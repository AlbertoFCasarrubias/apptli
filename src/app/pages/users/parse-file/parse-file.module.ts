import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ParseFilePageRoutingModule } from './parse-file-routing.module';

import { ParseFilePage } from './parse-file.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ParseFilePageRoutingModule
  ],
  declarations: []
})
export class ParseFilePageModule {}
