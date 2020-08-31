import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from "@angular/router";
import { AdminService } from '../../admin.service';
import { DocumentService } from '../../document.service';
import { CountdownComponent } from 'ngx-countdown';
import { FrontEndConfig } from '../../frontendConfig';

@Component({
  selector: 'app-signupemployee',
  templateUrl: './signupemployee.component.html',
  styleUrls: ['./signupemployee.component.css']
})

export class SignupemployeeComponent implements OnInit {

  constructor(public activatedroute: ActivatedRoute,
    private router: Router,
    public adminservice: AdminService,
    public documentservice: DocumentService,
    private frontendconfig: FrontEndConfig) { }

  @ViewChild('countdown') counter: CountdownComponent;
  id: any;
  show = true
  active: any
  password: any
  show1: any
  status: any
  mailstatus: any;
  email: any;
  emailconfirmation;
  linkexpire: boolean = false
  formSubmitted
  passwordMinLength: Boolean;
  passwordupper: Boolean;
  passwordLower: Boolean;
  passwordNumber: Boolean;
  passwordSpecial: Boolean;
  upadtepassword: boolean
  upadtepassword1: boolean = true;
  usernameLength = false;
  Password;
  confirmPassword;

  ngOnInit() {
    this.id = this.activatedroute.snapshot.paramMap.get("id");
    this.adminservice.checkStatus(this.id).subscribe((data: any) => {
      if (data.linkstatus == 'Link Expired' || data.type == "replace") {
        this.linkexpire = true
      }
      this.status = data
      if (this.status.active && data.type != "replace") {
        this.router.navigate(['/signupemailconfirm/' + this.status.encryptmail])
      }
    })
  }

  /**
   * Function name : activateemail
   * Input : userform, form data that user has given
   * Output : registering user with valid data
   * Desc : It will take userform as user data and checks valid user data using API and will get registered in docintact.
   */
  activateemail(userform) {
    if (!userform.value.cPassword && !userform.value.ConfirmPassword) {
      this.formSubmitted = true
      this.Password = false;
      this.confirmPassword = false;
    }
    if (!userform.value.cPassword && userform.value.ConfirmPassword) {
      this.Password = true;
      this.confirmPassword = false;
    } else if (userform.value.cPassword && !userform.value.ConfirmPassword) {
      this.confirmPassword = true;
      this.Password = false;
    }
    if (userform && (userform.value.agreetoSign == false || userform.value.agreetoSign == undefined)) {
      this.documentservice.openSnackBar("Agree to our Terms and Conditions and Privacy Policy", "X")

    } else if (userform.valid) {
      if (userform.value && ((userform.value.cPassword == userform.value.ConfirmPassword && userform.value.agreetoSign == true))) {
        var data = { id: this.id, password: userform.value.cPassword }
        this.adminservice.activatenewemail(data).subscribe(data1 => {
          this.mailstatus = data1;
          if (data1) {
            this.show = false;
            this.show1 = true;
          }
        })
      }
    }
  }


   /**
   * Function name : Restrictspacekey
   * Input : event, pressed key data
   * Output : Spacebar will not allow 
   * Desc : When we press space key, it will not allow
   */
  Restrictspacekey(event) {
    if (event.keyCode == 32) {
      return false;
    }
  }

   /**
   * Function name : validate
   * Input : password
   * Output : status of entered password
   * Desc : It will check valid and invalid scenarios of a password, which is entered by user.
   */
  validate(password) {
    this.passwordMinLength = false;
    this.passwordupper = false;
    this.passwordLower = false;
    this.passwordNumber = false;
    this.passwordSpecial = false;
    var minMaxLength = /^[\s\S]{8,32}$/,
      upper = /[A-Z]/,
      lower = /[a-z]/,
      number = /[0-9]/,
      special = /[ !"#$%&()*+,\-./:;<=>?@[\\\]^_`{|}~]/;
    if (minMaxLength.test(password)) {
      this.passwordMinLength = true;
    }
    if (upper.test(password)) {
      this.passwordupper = true;
    }
    if (lower.test(password) && password != undefined) {
      this.passwordLower = true;
    }
    if (number.test(password)) {
      this.passwordNumber = true;
    }
    if (special.test(password)) {
      this.passwordSpecial = true;
    }
  }
     /**
   * Function name : termsandpol
   * Input : null
   * Output : Navigation to termsandcondition page.
   * Desc : To navigate to termsandcondition page, when user clicks on 'Terms and Conditions'.
   */
  termsandpol() {
    window.open(this.frontendconfig.frontendurl + '/termsandcondition', '_blank');
  }

  /**
   * Function name : privacypolicy
   * Input : null
   * Output : Navigation to privacypolicy page.
   * Desc : To navigate to privacypolicy page, when user clicks on 'Privacy Policy'.
   */
  privacypolicy() {
    window.open(this.frontendconfig.frontendurl + '/privacypolicy', '_blank');
  }

}
