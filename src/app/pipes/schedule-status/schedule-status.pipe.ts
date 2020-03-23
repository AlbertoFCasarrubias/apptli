import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'scheduleStatus'
})
export class ScheduleStatusPipe implements PipeTransform {
  EVENT_STATUS   = {
    pay: 'Pagado',
    cancelled: 'Cancelado',
    requestByDoctor: 'Solicitado por el doctor',
    requestByPatient: 'Solicitado por el paciente',
    approved: 'Consulta confirmada',
    unpay: 'No pagado',
  }

  transform(value: any, ...args: any[]): any {
    return this.EVENT_STATUS[value];
  }

}
