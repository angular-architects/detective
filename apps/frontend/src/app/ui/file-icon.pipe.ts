import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fileIcon',
  standalone: true,
})
export class FileIconPipe implements PipeTransform {
  transform(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'ts':
      case 'tsx':
        return 'code';
      case 'js':
      case 'jsx':
        return 'javascript';
      case 'html':
        return 'html';
      case 'css':
      case 'scss':
        return 'style';
      case 'json':
        return 'data_object';
      case 'md':
        return 'description';
      default:
        return 'insert_drive_file';
    }
  }
}
