import { Component, OnInit } from '@angular/core';
import { UserService } from '../../user.service';
import { DocumentService } from '../../document.service';
import { Router, NavigationExtras } from "@angular/router";
declare var $: any;
@Component({
  selector: 'app-aboutus',
  templateUrl: './aboutus.component.html',
  styleUrls: ['./aboutus.component.css']
})
export class AboutusComponent implements OnInit {

  constructor(public userService: UserService,
    public documentservice: DocumentService,
    private router: Router) { }

  emailForSignup;
  aboutusfreetrial;
  userdata: any;
  emailchecked = false;
  noEmail: Boolean = false;

  ngOnInit() {
    $(document).ready(function () {
      $("html, body").animate({
        scrollTop: 0
      }, 600);
      return false;
    });
  }

  /**
   * Function name : freetrail
   * Input : null
   * Output : Navigation to signup page.
   * Desc : To navigate to signup page, when user clicks on 'Start Your Account'.
   */
  freetrail() {
    let navigationExtras: NavigationExtras = {
      queryParams: {
        "type": "Signup",
      }
    };
    this.router.navigate(["/"], navigationExtras);
    setTimeout(() => {
      this.router.navigate(["/"])
    }, 1000);
  }
  

}
