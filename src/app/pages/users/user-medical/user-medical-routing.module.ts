import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { UserMedicalPage } from './user-medical.page';

const routes: Routes = [
  {
    path: '',
    component: UserMedicalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UserMedicalPageRoutingModule {}
