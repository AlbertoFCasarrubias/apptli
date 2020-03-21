import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HomePage } from './home.page';
import {ScheduleComponent} from '../../components/schedule/schedule.component';
import {ModalScheduleComponent} from '../../components/schedule/modal-schedule/modal-schedule.component';
import {ObjectQuantityComponent} from '../../components/object-quantity/object-quantity.component';
import {ModalObjectQuantityComponent} from '../../components/object-quantity/modal-object-quantity/modal-object-quantity.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    RouterModule.forChild([
      {
        path: '',
        component: HomePage
      }
    ])
  ],
  entryComponents: [ModalScheduleComponent, ModalObjectQuantityComponent],
  declarations: [HomePage, ScheduleComponent, ModalScheduleComponent, ObjectQuantityComponent, ModalObjectQuantityComponent],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class HomePageModule {}
