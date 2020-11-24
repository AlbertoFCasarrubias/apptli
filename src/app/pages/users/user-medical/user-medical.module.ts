import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { UserMedicalPageRoutingModule } from './user-medical-routing.module';

import { UserMedicalPage } from './user-medical.page';
import {HighchartsChartModule} from 'highcharts-angular';
import {ChartModule} from 'angular-highcharts';
import {ChartsComponent} from '../../../components/charts/charts.component';
import {AppointmentPage} from '../appointment/appointment.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    ChartModule,
    HighchartsChartModule,
    UserMedicalPageRoutingModule
  ],
  declarations: [UserMedicalPage, ChartsComponent, AppointmentPage],
  entryComponents: [ AppointmentPage],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class UserMedicalPageModule {}
