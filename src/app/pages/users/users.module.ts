import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { UserPageRoutingModule } from './users-routing.module';

import { UsersPage } from './users.page';
import {SharedModule} from '../SharedModule';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SharedModule,
    UserPageRoutingModule
  ],
  declarations: [UsersPage],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class UserPageModule {}
