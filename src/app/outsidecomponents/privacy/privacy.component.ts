import { Component, OnInit } from '@angular/core';
declare var $: any;
@Component({
  selector: 'app-privacy',
  templateUrl: './privacy.component.html',
  styleUrls: ['./privacy.component.css']
})
export class PrivacyComponent implements OnInit {

  constructor() { }

  ngOnInit() {
    $(document).ready(function () {
      $("html, body").animate({
        scrollTop: 0
      }, 600);
      return false;
    });
  }

}
