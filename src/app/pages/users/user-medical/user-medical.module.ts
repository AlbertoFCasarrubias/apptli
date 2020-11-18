import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { UserMedicalPageRoutingModule } from './user-medical-routing.module';

import { UserMedicalPage } from './user-medical.page';
import {HighchartsChartModule} from 'highcharts-angular';
import {ChartModule} from 'angular-highcharts';
import {HighchartsComponent} from '../../../components/highcharts/highcharts.component';
import {ChartsComponent} from '../../../components/charts/charts.component';
import {AppModule} from '../../../app.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    ChartModule,
    HighchartsChartModule,
    UserMedicalPageRoutingModule,
    AppModule
  ],
  declarations: [UserMedicalPage, HighchartsComponent, ChartsComponent],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class UserMedicalPageModule {}
