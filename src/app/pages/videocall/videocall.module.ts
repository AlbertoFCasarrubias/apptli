import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { VideocallPageRoutingModule } from './videocall-routing.module';

import { VideocallPage } from './videocall.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    VideocallPageRoutingModule
  ],
  declarations: [VideocallPage]
})
export class VideocallPageModule {}
