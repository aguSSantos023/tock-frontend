import { HttpClient, HttpErrorResponse, HttpEventType } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { SongManager } from './song-manager';
import { environment } from '../../environments/environment';
import { UploadStatus, UploadTask } from '../interface/upload.interface';
import {
  catchError,
  concatMap,
  EMPTY,
  finalize,
  from,
  map,
  of,
  Subject,
  takeUntil,
  tap,
  timer,
} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UploadManager {
  private http = inject(HttpClient);
  private songManager = inject(SongManager);

  private apiUrl = `${environment.apiUrl}/songs`;
  private readonly MAX_BATCH_SIZE = 50;
  private readonly MIN_SPACE_THRESHOLD_MB = 3;

  queue = signal<UploadTask[]>([]);
  isProcessing = signal<boolean>(false);

  totalFiles = computed(() => this.queue().length);
  completedCount = computed(() => this.queue().filter((task) => task.status === 'success').length);

  private stopSignal$ = new Subject<void>();

  /**
   * Captura y Selección
   */
  addFilesToQueue(files: FileList | File[]) {
    const currentQueue = this.queue();
    const newFiles = Array.from(files);

    if (currentQueue.length + newFiles.length > this.MAX_BATCH_SIZE) {
      alert(`Límite máximo de ${this.MAX_BATCH_SIZE} archivos. Por favor, reduce la selección.`);
      return;
    }

    const newTasks: UploadTask[] = newFiles.map((file) => ({
      id: crypto.randomUUID(),
      file,
      title: file.name.replace(/\.[^/.]+%/, ''),
      status: 'pending',
      progress: 0,
    }));

    this.queue.update((prev) => [...prev, ...newTasks]);
  }

  /**
   * INICIO DE LA COLA
   */
  startUploads() {
    if (this.isProcessing()) return;
    this.isProcessing.set(true);
    this.processNextTask();
  }

  /**
   * Busca la siguiente tarea pendiente de forma dinámica
   */
  private processNextTask() {
    // Buscamos la PRIMERA tarea que esté 'pending'
    const nextTask = this.queue().find((t) => t.status === 'pending');

    // Si no hay más tareas pendientes, cerramos el kiosco
    if (!nextTask) {
      this.isProcessing.set(false);
      this.songManager.refresh(); // Refresca la lista
      return;
    }

    this.executeFlow(nextTask)
      .pipe(takeUntil(this.stopSignal$))
      .subscribe({
        next: () => {
          // Cuando termine (incluyendo el delay), buscamos la siguiente
          this.processNextTask();
        },
        error: () => {
          this.isProcessing.set(false);
        },
      });
  }

  private executeFlow(task: UploadTask) {
    return of(task).pipe(
      // Fase de Transcodificación, próximo paso: Web Worker
      tap(() => this.updateTaskStatus(task.id, 'uploading', 0)),

      // Subida al servidor
      concatMap(() => this.uploadToServer(task)),

      // Delay aleatorio 1-3s proteccion servidor
      concatMap(() => {
        const randomDelay = Math.floor(Math.random() * 2000) + 1000;
        return timer(randomDelay);
      }),

      catchError((err) => {
        this.handleError(task.id, err);

        // Si el error es de espacio
        if (err.status === 507) {
          this.stopSignal$.next();
          return EMPTY;
        }
        // devolvemos un observable que permite seguir con la siguiente canción
        return of(null);
      }),
    );
  }

  /**
   * Lógica de red
   */
  private uploadToServer(task: UploadTask) {
    const formData = new FormData();
    formData.append('title', task.title);
    formData.append('file', task.finalBlob || task.file);

    return this.http
      .post(this.apiUrl, formData, {
        reportProgress: true,
        observe: 'events',
      })
      .pipe(
        tap((event) => {
          // calcula cuánto se ha enviado respecto al total del archivo
          if (event.type === HttpEventType.UploadProgress && event.total) {
            const progress = Math.round((100 * event.loaded) / event.total);
            this.updateTaskStatus(task.id, 'uploading', progress);
          }
        }),
        // Filtramos para que el stream solo complete cuando llegue el 201 OK
        map((event) => event.type === HttpEventType.Response),
        tap((isDone) => {
          if (isDone) this.updateTaskStatus(task.id, 'success', 100);
        }),
      );
  }

  // Helpers de Estado

  private updateTaskStatus(id: string, status: UploadStatus, progress: number) {
    this.queue.update((tasks) =>
      tasks.map((task) => (task.id === id ? { ...task, status, progress } : task)),
    );
  }

  private handleError(id: string, error: HttpErrorResponse) {
    let msg = 'Error desconocido';
    if (error.status === 507) msg = '⚠️ Espacio insuficiente en servidor.';

    this.updateTaskStatus(id, 'error', 0);
    this.queue.update((tasks) => tasks.map((t) => (t.id === id ? { ...t, error: msg } : t)));
  }

  clearQueue() {
    if (this.isProcessing()) return;
    this.queue.set([]);
  }
}
