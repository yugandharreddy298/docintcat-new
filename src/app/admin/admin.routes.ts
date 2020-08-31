import { Routes } from '@angular/router';
import { AdminNavbarComponent } from './admin-navbar/admin-navbar.component';
import { AdminpanelComponent } from './adminpanel/adminpanel.component';
import { AdminUserdetailsComponent } from './admin-userdetails/admin-userdetails.component';
export const adminroutes: Routes = [
  {
    path: 'adminnavbar', component: AdminNavbarComponent,
    children: [{ path: 'adminpanel', component: AdminpanelComponent },
    { path: 'userdetails', component: AdminUserdetailsComponent },
    ]
  }
];
