import {Directive, ElementRef} from '@angular/core';

@Directive({
  selector: '[drop]'
})
export class ScheduleHourDirective {

  constructor(element: ElementRef) {}

}
