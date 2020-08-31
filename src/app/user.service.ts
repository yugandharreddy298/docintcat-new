import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from "@angular/router";
import { FrontEndConfig } from "./frontendConfig"
import { CookieService } from 'ngx-cookie-service';
import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root'
})

export class UserService {
  searchElement: any;

  constructor(private http: HttpClient,
    private router: Router,
    private frontendconfig: FrontEndConfig,
    public CookieService: CookieService) {
    this.isUserLoggedIn = JSON.parse(localStorage.getItem('loggedIn') || ('false'))
  }

  encryptSecretKey = 'key'
  localstorageData: any = {};
  currentpath: any = {}
  routing: any
  currentelement
  serverurl = this.frontendconfig.getserverurl();
  private isUserLoggedIn;

  // to get server url
  getserverurl() {
    return this.serverurl
  }

  // Encrypt data with secret key
  encryptData(data) {
    return CryptoJS.AES.encrypt(JSON.stringify(data), this.encryptSecretKey).toString();
  }

  // Encrypt data
  decryptData(data) {
    if (data) {
      const bytes = CryptoJS.AES.decrypt(data, this.encryptSecretKey);
      if (bytes.toString()) {
        return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
      }
    }
    console.log(data)
    return data;
  }

  // Authentication check
  checkLogin(user) {
    return this.http.post(this.serverurl + '/auth/local', user)
  }

  // Setting up data
  setcurrentelement(data) {
    this.currentelement = data
  }

  // Get currentelement data
  getcurrentelement() {
    return this.currentelement
  }

  // Making data as encrypted and storing in local storage with the name of 'current path'
  setpath(data) {
    for (var j = 0; j < data.length; j++) {
      if (data[j]) {
        for (var i in data[j]) {
          if (data[j][i] && (i == 'name' || i=='_id')) data[j][i] = this.encryptData(data[j][i]);
          else{ delete data[j][i]; }
        }
      }
    }
    localStorage.setItem('currentpath', JSON.stringify(data));
  }

  // Get current path from local storage
  getpath() {
    return JSON.parse(localStorage.getItem('currentpath'))
  }

  // Making data as encrypted and storing in local storage with the name of 'naviagation'
  setroutingnavigation(data) {
    this.routing = this.encryptData(data)
    localStorage.setItem('navigation', this.routing);
    return this.routing
  }

  // get navigartion from local storage
  getroutingnavigation() {
    return localStorage.getItem('navigation')
  }

  // Delete user when sign up with twitter / facebook verification
  deleteDoc(obj) {
    return this.http.get(this.serverurl + '/api/users/deletesocialdoc/' + obj)
  }

  // login with twitter
  twitterLogin(obj) {
    return this.http.post(this.serverurl + '/api/users/twitterlogin', obj)
  }

  // login with facebook
  facebookLogin(obj) {
    return this.http.post(this.serverurl + '/api/users/facebooklogin', obj)
  }

  // heck old password when user user try to change password
  checkpassword(password) {
    var postVar1 = { type: "password", value: password };
    return this.http.post(this.serverurl + '/api/users/oldPasswordChecking', postVar1)
  }

  // Registered Users List
  getUsers() {
    return this.http.get(this.serverurl + '/api/users/getUsers')
  }

  // get Profile 
  getProfile() {
    return this.http.get(this.serverurl + '/api/users/me')
  }

  // Get selected user 
  getuserid(data) {
    return this.http.get(this.serverurl + '/api/users/checkuserid/' + data)
  }

  // Forgot Password Sending OTP to the Email
  forgotPassEmail(otpObj) {
    return this.http.post(this.serverurl + '/api/users/forgotPassEmail', otpObj)
  }

  // Verify OTP when user click on  Forgot Password
  verifyOtp(otpObj) {
    return this.http.post(this.serverurl + '/api/users/verifyotp', otpObj)
  }

  // Forgot Password Sending OTP to the Email
  changeForgotPass(Pass) {
    return this.http.post(this.serverurl + '/api/users/changeForgotPass', Pass)
  }

  // Change password
  changePass(user) {
    return this.http.put(this.serverurl + '/api/users/change/password', user)
  }

  // setting user data in encrypted format while storing in local storage
  setUserLoggedIn(data) {
    if (data.user.type == 'organisation') {
      this.localstorageData = {
        'token': data.token,
        'email': this.encryptData(data.user.email),
        'role': this.encryptData(data.user.role),
        'type': this.encryptData(data.user.type),
        'new': this.encryptData(data.user.new),
        'id': this.encryptData(data.user._id),
        'name': this.encryptData(data.user.companyname)
      }
    }
    if (data.user.type == 'individual') {
      this.localstorageData = {
        'token': data.token,
        'email': this.encryptData(data.user.email),
        'name': this.encryptData(data.user.name),
        'role': this.encryptData(data.user.role),
        'type': this.encryptData(data.user.type),
        'id': this.encryptData(data.user._id),
        'new': this.encryptData(data.user.new)
      }
    }
    if (data.user.type == 'employee') {
      this.localstorageData = {
        'token': data.token,
        'email': this.encryptData(data.user.email),
        'name': this.encryptData(data.user.name),
        'role': this.encryptData(data.user.role),
        'type': this.encryptData(data.user.type),
        'id': this.encryptData(data.user._id),
        'new': this.encryptData(data.user.new),
        'organizationid': this.encryptData(data.user.organizationid)
      }
    }
    localStorage.setItem('loggedIn', 'true')
    localStorage.setItem('currentUser', JSON.stringify(this.localstorageData));
  }

  //  Get user logged in status
  getUserLoggedIn() {
    return JSON.parse(localStorage.getItem('loggedIn') || this.isUserLoggedIn.toString())
  }

  // Setting loggedIn as false to logging out from the account
  setUserLogout() {
    this.isUserLoggedIn = false;
    localStorage.setItem('loggedIn', 'false')
  }

  // Logging out (Removing local storage data)
  logout() {
    var userToken = { 'token': null, 'email': null, 'name': null, 'type': null, 'role': null, 'new': null }
    localStorage.setItem('loggedIn', "false")
    localStorage.setItem('currentUser', JSON.stringify(userToken))
    this.CookieService.delete('token', '/')
    this.router.navigate(['/']);
  }

  //  Verify OTP when user click on  Forgot Password
  verifyemail(user) {
    return this.http.post(this.serverurl + '/api/users/verifyemail1', user)
  }

  //getting all users in database for two way verfication
  getUser(mobilenumber) {
    var postVar = { type: "mobile", value: mobilenumber };
    return this.http.post(this.serverurl + '/api/users/checkusers', postVar)
  }

  // Update selected User
  updateimages(data) {
    return this.http.put(this.serverurl + '/api/users/update/' + data._id, data)
  }

  // Updtate selected user with data
  userStatusUpdate(user) {
    return this.http.put(this.serverurl + '/api/users/' + user._id, user)
  }

   // Check user with email
  getemail(email) {
    var postVar1 = { type: "email", value: email };
    return this.http.post(this.serverurl + '/api/users/checkusers', postVar1)
  }

  // check user individual / organisation user status when click on mail link
  getUserData(email) {
    var postVar1 = { type: "email", value: email };
    return this.http.post(this.serverurl + '/api/users/checkusers1', postVar1)
  }

  //  Check whether the User is exist or not
  getallemail(email) {
    return this.http.post(this.serverurl + '/api/users/checkallusers', email)
  }

  // get registered users
  getRegisteredUsers() {
    return this.http.get(this.serverurl + '/api/users/getRegisteredUsers')
  }

  // create chat
  createChat(chatdata) {
    return this.http.post(this.serverurl + '/api/chats/', chatdata);
  }

  // Get a list of chat for a document
  getChatHistory(id) {
    return this.http.get(this.serverurl + '/api/chats/' + id);
  }

  // Get selected chat
  getChatDoc(id) {
    return this.http.get(this.serverurl + '/api/chats/getdoc/' + id);
  }

  // Get a list of unread chat for a user
  getChatDocuments() {
    return this.http.get(this.serverurl + '/api/chats/');
  }

  // Updates an existing chat
  markedchatread(i) {
    return this.http.put(this.serverurl + '/api/chats/' + i._id, i)
  }

  // google login
  googlelogin() {
    return this.http.get(this.serverurl + '/auth/google');
  }

  // Checking department presence
  getDept(department) {
    var postVar = { type: "department", value: department };
    return this.http.post(this.serverurl + '/api/departments/checkdepartments', postVar)
  }

  // filtering input data 
  filterusers(data) {
    return this.http.post(this.serverurl + '/api/users/filterUsers', data)
  }

  // Search Employess based On Name
  Searchuser(search) {
    return this.http.post(this.serverurl + '/api/users/search/user', search)
  }

  // Check user
  checkemail(email) {
    var email1 = { type: "activeEmail", value: email }
    return this.http.post(this.serverurl + '/api/users/checkusers', email1);
  }

  //  Decrypt all the data when user signin / signup from google/facebook/twitter
  userdecryptData(data) {
    return this.http.post(this.serverurl + '/api/users/userecryptDatas', data);
  }

  // Get Country List  when user send link to Mobiles
  getcountries(country) {
    return this.http.post(this.serverurl + '/api/users/getcountries', country);
  }

  // get Active Users in Seleced Departments
  getDepartments(departments) {
    return this.http.post(this.serverurl + '/api/users/getDepartments', departments);
  }
    // to clear all other user selection
   clearAll()
  {
    return this.http.get(this.serverurl + '/api/usersessions/clearAll');

  }

  searchElementSet(element)
  {
   this.searchElement=element
  }
  searchElementReturn()
  {
   return this.searchElement
  }
}
