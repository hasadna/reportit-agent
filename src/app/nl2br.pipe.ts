import { Pipe, PipeTransform, SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
  name: 'nl2br'
})
export class Nl2brPipe implements PipeTransform {

  constructor(private sanitizer: DomSanitizer) {}

  transform(value: any, args?: any): any {
    if (typeof value !== 'string') {
      return value;
    }
    const textParsed = value.replace(/(?:\r\n|\r|\n)/g, '<br />');
    return textParsed;
  }

}
