import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CalendarPage } from './calendar.page';
import {DragulaModule} from 'ng2-dragula';
import {RouterModule} from '@angular/router';
import {HomePage} from '../home/home.page';
import {ModalScheduleComponent} from '../../components/schedule/modal-schedule/modal-schedule.component';
import {ModalObjectQuantityComponent} from '../../components/object-quantity/modal-object-quantity/modal-object-quantity.component';
import {ScheduleComponent} from '../../components/schedule/schedule.component';
import {ObjectQuantityComponent} from '../../components/object-quantity/object-quantity.component';
import {ScheduleHourDirective} from '../../directives/schedule-hour.directive';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DragulaModule,
    ReactiveFormsModule,
    RouterModule.forChild([
      {
        path: '',
        component: CalendarPage
      }
    ])
  ],
  entryComponents: [ModalScheduleComponent, ModalObjectQuantityComponent],
  declarations: [
    CalendarPage,
    ScheduleComponent,
    ScheduleHourDirective,
    ModalScheduleComponent,
    ObjectQuantityComponent,
    ModalObjectQuantityComponent],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class CalendarPageModule {}
