import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { organizationroutes } from './organization.routes';
import { RouterModule } from '@angular/router';
import { SharingModule } from '../sharing/sharing.module';
import { sharedModulesModule } from '../sharedmodules.module';
import { OrganizationFileSharingComponent } from './organization-file-sharing/organization-file-sharing.component';
import { AdddepartmentComponent } from './adddepartment/adddepartment.component';
import { DepartmentdialogComponent } from './departmentdialog/departmentdialog.component';
import { AddemployeeComponent } from './addemployee/addemployee.component';
import { EmployeedialogComponent } from './employeedialog/employeedialog.component';
import { PublicModule } from '../public/public.module';

@NgModule({
  declarations: [
    OrganizationFileSharingComponent,
    AddemployeeComponent,
    EmployeedialogComponent,
    DepartmentdialogComponent,
    AdddepartmentComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(organizationroutes),
    SharingModule,
    sharedModulesModule,
    PublicModule
  ],
  entryComponents: [
    OrganizationFileSharingComponent, EmployeedialogComponent, DepartmentdialogComponent,
  ]
})
export class OrganizationModule { }
