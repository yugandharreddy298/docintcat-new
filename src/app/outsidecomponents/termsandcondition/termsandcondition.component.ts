import { Component, OnInit } from '@angular/core';
declare var $: any;
@Component({
  selector: 'app-termsandcondition',
  templateUrl: './termsandcondition.component.html',
  styleUrls: ['./termsandcondition.component.css']
})
export class TermsandconditionComponent implements OnInit {

  constructor() { }
  
  mailstatus
  userInfo
  activateemail

  ngOnInit() {
    $(document).ready(function () {
      $("html, body").animate({
        scrollTop: 0
      }, 600);
      return false;
    });
  }

}
