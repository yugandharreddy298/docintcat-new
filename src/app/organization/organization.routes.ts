import { Routes, } from '@angular/router';
import { MainnavComponent } from '../sharing/mainnav/mainnav.component';
import { AdddepartmentComponent } from './adddepartment/adddepartment.component';
import { AddemployeeComponent } from './addemployee/addemployee.component';
export const organizationroutes: Routes = [
  {
    path: 'home', component: MainnavComponent,
    children: [
      { path: 'adddepartment', component: AdddepartmentComponent },
      { path: 'addemployee', component: AddemployeeComponent },
    ]
  },
];
