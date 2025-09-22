import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fileName',
  standalone: true,
})
export class FileNamePipe implements PipeTransform {
  transform(filePath: string): string {
    return filePath.split('/').pop() || filePath;
  }
}
