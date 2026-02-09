import { HttpClient } from '@angular/common/http';
import { inject, Injectable, resource } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { firstValueFrom } from 'rxjs';
import { Song } from '../models/song.model';

@Injectable({
  providedIn: 'root',
})
export class SongManager {
  private http = inject(HttpClient);

  private apiUrl = `${environment.apiUrl}/songs`;

  songs = resource({
    loader: () => firstValueFrom(this.http.get<Song[]>(this.apiUrl)),
  });

  async upload(file: File, title: string) {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('file', file);

    return await firstValueFrom(this.http.post(this.apiUrl, formData));
  }

  async delete(songId: number) {
    await firstValueFrom(this.http.delete(`${this.apiUrl}/${songId}`));
    this.songs.reload();
  }

  getAudioBlob(songId: number) {
    return this.http.get(`${this.apiUrl}/${songId}/audio`, {
      responseType: 'blob', // Decirle que esperamos un archivo binario
    });
  }
}
