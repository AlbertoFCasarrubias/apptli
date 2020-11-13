import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { UserMedicalPageRoutingModule } from './user-medical-routing.module';

import { UserMedicalPage } from './user-medical.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    UserMedicalPageRoutingModule
  ],
  declarations: [UserMedicalPage]
})
export class UserMedicalPageModule {}
