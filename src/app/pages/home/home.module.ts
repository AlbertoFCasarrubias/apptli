import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HomePage } from './home.page';
import {PipesModule} from '../../pipes/pipes.module';

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
    ]),
    PipesModule
  ],
  entryComponents: [],
  declarations: [HomePage],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class HomePageModule {}
