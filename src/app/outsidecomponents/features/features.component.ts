import { Component, OnInit } from '@angular/core';
import { Router, NavigationExtras } from "@angular/router";
declare var $: any;
@Component({
  selector: 'app-features',
  templateUrl: './features.component.html',
  styleUrls: ['./features.component.css']
})

export class FeaturesComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {
    $(document).ready(function () {
      $("html, body").animate({
        scrollTop: 0
      }, 600);
      return false;
    });
  }

  /**
   * Function name : startbtn
   * Input : null
   * Output : Navigation to signup page.
   * Desc : To navigate to signup page, when user clicks on 'Start File Sharing For Free'/'Try Now'.
   */
  startbtn() {
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
