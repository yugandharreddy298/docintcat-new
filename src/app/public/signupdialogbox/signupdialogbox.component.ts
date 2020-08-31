import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Router } from "@angular/router";
import { DocumentService } from '../../document.service';
import { UserService } from 'src/app/user.service';

@Component({
  selector: 'app-signupdialogbox',
  templateUrl: './signupdialogbox.component.html',
  styleUrls: ['./signupdialogbox.component.css']
})

export class SignupdialogboxComponent implements OnInit {
  errores
  error: boolean = false
  profiledata: any
  formCheck = false
  password: any
  passwordtype = 'password';
  passwordIcon = 'fa fa-eye-slash';
  constructor(
    public dialogRef: MatDialogRef<SignupdialogboxComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private router: Router,
    private documentService: DocumentService,
    private userservice: UserService) { }

  ngOnInit() {
  }

  /**
   * Function name : onNoClick
   * Input : null
   * Output : Navigation to shared-files page.
   * Desc : To navigate to shared-files page, when user clicks on 'No'.
   */
  onNoClick(): void {
    this.dialogRef.close(false);
    this.profiledata = JSON.parse(localStorage.getItem('currentUser'))
    if (this.profiledata) {
      this.profiledata.type = this.userservice.decryptData(this.profiledata.type)
      if (this.profiledata.type == 'individual') this.router.navigate(['/individual/home/shareddocument/:id'])
      else if (this.profiledata.type == 'organisation' || this.profiledata.type == 'employee') this.router.navigate(['/organization/home/shareddocument.:id'])
    }
    else
      this.router.navigate(['/'])
  }

  /**
   * Function name : dataSubmit
   * Input : otpData
   * Output : valid otp will be sent.
   * Desc : valid otp will be sent.
   */
  dataSubmit = function (otpData) {
    this.formCheck = true
    if (otpData.valid) {
      this.formCheck = false
      this.dialogRef.close(otpData.value.otp);
    }
  }

  /**
   * Function name : Passwordsubmit
   * Input : Password
   * Output : Password checked status.
   * Desc : Valid password will be checked.
   */
  Passwordsubmit(Password) {
    let format = /[ !@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/
    this.formCheck = true
    if (Password.valid) {
      this.formCheck = false
      if (!this.data.id) {
        if (Password.value.Password == this.data.content)
          this.dialogRef.close(true);
        else {
          this.error = true
          this.errores = 'Password Incorrect'
        }
      }
      if (this.data.id) {
        Password.value.title = "passwordchecking"
        if (Password.value.Password && format.test(Password.value.Password)) {
          this.error = true
          this.errores = 'Password Incorrect'
        } else {
          this.documentService.getSearch('sharingpeoples/checkpassword/' + this.data.id + '/' + Password.value.Password + '/' + Password.value.title).subscribe(data => {
            if (data) this.dialogRef.close(true);
            else {
              this.error = true
              this.errores = 'Password Incorrect'
            }
          })
        }
      }
    }
  }
  /**
   * Function name : hideShowPassword
   * Input :null
   * Output :Password show hide 
   */
  hideShowPassword() {
    if (this.passwordtype == 'password') {
      this.passwordtype = 'text';
      this.passwordIcon = 'fa fa-eye';
    }
    else {
      this.passwordtype = 'password';
      this.passwordIcon = 'fa fa-eye-slash';
    }
  }
}

export interface DialogData {
  title: string;
  content: string;
  otpflag: boolean;
  errorMsg: string;
  id: String;
  Docflag: boolean;
  type:String;
  method:string;
}
