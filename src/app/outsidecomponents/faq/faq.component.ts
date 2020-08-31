import { Component, OnInit } from '@angular/core';
declare var $: any;
@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.css']
})
export class FaqComponent implements OnInit {

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
