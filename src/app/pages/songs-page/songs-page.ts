import { Component, inject } from '@angular/core';
import { SongManager } from '../../services/song-manager';
import { environment } from '../../../environments/environment.development';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-songs-page',
  imports: [DatePipe],
  templateUrl: './songs-page.html',
  styleUrl: './songs-page.css',
})
export class SongsPage {
  public songManager = inject(SongManager);

  backendUrl = environment.apiUrl.replace('/api', '');

  formatSize(bytes: string): string {
    const mb = parseInt(bytes) / (1024 * 1024);
    return mb.toFixed(2) + ' MB';
  }
}
