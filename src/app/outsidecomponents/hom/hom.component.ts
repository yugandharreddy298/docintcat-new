import { Component, OnInit, HostListener, ViewChild, ElementRef, NgZone } from '@angular/core';
import { GeneralService } from '../../general.service';
import { Router } from '@angular/router';
import { UserService } from '../../user.service';
import { AdminService } from '../../admin.service';
import { MatDialog, } from '@angular/material';
import { DocumentService } from '../../document.service';
import { ActivatedRoute, Params } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { MatSnackBar } from '@angular/material';
import { FormControl } from '@angular/forms';
import { TooltipPosition } from '@angular/material';
import { FrontEndConfig } from '../../frontendConfig';

declare global {
  interface Window {
    RTCPeerConnection: RTCPeerConnection;
    mozRTCPeerConnection: RTCPeerConnection;
    webkitRTCPeerConnection: RTCPeerConnection;
  }
}
declare var $: any;
@Component({
  selector: 'app-hom',
  templateUrl: './hom.component.html',
  styleUrls: ['./hom.component.css']
})
export class HomComponent implements OnInit {
  isInvalidEmailError: boolean;
  isInvalidMobileError: boolean;
  [x: string]: any;
  constructor(
    private zone: NgZone,
    private snackBar: MatSnackBar,
    private cookieService: CookieService,
    public activatedroute: ActivatedRoute,
    public generalservice: GeneralService,
    private router: Router,
    public userService: UserService,
    public adminservice: AdminService,
    public dialog: MatDialog,
    public documentservice: DocumentService,
    private frontendconfig: FrontEndConfig
  ) {

  }
  @ViewChild('buttonMobileMenu') buttonMobileMenu: ElementRef<any>;
  capsOn;
  positionOptions: TooltipPosition[] = ['right'];
  position = new FormControl(this.positionOptions[0]);
  myOptions = {
    'placement': 'left',
    'show-delay': 500
  }
  emailvalid: boolean;
  login = true;
  register = false;
  reset = false;
  reset1 = true;
  hide = true;
  hide1 = true;
  email;
  check = false;
  individualclick: boolean;
  organisationclick: boolean;
  check1 = false;
  check2 = false;
  check3 = false;
  check4 = false;
  req1 = false;
  individual = false;
  iserror = false;
  otpTextBox = false;
  errorres: any;
  emailchecked = false;
  userdata: any;
  changepassword = false;
  useremail: any;
  id: any;
  show1: any = false;
  userForm: any
  Remember: boolean = false;
  username: any;
  name: any;
  companyname: any;
  password: any;
  passwordMinLength: boolean;
  passwordupper: boolean;
  passwordLower: boolean;
  passwordNumber: boolean;
  passwordSpecial: boolean;
  upadtepassword: boolean;
  upadtepassword1: boolean = true;
  usernameLength = false;
  formCheck: any;
  displayerror: any;
  maxTime: any = 120;
  time: any = 0;
  timer: any;
  showtime: any;
  organisation: boolean = false;
  hidedata: boolean = true;
  type: any;
  organisation_formSubmitted: boolean;
  formSubmitted: boolean = false;
  key: any;
  cookiename: any;
  cookievalues = [];
  emailcheck: boolean = false;
  orgemailcheck: boolean = false;
  emailForSignup: any;
  services: any;
  testimonials: any;
  loadergif: boolean = false;
  loadergif2: boolean = false
  decryptedData: any;
  routername: String;
  message1: any;
  private ipRegex = new RegExp(/([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/); // for Public IP 
  localIp: any;
  IpAddress: any;
  routername1: any; 
  iebrowser: any; // detect IE browser
  emailinvalid: any; //  for IE email validation in login
  passwoedinvalid: any;// for IE password validation in login
  usernameinvalid: any;// for IE username validation in login
  fileid: any; // assign document id when navigate from mail 
  isEmailLoaded: boolean = false; // For email checking, i.e email is getting from the DB
  invalidmobile: any;
  focusin: any;
  ip: any; // for IP 
  mobileMenuShow: boolean = true; // display toogle icon in mobile view
  errors = false 
  serverurl  = this.frontendconfig.getserverurl();
  req = false 
  Resendtime=false // check time is set to zero or not 
  confirmPassword;
  Password;
  formSubmitted1;
  ForgetformSubmitted=false //to check forgotPassword email submitted or not
  ngOnInit() {

   /**
   * Desc : cookies if exists
   */
    const cookieExists = this.cookieService.check('token');
    if (cookieExists) { this.router.navigate(['/home/myfiles/']); }
  /**
   * Desc : Handle signup or sign with google or facebook or twitter
   */
    const token = this.activatedroute.snapshot.queryParams.token;
    const title = this.activatedroute.snapshot.queryParams.title;
    const userData = {
      name: this.activatedroute.snapshot.queryParams.name,
      email: this.activatedroute.snapshot.queryParams.email,
      new: this.activatedroute.snapshot.queryParams.new,
      role: this.activatedroute.snapshot.queryParams.role,
      type: this.activatedroute.snapshot.queryParams.type,
      provider: this.activatedroute.snapshot.queryParams.provider,
      twitter_id: this.activatedroute.snapshot.queryParams.twitter_id || null,
      facebook_id: this.activatedroute.snapshot.queryParams.facebook_id || null,
    };
      /**
   * Desc : Handle signup or sign with google or facebook or twitter
   */
    if (title === 'googlelogin') {
      this.userService.userdecryptData(userData).subscribe((data: any) => {
        this.decryptedData = data;
        data.token = token;
        data.user = data;
        if (data.provider === 'facebook') {
          if (data.email === 'individual' || data.email === '') {
            this.isDelete = true;
            document.getElementById('fbemailmobileBtn').click();
          } else {
            this.socialLoginNavigation(data)
          }
        } else if (data.provider === 'twitter') {
          if (data.email === 'individual' || data.email === '') {
            this.isDelete = true;
            document.getElementById('emailmobileBtn').click();
          } else {
            this.socialLoginNavigation(data)
          }
        } else {
         this.socialLoginNavigation(data)
        }
      });
    }

    if (window.innerWidth < 1000) {
      this.mobileMenuShow = false;
    }
    this.IpAddress = JSON.parse(localStorage.getItem('mylocation')); // get public IP from local storage
    this.ip = JSON.parse(localStorage.getItem('myip')); // get  public IP from local storage

    // detect IE browser
    if ((!!(window as any).MSInputMethodContext && !!(document as any).documentMode)) {
      this.iebrowser = true;
    } else {
      this.iebrowser = false;

    }

  /**
   * Desc : Handle queryparams when user navigate from other tabs its works in IE , EGDE
   */

    this.activatedroute.queryParams.subscribe((queryParams: Params) => {

      this.routername1 = queryParams.type
      if ((/Edge\/\d./i.test(navigator.userAgent) || (!!(window as any).MSInputMethodContext && !!(document as any).documentMode))
        && this.routername1 == 'undefined' && this.routername == '') {
        this.router.navigate(['/']);
        document.getElementById('loginclose').click();
      } else if ((/Edge\/\d./i.test(navigator.userAgent) || (!!(window as any).MSInputMethodContext && !!(document as any).documentMode))
        && this.routername1 == 'Signup') {
        this.hidedata = true;
        this.checkorg = false;
        document.getElementById('test1').click();
      } else if ((/Edge\/\d./i.test(navigator.userAgent) || (!!(window as any).MSInputMethodContext && !!(document as any).documentMode))
        && this.routername1 == 'individualsignup') {
        this.type = 'individual';
        this.individualclick = true;
        this.organisationclick = false;
        this.hidedata = false;
        this.individual = true;
        this.checkorg = false;
        document.getElementById('test1').click();
        setTimeout(() => {
          $('#target').focus();
        }, 1000);
      }
      else if ((/Edge\/\d./i.test(navigator.userAgent) || (!!(window as any).MSInputMethodContext && !!(document as any).documentMode))
        && this.routername1 == 'individuallogin') {
        document.getElementById('loginModalBtn').click();
        setTimeout(() => {
          $('#target').focus();
        }, 1000);
        if (queryParams && queryParams.id) {
          this.id = queryParams.id;
          sessionStorage.setItem('id',this.id)
        }
        if (queryParams && queryParams.fileid) {
          this.fileid = queryParams.fileid;
          sessionStorage.setItem('fileid',this.fileid)
        }

      }
    });
    this.determineLocalIp();

  /**
   * Desc : Handle queryparams when user navigate from other tabs its works in all browser  Except IE browser
   */

    this.activatedroute.queryParams.subscribe(params => {
      this.routername = params['type'];
      if (this.routername === 'undefined' && this.routername === '') {
        this.router.navigate(['/']);
        document.getElementById('loginclose').click();
      } else if (this.routername === 'Signup') {
        this.hidedata = true;
        this.checkorg = false;
        document.getElementById('test1').click();
      } else if (this.routername === 'individualsignup') {
        this.type = 'individual';
        this.individualclick = true;
        this.organisationclick = false;
        this.hidedata = false;
        this.individual = true;
        this.checkorg = false;
        document.getElementById('test1').click();
        setTimeout(() => {
          $('#target').focus();
        }, 1000);
      } else if (this.routername === 'individuallogin') {
        document.getElementById('loginModalBtn').click();
        setTimeout(() => {
          $('#target').focus();
        }, 1000);
        this.fileid = params.fileid;
       if(params && params.id) sessionStorage.setItem('id',params.id);
       if(params && params.fileid) sessionStorage.setItem('fileid',params.fileid);
      }


    });
    this.id = this.activatedroute.snapshot.queryParams.id;  // get id from query params
    var dynamicyear :any = document.getElementById("year");
    dynamicyear.innerHTML = new Date().getFullYear();
  }

  /**
   * Function name : determineLocalIp
   * Input : null
   * Output : private ip   
   * Desc : get Private IP of respective user 
   */
  private determineLocalIp() {
   // window.RTCPeerConnection = this.getRTCPeerConnection();

    const pc = new RTCPeerConnection({ iceServers: [] });
    pc.createDataChannel('');
    pc.createOffer().then(pc.setLocalDescription.bind(pc));

    pc.onicecandidate = (ice) => {
      this.zone.run(() => {
        if (!ice || !ice.candidate || !ice.candidate.candidate) {
          return;
        }

        this.localIp = this.ipRegex.exec(ice.candidate.candidate)[1];        
        const encryptdip = this.userService.encryptData(this.localIp);
        localStorage.setItem('ipaddress', encryptdip);

      });
    };
    const ipdata = localStorage.getItem('ipaddress');
    if (!this.IpAddress && !this.ip) {
      this.IpAddress = this.userService.decryptData(ipdata);
    }
  }
      /**
   * Function name : HostListener window refresh event
   * Desc : show alert when user click on browser refresh  
   */

  @HostListener("window:beforeunload", ["$event"]) unloadHandler(event: Event) {
    if(this.Resendtime){
     console.log("Processing beforeunload...");
     // Do more processing... 
     event.returnValue = true;
    }

}
    /**
   * Function name : HostListener window resize event
   * Desc : handle mobile toggle icon on resize window
   */
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    if (window.innerWidth < 1000) {
      this.mobileMenuShow = false;
    } else {
      this.mobileMenuShow = true;
    }
  }
  /**
   * Function name : HostListener window popstate event
   * Desc : hanble browser back 
   */
  @HostListener('window:popstate', ['$event'])
  onPopState(event) {

    const login = localStorage.getItem('loggedIn');

    if (login !== 'true') {
      this.router.navigate(['/']);

    }
  }
  /**
   * Function name : HostListener window scroll event
   * Desc : show toggle menu in mobile view
   */
  @HostListener('window:scroll', ['$event'])
  onWindowScroll($event) {
    if (this.buttonMobileMenu.nativeElement.contains(event.target)) {
      if (this.mobileMenuShow) {
        this.mobileMenuShow = false;

      } else {
        this.mobileMenuShow = true;


      }
    } else if (window.innerWidth < 1000) {
      this.mobileMenuShow = false;
    }
  }
  @HostListener('window:click', ['$event']) onClick(event) {
    if (this.buttonMobileMenu.nativeElement.contains(event.target)) {
       if(this.mobileMenuShow ) {
      this.mobileMenuShow = false;

    } else {
      this.mobileMenuShow = true;

      
       } 
    } else if(window.innerWidth < 1000) {
      this.mobileMenuShow = false;
    } 
  
  
  }
  /**
   * Function name : loginmodel
   * Input : null
   * Output : show login popup    
   * Desc : show login model when users clicks on login in home page
   */
    loginmodel() {
    if (this.cookieService.check('u')) {
      this.username = this.userService.decryptData(this.cookieService.get('u'));
      this.Remember = true;
    }
    // click on tab email or password field highlighting 
    if (!this.username) {
      setTimeout(() => {
        $('#target').focus();
      }, 1000);
    }
    if (this.username) {
      setTimeout(() => {
        $('#PasswordTarget').focus();
      }, 1000);
    }

    document.getElementById('loginModalBtn').click();
    document.getElementById('loginclose').click();
  }
 /**
   * Function name : socialLoginNavigation
   * Input : login user ,token
   * Output : navigate to sepcific routers    
   * Desc : navigate to respective page while social logins through mail links and social logins
   */
  socialLoginNavigation(data) {
    var id = sessionStorage.getItem('id')
    var fileid = sessionStorage.getItem('fileid')
    this.userService.setUserLoggedIn(data);
    if (data.user.type === 'individual') {
      if (id && !fileid) {
        this.router.navigate(['/user/allowusers/' + id]);
        sessionStorage.removeItem('id')
      } else  if (fileid && !id) {
        const sharedata = {
          fileid: fileid
        }
        this.documentservice.decryptedvalues(sharedata).subscribe((filedata: any) => {
          this.documentservice.getSharingPeoples(filedata.decryptdata).subscribe(filedata => {
            const userdata: any = filedata;
            if (userdata.sharingpeoples[0].fromid.email === data.user.email) {
                this.router.navigate(['individual/filecont/' + fileid]);
                sessionStorage.removeItem('fileid')
            } else {
              this.router.navigate(['checkuser/' + fileid]);
              sessionStorage.removeItem('fileid')
            }
          });
        });
      }
      else {
        this.router.navigate(['/individual/home/myfiles/']);
      }
    } else if (data.user.type === 'employee' || data.user.type === 'organisation') {
      if (id) {
        this.router.navigate(['/user/allowusers/' + id]);
        sessionStorage.removeItem('id')
      }
      else  if (fileid && !id) {
        const sharedata = {
          fileid: fileid
        }
        this.documentservice.decryptedvalues(sharedata).subscribe((filedata: any) => {
          this.documentservice.getSharingPeoples(filedata.decryptdata).subscribe(filedata => {
            const userdata: any = filedata;
            if (userdata.sharingpeoples[0].fromid.email === data.user.email) {
                this.router.navigate(['organization/filecont/' + fileid]);
                sessionStorage.removeItem('fileid')
            } else {
              this.router.navigate(['checkuser/' + fileid]);
              sessionStorage.removeItem('fileid')
            }
          });
        });
      } else {
        this.router.navigate(['/organization/home/myfiles/']);
      }
    }
   
  }
  /**
   * Function name : signupmodel
   * Input : null
   * Output : show signup popup    
   * Desc : show signup model when users clicks on signup in home page
   */
    signupmodel() {
    document.getElementById('sample1').click();
  }
  /**
   * Function name : signupnow
   * Input : null
   * Output : show signup model    
   * Desc : show signup model when users clicks on signup in loginpage 
   */
  signupnow() {
    this.hidedata = true
    document.getElementById('sample4').click();
    document.getElementById('sample1').click();
    document.getElementById('sample2').click();
  }
    /**
   * Function name : forgetpassword
   * Input : null
   * Output : show forgot password screen   
   * Desc : show Forgot password screen when click on login model
   */
  forgetpassword() {

    setTimeout(() => {
      $('#ForgetPasswordemail').focus(); // set focus to email when click Forgot Password
    }, 1000);

    this.email = '';
    this.login = false;
    this.reset = true;
    this.reset1 = true;
    this.otpTextBox = false;
  }
  /**
   * Function name : individualClick
   * Input : title (individual / organisation)
   * Output : select  individual  
   * Desc : select  individual  while sign up 
   */ 
  individualClick(title) {
    if (title === 'inv') {
      this.type = 'individual';
      this.individualclick = true;
      this.organisationclick = false;
    } else {
      this.type = 'organisation';
      this.individualclick = false;
      this.organisationclick = true;
    }
  }

  checkorg = false;
   /**
   * Function name : formOpen
   * Input : null
   * Output : select  individual / organisation  
   * Desc : select  individual / organisation  while sign up 
   */ 
  formOpen() {
    if (!this.name) {
      setTimeout(() => {
        $('#target1').focus(); // target name when open model
      }, 1000);
    }
    this.checkorg = false;
    if (this.individualclick) {
      this.checkorg = false;
      this.individual = true;
      this.hidedata = false;
    }
    if (this.organisationclick) {
      this.organisation = true;
      this.hidedata = false;
    } else {
      this.checkorg = true;
    }
  }



  email1: any;
     /**
   * Function name : signin
   * Input : json {email , password}
   * Api: auth/local
   * Output : Array  {User,token}
   * Desc : check  user while signup/login   with twitter or facebook  
   * Error :{String}  Unauthorized 
   */ 
   signin = function (user) {
    this.check = true;
    this.iserror = false;
    if (this.iebrowser) {
      if (!user.valid) {
        this.passwoedinvalid = true;
      }
    }
    if (user.value) {
      this.email1 = user.value.username.toLowerCase()
    }
    if (user.valid) {
      this.iserror = false;
      user.value.username = user.value.username.toLowerCase()
      this.generalservice.checkLogin(user.value).subscribe(data => {
        console.log('userdata', data)
        this.check = false;
        if (data.token) {
          // for remember me storing in cookies
          if (user.value.Remember) {
            this.cookieService.set('u', this.userService.encryptData(user.value.username), 6); // 6 days
            this.cookieService.set('p', this.userService.encryptData(user.value.password), 6); // 6 days 
          } else {
            this.cookieService.delete('u');
            this.cookieService.delete('p');
          }
          this.userService.setUserLoggedIn(data);
          if (document.getElementById('signInCloseBtn')) {
            document.getElementById('signInCloseBtn').click();
          }
          if (data.user.active === false) {
            this.router.navigate(['/emailactivation']);
          } else if (this.id) {
            this.router.navigate(['/user/allowusers/' + this.id]);
          } else if (this.fileid && data.user.active) {
            const sharedata = {
              fileid: this.fileid
            }
            this.documentservice.decryptedvalues(sharedata).subscribe((filedata: any) => {
              this.documentservice.getSharingPeoples(filedata.decryptdata).subscribe(filedata => {
                const userdata = filedata;
                if (userdata.sharingpeoples[0].fromid.email === data.user.email) {
                  if (data.user.type === 'individual') {
                    this.router.navigate(['individual/filecont/' + this.fileid]);
                  } else if (data.user.type === 'employee' || data.user.type === 'organisation') {
                    this.router.navigate(['organization/filecont/' + this.fileid]);
                  }

                } else {
                  this.router.navigate(['checkuser/' + this.fileid]);
                }
              });
            });
          } else {
            if (data.user.role === 'user' && data.user.type === 'individual') {
              this.router.navigate(['/individual/home/myfiles']);
            } else if (data.user.role === 'user' && (data.user.type === 'organisation' || data.user.type === 'employee')) {
              this.router.navigate(['/organization/home/myfiles']);
            }
            if (data.user.role === 'admin') {
              this.router.navigate(['/admin/adminnavbar']);
            }
          }
        }
      }, error => {
        if (error === 'Account Verification is pending please verify.') {
          if (document.getElementById('signInCloseBtn')) {
            document.getElementById('signInCloseBtn').click();
          }
          const data = { email: this.email1 };
          this.adminservice.resendConfirmationEmail(data).subscribe(data => { });
          this.router.navigate(['/emailactivation/', this.userService.encryptData(this.email1)]);
        }
        this.iserror = true;
        this.errorres = error;

      });
    }
  }
  
    /**
   * Function name : Restrictspacekey
   * Input : event
   * Output : Restrict space
   * Desc : Restrictspacekey in change password
   */

  Restrictspacekey(event) {

    if (event.keyCode === 32) {

      return false;
    }
  }
    /**
   * Function name : Restrictcharacter
   * Input : event
   * Output : Restrict f7
   * Desc : Password pattern validation  
   */
  Restrictcharacter(event) {

    if (event.keyCode === 118) {

      return false;
    }
  }

  /**
   * Function name : validate
   * Input : password
   * Output : validate password as 1 upper, 1 lower , 1 captial and one special character
   * Desc : Password pattern validation  
   */
  validate(password) {
    this.passwordMinLength = false;
    this.passwordupper = false;
    this.passwordLower = false;
    this.passwordNumber = false;
    this.passwordSpecial = false;
    const minMaxLength: RegExp = /^[\s\S]{8,32}$/;
    const upper: RegExp = /[A-Z]/;
    const lower: RegExp = /[a-z]/;
    const phonenumber: RegExp = /[0-9]/;
    const special: RegExp = /[ !"#$%&()*+,\-./:;<=>?@[\\\]^_`{|}~]/;
    if (minMaxLength.test(password)) {
      this.passwordMinLength = true;
    }
    if (upper.test(password)) {
      this.passwordupper = true;
    }
    if (lower.test(password) && password !== undefined) {
      this.passwordLower = true;
    }
    if (phonenumber.test(password)) {
      this.passwordNumber = true;
    }
    if (special.test(password)) {
      this.passwordSpecial = true;
    }
  }
  message: any;
     /**
   * Function name : onKeyDownemail1
   * Input : email
   * Api: users/checkusers1
   * Output : Json User
   * Desc : check  user while signup/login   with twitter or facebook  
   * Error :{String}  data : false
   */
  onKeyDownemail1(email) { // Check whether Email exits
    const regexp = new RegExp('([A-Za-z]|[0-9])[A-Za-z0-9.]+[A-Za-z0-9]@((?:[-a-z0-9]+\.)+[a-z]{2,})')
    this.check1 = false;
    this.message = null;
    if (regexp.test(email)) {
      this.userService.getUserData(email.toLowerCase()).subscribe(data => {
        this.userdata = data;
        this.emailchecked = true;
        if (this.userdata.provider || this.userdata.email) {
          this.check1 = true;
          if (this.userdata.provider) {
            this.message = "This Email is already registered/logged-in with " + this.userdata.provider + ". Try to login with " + this.userdata.provider;
          } else {
            this.message = 'This Email is already registered/logged-in with credentials. Try to login with your credentials';
          }
        }
      });
    }
  }
     /**
   * Function name : onBlurMethod1
   * Input : email
   * Api: users/checkusers
   * Output : Json User
   * Desc : check  user while login 
   * Error :{String}  data : false
   */
  onBlurMethod1(email) {
    this.check1 = false;
    var regexp = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
    if (regexp.test(email)) {
      this.userService.getemail(email.toLowerCase()).subscribe(data => {
        this.userdata = data
        if (!this.userdata.data) {
          this.check1 = true
        }
      })
    }
    if (!regexp.test(email)) {

      this.check1 = true;
      this.check = false;
    }

  }
   /**
   * Function name : onKeyDownemail
   * Input : email
   * Api: users/checkusers
   * Output : Json User
   * Desc : check  user while login 
   * Error :{String}  data : false
   */
  onKeyDownemail(email) { // Check whether Email exits 
    const regexp = new RegExp('([A-Za-z]|[0-9])[A-Za-z0-9.]+[A-Za-z0-9]@((?:[-a-z0-9]+\.)+[a-z]{2,})');
    this.check1 = false;
    if (regexp.test(email)) {
      this.userService.getemail(email.toLowerCase()).subscribe(data => {
        this.userdata = data;
        this.emailchecked = true;
        if (this.userdata.data) {
          this.check1 = true;
        }
      })
    }
  }

   /**
   * Function name : onKeyDownSignupemail
   * Input : email
   * Api: users/checkusers
   * Output : Json User
   * Desc : check individual user exits in DB or not
   * Error :{String}  data : false
   */
  onKeyDownSignupemail(email) { // Check whether Email exits 
    const regexp = new RegExp('([A-Za-z]|[0-9])[A-Za-z0-9.]+[A-Za-z0-9]@((?:[-a-z0-9]+\.)+[a-z]{2,})')
    this.check2 = false;
    if (regexp.test(email)) {
      this.userService.getemail(email.toLowerCase()).subscribe((data: any) => {
        this.userdata = data;
        this.emailchecked = true;
        if (this.userdata.data && this.userdata.user && !this.userdata.user.active) {
          this.emailcheck = true;
          this.check2 = false;
        } else if (this.userdata.data) {
          this.check2 = true;
          this.emailcheck = false;
        } else {
          this.emailcheck = false
          this.check2 = false
        }
      })
    }
  }
    /**
   * Function name : Checking
   * Input : event
   * Output : set as remenber me 
   */
  Checking(e) {
    if (e.code == 'Enter' && !this.Remember) {
      this.Remember = true;
    }
    else if (e.code == 'Enter' && this.Remember) {
      this.Remember = false;
    }
  }
  /**
   * Function name : onKeyDownorgemail
   * Input : email
   * Api: users/checkusers
   * Output : Json User
   * Desc : Check organisation email
   * Error :{String}  data : false
   */

  onKeyDownorgemail(email) {
    var regexp = new RegExp('([A-Za-z]|[0-9])[A-Za-z0-9.]+[A-Za-z0-9]@((?:[-a-z0-9]+\.)+[a-z]{2,})')
    this.check3 = false;
    if (regexp.test(email)) {
      this.userService.getemail(email.toLowerCase()).subscribe(data => {
        this.userdata = data
        this.emailchecked = true;
        if (this.userdata.data && this.userdata.user && !this.userdata.user.active) {
          this.orgemailcheck = true
          this.check3 = false
        }
        else if (this.userdata.data) {
          this.check3 = true
          this.orgemailcheck = false
        }
      })
    }
  }

  isDelete: any = true
  ConfirmPassword
  cPassword
  /**
   * Function name : closeforget
   * Input : Form data
   * Output : String
   * Desc : reset data when Forgot password  model close
   */
  closeforget(formName) {
    this.ConfirmPassword = ''
    this.cPassword = ''
    this.displayerror = false;
    this.errorres = '';
    this.check1 = false;
    this.req1 = false;
    this.Resendtime=false;
    if (formName) { formName.resetForm(); }
  }
    /**
   * Function name : closeModel
   * Input : Form data
   * Output : String
   * Desc : reset data when login  model close
   */
  closeModel(formName) {
    if (formName) { formName.resetForm(); this.check = false; }
    this.hide = true;
    this.hide1 = true;
    this.otpTextBox = false;
    this.changepassword = false;
    this.emailinvalid = false;
    this.passwoedinvalid = false;
    this.usernameinvalid = false;
    this.invalidmobile = false;
         
  }
  /**
   * Function name : closeModelsocial
   * Input : json param
   * Output : String
   * Api   : users/deletesocialdoc/
   * Desc : reset email when close model and then deleted that account
   */
  closeModelsocial(formName) {
    if (formName) { formName.resetForm(); this.check1 = false; }
    if (this.isDelete) {
      this.userService.deleteDoc(this.decryptedData.twitter_id || this.decryptedData.facebook_id).subscribe(data => {
      })
    }
  }
  /**
   * Function name : closeModel1
   * Input :  form
   * Desc :reset model data and navigates to home
   */
  closeModel1(form) {
    this.reset1 = true;
    this.Resendtime=false;
    document.getElementById('loginclose').click();
    this.formSubmitted = false;
    this.organisation_formSubmitted = false;
    if (form) {
      form.resetForm();
    }
    this.emailinvalid = false;
    this.passwoedinvalid = false;
    this.usernameinvalid = false;
    this.invalidmobile = false;
  }
  /**
   * Function name : escaptdisable
   * Input :  null
   * Desc :reset model data and navigates to home
   */
  escaptdisable() {
    this.reset1 = true;
    this.router.navigate(['/'])
  }
    /**
   * Function name : signup
   * Input :  json / user data 
   * Output :  {Json}  User
   * Desc : Sign up individual / organisation 
   * Api : users/
   * Error : 500 Internal Server Error
   */
  email2
  signup = function (data, title) {
    this.IpAddress = JSON.parse(localStorage.getItem('mylocation'));
    this.ip = JSON.parse(localStorage.getItem('myip'));
    if (title === 'individual') {
      this.formSubmitted = true;
      if (!data.valid) {
        if (this.iebrowser) {
          this.emailinvalid = true
          this.passwoedinvalid = true
          this.usernameinvalid = true
        }

      }
    }
    if (title === 'organisation') {
      if (!data.valid) {
        if (this.iebrowser) {
          this.emailinvalid = true
          this.passwoedinvalid = true
          this.usernameinvalid = true
          this.invalidmobile = true
        }

      }
      this.organisation_formSubmitted = true;
    }
    if (this.type) {
      data.value.type = this.type;
      this.displayerror = false;
      this.email2 = data.value.email;

      if (data.valid && this.check === false) {
        if (title == 'individual') this.formSubmitted = false;
        if (title == 'organisation') this.organisation_formSubmitted = false;
        data.value.IP = (this.IpAddress) ? this.IpAddress.ip : (this.ip) ? this.ip.ip : 'not avilable'
        if (!this.check2 && !this.emailcheck) {
          this.adminservice.saveuser(data.value).subscribe(data => {
            if (data.token) {
              data.token = data.token
              data.user = data
              document.getElementById('signUpCloseBtn').click()
              this.userService.setUserLoggedIn(data)
              this.router.navigate(['/emailactivation', this.userService.encryptData(this.email2)]);
            }
          })
        }
      }
    }

  }

   /**
   * Function name : checkuseremil
   * Input :  Email 
   * Output :  {Json}  User
   * Desc : Check User  when try to cahnge Password Using  Forgot Password 
   * Api : users/checkusers
   * Error : {Json } Data : false
   */
  checkuseremil(email) {
    this.isEmailLoaded = false;
    this.displayerror = false;
    this.errorres = ''
    var regexp = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
    if (regexp.test(email)) {
      this.userService.getemail(email.toLowerCase()).subscribe(data => {
        console.log(data)
        this.userdata = data
        this.isEmailLoaded = true;
        if (!this.userdata.data) {
          this.check1 = true
        }
        else {
          this.check1 = false;
          if (this.userdata.user && !this.userdata.user.status && this.userdata.user.active) {
            this.displayerror = true;
            this.errorres = 'Account is blocked, Please contact admin.'
          }
          else if (this.userdata.user && !this.userdata.user.active && this.userdata.user.status) {
            this.displayerror = true;
            this.errorres = 'Account is not verified, Please verify.'
          }
        }
      })
    }



  }

  /**
   * Function name : sendOtp
   * Input :  Email 
   * Output :  {String}  success
   * Desc : Send OTP to Email using Forgot Password 
   * Api : users/forgotPassEmail
   * Error : {String} notFound. , server Error
   */
  sendOtp(usermailform) {
    this.IpAddress = JSON.parse(localStorage.getItem('mylocation'));
    this.ip = JSON.parse(localStorage.getItem('myip'));
    this.req1 = true
    clearInterval(this.timer);
    var email = usermailform.value.email
    if (usermailform.valid) {
      this.req1 = false
      this.ForgetformSubmitted=false
     if (!this.check1 && !this.displayerror && !this.errorres && this.isEmailLoaded) {
        this.loadergif = true
        this.displayerror = false
        this.errorres = ''
        var emaill = email.toLowerCase();
        this.useremail = emaill
        var user = { email: emaill, IpAddress: (this.IpAddress) ? this.IpAddress.ip : (this.ip) ? this.ip.ip : 'not avilable' }
        this.userService.forgotPassEmail(user).subscribe((data: any) => {
          if (data.res == 'success') {
            this.otpTextBox = true;
            setTimeout(() => {
              $('#otpfield').focus();
            }, 100);

            this.loadergif = false
            this.maxTime = 120;
            this.Resendtime=true
            this.reset1 = false;
            this.StartTimer();
            usermailform.resetForm()
          }
          else if (data.res) {
            this.errorres = data.res
            this.displayerror = true;
            this.loadergif = false;
          }
        });

      }


    }
    else this.req1 = true

  }
    /**
   * Function name : passwordUpdated
   * Input :  Null
   * Desc : show success image when change password through Forgot Password 
   */ 
  passwordUpdated() {
    this.show1 = true;
    this.reset = true;
    this.reset1 = false
  }
  /**
   * Function name : changePass
   * Input :  New password and Confirm Password
   * Output :  {String}  success
   * Desc : Change password using Forgot Password  
   * Api : users/changeForgotPass
   * Error : {String} Unauthorized
   */
  changePass = function (Pass) {
    if (!Pass.value.cPassword && !Pass.value.ConfirmPassword) {
      this.Password = false;
      this.confirmPassword = false;
      this.formSubmitted1 = true;
    }
    if (!Pass.value.cPassword && Pass.value.ConfirmPassword) {
      this.Password = true;
      this.confirmPassword = false;
    } else if (Pass.value.cPassword && !Pass.value.ConfirmPassword) {
      this.confirmPassword = true;
      this.Password = false;
    }
    this.IpAddress = JSON.parse(localStorage.getItem('mylocation'));
    this.ip = JSON.parse(localStorage.getItem('myip'));
    this.req = true
    this.errorres = ''

    if (Pass.valid && Pass.value.cPassword == Pass.value.ConfirmPassword) {
      var passData = { newPass: Pass.value.ConfirmPassword, email: this.useremail, IpAddress: (this.IpAddress) ? this.IpAddress.ip : (this.ip) ? this.ip.ip : 'not avilable' }
      this.userService.changeForgotPass(passData).subscribe(data => {
        if (data.res == 'success') {
          this.passwordUpdated();
          this.changepassword = false;
          this.resetimg = true
          this.otpTextBox = false;
          this.upadtepassword1 = false
          Pass.resetForm();
        }
      });

    }
  }

    /**
   * Function name : signinFacebook
   * Input : email 
   * Output :  get user data in Json
   * Desc : sign up/ signin with Facebook
   * Api : users/facebooklogin
   * Error : {string} No account 
   */
  signinFacebook(formData) {
    if (formData.valid && !this.check1) {
      this.type = 'individual';
      this.individualclick = true
      this.organisationclick = false;
      formData.value.facebook_id = this.decryptedData.facebook_id
      this.userService.facebookLogin(formData.value).subscribe((data: any) => {
        this.isDelete = false;
        document.getElementById('fbemailCloseBtn').click();
        this.userService.setUserLoggedIn(data);

        if (data.user.type === 'individual'){
          this.router.navigate(['/individual/home/myfiles/'])
        } else if (data.user.type === 'employee' || data.user.type === 'organisation'){
          this.router.navigate(['/organization/home/myfiles/']) 
        } 
      })
    }

  }
  /**
   * Function name : signinTwitter
   * Input : email 
   * Output :  get user data in Json
   * Desc : sign up/ signin with twitter
   * Api : users/twitterlogin 
   * Error : {string} No account 
   */
  signinTwitter(formData) {
    if (formData.valid && !this.check1) {
      this.type = 'individual';
      this.individualclick = true
      this.organisationclick = false;
      formData.value.twitter_id = this.decryptedData.twitter_id
      this.userService.twitterLogin(formData.value).subscribe((data: any) => {
        this.isDelete = false;
        document.getElementById('emailCloseBtn').click();
        this.userService.setUserLoggedIn(data);
        if (data.user.role === 'user') {
          this.router.navigate(['/organization/home/myfiles/'])
        }
      })
    }

  }
  resetimg = true
  /**
 * Function name : SubmitOTP
 * Input : otp  
 * Output : {String} success
 * Desc : Verify OTP for change Password Using  Forgot Passsword 
 * Api :users/verifyotp 
 * Error : { String }  OTPFAILED ,block 
 */
  SubmitOTP = function (otpData) {
    this.passwoedinvalid = false
    this.emailinvalid = false
    this.IpAddress = JSON.parse(localStorage.getItem('mylocation'));
    this.ip = JSON.parse(localStorage.getItem('myip'));
    var optvalue = otpData.value.otp
    this.formCheck = true
    if (otpData.valid) {
      this.formCheck = false
      var otpObj = { otp: optvalue, email: this.useremail, IP: (this.IpAddress) ? this.IpAddress.ip : (this.ip) ? this.ip.ip : 'not avilable' };
      this.userService.verifyOtp(otpObj).subscribe(data => {
        if (data.res == 'OTP-expired') {
          this.errorres = 'Your OTP is expired... Please click on resend to get new one.'
          this.displayerror = true;
          if (otpData) { otpData.resetForm(); this.req = false }
        }
        else if (data.res == 'OTPFAILED') {
          this.displayerror = true;
          this.errorres = 'Invalid OTP'
        }
        else if (data.res == 'block') {
          this.errorres = 'Your account is blocked... Please contact admin...'
          this.displayerror = true;
        }
        else if (data.res == 'success') {
          this.check = false;
          this.changepassword = true;
          this.register = false
          this.login = false
          this.resetimg = false
          otpData.resetForm();
          setTimeout(() => {
            $('#newPasswordemail').focus();
          }, 1000);
          clearInterval(this.timer)
          this.useremail = this.useremail.toLowerCase();
        }
      });
    }
  }

/**
 * Function name : facebook
 * Input : null 
 * Output : Success login / sign up using Facebook
 * Desc : Login / Signup with Facebook 
 */
  facebook() {
   location.href = this.serverurl+'/auth/facebook';
  }
  /**
 * Function name : google
 * Input : null 
 * Output : Success login / sign up using Google
 * Desc : Login / Signup with Google 
 */
  google() {
    console.log(this.serverurl)
    location.href =  this.serverurl+'/auth/google';
  }
/**
 * Function name : twitter
 * Input : null 
 * Output : Success login / sign up using Twitter
 * Desc : Login / Signup with Twitter 
 */
  twitter() {
   location.href =  this.serverurl+'/auth/twitter';

  }
/**
 * Function name : checkUserdata
 * Input : data , input Type
 * Output : update invalid sign up data works in IE Only
 * Desc : check data is empty or not when focus IE Browser Only 
 */
  checkUserdata(data, type) {
    if (type === 'mobile') {
      if ((data.value == '' || data.value == undefined) && this.iebrowser) {
        this.invalidmobile = true
      }
      else {
        this.invalidmobile = false
      }
    }
    else if (type === 'name') {
      if ((data.value == '' || data.value == undefined) && this.iebrowser) {
        this.usernameinvalid = true
      } else {
        this.usernameinvalid = false
      }
    }
    else if (type === 'password') {
      if ((data.value == '' || data.value == undefined) && this.iebrowser) {
        this.passwoedinvalid = true
      } else {
        this.passwoedinvalid = false
      }
    }
    else if (type === 'email') {
      if ((data.value == '' || data.value == undefined) && this.iebrowser) {
        this.emailinvalid = true
      }
      else {
        this.emailinvalid = false
  
      }
    }

  }
  /**
 * Function name : checkp
 * Input : password , event , login form data 
 * Output : Trigger signin method
 * Desc : Enter Password and Click Enter to trigger signin
 */
  checkp(password, event, form) {
    if (event.code === 'Enter' || event.code === 'NumpadEnter') {
      this.signin(form)
    }
    this.iserror = false
    if (password === undefined || password === '')
      this.errors = true
    else
      this.errors = false
  }
  /**
   * Function name : checksignupdata
   * Input : signup  data
   * Output : {Boolean}  True/False   
   * Desc : Check signup data is empty or not  
   */
  checksignupdata(userdata) {
    if (userdata === undefined || userdata === '') {
      this.errors = true;
    } else {
      this.errors = false;
    }
  }
  /**
   * Function name : next
   * Input : Event , next element id  , prev element id
   * Output : {Boolean}  True/False   
   * Desc : Restrict only numbers in OTP Fields , focus to next element 
   */
  next(event) {
this.displayerror=false
    const keys = [8, 9, 13, /*16, 17, 18,*/, 19, 20, 27, 33, 34, 35, 36, 37, 38, 39, 40, 45, 46, 48, , 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 86, 144, 145];

   if ($.inArray(event.which, keys) >= 0) {
      return true;
    }  else if (event.shiftKey || event.which <= 48 || event.which >= 58) {
      return false;
    }

  }


  /**
   * Function name : otpresend
   * Input : null 
   * Output : {String}  success   
   * Desc : Resend OTP In Forgot Password
   * api : users/forgotPassEmail
   * apiError : {String} block
   */
  otpresend = function () {

    this.loadergif2 = true;
    const user = { email: this.useremail, IpAddress: (this.IpAddress) ? this.IpAddress.ip : (this.ip) ? this.ip.ip : 'not avilable' };
    this.userService.forgotPassEmail(user).subscribe(data => {
      this.displayerror = false;
      this.req1 = true;

      if (data.res === 'success') {
        this.loadergif2 = false;
        this.maxTime = 120;
        this.Resendtime=true
        clearInterval(this.timer);

        this.StartTimer();
      } else if (data.res === 'block') {
        this.loadergif2 = false;
        this.errorres = 'Your account is blocked... Please contact admin...'
        this.displayerror = true;
      }
    });

  }



  /**
   * Function name : StartTimer
   * Input : null 
   * Output :  Start / Clear Time 
   * Desc : Start Timer when click On Forgot Password
   */
  StartTimer() {
    this.timer = setInterval(() => {
      if (this.time < this.maxTime) {
        this.maxTime -= 1;
        const minutes: number = Math.floor(this.maxTime / 60);
        this.showtime = (minutes + ':' + (this.maxTime - minutes * 60));
      } else {
       this.Resendtime=false
        clearInterval(this.timer);
      }
    }, 1000)
  }

  private getRTCPeerConnection() {
    return window.RTCPeerConnection ||
      window.mozRTCPeerConnection ||
      window.webkitRTCPeerConnection;
  }

  onFocus(type)
  {
   if(type=='email')
   {
     this.isInvalidEmailError=false
   }
   else if(type=='mobilenumber')
   {
    this.isInvalidMobileError=false
   }
  }
  onBlur(type)
  {
    if(type=='email')
    {
      this.isInvalidEmailError=true
    }
    else if(type=='mobilenumber')
    {
     this.isInvalidMobileError=true
    }
  }
}

export interface DialogData {
  title: string;
  content: string;
  otpflag: boolean;
  errorMsg: string;
  type: string;
}

