import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'username',
})
export class UsernamePipe implements PipeTransform {
  transform(email: string | null, ...args: unknown[]): string {
    if (!email) return 'Usuario';

    const name = email.split('@')[0];

    return name.charAt(0).toUpperCase() + name.slice(1);
  }
}
