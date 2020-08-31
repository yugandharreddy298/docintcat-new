import { Component, OnInit, OnDestroy, Output, EventEmitter, HostListener } from '@angular/core';
import { UserService } from '../../user.service';
import { DataService } from '../../core/data.service'
import { AdminService } from '../../admin.service';
import { CookieService } from 'ngx-cookie-service';
import { DocumentService } from '../../document.service';
import { GeneralService } from '../../general.service';
import { Router } from "@angular/router";
import { FileuploadService } from '../../fileupload.service';
import { MatDialog } from '@angular/material';
import { Subscription } from 'rxjs';
import { FrontEndConfig } from '../../frontendConfig';
import { CommonDialogComponent } from 'src/app/public/common-dialog/common-dialog.component';
import { SignupdialogboxComponent } from '../../public/signupdialogbox/signupdialogbox.component';

declare var gapi: any;
declare var google: any;
declare var $: any;
declare var Dropbox: any;
declare var OneDrive: any;
@Component({
  selector: 'app-mainnav',
  templateUrl: './mainnav.component.html',
  styleUrls: ['./mainnav.component.css']
})

export class MainnavComponent implements OnInit, OnDestroy {

  profiledata: any
  profilestyle
  headerzindex: Boolean = false // set z-index to header when router navigates to dashboard page 
  frontendurl = this.frontEndConfig.frontendurl;
  url = false;
  file = true;
  document = true;
  folder = false;
  isSocialLoading: boolean = false;
  passwordMinLength: Boolean = false;
  passwordupper: Boolean = false;
  passwordLower: Boolean = false;
  passwordNumber: Boolean = false;
  passwordSpecial: Boolean = false;
  enablenotificationlist: Boolean = false
  type: any;
  role: any;
  samePassword: any;
  userName: any;
  userEmail: any;
  userType: any;
  display: boolean = true
  notificationlogs = []
  chatnotificationlogs = []
  chatnotificationlogsCount = 0
  samplee
  notification
  count: number
  resultData: any
  diff
  resultDatas: any
  badgeCount: any;
  access: any
  SearchValue: any
  oldpass: any
  newpass: any
  pwd3: any
  hide = true;
  hide1 = true;
  hide2 = true;
  PasswordMissMatch: Boolean = false;
  errorres = ""
  displayerror = false;
  formSubmitted = false;
  local: any
  s: any
  isOldPassword: boolean = false;
  isOldPassword1: boolean = false;
  uid
  res: any;
  subscription: Subscription
  message
  search
  shownotifitab: boolean = false
  chatshownotifitab: boolean = false
  IpAddress
  iebrowser
  invalidoldpassword
  invalidnewpas
  invalidconfpas
  focus
  clearintervaldata
  dropdevkey = 'hfds0x416l38hgr';
  dropscret = 'k2f83puyfke1z1t';
  developerKey = 'AIzaSyB4L-PhNuvZHw4wbVOjS93VV0uCAgXHUc0';
  clientId = "778273248008-3rlo8d96pebk6oci737ijtbhmla253gr.apps.googleusercontent.com"
  scope = [
    'profile',
    'email',
    'https://www.googleapis.com/auth/drive'//insert scope here
  ].join(' ');
  pickerApiLoaded = false;
  oauthToken?: any;
  oneDriveApplicationId = "d091f200-527a-4572-aab8-678d6f3ac972";
  searchvalue;
  searchdata;
  getUploadSuccess: any;
  totalfilelength = 0;
  uploadCompleted = false;
  queue:any
  fileQueue = []
  uploadingdata 
  testuingnew: Subscription;
  verificationdata: any;
  oncomplete_Singlefile: Subscription;
  uploading:any;
  @HostListener('window:popstate', ['$event'])
  onPopState(event) {
  }

  @HostListener('scroll')
  public asd(): void {
    this.shownotifitab = false
  }

  @Output() fileAdded = new EventEmitter<{ data: string }>();

  constructor(private frontEndConfig: FrontEndConfig,
    public adminservice: AdminService,
    public router: Router, public dialog: MatDialog,
    private userService: UserService,
    public uploader: FileuploadService,
    private generalservice: GeneralService,
    private dataService: DataService,
    private adminService: AdminService,
    private cookieService: CookieService,
    public documentservice: DocumentService) {
    this.socketConnect();
    this.autoRefreshNotification();
    router.events.subscribe((val: any) => {
      if (val.url == '/home/dashboard') {
        this.headerzindex = true
      } else {
        this.headerzindex = false
      } 
    });
   this.uploadingdata= this.uploader.getopenModal().subscribe((data:any) =>
    {   
      if(data == 'openmodal'){
        if (!this.totalfilelength) { 
          document.getElementById('openModalButton').click();
         }
            this.uploadCompleted = false
      }
    })
    this.uploader.getFilesUpload().subscribe((data:any) =>
    {
      this.totalfilelength=data.length
      this.queue = data
    });
    this.getUploadSuccess = this.uploader.getUploadSuccess().subscribe((message: any) => { 
  
      this.count = 0;
     if(this.queue) var closemodel=this.queue.some(x=>x.progress==0)
    
     if(!closemodel) {
       document.getElementById('closeFileModal').click()
     this.uploader.clearQueue();
      this.queue=null
      this.totalfilelength = 0;
     }

    });
    this.testuingnew = this.uploader.getUploadResponse().subscribe((message: any) => {
      this.verificationdata = message;
      if (message.responsedata === 'PDF is password protected, please enter password'
        || message.responsedata === 'Please check your password') {
        this.passwordVerification(message);
      }
    });
    this.oncomplete_Singlefile = this.uploader.oncomplete_Singlefile().subscribe((data: any) => {
    });
  }

  /**
   * Function name : autoRefreshNotification
   * Input : null
   * Output : Notification count
   * Desc : to get the notification count.
   */
  autoRefreshNotification() {
    this.dataService.newNotificationReceived().subscribe(data => {
      this.getNotificationCount();
      this.getOfflineNotification();
    })
  }

  /**
   * Function name : cookiesConnect
   * Input : null
   * Output : to check whether the data consists in cookies and stores it 
   * Desc : to check whether the data consists in cookies and stores it 
   */
  cookiesConnect() {
    const cookieExists: boolean = this.cookieService.check('token');
    const userExists: boolean = this.cookieService.check('user');
    if (cookieExists && userExists) {
      var data = { token: this.cookieService.get('token'), user: JSON.parse(this.cookieService.get('user')) }
      if (!localStorage.getItem('currentUser')) this.userService.setUserLoggedIn(data);
      if (localStorage.getItem('currentUser')) {
        this.getProfileData();
      }
    }
  }

  /**
   * Function name : getProfileData
   * Input : null
   * Output : profile content
   * Desc : getting profile content 
   */
  getProfileData() {
    this.profiledata = JSON.parse(localStorage.getItem('currentUser'));
    this.role = this.userService.decryptData(this.profiledata.role);
    this.userName = this.userService.decryptData(this.profiledata.name);
    this.userEmail = this.userService.decryptData(this.profiledata.email);
    this.userType = this.userService.decryptData(this.profiledata.type);
  }

  ngOnInit() {
    $(document).ready(function () {
      if ($(window).width() < 1000) {
        $(".togg>li").attr('data-toggle', 'collapse');
      }
    });
    $(window).resize(function () {
      if ($(window).width() < 1000) {
        $(".togg>li").attr('data-toggle', 'collapse');
      } else {
        $(".togg>li").attr('data-toggle', 'collapse12');
      }
    });
    this.cookiesConnect();
    this.getProfileData();
    this.getOfflineNotification();
    this.getNotificationCount();
    //Internet explorer header fix
    if (!!(window as any).MSInputMethodContext && !!(document as any).documentMode) {
      this.iebrowser = true
      this.profilestyle = "margin-top: -1.5rem;"
      $(".top_nav").addClass("iebrowser");
    } else {
      this.iebrowser = false
    }
    this.IpAddress = JSON.parse(localStorage.getItem('mylocation'));
    this.getGeolocation() //get the current location of user
    if ((/Edge\/\d./i.test(navigator.userAgent) || (!!(window as any).MSInputMethodContext && !!(document as any).documentMode))) {
      this.clearintervaldata = setInterval(() => {
        this.ccb();
      }, 100);
    }
  }
  @HostListener("window:beforeunload", ["$event"]) unloadHandler(event: Event) {
    if(!this.uploadCompleted && this.queue!=undefined){
     console.log("Processing beforeunload...");
     // Do more processing...
     event.returnValue = true;
    }

}
  /**
  * Function name : clearData
  * Input : null
  * Output : Clipboard data will be cleared.
  * Desc : To clear Clipboard data.
  */
  clearData() {
    window["clipboardData"].setData('text', '')
  }

  /**
   * Function name : ccb
   * Input : null
   * Output : Clipboard data will be cleared.
   * Desc : To clear Clipboard data.
   */
  ccb() {
    if (window["clipboardData"]) {
      window["clipboardData"].clearData();
    }
  }

  /**
   * Function name : getOfflineNotification
   * Input : null
   * Output : Notification data
   * Desc : to get the all notification
   */
  getOfflineNotification() {
    this.generalservice.getOfflinenotification().subscribe((data: any) => {
      this.notificationlogs = data.filter(element =>element.type != 'chat' && element.active)
      this.chatnotificationlogs = data.filter(element =>element.type == 'chat' )
      this.chatnotificationlogsCount = data.filter(element =>element.type == 'chat' && element.active == true).length
      this.notificationlogs.forEach(element => {
        element.created_at;
        element.fromEmail = (element.fromid && element.fromid.name) ? element.fromid.name : (element.fromemail).split('@')[0];
        element.diff = this.getDataDiff(new Date(element.created_at), new Date());
      });
      this.chatnotificationlogs.forEach(element => {
        element.created_at;
        element.fromEmail = (element.fromid && element.fromid.name) ? element.fromid.name : (element.fromemail).split('@')[0];
        element.diff = this.getDataDiff(new Date(element.created_at), new Date());
      });
    });
  }

  /**
   * Function name : getNotificationCount
   * Input : null
   * Output : Notification count
   * Desc : to get count of notification
   */
  getNotificationCount() {
    this.generalservice.countNotifications().subscribe((data: any) => {
      this.count = data
    })
  }

  /**
  * Function name : getNotification
  * Input : null
  * Output :Unread notifications
  * Desc : gets the unread notifications
  */
  getNotification() {
    this.generalservice.getnotification().subscribe((data: any) => {
      this.resultDatas = data
    })
  }

  /**
   * Function name : shownotification
   * Input : null
   * Output : shownotifitab as true
   * Desc : To show notification tab
   */
  shownotification() {
    this.shownotifitab = true;
    this.chatshownotifitab = false
  }

  /**
   * Function name : hidenot
   * Input : null
   * Output : shownotifitab as false
   * Desc : To hide notification tab
   */
  hidenot() {
    this.shownotifitab = false
    this.chatshownotifitab = false
  }

  /**
   * Function name : loaddropbox
   * Input : null
   * Output : Drop box open
   * Desc : To load drop box
   */
  loaddropbox = function () {
    Dropbox.choose(this.options);
  }

  // Options for drop box
  options = {
    success: (files) => {
      this.isSocialLoading = true;
      files.forEach(element => {
        this.urlcontent(element);
      });
    },
    cancel: function () {
    },
    linkType: "direct", // or "preview"
    multiselect: false, // or false
    extensions: ['.pdf', '.doc', '.docx'],
    folderselect: false, // or true
  };

  /**
   * Function name : urlcontent
   * Input : urldata
   * Output : Drop box open
   * Desc : To add file from drop box using URL
   */
  urlcontent(urldata) {
    var nameArray=[];
    var dropboxurl = {
      value: urldata
    }
    if (urldata) {
      nameArray.push({name:urldata.name})
    var filedata={
     files:nameArray,
   }
   this.documentservice.isFilenameExits(filedata).subscribe(filePresent=>{
     if (filePresent) {
       document.getElementById('fileselect123').click();
       const nameConfirmationDiaBox = this.dialog.open(SignupdialogboxComponent, {
         width: '500px',
         disableClose: false,
         autoFocus: true,
         panelClass: 'passwordbottom',
         data: { type: 'fileName' }
       });
       nameConfirmationDiaBox.afterClosed().subscribe(res => {
         if (res) {
          this.uploader.urlcontent(dropboxurl).subscribe(data => {
            this.isSocialLoading = false;
            this.documentservice.sendFileData(data);
            this.documentservice.openSnackBar("File added from Dropbox", "X")
          }, error => {
            if (error == "Invalid")
              this.documentservice.openSnackBar("not pdf ", "X")
            this.isSocialLoading = false;
          })
         }
       })
     }
     else {
      this.uploader.urlcontent(dropboxurl).subscribe(data => {
        this.isSocialLoading = false;
        this.documentservice.sendFileData(data);
        this.documentservice.openSnackBar("File added from Dropbox", "X")
      }, error => {
        if (error == "Invalid")
          this.documentservice.openSnackBar("not pdf ", "X")
        this.isSocialLoading = false;
      })
    }
   })
 }
   
  }

  /**
   * Function name : validate
   * Input : password
   * Output : Valid password
   * Desc : Password validatioon
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
   * Function name : loadGoogleDrive
   * Input : null
   * Output : Google drive upload
   * Desc : Google drive upload
   */
  loadGoogleDrive() {
    gapi.load('auth', { 'callback': this.onAuthApiLoad.bind(this) });
    gapi.load('picker', { 'callback': this.onPickerApiLoad.bind(this) });
  }

  /**
     * Function name : onAuthApiLoad
     * Input : null
     * Output : Google drive Authentication
     * Desc : Google drive Authentication
     */
  onAuthApiLoad() {
    gapi.auth.authorize(
      {
        'client_id': this.clientId,
        'scope': this.scope,
        'immediate': false
      },
      this.handleAuthResult);
  }

  /**
   * Function name : onPickerApiLoad
   * Input : null
   * Output : Google drive upload
   * Desc : Google drive upload
   */
  onPickerApiLoad() {
    this.pickerApiLoaded = true;
  }

  /**
  * Function name : handleAuthResult
  * Input : authResult
  * Output : Google drive upload
  * Desc : Google drive upload
  */
  handleAuthResult = (authResult) => {
    if (authResult && !authResult.error) {
      if (authResult.access_token) {
        this.access = authResult.access_token
        let pickerBuilder = new google.picker.PickerBuilder();
        let picker = pickerBuilder.
          setOAuthToken(authResult.access_token).
          addView(new google.picker.DocsView().setIncludeFolders(true).setOwnedByMe(true).setMimeTypes("application/pdf,application/vnd.google-apps.document,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document")).
          addView(new google.picker.DocsView().setIncludeFolders(true).setOwnedByMe(false).setMimeTypes("application/pdf,application/vnd.google-apps.document,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document")).setCallback((e) => { console.log(e); this.pickerCallback(e) }).
          build();
        picker.setVisible(true);
      }
    }
  }

  /**
   * Function name : pickerCallback
   * Input : data
   * Output : google picker callback
   * Desc : google picker callback
   */
  pickerCallback = (data) => {
    let self = this;
    if (data[google.picker.Response.ACTION] == google.picker.Action.PICKED) {
      var doc = data[google.picker.Response.DOCUMENTS][0];
      self.uploadtoDB(doc);
    }
  }

  /**
   * Function name : uploadtoDB
   * Input : doc
   * Output : uplaod file to db
   * Desc : uplaod file to db
   */
  uploadtoDB = (doc) => {
    this.isSocialLoading = true;
    doc.access = this.access;
    var nameArray = [{ name: doc.name }]
    this.documentservice.isFilenameExits({ files: nameArray }).subscribe(filePresent => {
      this.isSocialLoading = false;
      if (filePresent) {
        const nameConfirmationDiaBox = this.dialog.open(SignupdialogboxComponent, {
          width: '500px',
          disableClose: false,
          autoFocus: true,
          panelClass: 'passwordbottom',
          data: { type: 'fileName' }
        });
        nameConfirmationDiaBox.afterClosed().subscribe(res => {
          if (res) {
            this.documentservice.googleupload(doc).subscribe(data => {
              var newfile = data
              if (newfile) {
                this.isSocialLoading = false;
                this.documentservice.sendFileData(newfile);
              }
            })
          }
          

        })
      }
      else {
        this.documentservice.googleupload(doc).subscribe(data => {
          var newfile = data
          if (newfile) {
            this.isSocialLoading = false;
            this.documentservice.sendFileData(newfile);
          }
        })
      }
    })
  }

  /**
   * Function name : uploadtoDB
   * Input : doc
   * Output : One drive upload
   * Desc : One drive upload
   */
  loadoneDrive() {
    this.launchOneDrivePicker()
  }


  /**
   * Function name : uploadtoDB
   * Input : doc
   * Output : One drive upload
   * Desc : One drive upload
   */
  launchOneDrivePicker = () => {
var redirecturi;
    if (this.userType === 'individual') {
      redirecturi=this.frontendurl + '/individual/home/myfiles/';
    } else if (this.userType=== 'organisation' || this.userType === 'employee') {
      redirecturi=this.frontendurl + '/organization/home/myfiles/';
    }
    var odOptions = {
      clientId: this.oneDriveApplicationId,
      action: "download",
      multiSelect: true,
      openInNewWindow: true,
      advanced: {
        filter: ".pdf,.doc,.docx",  // Show only folders and png files
        redirectUri: redirecturi // must match domain url
      },
      success: (files) => {
        this.isSocialLoading = true;
        this.onedriveurlcontent(files.value);
      },
      cancel: function () { (null); },
      error: function (e) { (e); }
    };
    OneDrive.open(odOptions);
  }


  /**
   * Function name : uploadtoDB
   * Input : doc
   * Output : One drive upload
   * Desc : One drive upload
   */
  onedriveurlcontent = (files) => {
    files.forEach(element => {
      var dropboxurl =
      {
        name: element.name,
        url: element["@microsoft.graph.downloadUrl"]
      }
      var nameArray=[]
      nameArray.push({name:dropboxurl.name})
      var filedata={
       files:nameArray,
     }
     this.documentservice.isFilenameExits(filedata).subscribe(filePresent=>{
       if (filePresent) {
        this.isSocialLoading = false;
         document.getElementById('fileselect123').click();
         const nameConfirmationDiaBox = this.dialog.open(SignupdialogboxComponent, {
           width: '500px',
           disableClose: false,
           autoFocus: true,
           panelClass: 'passwordbottom',
           data: { type: 'fileName' }
         });
         nameConfirmationDiaBox.afterClosed().subscribe(res => {
           if (res) {
            if (dropboxurl) {
              this.uploader.onedriveurlcontent(dropboxurl).subscribe(data => {
                this.isSocialLoading = false;
                this.documentservice.sendFileData(data);
                this.documentservice.openSnackBar("File added from Onedrive", "X")
              }, error => {
                if (error == "Invalid")
                  this.documentservice.openSnackBar("not pdf ", "X")
                this.isSocialLoading = false;
              })
            }
           }
         })
       }
       else {
        if (dropboxurl) {
          this.uploader.onedriveurlcontent(dropboxurl).subscribe(data => {
            this.isSocialLoading = false;
            this.documentservice.sendFileData(data);
            this.documentservice.openSnackBar("File added from Onedrive", "X")
          }, error => {
            if (error == "Invalid")
              this.documentservice.openSnackBar("not pdf ", "X")
            this.isSocialLoading = false;
          })
        }
       }
     })
     
    });

  }

  /**
   * Function name : getDataDiff
   * Input : startDate, endDate
   * Output : One drive upload
   * Desc :to get date difference
   */
  getDataDiff(startDate, endDate) {
    var diff = endDate.getTime() - startDate.getTime();
    var days = Math.floor(diff / (60 * 60 * 24 * 1000));
    var hours = Math.floor(diff / (60 * 60 * 1000)) - (days * 24);
    var minutes = Math.floor(diff / (60 * 1000)) - ((days * 24 * 60) + (hours * 60));
    var seconds = Math.floor(diff / 1000) - ((days * 24 * 60 * 60) + (hours * 60 * 60) + (minutes * 60));
    return { day: days, hour: hours, minute: minutes, second: seconds };
  }

  /**
   * Function name : logout
   * Input : null
   * Output : Logged out
   * Desc :to get user looged out when he clicks on signout
   */
  logout() {
    this.cookieService.delete('token');
    this.cookieService.delete('user');
    let type = { type: "disconnect" }
    var sub = this.dataService.Connectsocket(type)
      .subscribe(quote => { });
    this.adminService.logout();
  }

  /**
   * Function name : clearnotification
   * Input : id
   * Output : Clearing notification
   * Desc :to clear particular selected notification
   */
  clearnotification(id) {
    id.active = false
    this.generalservice.markedread(id).subscribe(data => {
      this.getNotificationCount();
    });
  }

  /**
  * Function name : clearAllNotifications
  * Input : data
  * Output : Clearing all the notification
  * Desc :to clear all the notification
  */
  clearAllNotifications(data,title) {
    console.log(data)
    var sendData ={
      data:data,
      title:title
    }
    this.generalservice.clearAllNotifications(sendData).subscribe(data => {
      this.getOfflineNotification();
      if(title === 'notification') this.notificationlogs = [];
    });
  }

  /**
  * Function name : clearAllNotificationsactive
  * Input : data
  * Output : Clearing all the active notification
  * Desc :to clear all the active notification
  */
  clearAllNotificationsactive(data) {
    if (this.enablenotificationlist) {
      this.enablenotificationlist = false
    } else { this.enablenotificationlist = true }
    if (this.count) {
      var data1 = data.filter(x => !x.read && x.type != 'chat');
      this.generalservice.clearAllNotificationsactive(data1).subscribe(data => {
        this.getNotificationCount();
      });
    }
  }

  ngOnDestroy() {
    let type = { type: "disconnect" }
    this.getUploadSuccess.unsubscribe();
     this.uploadingdata.unsubscribe();
    this.oncomplete_Singlefile.unsubscribe();
    this.testuingnew.unsubscribe();
    var sub = this.dataService.Connectsocket(type).subscribe(quote => { });
    clearInterval(this.clearintervaldata);
  }

  /**
   * Function name : Search
   * Input : Searchterm
   * Output : Searched item data
   * Desc :to get the data by search
   */
  Search(Searchterm) {
    // this.search = {
    //   search: Searchterm,
    // }
    // this.documentservice.searchdocuments(this.search).subscribe(data => {
    //   this.searchdata = data;
    // });
    this.searchvalue = Searchterm
  }

  /**
   * Function name : searchnavigate
   * Input : null
   * Output : Searched item navigation
   * Desc : Navigation to searched item
   */
  searchnavigate() {
    if (this.searchvalue == null) {
      this.documentservice.openSnackBar("Please Enter text ", "X");
    }
    if (this.searchvalue != null) {
      this.searchvalue=this.searchvalue.trim();
     if (this.userType == 'individual') this.router.navigate(['/individual/home/search/'], { queryParams: { searchvalue: this.searchvalue } });
      else if (this.userType == 'organisation' || this.userType == 'employee') this.router.navigate(['/organization/home/search/'], { queryParams: { searchvalue: this.searchvalue } });
    }
  }

  /**
  * Function name : socketConnect
  * Input : null
  * Output : Socket connection
  * Desc : To connect socket
  */
  socketConnect() {
    this.type = { type: "connect" }
    this.dataService.Connectsocket(this.type).subscribe(quote => { });
  }

  /**
   * Function name : clearval
   * Input : null
   * Output : Removed browserpath
   * Desc : To remove browserpath
   */
  clearval() {
    localStorage.removeItem('browserpath')
    this.searchvalue = null;
    this.SearchValue = null;
  }

  /**
   * Function name : clearval
   * Input : oldPassword
   * Output : old passsword check
   * Desc : to check old passsword
   */
  checkpassword(oldPassword) {
    this.samePassword = oldPassword;
    if (oldPassword != '' && oldPassword != undefined) {
      this.userService.checkpassword(oldPassword).subscribe(data => {
        var res: any = data
        if (res.result == 'Old password mismatch') {
          this.isOldPassword = true;
          this.errorres = res.result;
        } else if (res.result == 'matched')
          this.isOldPassword = false;
      })
    }
  }

  /**
  * Function name : checkpassword1
  * Input : oldPassword
  * Output : Old and new password check
  * Desc : check for old and new password match
  */
  checkpassword1(oldPassword) {
    if (oldPassword == this.samePassword) {
      this.isOldPassword1 = true;
      this.errorres = "Old password mismatch";
    }
    this.validate(oldPassword)
  }

  /**
   * Function name : cancel
   * Input : user
   * Output : form reset
   * Desc : To reset form
   */
  cancel(user) {
    if (user) { user.resetForm(); this.formSubmitted = false; this.isOldPassword = false; this.isOldPassword1 = false }
  }

  /**
   * Function name : otpfun
   * Input : user
   * Output : Password change through OTP
   * Desc : validate otp and send password change message
   */
  otpfun = function (user) {
    this.errorres = ""
    this.displayerror = false
    this.formSubmitted = true
    if (user.valid && user.value.oldpass != user.value.newpass && user.value.newpass == user.value.pwd3 && !this.isOldPassword) {
      user.value.IpAddress = (this.IpAddress) ? this.IpAddress.ip : 'Not Avilable'
      this.userService.changePass(user.value).subscribe(data => {
        var res = data;
        user.resetForm();
        this.formSubmitted = false
        document.getElementById("changePassCloseBtn").click();
        if (res.result == "success") {
          this.documentservice.openSnackBar("Password Changed Successfully", "X");
        }
      })
    }
  }

  /**
   * Function name : checkpasswor
   * Input : data, type
   * Output : Password fields
   * Desc : validate Password fields
   */
  checkpasswor(data, type) {
    if ((data.value == '' || data.value == undefined) && this.iebrowser) {
      if (type == 'old') {
        this.invalidoldpassword = true
      } else if (type == 'new1') {
        this.invalidnewpas = true
      } else if (type == 'new2') {
        this.invalidconfpas = true
      }
    } else {
      if (type == 'old') {
        this.invalidoldpassword = false
      } else if (type == 'new1') {
        this.invalidnewpas = false
      } else if (type == 'new2') {
        this.invalidconfpas = false
      }
    }
  }

  /**
   * Function name : Restrictspacekey
   * Input : event
   * Output : Space key restriction while entering password
   * Desc : Restrictspacekey in change password
   */
  Restrictspacekey(event) {
    if (event.keyCode == 32) {
      return false;
    }
  }

  /**
   * Function name : getGeolocation
   * Input : null
   * Output : Current location
   * Desc : to store currentLocation in local storage
   */
  getGeolocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        var currentLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        }
        localStorage.setItem('currentLocation', JSON.stringify(currentLocation))
      }, error => {
        localStorage.removeItem('currentLocation')
      });
    }
  }
  /**
   * Function name : passwordVerification
   * Input{object}: (message) message*-uploaded file response
   * Output : open up the dialog box to enter password for password protected file
   */
  passwordVerification(message) {
    let resultdata;
    setTimeout(() => {
      $('body').css('overflow', 'hidden');


    }, 10);
    const dialogRef = this.dialog.open(CommonDialogComponent, {
      data: { name: 'protection', content: message },
      disableClose: false, width: '570px', panelClass: 'deletemod'
    });
    dialogRef.afterClosed().subscribe(res => {
      setTimeout(() => {
        $('body').css('overflow', 'auto');


      }, 10);
      if (res) {
        const data = {
          file: this.verificationdata,
          password: res
        };
        resultdata = this.uploader.passwordremover(data);
      } else {
        this.uploadCompleted = false;
        this.uploader.continueQueue();
      }
    });
  }



    /**
   * Function name : NotificationNavigate
   * Input{object}: notification record
   * Output : navigate to respective file or folder when click on respective notification
   */
  NotificationNavigate(data){ 
    this.shownotifitab = false
  this.generalservice.NotificationNavigate(data,false);
  }
   /**
   * Function name : sessionsClear
   * Output : to clear all other session of particular user
   */
  sessionsClear()
  {
    this.userService.clearAll().subscribe(data => {
      this.documentservice.openActionSnackBar(data,'x')
    })
  }
}
