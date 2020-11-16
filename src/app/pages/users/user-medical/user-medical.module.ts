import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { UserMedicalPageRoutingModule } from './user-medical-routing.module';

import { UserMedicalPage } from './user-medical.page';
import {HighchartsChartModule} from 'highcharts-angular';
import {ChartModule} from 'angular-highcharts';

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
  declarations: [UserMedicalPage]
})
export class UserMedicalPageModule {}
