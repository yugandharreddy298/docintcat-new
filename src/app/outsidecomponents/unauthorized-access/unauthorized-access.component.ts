import { Component, OnInit } from '@angular/core';
import { UserService } from '../../user.service';

@Component({
  selector: 'app-unauthorized-access',
  templateUrl: './unauthorized-access.component.html',
  styleUrls: ['./unauthorized-access.component.css']
})
export class UnauthorizedAccessComponent implements OnInit {


  constructor(private userService: UserService) { }
  x: any
  y: any
  profiledata: any
  userType: any
  ngOnInit() {
    this.profiledata = JSON.parse(localStorage.getItem('currentUser'));
    if(this.profiledata && this.profiledata.type) this.userType = this.userService.decryptData(this.profiledata.type);

  }
  mouseMove(e) {
    this.x = 115 + 50 * e.clientX / innerWidth;
    this.y = 50 + 50 * e.clientY / innerHeight;
  }


}
