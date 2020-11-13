import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ParseFilePage } from './parse-file.page';

const routes: Routes = [
  {
    path: '',
    component: ParseFilePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ParseFilePageRoutingModule {}
