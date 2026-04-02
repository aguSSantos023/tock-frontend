import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dataSize',
  standalone: true,
})
export class DataSizePipe implements PipeTransform {
  transform(value: number | string | bigint | undefined | null, decimals: number = 2): string {
    if (value === undefined || value === null || value === '' || value === 0 || value === '0') {
      return '0 B';
    }

    const bytes = typeof value === 'bigint' ? Number(value) : Number(value);

    if (isNaN(bytes)) return '0 B';
    if (bytes === 0) return '0 B';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['B', 'KB', 'MB', 'GB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    const finalDecimals = i === 0 ? 0 : dm;

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(finalDecimals))} ${sizes[i]}`;
  }
}
