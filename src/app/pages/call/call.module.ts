import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CallPageRoutingModule } from './call-routing.module';

import { CallPage } from './call.page';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        CallPageRoutingModule,
        ReactiveFormsModule
    ],
  declarations: [CallPage]
})
export class CallPageModule {}
