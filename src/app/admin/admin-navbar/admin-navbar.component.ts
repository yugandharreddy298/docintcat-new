import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../admin.service';

@Component({
  selector: 'app-admin-navbar',
  templateUrl: './admin-navbar.component.html',
  styleUrls: ['./admin-navbar.component.css']
})
export class AdminNavbarComponent implements OnInit {
  profiledata;
  constructor(private adminService: AdminService) { }

  ngOnInit() {
    this.adminService.getProfile().subscribe(data => {
      this.profiledata = data;
    });
  }
/**
   * Function name : logout
   * Input : null
   * Output : Logged out from the account.
   * Desc : Calling logout method to get the user logged out from the account.
   */
  logout() {
    this.adminService.logout();
  }
}
