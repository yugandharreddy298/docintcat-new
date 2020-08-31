import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
const routes: Routes = [
  { path: '', loadChildren: './outsidecomponents/outsidecomponents.module#OutsidecomponentsModule' },
  { path: 'admin', loadChildren: './admin/admin.module#AdminModule' },
  { path: 'individual', loadChildren: './sharing/sharing.module#SharingModule' },
  { path: 'organization', loadChildren: './organization/organization.module#OrganizationModule' },
  { path: 'user', loadChildren: './public/public.module#PublicModule' },
  { path: '**', redirectTo: '/', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }