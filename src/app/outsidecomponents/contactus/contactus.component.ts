
import { Component, OnInit } from '@angular/core';
import { GeneralService } from '../../general.service';
declare var $: any;
@Component({
  selector: 'app-contactus',
  templateUrl: './contactus.component.html',
  styleUrls: ['./contactus.component.css']
})

export class ContactusComponent implements OnInit {

  req = false;
  isMsg = false;
  contactloader = false;
  lname
  email
  mnumber
  message
  fname
  successalert: boolean = false //success message alert
  failalert: boolean = false //fail message alert
  contactdata: any // submiting data
  iebrowser // for Ie validtions
  nameinvalid  // for Ie validtions
  emailinvalid  // for Ie validtions
  mobileinvalid // for Ie validtions
  invalidmsg // for Ie validations

  constructor(private generalService: GeneralService) { }

  ngOnInit() {
    if ((!!(window as any).MSInputMethodContext && !!(document as any).documentMode)) {
      this.iebrowser = true
    }
    else {
      this.iebrowser = false
    }
    $(document).ready(function () {
      $("html, body").animate({
        scrollTop: 0
      }, 600);
      return false;
    });
  }

  /**
   * Function name : contactSubmit
   * Input : user data with name, email, number and company name
   * Output : Docintact will recieve a mail with the user entered details
   * Desc : To get to know the users details and message, that he is entering and dropping mail to docintact
   */
  contactSubmit = function (user) {
    if (!user.valid) {
      this.nameinvalid = true
      this.emailinvalid = true
      this.mobileinvalid = true
      this.invalidmsg = true
    }
    this.req = true;
    if (user.valid) {
      this.req = false;
      this.generalService.contact(user.value).subscribe(data => {
        this.contactdata = data
        user.resetForm();
        if (this.contactdata.res) {
          this.successalert = true;
        } else { this.failalert = true }
      }, error => {
      })
    }
  }

  /**
  * Function name : checkData
  * Input : user entered name, mail, number, message
  * Output : If name/mail/number/message is not valid or empty, it will throw error
  * Desc : To check valid name/mail/number/message for Ie Browser
  */
  checkData(data, type) {
    if ((data.value == '' || data.value == undefined) && this.iebrowser) {
      if (type === 'message') {
        this.invalidmsg = true
      } else if (type === 'mobile') {
        this.mobileinvalid = true
      } else if (type === 'mail') {
        this.emailinvalid = true
      } else if (type === 'name') {
        this.nameinvalid = true
      } else {
      }
    }
    else {
      if (type === 'message') {
        this.invalidmsg = false
      } else if (type === 'mobile') {
        this.mobileinvalid = false
      } else if (type === 'mail') {
        this.emailinvalid = false
      } else if (type === 'name') {
        this.nameinvalid = false
      } else {
      }
    }
  }

}
