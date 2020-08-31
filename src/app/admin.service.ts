import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from "@angular/router";
import { FrontEndConfig } from "./frontendConfig"
import { CookieService } from 'ngx-cookie-service';
@Injectable({
  providedIn: 'root'
})

export class AdminService {

  constructor(private http: HttpClient,
    private router: Router,
    private frontendconfig: FrontEndConfig,
    public CookieService: CookieService) { }

  serverurl = this.frontendconfig.getserverurl();
  resendEmailforemployee
  getdates = new EventEmitter<any>();
  gettdates = new EventEmitter<any>();
  getdatespick = new EventEmitter<any>();
  
  // get server url
  getserverurl() {
    return this.serverurl
  }

  // Update new variable when first time login when sign up
  updatenewuser() {
    var id = ""
    return this.http.put(this.serverurl + '/api/users/updatenewuser/', id)
  }

  // Create new user
  saveuser(user) {
    return this.http.post(this.serverurl + '/api/users/', user)
  }

  // Activate user through Mail Link
  activateemail(data) {
    return this.http.post(this.serverurl + '/api/users/emailactivate', data)
  }

  // Resend Verification Mail Link
  resendConfirmationEmail(data) {
    return this.http.post(this.serverurl + '/api/users/resendEmail', data)
  }

  //  Resend Mail Link to employees
  resedEmailforemp(data) {
    return this.http.post(this.serverurl + '/api/users/resendEmailforemployee', data)
  }

  // get Profile 
  getProfile() {
    return this.http.get(this.serverurl + '/api/users/me')
  }

  // Check Mail link status
  checkStatus(id) {
    return this.http.get(this.serverurl + '/api/users/checkstatus/' + id)
  }

  // Activate employee when click on mail link
  activatenewemail(data) {
    return this.http.post(this.serverurl + '/api/users/newemailactivate', data)
  }

  // Request for files and folders
  user_folders_files(userid) {
    return this.http.get(this.serverurl + '/api/folders/user_folders_files/' + userid)
  }

  // Request for files and folders for admin
  getadminfolderdetails(id) {
    return this.http.get(this.serverurl + '/api/folders/adminfolderdetails/' + id)
  }

  // user got logged out
  logout() {
    var userToken = { 'token': null }
    localStorage.setItem('loggedIn', "false")
    localStorage.setItem('currentUser', JSON.stringify(userToken))
    this.CookieService.delete('token', '/')
    this.router.navigate(['/']);
  }

}
