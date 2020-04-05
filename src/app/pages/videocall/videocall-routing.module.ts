import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VideocallPage } from './videocall.page';

const routes: Routes = [
  {
    path: '',
    component: VideocallPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VideocallPageRoutingModule {}
