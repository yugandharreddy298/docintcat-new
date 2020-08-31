import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { adminroutes } from './admin.routes';
import { AdminNavbarComponent } from './admin-navbar/admin-navbar.component';
import { AdminpanelComponent } from './adminpanel/adminpanel.component';
import { AdminUserdetailsComponent } from './admin-userdetails/admin-userdetails.component';
import { sharedModulesModule } from '../sharedmodules.module';
import { PublicModule } from '../public/public.module';

@NgModule({
  declarations: [
    AdminNavbarComponent,
    AdminpanelComponent,
    AdminUserdetailsComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(adminroutes),
    sharedModulesModule,
    PublicModule
  ]
})
export class AdminModule { }
