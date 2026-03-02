import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { firstValueFrom } from 'rxjs';
import { PaginatedSongs, Song } from '../interface/song.interface';

@Injectable({
  providedIn: 'root',
})
export class SongManager {
  private http = inject(HttpClient);

  private apiUrl = `${environment.apiUrl}/songs`;

  currentPage = signal(1);
  songs = signal<Song[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  async loadMore() {
    if (this.loading()) return; // Evitar múltiples peticiones

    this.loading.set(true);
    this.error.set(null);

    try {
      const page = this.currentPage();
      const data = await firstValueFrom(
        this.http.get<PaginatedSongs>(`${this.apiUrl}?page=${page}&limit=15`),
      );

      this.songs.update((current) => [...current, ...data.data]);
      this.currentPage.update((p) => p + 1);
    } catch (err) {
      this.error.set('Error al cargar canciones');
    } finally {
      this.loading.set(false);
    }
  }

  async refresh() {
    this.songs.set([]);
    this.currentPage.set(1);
    await this.loadMore();
  }

  async upload(file: File, title: string) {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('file', file);

    return await firstValueFrom(this.http.post(this.apiUrl, formData));
  }

  async delete(songId: number) {
    await firstValueFrom(this.http.delete(`${this.apiUrl}/${songId}`));
    this.songs.update((list) => list.filter((s) => s.id !== songId));
  }

  getAudioBlob(songId: number) {
    return this.http.get(`${this.apiUrl}/${songId}/audio`, {
      responseType: 'blob', // Decirle que esperamos un archivo binario
    });
  }
}
