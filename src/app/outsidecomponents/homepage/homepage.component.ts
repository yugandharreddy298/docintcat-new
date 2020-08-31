import { Component, OnInit } from '@angular/core';
import { UserService } from '../../user.service';
import { DocumentService } from '../../document.service';
import { Router, NavigationExtras } from "@angular/router";
declare var $: any;
@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.css']
})
export class HomepageComponent implements OnInit {

  constructor(public userService: UserService,
    public documentservice: DocumentService,
    private router: Router) { }

  emailForSignup
  check4
  userdata: any;
  emailchecked = false;
  noEmail: Boolean = false;

  ngOnInit() {
    $(document).ready(function () {
      $('.owl-carousel').owlCarousel({
        stagePadding: 200,
        loop: true,
        dots: true,
        margin: 10,
        nav: false,
        items: 1,
        lazyLoad: true,
        autoplay: false,
        responsive: {
          320: {
            items: 1,
            stagePadding: 30
          },
          360: {
            items: 1,
            stagePadding: 30
          },
          600: {
            items: 1,
            stagePadding: 100
          },
          800: {
            items: 1,
            stagePadding: 100
          },
          1000: {
            items: 1,
            stagePadding: 200
          },
          1200: {
            items: 1,
            stagePadding: 250
          },

        }
      })
    });
  }

  /**
   * Function name : onTap
   * Input : null
   * Output : Navigation to signup page.
   * Desc : To navigate to signup page, when user clicks on 'Start Your Account Today'.
   */
  onTap() {
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


