import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from "@angular/router";
import { AdminService } from '../../admin.service';
import { CountdownComponent } from 'ngx-countdown';
import { DocumentService } from '../../document.service';
import { UserService } from '../../user.service';
@Component({
  selector: 'app-signupmailconfirm',
  templateUrl: './signupmailconfirm.component.html',
  styleUrls: ['./signupmailconfirm.component.css']
})

export class SignupmailconfirmComponent implements OnInit {

  constructor(public activatedroute: ActivatedRoute,
    private router: Router,
    public adminservice: AdminService,
    private documentservice: DocumentService,
    private userService: UserService) { }

  @ViewChild('countdown') counter: CountdownComponent;
  linkdisable = false;
  emailconfirmation;
  email: any;
  show = false;
  show1 = false;
  active: any
  mailstatus: any = {};
  userInfo: any;
  invalduser: boolean = false
  activeastatus

  ngOnInit() {
    this.email = this.activatedroute.snapshot.paramMap.get("id");
    this.userService.checkemail(this.email).subscribe(data => {
      this.userInfo = data;
      if (this.userInfo.data) {
        if (this.userInfo.user.active) {
          this.activeastatus = true
        }
        else this.activeastatus = false
        this.invalduser = false
        document.getElementById("openModalButton").click();
      }
      else if (!this.userInfo.data) {
        this.activeastatus = false
        this.invalduser = true
      }
    });
    var dynamicyear :any = document.getElementById("year");
    dynamicyear.innerHTML = new Date().getFullYear();
  }

  /**
   * Function name : activateemail
   * Input : null
   * Output : Account will be activated
   * Desc : It will pass email to API to make that account active.
   */
  activateemail() {
    var data = { id: this.email };
    if (!this.userInfo.user.active) {
      this.adminservice.activateemail(data).subscribe(data => {
        this.mailstatus = data;
        if (data) this.show = false;
      })
    }
  }

  /**
    * Function name : resendEmailLink
    * Input : null
    * Output : Account verification link sent to the user
    * Desc : Will send mail data to the API and the API will resend confirmation link to the user.
    */
  resendEmailLink() {
    this.show = true;
    this.show1 = true;
    var Info = { email: this.email, type: "email" };
    this.adminservice.resendConfirmationEmail(Info).subscribe(data => {
      this.emailconfirmation = data
      this.counter.restart();
      if (this.emailconfirmation.res == "success") {
        this.documentservice.openSnackBar("Verification link sent to Email", "X")
      }
    })
  }

  /**
   * Function name : finishTest
   * Input : null
   * Output : Count time will get stop
   * Desc : Once count down is done with the count, the method will get called and we are stopping that count down.
   */
  finishTest() {
    this.show = false;
    this.show1 = true;
    this.counter.stop();
  }
}
