import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { UserProfilePage } from './user-profile.page';

const routes: Routes = [
  {
    path: '',
    component: UserProfilePage,
    children: [
      {
        path: 'user',
        children: [
          {
            path: '',
            loadChildren: () => import('../user/user.module').then( m => m.UserPageModule),
          }
        ]
      },
      {
        path: 'user/:id',
        children: [
          {
            path: '',
            loadChildren: () => import('../user/user.module').then( m => m.UserPageModule),
          }
        ]
      },
      {
        path: 'medical/:id',
        children: [
          {
            path: '',
            loadChildren: () => import('../user-medical/user-medical.module').then( m => m.UserMedicalPageModule),
          }
        ]
      },
      {
        path: '',
        redirectTo: '/user-tab/user/:id',
        pathMatch: 'full'
      }
    ]

  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UserProfilePageRoutingModule {}
