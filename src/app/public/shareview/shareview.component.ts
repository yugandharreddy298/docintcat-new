import { Component, OnInit, EventEmitter, OnDestroy, Output, ViewChild, HostListener, ElementRef, NgZone } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DocumentService } from '../../document.service';
import { Router } from "@angular/router";
import { AdminService } from '../../admin.service';
import * as moment from 'moment';
import { FrontEndConfig } from '../../frontendConfig';
import { DataService } from '../../core/data.service';
import { GeneralService } from '../../general.service';
import { MatDialog, } from '@angular/material';
import { CookieService } from 'ngx-cookie-service';
import { OrganizationService } from '../../organization.service';
import { FormControl } from '@angular/forms';
import { MatAutocomplete } from '@angular/material';
import { MatSelect } from '@angular/material';
import { Subject } from 'rxjs';
import { Observable } from 'rxjs/Observable';
import { WebcamImage, WebcamInitError, WebcamUtil } from 'ngx-webcam';
import { FormGroup, Validators } from '@angular/forms';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { CommonDialogComponent } from '../common-dialog/common-dialog.component';
import { SignupdialogboxComponent } from '../../public/signupdialogbox/signupdialogbox.component';
import { UserService } from '../../user.service'
import { DatePipe } from '@angular/common'
import * as _ from "lodash";
import libphonenumber from 'google-libphonenumber';
import { Location } from '@angular/common';
import * as ebml from 'ts-ebml';
import { Buffer } from 'buffer';
import { Subscription } from 'rxjs';

declare var gapi: any;
const phoneUtil = libphonenumber.PhoneNumberUtil.getInstance();
declare var $: any;
declare var MediaRecorder: any;
declare var window: any;
window.Buffer = Buffer;

@Component({
  selector: 'app-shareview',
  templateUrl: './shareview.component.html',
  styleUrls: ['./shareview.component.css']
})

export class ShareviewComponent implements OnInit, OnDestroy {

  @ViewChild('bodyscroll') bodyscroll: ElementRef;
  @ViewChild('singleSelect') singleSelect: MatSelect;
  @Output() onSelectionChange: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild('auto') matAutocomplete: MatAutocomplete;
  @ViewChild('video') video: any;
  fixedBoxOffsetTop: any;
  fixedBoxOffsetTopOtherMethod: any;
  showBottom = true;
  showTop = false;
  heatmapss: Boolean = false; // for displaying heatmaps
  versions: Boolean = false; //for displaying versions
  heatmapLoading: Boolean = false;  // loader for heatmap
  //Decalre PDF top and left
  PdfHeight: any = 0; // OnLoad PDf get Height
  PdfWidth: any = 0; // OnLoad Pdf Get width;
  PdfTop: any = 0; // Pdf Top distance
  PdfTopScroll: any = 0; // Pdf Top distance + Scroll Distance
  PdfLeft: any = 0; // Pdf Left distance
  PdfLeftNosideBar: any = 0; // Pdf Without side bar left side distance
  vers: boolean = false
  saveTemplatebtn = false
  isSignaturField: boolean = false; // Check Fields signature is exists or not if exists it will load by default signature
  isIntialField: boolean = false; // Check Fields signature is exists or not if exists it will load by default signature
  isPhotoField: boolean = false; // Check Fields signature is exists or not if exists it will load by default signature
  isStampField: boolean = false; // Check Fields signature is exists or not if exists it will load by default signature
  modelshow: any
  IframePrint: any = ''; // Iframe print for closing the print popup while clicking the back button
  documentres
  routervalue
  pageInfo = []
  focus

  recordRTC;
  stream=null;
  mediaConstraints: any = {
    video: {
      // mandatory: {
      //   minWidth: 1280,
      //   minHeight: 720
      // }
    }, audio: true
  };
  expired: boolean = false
  removedFile;
  phone
  fontStyle;
  preview;
  serverurl = this.frontEndConfig.getserverurl();
  endtime: any
  sharedid: any;
  fileid: any
  sharedRecord: any
  documentRecord: any
  docData: any
  fileDataContent: any
  fieldData: any
  fields: any = [];
  filledFieldCount: number = 0
  fieldValues: any
  activeComment: any = [];
  comments: any = [];
  FieldDataRecord: any
  signatureImage: any
  type: any
  fontvalue: any
  fonttype: any
  fontstyle: any
  arrowClass: any
  imageFile: any
  editF: any
  private _presetFonts = ['Tangerine', 'Pacifico', 'Homemade Apple', 'Sacramento', 'Mrs Saint Delafield', 'Ruthie', 'Dr Sugiyama', 'Lovers Quarrel', 'Qwigley', 'Srisakdi', 'Lobster', 'Sniglet', 'Satisfy', 'Bilbo'];
  onlinedata: any
  onlineusers = []
  profiledata: any
  createdtime: any
  _id: any;
  commentsdata
  commentedlines
  coordinatex
  coordinatey
  childcomments = []
  parentcomment = []
  edit = true
  reply = false
  editlabel = false
  documentid
  currentVersionDocFieldOptionsResult: any;
  SignatureList = []
  PhotoList = []
  StampList = []
  auditlogs: any;
  auditlogsResult: any;
  closeChat = false
  expirydate: any;
  presentdate: any;
  errorres: any
  organid: any
  signdependency = false

  documentdependency = false
  req = false
  allDocVersionsResult = []
  watermarkLoading: Boolean = false;
  watermarkText
  action = 'x';
  snackBarMeassage: any
  filesToUpload: Array<File> = [];
  imagedata: any
  currentTab = 0;
  platform: any
  latitude: any
  longitude: any
  geocoder: any;
  Address: any
  sharedocument
  linkid
  submitData: any
  finished: boolean = false //document finished or not
  cropimageData: any
  croppedImage: any
  notificationlogs = []
  chatnotificationlogs = []
  chatnotificationlogsCount = 0
  resultData: any
  diff: any
  count: any
  resultDatas: any
  pdf;
  outline;
  page = 1;
  pagenumbers = []
  requiredFieldsCount = []
  requiredFieldsCounts
  formatvalue = false
  formatvalue1 = false
  formatvalue2 = false
  downloadpath
  isloading: boolean = true; // For loader Appearance
  tabactive
  NotificationData
  Notificationscount
  videorecordChecking
  loggedIn
  expiretimeCheck = true
  downloadType
  downloadFile
  withlog
  pdfPinSet
  pdfPin
  documentImages
  email
  locationdata
  shownoti: boolean = false
  listshow: boolean = false
  showlist: boolean = false
  mobiledemo: boolean = false
  isOldPassword: boolean = false
  isOldPassword1: boolean = false
  samePassword
  passwordMinLength: Boolean = false;
  passwordupper: Boolean = false;
  passwordLower: Boolean = false;
  passwordNumber: Boolean = false;
  passwordSpecial: Boolean = false;
  hide1 = true;
  displayerror
  oldpass
  newpass
  pwd3
  IpAddress
  divsigpadWidth
  iebrowser // for prevalidations errors in ie only
  invalidoldpassword // for ie invalid old password
  invalidnewpas // for ie invalid new password
  invalidconfpas // for ie invalid new confirm  password
  clearintervaldata
  finishbuttonmobile: boolean = false// show  finish button in mobile view
  // divintpadWidth 
  clientId = "778273248008-3rlo8d96pebk6oci737ijtbhmla253gr.apps.googleusercontent.com"
  fieldminlength: any
  fieldsforsubmit = [];
  windowwidth
  reviewfile: boolean = false // show sucess message when review the file 
  sharingpeople = []
  passwordCheck: boolean = false;
  initialList = []
  requiredFiled: any
  valueDecr = false
  image = true
  chatdata = {};
  chatHistory: any;
  openChat = false;
  windowScrollHeight: any;
  PDFLoading = true;
  waterMark: any = { fontsize: '14px', content: '' };
  pageinterval
  pdfZoom: any = 0; //PDf Zoom Percentage
  zoomVal = 1; // PDF Zoom 
  zoomWidth  // Before zoom we will caliculate width
  zoomHeight  // Before zoom we will caliculate height
  accessbutton = false
  latestrecord: any
  signatureValidation: any
  signtype: any
  resend = false
  LogsList = []
  showScroll: boolean;
  showScrollHeight = 300;
  hideScrollHeight = 10;
  commentid
  commentbtn = false
  formSubmitted = false
  postcommentData: any
  comment
  coordinatewidth
  coordinatehight
  selectorid: any
  replyData: any
  pencolor = '#000000'
  isOpenPad = true
  SignaturePadcolor
  opendependencypopup = false
  dialogRefDependency
  authenticate: Boolean = false
  authIput
  camLoaderSuccess: Boolean = false
  camLoaderFail: Boolean = false
  savedPhoto
  showpages = true
  pageNo: any = 1;
  showpage = false
  arrowShow = true
  viewedcount = 0;
  selectedcount = 0
  name: any = [];
  heatmaps
  enablenotificationlist: any
  searchcountry
  countrylist
  enteredvalue: any
  added: any
  selectimg: any
  authenticateData
  authenticateTitle
  revokeDialog = false
  Recorder; //media recorder
  recordedChunks=[]; //recorded steam
  documentLogs:any; // get logs for files with in the folder
  chatshownotifitab: boolean = false
  agreetoSign:any;
  heatmap_tooltip = false;
  heatmap_tooltip1 = false;
  scope = [
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/drive.appdata',
    'https://www.googleapis.com/auth/drive.file'
  ].join(' ');
  phoneForm = new FormGroup({
    phone: new FormControl(undefined, [Validators.required])
  });
  notAuthorized = true
  commentshownotifitab: boolean = false
  notificationType:Subscription
  newChat = false
  macos: boolean = false; //  detect MAC os
  SelectedCom: any;
  initialLoad:boolean=false

// To connect socket
  socketConnect() {
    this.type = { type: "connect" }
    this.dataservice.Connectsocket(this.type).subscribe(quote => { });
  }
// Disconnection of socket
  socketDisconnect() {
    let type = { type: "disconnect" }
    this.dataservice.Connectsocket(type).subscribe(quote => { });
  }
  passwordOpen = false
  constructor(private Locations: Location,
    private _ngZone: NgZone,
    public datepipe: DatePipe,
    private organizationService: OrganizationService,
    private userservice: UserService,
    public dialog: MatDialog,
    private dataservice: DataService,
    private frontEndConfig: FrontEndConfig,
    private generalservice: GeneralService,
    private router: Router,
    public activatedroute: ActivatedRoute,
    private cookieService: CookieService,
    private documentService: DocumentService,
    private adminService: AdminService) {
    this.socketConnect()
    console.log("constructor")
    activatedroute.params.subscribe(val => {
    if(sessionStorage.getItem("chatid") )
      {
       this.test()
      }
      if(this.initialLoad)this.ngOnInit()
    })
  }
  // To handle Browser Back button
  @HostListener('window:popstate', ['$event'])
  onPopState(event) {
    this.newChat = false

    if (this.loggedIn == 'true') {
      var sampledata = this.documentService.getStartUrl();
      console.log( sampledata.split('/')[2])
      if (sampledata && sampledata.split('/')[2] == 'allowusers') {
        if (this.loggedIn == 'true') {
          if (this.profiledata.type == 'individual') this.router.navigate(['/individual/home/myfiles'])
          else if (this.profiledata.type == 'organisation' || this.profiledata.type == 'employee') this.router.navigate(['/organization/home/myfiles'])
        }
      } 
    }
    else {
      location.replace("/");
    }
    
  }
  // Refresh browser
  @HostListener('window:beforeunload', ['$event'])
  beforeunloadHandler(event) {
    this.ngOnDestroy();
  }
  // signaturepad,chatmodal width based on device width in window resizing
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    var s = window,
      d = document,
      x = s.innerWidth
    this.windowwidth = x
    this.windowScrollHeight = window.innerHeight - 130;
    if ((x <= 1920) && (x >= 1024)) {
      this.divsigpadWidth = 600
    }
    else if ((x <= 1024) && (x >= 600)) {
      this.divsigpadWidth = 600
    }
    else if ((x <= 600) && (x >= 320)) {
      this.divsigpadWidth = 280
    }
    else {
      this.divsigpadWidth = 600
    }
  }
  // signaturepad,scroll width based on device width 
  @HostListener('window:load', ['$event'])
  onLoad(event) {
    var s = window,
      d = document,
      x = s.innerWidth
    if ((x <= 1920) && (x >= 1024)) {
      this.divsigpadWidth = 600
    }
    else if ((x <= 1024) && (x >= 600)) {
      this.divsigpadWidth = 600
    }
    else if ((x <= 600) && (x >= 320)) {
      this.divsigpadWidth = 280
    }
    else {
      this.divsigpadWidth = 600
    }
  }
// To restrict keyboard keys
  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if ((event.ctrlKey && event.keyCode == 80) || (event.keyCode == 45)) {
      if (event.keyCode == 45) {
        this.snackBarMeassage = 'PrintScreen is not allowed'
        this.documentService.openSnackBar(this.snackBarMeassage, this.action);
      }
      if (event.ctrlKey && event.keyCode == 80) {
        event.returnValue = false;
        event.preventDefault();
        this.snackBarMeassage = 'print is not allowed'
        this.documentService.openSnackBar(this.snackBarMeassage, this.action);
      }
    }
  }
  ngOnInit() {
    if(window.navigator.platform=='MacIntel'){
      console.log(window.innerWidth)
      if(window.innerWidth>=800){
        this.macos=true
      }else{
        this.macos=false
      }
    }else{
      this.macos=false
    }
    console.log("this.sharedocument")
    $('body').removeClass('noselect'); // enable user selection for comments 
    this.locationdata = JSON.parse(localStorage.getItem('mylocation'));
    this.divsigpadWidth = 600;
    var domain = this.router.url.split('/');
    if (domain.length == 5) {
      var sharedfiledata = {
        fileid: domain[4],
        sharedid: domain[3]
      }
    }
    var sharedfiledata = {
      fileid: domain[4],
      sharedid: domain[3]
    }
    if (domain.length == 4) {
      var sharedfiledata = {
        fileid: domain[3],
        sharedid: domain[3]
      }
    }
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        this.latitude = position.coords.latitude;
        this.longitude = position.coords.longitude;
      }, error => {
        this.documentService.openSnackBar("Your Location is Blocked please Allow for security reasons", "X")
        this.latitude = undefined;
        this.longitude = undefined;
      });
    }
    setTimeout(() => {
      this.documentService.decryptedvalues(sharedfiledata).subscribe((data: any) => {
        this.sharedid = data.sharedid
        if (domain[2] != "Sharereview" && domain.length == 5) this.fileid = data.fileid
        if (domain[2] == "Sharereview" && domain.length == 5) this.linkid = domain[4];
        if (data.fileid && !this.linkid) this.shared();
        if (this.linkid) {
          this.documentService.getpass(this.linkid).subscribe((data: any) => {
            if (data.error || data.validity == 'expired') {
              if (data.error == 'not found') this.documentService.openSnackBar('Link is not Found', 'X');
              if (data.error == 'error') this.documentService.openSnackBar('Try after some time', 'X');
              if (data.validity == 'expired') this.documentService.openSnackBar('Link is Expired', 'X');
              this.Locations.back();
            }
            this.sharedocument = data;
            console.log(this.sharedocument)
            if (this.sharedocument.validity == undefined && this.sharedocument._id) this.shared()
            if (this.sharedocument.validity == 'expired') this.expired = true
            if ((this.sharedocument.length == 0 || this.sharedocument.revoke == true) && !this.revokeDialog) {
              this.isloading = false
              this.revokeDialog = true
              let dialogRef = this.dialog.open(CommonDialogComponent,
                { data: { title: 'dependency', name: 'dependency', content: "You don't Have an Access to View this file" }, width: '500px', panelClass: 'deletemod', disableClose: true });
              dialogRef.afterClosed().subscribe(res => {
                console.log(this.profiledata)
                if (res) {
                  if ((this.profiledata && this.profiledata.type )&& (this.profiledata.type == 'individual')) this.router.navigate(['/individual/home/shareddocument'])
                  else if ((this.profiledata && this.profiledata.type) && (this.profiledata.type == 'organisation' || this.profiledata.type == 'employee')) this.router.navigate(['/organization/home/shareddocument'])
                  else this.router.navigate(['/'])
                }
              })
            }
          })
        }
      })
    }, 10);
    this.loggedIn = localStorage.getItem('loggedIn')
    this.windowScrollHeight = window.innerHeight - 130;
    this.locationdata = JSON.parse(localStorage.getItem('myip'));
    var data = localStorage.getItem('ipaddress')
    if (!this.locationdata) this.locationdata = this.userservice.decryptData(data)
    if (!!(window as any).MSInputMethodContext && !!(document as any).documentMode) {
      this.iebrowser = true
    }
    else {
      this.iebrowser = false
    }
    if ((/Edge\/\d./i.test(navigator.userAgent) || (!!(window as any).MSInputMethodContext && !!(document as any).documentMode))) {
      this.clearintervaldata = setInterval(() => {
        this.ccb();
      }, 100);
    }
    this.windowwidth = window.innerWidth
    this.initialLoad=true
  }

  // clear data while copy 
  clearData() {
    window["clipboardData"].setData('text', '')
  }
  // To get clipboard data
  ccb() {
    if (window["clipboardData"]) {
      window["clipboardData"].clearData();
    }
  }
/**
  * Function name : getmodeldata
  * Desc : To call GetSignatureDocumentList,GetPhotoDocumentList,GetStampDocumentList and GetInitialDocumentList In ngOnint
  */
  getmodeldata() {
    this.GetSignatureDocumentList(false);
    this.GetPhotoDocumentList(false);
    this.GetStampDocumentList(false);
    this.GetInitialDocumentList(false);
  }
 /**
  * Function name : LoadData
  * Desc :To get ontime reflection
  */
  additionalData() {
    setInterval(() => {
      this.endtime = moment().format()
      if (this.createdtime == this.endtime) {
        this.documentService.openSnackBar("Your time is up!", "X")
      }
    }, 1000);
    this.dataservice.newMessageReceived()
      .subscribe(data => {
        console.log(data)
        if (data && data._id == this.sharedRecord._id && (data.active == false || data.revoke == true)) {
          let dialogRef = this.dialog.open(CommonDialogComponent,
            { data: { title: 'dependency', name: 'dependency', content: "You don't Have an Access to View this file" }, panelClass: 'deletemod', width: '500px', disableClose: true });
          dialogRef.afterClosed().subscribe(res => {
            if (res) {
              if ((this.profiledata && this.profiledata.type) && (this.profiledata.type == 'individual')) this.router.navigate(['/individual/home/shareddocument'])
              else if ((this.profiledata && this.profiledata.type) && (this.profiledata.type == 'organisation' || this.profiledata.type == 'employee')) this.router.navigate(['/organization/home/shareddocument'])
              else this.router.navigate(['/'])
            }
          })
        }
        else if (((data.fileid == this.sharedRecord.fileid._id) || (data.fileid == this.fileid))) {
          this.getSharedPeoples();
          this.LoadFields()
        }
        if (data && data._id == this.sharedRecord._id) {
          this.documentService.getSharedDoc(this.sharedid).subscribe(async res => {
            this.sharedRecord = res;
            if (!(this.sharedRecord.fileid && this.sharedRecord.fileid._id))
              this.sharedRecord.fileid = this.documentRecord;
              if(this.sharedRecord.VideoRecord && !this.stream){
                this.startRecording()
              }
          })
        }
      })
    this.dataservice.newNotificationReceived()
      .subscribe(data => {
        this.getOfflineNotification();
        this.getNotificationCount();
      })
    this.dataservice.newChatReceived()
      .subscribe(data => {
        if (this.sharedRecord && this.sharedRecord.fileid && this.sharedRecord.Chat && (data.documentid == this.sharedRecord.fileid._id)) {
          this.newChat = true;
          this.versions = false;
          this.showpages = false;
        }
      })
    this.dataservice.documentUpdate().subscribe(data => {
      if ((this.sharedRecord.fileid && this.sharedRecord.fileid._id == data._id) || (this.fileid == data._id)) {
        if (this.documentRecord.versionid != data.versionid) {
          if ((this.sharedRecord.accesstype == 'Allowusers' && this.sharedRecord.toemail == this.profiledata.email) || this.sharedRecord.accesstype == 'public') {
            this.documentRecord = data
            this.documentService.getCurrentVersionDocFieldWithValues({ documentid: this.documentRecord._id, versionid: this.documentRecord.versionid }).subscribe(async (currentVersionDocFieldOptions: any) => {
              this.fields = currentVersionDocFieldOptions;
              this.DisplayFieldsData()
            })
          }
          else if (this.notAuthorized) {
            this.isloading = false
            this.urlMismatch()
          }
        }
        else {
          if ((this.sharedRecord.accesstype == 'Allowusers' && this.sharedRecord.toemail == this.profiledata.email) || this.sharedRecord.accesstype == 'public') {
            this.documentRecord = data
          }
          else if (this.notAuthorized) {
            this.isloading = false
            this.urlMismatch()
          }
        }
        if (this.documentRecord.waterMark) {
          this.waterMark = this.documentRecord.waterMark
          this.loadWaterMark()
        }
      }
    })
    this.dataservice.FieldsValueUpdate()
      .subscribe(data => {
        if (this.sharedRecord.fileid._id == data.documentid) {
          this.displayUpdatedFieldValue(data) // Update fields whenever field value inserted
        }
      })
    this.dataservice.FieldsOptionsUpdate()
      .subscribe(data => {
        if (this.dialogRefDependency) this.dialogRefDependency.close()
        if (this.sharedRecord.fileid._id == data.documentid) {
          this.LoadFields()
        }
      })
    this.dataservice.getsignatureDocs().subscribe(data => {
      if (data.signtype == 'signature')
        this.GetSignatureDocumentList(false)
      else
        this.GetInitialDocumentList(false)
    })
    this.dataservice.getphotoDocs().subscribe(data => {
      this.GetPhotoDocumentList(false)
    })
    this.dataservice.getstampDocs().subscribe(data => {
      this.GetStampDocumentList(false)
    })
    this.dataservice.onlineusers()
      .subscribe(data => {
        if (data.fileid == this.sharedRecord.fileid._id) {
          let isNewPerson = true
          this.onlineusers.forEach((element, index) => {
            if (data._id == element._id) {
              if (data.viewStatus)
                this.onlineusers[index] = data
              else
                this.onlineusers.splice(index, 1)
              isNewPerson = false
            }
          });
          if (isNewPerson) {
            if (data.viewStatus)
              this.onlineusers.push(data)
          }
        }
      })
    this.dataservice.mobilelinkupdate()
      .subscribe(data => {
        this.updateFromMobile(data);
      })
    this.dataservice.newCommentReceived().subscribe(data => {
      this.getComments()
    })
  }

  // Shows the newly submited data in the document
  async displayUpdatedFieldValue(FieldValue) {
    if (this.fields.length)
      this.fields.forEach((field, index) => {
        if (field.id == FieldValue.id) {
          if (FieldValue.value) field.value = FieldValue.value;
          if (FieldValue.path) field.path = FieldValue.path;
          if (FieldValue.size) field.size = FieldValue.size;
          if (FieldValue.fontText) field.fontText = FieldValue.fontText;
          if (FieldValue.fontStyle) field.fontStyle = FieldValue.fontStyle;
          if (FieldValue.signaturebaseData) field.signaturebaseData = FieldValue.signaturebaseData;
          if (FieldValue.signatureType) field.signatureType = FieldValue.signatureType;
          if (FieldValue.photoType) field.photoType = FieldValue.photoType;
          if (FieldValue.stampType) field.stampType = FieldValue.stampType;
          if (FieldValue.signatureId) field.signatureId = FieldValue.signatureId;
          if (FieldValue.photoId) field.photoId = FieldValue.photoId;
          if (FieldValue.stampId) field.stampId = FieldValue.stampId;
          if (FieldValue.insertedemail) field.insertedemail = FieldValue.insertedemail;
          if (FieldValue.created_at) field.created_at = FieldValue.created_at;
          if (FieldValue.longitude) field.longitude = FieldValue.longitude;
          if (FieldValue.latitude) field.latitude = FieldValue.latitude;
          this.spliceRequitedField(field)
          if (this.profiledata && (FieldValue.insertedemail == this.profiledata.email)) field.finished = true;
        }
      })
    if (this.profiledata && (FieldValue.insertedemail !== this.profiledata.email)) await this.dependencyCheck(this.fields)
  }
 /**
   * Function name : getSharedPeoples
   * Input  : fileid
   * Output : {array} sharedpeoples
   * Desc   : To get sharedpeoples of specific document
   */
  getSharedPeoples() {
    this.documentService.getsharingpeople(this.sharedRecord.fileid._id || this.fileid).subscribe((sharerecords: any) => {
      this.sharingpeople = sharerecords
    })
  }
 /**
   * Function name : createonlineUsers
   * Input : {json}
   * Output :{json} onlineuser data
   * Desc : create online user when file is opened
   */
  createonlineUsers(sharedRecord) {
    var log = {
      fileid: sharedRecord.fileid._id,
      viewStatus: true,
      email: sharedRecord.toemail,
      uid: (sharedRecord.toid) ? (sharedRecord.toid._id) : undefined
    }
    this.generalservice.onlineuser(log).subscribe(data => {
      this.onlinedata = data
      this.Getonlineusers(this.sharedRecord.fileid._id)
    })
  }
  // Check expired or not for every 10 seconds 
  Interval = setInterval(() => {
    this.endtime = moment().format("YYYY-MM-DDTHH:mm:ss")
    if (this.expirydate) {
      if (this.expirydate <= this.endtime) {
        clearInterval(this.Interval);
        this.expiretimeCheck = false
        this.isloading = false
        let dialogRef = this.dialog.open(CommonDialogComponent,
          { data: { title: 'dependency', name: 'dependency', content: 'The Document Is Expired' }, width: '500px', panelClass: "deletemod", disableClose: false });
        dialogRef.afterClosed().subscribe(res => {
          if (res) {
            this.Locations.back();
          } else {
            this.Locations.back();
          }
        })
      }
    }
  }, 1000);
 /**
   * Function name : CheckTheDependency
   * Input : {array}
   * Output :{json} onlineuser data
   * Desc : call dependencycheck if field having dependency
   */
  async CheckTheDependency() {
    return new Promise(async (resolve, reject) => {
      this.documentService.getCurrentVersionDocFieldWithValues({ documentid: this.sharedRecord.fileid._id, versionid: this.sharedRecord.fileid.versionid }).subscribe(async (currentVersionDocFieldOptions: any) => {
        this.documentService.getDocumentSingleLog({ documentid: this.sharedRecord.fileid._id, message: 'Submitted', sharedid: this.sharedid, toemail: this.sharedRecord.toemail }).subscribe((data: any) => {
          if (data && data.length) {
            this.finished = true;
          }
        })
        if (currentVersionDocFieldOptions.length) await this.dependencyCheck(currentVersionDocFieldOptions);
        if (!currentVersionDocFieldOptions.length) this.documentdependency = true
        resolve()
      }, error => {
        this.documentdependency = true
        this.documentService.openSnackBar(error, 'X')
      })
    })
  }
/**
   * Function name : shared
   * Input : {String} sharedid
   * Output :{json} sharedRecord
   * Desc : Check Is there any password protection are there or not and expire time
   */
 async shared() {
    this.documentService.getSharedDoc(this.sharedid).subscribe(async res => {
      this.sharedRecord = res;
       if (((!this.sharedRecord.agreetoSign && !this.sharedRecord.view) || (!this.sharedRecord.agreetoReview && this.sharedRecord.view)) &&this.sharedRecord && this.sharedRecord.fileid && !this.sharedRecord.folderid && !this.sharedRecord.revoke) {
         this.isloading=false
        document.getElementById('agreetosign').click()  
       } 
       else if(this.sharedRecord && this.sharedRecord.folderid)
       { 
        this.profiledata = JSON.parse(localStorage.getItem('currentUser'))
        this.profiledata.email = this.userservice.decryptData(this.profiledata.email);
        var fileid={
          _id:this.fileid
        }
        this.documentService.getDocumentLogs(fileid).subscribe(data => {
          this.documentLogs = data
          this.documentLogs = this.documentLogs.filter(x => (x.message == 'Viewed' &&(x.toemail == this.profiledata.email || x.email == this.profiledata.email)))
          if (this.documentLogs.length == 0){
            this.isloading=false;
            document.getElementById('agreetosign').click()
          } 
          else if (this.documentLogs.length != 0) {
            this.LoadSharingRecord();
            this.isloading=true
        }
        })
       }else{
      this.LoadSharingRecord();
      }
    }, error => {
      this.isloading = false
      if (error == 'Expired') {
        let dialogRef = this.dialog.open(CommonDialogComponent,
          { data: { title: 'dependency', name: 'dependency', content: 'The Document Is Expired' }, width: '500px', panelClass: "deletemod", disableClose: false });
        dialogRef.afterClosed().subscribe(res => {
          if (res) {
            this.Locations.back();
          } else {
            this.Locations.back();
          }
        })
      }
    });
  }


  LoadSharingRecord(){

    this.profiledata = JSON.parse(localStorage.getItem('currentUser'))
    if(this.profiledata && this.profiledata.email && this.sharedRecord && this.sharedRecord.toemail && (this.userservice.decryptData(this.profiledata.email).trim() === this.sharedRecord.toemail.trim())){
    this.profiledata.name = this.userservice.decryptData(this.profiledata.name)
    this.profiledata.email = this.userservice.decryptData(this.profiledata.email);
    this.profiledata.id = this.userservice.decryptData(this.profiledata.id)
    this.profiledata.type = this.userservice.decryptData(this.profiledata.type)
  } else if(this.sharedRecord.accesstype == 'public'){
    var nameArray = this.sharedRecord.toemail.split('@')
    this.profiledata = {
      name: nameArray[0],
      email: this.sharedRecord.toemail
    }
  }
  if (this.sharedRecord.revoke == true && !this.revokeDialog) {        
    this.isloading = false
    this.revokeDialog = true
    let dialogRef = this.dialog.open(CommonDialogComponent,
      { data: { title: 'dependency', name: 'dependency', content: "You don't Have an Access to View this file" }, width: '500px', panelClass: 'deletemod', disableClose: true });
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        if ((this.profiledata && this.profiledata.type) && this.profiledata.type == 'individual') this.router.navigate(['/individual/home/shareddocument'])
        else if ((this.profiledata && this.profiledata.type) && (this.profiledata.type == 'organisation' || this.profiledata.type == 'employee')) this.router.navigate(['/organization/home/shareddocument'])
        else this.router.navigate(['/'])
      }
    })
  }
  if (this.sharedRecord.filepassword && this.sharedRecord.pin && !this.passwordCheck && !this.passwordOpen) {
    this.passwordOpen = true
    setTimeout(() => {
    this.isloading = false  
    }, 3000);
    const ConfirmationDiaBox = this.dialog.open(SignupdialogboxComponent, {
      width: '500px',
      disableClose: false,
      autoFocus: true,
      panelClass: 'passwordbottom',
      data: { title: "Please enter password to view the document", content: this.sharedRecord.filepassword, otpflag: true, id: this.sharedRecord._id ,type:'Password'}
    });
    ConfirmationDiaBox.afterClosed().subscribe(async result => {
      if (result) {
        this.isloading = false
        this.passwordCheck = true
        await this.loadDocumentRecordAndDependency()
        if (this.sharedRecord.VideoRecord)
          this.startRecording();
        else this.videorecordChecking = true
      }
      else {
        this.Locations.back();
      }
    });
  }
  else if (this.sharedRecord.VideoRecord) {
    this.loadDocumentRecordAndDependency()
    this.startRecording()
  }
  else {
    this.videorecordChecking = true
    this.loadDocumentRecordAndDependency()
  }
  if (this.sharedRecord.access_expirydate) {
    this.expirydate = moment(this.sharedRecord.access_expirydate).format("YYYY-MM-DDTHH:mm:ss")
    this.Interval
  }
  }
/**
 * Function name : loadDocumentRecordAndDependency
 * Input : {String} fileid
 * Output :{array} file images
 * Desc : Get file images
 */
  async loadDocumentRecordAndDependency() {
    if (this.sharedRecord.folderid) {
      this.documentService.getDocumentRecord(this.fileid).subscribe(async data => {
        this.sharedRecord.fileid = data
        if (this.sharedRecord && this.sharedRecord.Chat) this.createonlineUsers(this.sharedRecord);
        await this.CheckTheDependency()
        if ((this.sharedRecord.accesstype == 'Allowusers' && this.sharedRecord.toemail == this.profiledata.email) || this.sharedRecord.accesstype == 'public') {
          this.documentRecord = this.sharedRecord.fileid
          this.documentService.getDocumentImages(this.documentRecord._id).subscribe(docimg => {
            this.documentImages = docimg
          })
        }
      }, error => {
        this.isloading = false
        this.urlMismatch()
      })
    }
    else {
      if (this.sharedRecord && this.sharedRecord.Chat) this.createonlineUsers(this.sharedRecord);
      await this.CheckTheDependency()
      if ((this.sharedRecord.accesstype == 'Allowusers' && this.sharedRecord.toemail == this.profiledata.email) || this.sharedRecord.accesstype == 'public') {
        this.documentRecord = this.sharedRecord.fileid
        this.documentService.getDocumentImages(this.documentRecord._id).subscribe(docimg => {
          this.documentImages = docimg
        })
      }
      else if (this.notAuthorized) {
        this.isloading = false
        this.urlMismatch()
      }
    }
  }
  /**
    * Function name : LoadFields
    * Input : fileid
    * Output : {array}  fields
    * Desc : Gettiong Document fields Data
    */
  LoadFields() {
    this.documentService.getSelectedDoc(this.sharedRecord.fileid._id || this.fileid,'public').subscribe((data:any) => {
      if (data.waterMark) {
        this.waterMark = data.waterMark;
        setTimeout(() => {
          this.loadWaterMark();
        }, 1000);
      }
      if ((this.sharedRecord.accesstype == 'Allowusers' && this.sharedRecord.toemail == this.profiledata.email) || this.sharedRecord.accesstype == 'public') {      
      this.documentRecord = data
      if (this.documentRecord.waterMark) this.waterMark = this.documentRecord.waterMark
      this.documentService.getCurrentVersionDocFieldWithValues({ documentid: this.documentRecord._id, versionid: this.documentRecord.versionid }).subscribe(async currentVersionDocFieldOptions => {
        this.fields = currentVersionDocFieldOptions;
        for (let field of this.fields) {
          if (this.PdfWidth) {
            field.width = (field.width / field.pageWidth) * this.PdfWidth
            field.height = (field.height / field.pageHeight) * this.PdfHeight
            field.left = (field.left / field.pageWidth) * this.PdfWidth
            field.top = (field.top / field.pageHeight) * this.PdfHeight
          }
          if(field.type == 'text' || field.type == 'name' || field.type == 'mobilenumber' || field.type == 'email' || field.type == 'company' || field.type == 'date' || field.type == 'checkbox' || field.type == 'radiobutton' || field.type == 'dropdown') {
            if(field.readonly && field.people == this.sharedRecord.toemail) field.readonly = true
            else {
              field.readonly = null
            }
          }
        }
        this.DisplayFieldsData();
      }, error => {
        if (error == 'Not Found')
          this.documentdependency = true
      });
    }
    else if(this.notAuthorized){
      this.isloading = false
      this.urlMismatch()
    }
    }, error => {
     this.urlMismatch()
    })
  }
  // To check required field count and load default values
  async DisplayFieldsData() {
    this.filledFieldCount = 0
    var isAnyOneInserted = 0
    this.fieldsforsubmit = this.fields.filter(x => x.type != 'label')
    this.fieldsforsubmit.forEach(field => {
      if (field.value || field.signatureId || field.stampId || field.photoId)
        this.filledFieldCount++
      if (field.insertedemail) isAnyOneInserted++
    });
    if (!isAnyOneInserted) this.filledFieldCount = 0
    
    if(!this.sharedRecord.view  ){
      this.requiredFieldsCount = this.fields.filter(field => (field.restrict && field.restrict == 'required' && field.people && field.people == this.sharedRecord.toemail && !(field.value || field.insertedemail || field.signatureId || field.photoId || field.stampId)));
      console.log( this.requiredFieldsCount)
      this.requiredFieldsCounts = this.requiredFieldsCount.length;
    }
    else{
      this.requiredFieldsCounts = 0
    }
    if (this.fields.length) await this.dependencyCheck(this.fields);
    else if (!this.fields.length) this.documentdependency = true
    for (let field of this.fields) {
      if (field.type == 'date' && field.value) field.value = new Date(field.value)
      if (!field.insertedemail && !field.people && (field.value || field.photoId || field.stampId || field.signatureId)) field.ownerFieldValue = true;
      if (field.insertedemail == this.sharedRecord.toemail) field.finished = true
      // if (field.people && (field.people != this.sharedRecord.toemail)) field.readonly = true;
      if (field.type == 'label') field.class = "disableDiv"
      else if (field.type == 'signature') this.isSignaturField = true;
      else if (field.type == 'initial') this.isIntialField = true;
      else if (field.type == 'Photo') this.isPhotoField = true;
      else if (field.type == 'Stamp') this.isStampField = true;
      if (  !this.sharedRecord.view ) this.populateDefaults(field);
      else field.readonly = true;
      setTimeout(() => { this.updateFieldCss(field); }) //After Div insert in html then only it needs to be call
      $("#style-1").scrollTop(1);
    }
    this.nextField()
  }
  /**
    * Function name : documentStatusUpdate
    * Input : fileid
    * Output: {json}  updated document
    * Desc  : To update the document status
    */
  documentStatusUpdate(fields) {
    return new Promise(async (resolve, reject) => {
      fields = fields.filter(field => field.type != 'label')
      this.documentService.getsharingpeople(this.sharedRecord.fileid._id).subscribe((sharerecords: any) => {
        var shareForReviews = []
        var shareForSignatures = []
        shareForSignatures = sharerecords.filter(element => !element.view)
        shareForReviews = sharerecords.filter(element => element.view)
        var shareAgree = sharerecords.filter(element => element.agreetoSign)
        var shareReview = sharerecords.filter(element => element.agreetoReview)
        var statusemail = []
        var filledFieldCount = 0
        fields.forEach(function (field) {
          var unique = true;
          if (field.insertedemail) {
            statusemail.forEach(function (email) {
              if (_.isEqual(field.insertedemail, email)) unique = false;
            });
            if (unique) statusemail.push(field.insertedemail)
          }
          if (field.value || field.signatureId || field.stampId || field.photoId)
            filledFieldCount++
        });
        if (statusemail.filter(element => element == this.sharedRecord.toemail).length == 0) {
          fields.filter(field => {
            if ((field.value || field.signatureId || field.stampId || field.photoId) && (field.people == this.sharedRecord.toemail)) {
              if (filledFieldCount > 0)
                filledFieldCount--
            }
          })
        }
        this.filledFieldCount = filledFieldCount
        var reviewedPeople, signedPeople
        signedPeople = sharerecords.filter(element => (element.signed && element.edit))
        reviewedPeople = sharerecords.filter(element => (element.reviewed && element.view))
        var status
        if (sharerecords.length && ((signedPeople.length == shareForSignatures.length && reviewedPeople.length == shareForReviews.length) || (reviewedPeople.length == shareForReviews.length && filledFieldCount == fields.length && shareAgree.length == shareForSignatures.length && shareReview.length == shareForReviews.length)))
          status = "Completed"
        else if (sharerecords.length > 1 && (signedPeople.length || reviewedPeople.length))
          status = "Partially completed"
        else if (sharerecords.length && (!signedPeople.length && !reviewedPeople.length))
          status = "Waiting for Sign"
        if (this.documentRecord.status != "Completed" && status == "Completed") {
          this.documentService.newCompletedDocImgs({ id: this.documentRecord._id, createCompDocImg: true }).subscribe((data: any) => { })
        }
        if (this.documentRecord.status != status) {
          this.documentService.updatefolder({ _id: this.documentRecord._id, status: status }).subscribe(updatedData => { });
        }
        resolve()
      });
    })
  }


  // Load Aditional Info
  loadAdditionalData() {
    this.auditlog({ id: this.sharedRecord.fileid._id }); // Get All Audit log when ever page loading is done
    this.getComments()
    if (this.sharedRecord.VersionAccess)
      this.getAllDocVersions(this.sharedRecord.fileid._id)
    var log = {
      fileid: this.sharedRecord.fileid._id,
      viewStatus: true,
      email: this.sharedRecord.toemail,
      uid: this.sharedRecord.toid,
    }
    this.getOfflineNotification();
    this.getNotificationCount();
  }
  //Populate Default Values
  populateDefaults(field) {
    if(!field.readonly)
    {
      if (field.class != "disableDiv" && field.type == "name" && !field.value && (field.people == this.sharedRecord.toemail)) {
        field.value = this.sharedRecord.toid.name
        if (field.value && field.required) this.spliceRequitedField(field)
      }
      else if (field.class != "disableDiv" && field.type == "email" && !field.value && (field.people == this.sharedRecord.toemail)) {
        field.value = this.sharedRecord.toemail
        if (field.value && field.required) this.spliceRequitedField(field)
      }
      else if (field.class != "disableDiv" && field.type == "date" && !field.value && (field.people == this.sharedRecord.toemail)) {
        field.value = new Date();
        if (field.value && field.required) this.spliceRequitedField(field)
      }
      else if (field.class != "disableDiv" && (field.type == "signature" && !field.signatureId)) {
        if (this.isSignaturField) this.populateDefaultSignature(field, 'signature');
      }
      else if (field.class != "disableDiv" && (field.type == "initial" && !field.signatureId)) {
        if (this.isIntialField) this.populateDefaultSignature(field, 'initial');
      }
      else if (field.class != "disableDiv" && field.type == "Photo" && !field.photoId) {
        if (this.isPhotoField) this.PopulateDefaultPhoto(field)
      }
      else if (field.class != "disableDiv" && field.type == "Stamp" && !field.stampId) {
        if (this.isStampField) this.PopulateDefaultStamp(field);
      }
    }
  }
  /**
   * Function name : populateDefaultSignature
   * Input : shared record toemail,type
   * Output: {json}  default Signature/Initial
   * Desc  : Get default Signature/Initial if exists based on type
   */
  populateDefaultSignature(field, type) {
    if (((field.type == "signature" || field.type == 'initial') && !field.signatureId)) {
      this.documentService.getDefaultSignature({ email: this.sharedRecord.toemail, signtype: type }).subscribe((data: any) => {
        if (field.people && field.people == this.sharedRecord.toemail) {
          field.req = false
          this.spliceRequitedField(field)
          let date = new Date()
          if (data._id) field.signatureId = data._id;
          if (data.type) field.signatureType = data.type
          if (data.signaturebaseData) field.signaturebaseData = data.signaturebaseData
          if (data.path) field.path = data.path
          if (data.size) field.size = data.size
          if (data.name) field.name = data.name
          if (data.encryptedid) field.encryptedid = data.encryptedid
          if (data.fontStyle) field.fontStyle = data.fontStyle
          if (data.fontText) field.fontText = data.fontText
          field.latitude = this.latitude
          field.longitude = this.longitude
          field.created_at = date
          data.created_at = date
          data.fieldId = field.id
          if (type == 'signature')
            this.savedocLogs(this.sharedRecord.fileid._id, data, 'Signature')
          else if (type == 'initial')
            this.savedocLogs(this.sharedRecord.fileid._id, data, 'Initial')
        }
      })
    }
  }

  /**
  * Function name : PopulateDefaultPhoto
  * Input : shared record toemail,type
  * Output: {json}  default Photo
  * Desc  : Get default Photo if exists based on type
  */
  PopulateDefaultPhoto(field) {
    if ((field.type == "Photo" && !field.photoId && !field.authentication)) {
      this.documentService.getDefaultPhoto(this.sharedRecord.toemail).subscribe((data: any) => {
        if (field.people && field.people == this.sharedRecord.toemail) {
          field.req = false
          this.spliceRequitedField(field)
          let date = new Date()
          if (data._id) field.photoId = data._id
          if (data.type) field.photoType = data.type
          if (data.path) field.path = data.path
          if (data.size) field.size = data.size
          if (data.name) field.name = data.name
          if (data.encryptedid) field.encryptedid = data.encryptedid
          if (data.photobaseData) field.photobaseData = data.photobaseData
          field.latitude = this.latitude
          field.longitude = this.longitude
          field.created_at = date
          data.created_at = date
          data.fieldId = field.id
          this.savedocLogs(this.sharedRecord.fileid._id, data, 'Photo')
        }
      })
    }
  }

  /**
  * Function name : PopulateDefaultStamp
  * Input : shared record toemail,type
  * Output: {json}  default Stamp
  * Desc  : Get default Stamp if exists based on type
  */
  PopulateDefaultStamp(field) {
    if ((field.type == "Stamp" && !field.stampId)) {
      this.documentService.getDefaultStamp(this.sharedRecord.toemail).subscribe((data: any) => {
        if (field.people && field.people == this.sharedRecord.toemail) {
          field.req = false
          this.spliceRequitedField(field)
          let date = new Date()
          if (data._id) field.stampId = data._id
          if (data.type) field.stampType = data.type
          if (data.path) field.path = data.path
          if (data.size) field.size = data.size
          if (data.name) field.name = data.name
          if (data.encryptedid) field.encryptedid = data.encryptedid
          field.latitude = this.latitude
          field.longitude = this.longitude
          field.created_at = date
          data.created_at = date
          data.fieldId = field.id
          this.savedocLogs(this.sharedRecord.fileid._id, data, 'Stamp')
        }
      })
    }
  }
  /**
  * Function name : getpdfSizes
  * Input  : pdf width,height
  * Output : {number}  
  * Desc   : calculation of pdftop and pdfleftsidebar
  */
  getpdfSizes() {
    this.PdfTop = document.getElementById('docsubheader').offsetHeight;
    this.PdfTopScroll = $("#style-1").scrollTop();
    this.PdfLeft = $('#docsidebar').outerWidth(true) + (($('#blog-post').outerWidth(true) - $('#blog-post').width()) / 2);
    this.PdfLeftNosideBar = ($('#blog-post').outerWidth(true) - $('#blog-post').width()) / 2;
  }

  /**
  * Function name : getFieldLeft
  * Input  : {json} field
  * Output : {number} field left value
  * Desc   : To get field left as per zoom Level
  */
  getFieldLeft(field) {
    var left = 0;
    if ((field.top || field.coordinatey) && this.zoomVal != 1) {
      var perc = this.getPercentageChange(parseInt(this.PdfWidth), parseInt($(".page:first").width()));
      if (field.left) {
        var l = (field.left / 100) * perc;
        left = field.left - l;
      }
      else {
        var l = (field.coordinatey / 100) * perc;
        left = (field.coordinatey - l) - ((this.zoomVal * 10) - 10);
      }
    }
    else if (field.left) left = field.left;
    else if (field.coordinatey) left = field.coordinatey; // only comments section
    return left + this.PdfLeftNosideBar;
  }

  /**
  * Function name : getFieldTop
  * Input  : {json} field
  * Output : {number} field Top value
  * Desc   :  Get Field Top as per zoom Level
  */
  getFieldTop(field) {
    var top = 0;
    if ((field.top || field.coordinatex) && this.zoomVal != 1) {
      var perc = this.getPercentageChange(parseInt(this.PdfWidth), parseInt($(".page:first").width()));
      if (!field.selectText && field.top) {
        var l = (field.top / 100) * perc;
        top = field.top - l;
      } else if (field.coordinatex) {
        var l = (field.coordinatex / 100) * perc;
        top = field.coordinatex - l;
      }
      else if (field.selectText) {
        var l = (field.top / 100) * perc;
        top = field.top - l;
      }
    }
    else if (field.top) { top = field.top; }
    else if (field.coordinatex) { top = field.coordinatex }
    return top;
  }

  /**
  * Function name : getFieldHeight
  * Input  : {json} field
  * Output : {number} field Height value
  * Desc   :  Get Field Height as per zoom Level
  */
  getFieldHeight(field) {
    if (field.height && this.zoomVal != 1) {
      var perc = this.getPercentageChange(parseInt(this.PdfWidth), parseInt($(".page:first").width()));
      var l = (field.height / 100) * perc;
      return field.height - l;
    }
    else return field.height;
  }

  /**
  * Function name : getFieldWidth
  * Input  : {json} field
  * Output : {number} field width value
  * Desc   :  Get Field width as per zoom Level
  */
  getFieldWidth(field) {
    if (field.width && this.zoomVal != 1) {
      var perc = this.getPercentageChange(parseInt(this.PdfWidth), parseInt($(".page:first").width()));
      var l = (field.width / 100) * perc;
      return field.width - l;
    } else return field.width;
  }

  /**
  * Function name : getPercentageChange
  * Input  : pdfwidth,pdfwidth on zooming
  * Output : {number} percentage value 
  * Desc   :  Calculate distance percentage
  */
  getPercentageChange(oldNumber, newNumber) {
    var decreaseValue = oldNumber - newNumber;
    return (decreaseValue / oldNumber) * 100;
  }

  /**
  * Function name : ResetFieldFonts
  * Input  : {json} field
  * Output : {number} field placeholder fontsize
  * Desc   :  Update FontSize  of placeholder based on field size
  */
  ResetFieldFonts(field) {
    if (this.windowwidth > 750) {
      if (field && field.type && (field.type == 'signature' || field.type == 'initial' || field.type == 'Photo' || field.type == 'Stamp' || (field.type == 'label' && field.placeholder == "label" && !field.value))) {
        var div = $("#" + field.id + '-input');
        var fontsizeInvw = div.width() / 90
        var fontsizeInvh = div.height() / 90
        if (div.width() == 15) div.css('font-size', 0.56 + 'vw');
        else if (div.width() == div.height())
          div.css('font-size', (fontsizeInvh + fontsizeInvw) + 'vmin');
          else if (div.width() > div.height()){

            if(!field.fontText) div.css('font-size', fontsizeInvh + 0.5 + 'vw');
          else if(field.fontText) div.css('font-size', fontsizeInvh  + 'vw');
          }
        else {
          fontsizeInvw = div.width() / 90
          fontsizeInvh = div.height() / 90
          div.css('font-size', (fontsizeInvw) + 'vw');
        }
      }
    }
    if (field && field.type && field.type == 'date') {
      this.assignRadio(field, 'pickerType');
    }
  }
  /**
  * Function name : UpdateDateFormat
  * Input  : {json} field
  * Output : {number} date with format
  * Desc   :  Update Date format as per date settings
  */
  UpdateDateFormat(field) {
    var index = this.requiredFieldsCount.findIndex(x => x.id == field.id);
    if (index >= 0) {
      this.requiredFieldsCount.splice(index, 1);
      $("#" + field.id).removeAttr("tabindex");
      $("#" + field.id).removeClass("focuscolor");
      $("#" + field.id + "-input").addClass("label");
      $("#" + field.id + "-input").removeClass("drag-box-label");
    }
    this.requiredFieldsCounts = this.requiredFieldsCount.length;
    if (field.pickerType == 'date') {
      var m = JSON.parse(JSON.stringify(field.dateformats));
      field.dateformats = '';
      setTimeout(() => { field.dateformats = m });
    }
    else if (field.pickerType == 'time') {
      var m = JSON.parse(JSON.stringify(field.timeformats));
      field.timeformats = '';
      setTimeout(() => { field.timeformats = m });
    }
    else {
      var m = JSON.parse(JSON.stringify(field.dateTimeformats));
      field.dateTimeformats = '';
      setTimeout(() => { field.dateTimeformats = m });
    }
    return field.value;
    if (!field.value) return true;
    if (field.pickerType == 'date') field.value = this.datepipe.transform(field.value, field.dateformats)
    else if (field.pickerType == 'time') field.value = this.datepipe.transform(field.value, field.timeformats)
    else field.value = this.datepipe.transform(field.value, field.dateTimeformats)
  }
// To clear date when click clear icon in date field
  clearDateValue(f) {
    f.value = null;
    if (f.restrict && f.restrict == 'required' && f.people && (!f.people || f.people == this.sharedRecord.toemail) && !this.requiredFieldsCount.some(x => x.id == f.id)) this.requiredFieldsCount.push(f)
    this.requiredFieldsCounts = this.requiredFieldsCount.length;
  }
  /**
   * Function name : assignRadio
   * Input : field,key
   * Output :date formats
   * Desc :Based on pickertype we can add formats
   */
  assignRadio(f, key) {
    if (f.type == 'date' && key == 'pickerType' && this.editF) {
      setTimeout(() => {
        $(".date-clear").hide();
        $("." + f.pickerType + "-picker-dropdown").show();
        if (f.pickerType == 'date') {
          this.editF.pickerT = 'calendar';
          this.editF.dateformats = 'dd/MM/yyyy';
          this.editF.timeformats, this.editF.dateTimeformats = '';
        }
        else if (f.pickerType == 'time') {
          this.editF.pickerT = 'timer';
          this.editF.timeformats = 'hh:mm a';
          this.editF.dateformats, this.editF.dateTimeformats = '';
        }
        else {
          this.editF.pickerT = 'both';
          this.editF.dateTimeformats = 'dd/MM/yyyy hh:mm';
          this.editF.dateformats, this.editF.timeformats = '';
        }
      }, 10);
    }
  }

  // Resize fields on window resize
  onWindowResize() {
    this.getpdfSizes();
  }

  resetFields(fields) {
    if (!fields) fields = this.fields;
    console.log(fields);
    for (let field of this.fields) {
      field.top = field.top + document.getElementById('docsubheader').offsetHeight + 30;
    }
  }

  /**
  * Function name : GetSignatureDocumentList
  * Input  : {String} If value is there it will check count if count 0 then it will navigate to that tab 
  * Output : {array} Signatures
  * Desc   :  Get Lists of Signatures 
  */
  GetSignatureDocumentList(taboption) {
    if (this.sharedRecord)
      this.documentService.ListOfSignatures(this.sharedRecord.toemail).subscribe((res: any) => {
        if (res.length > 0) {
          this.SignatureList = []
          res.forEach(signelement => {
            let needToPush = true;
            this.SignatureList.forEach(element => {
              if ((signelement.type == 'font' && signelement.fontStyle == element.fontStyle && signelement.fontText == element.fontText) ||
                (signelement.type == 'signaturepad' && signelement.signaturebaseData == element.signaturebaseData)) {
                needToPush = false;
                return;
              }
            });
            if (needToPush) this.SignatureList.push(signelement);
          });
        } else if (taboption && this.SignatureList.length == 0) {
          this.tabactive = taboption;
          this.signature()
        }
      });
  }
  /**
   * Function name : GetInitialDocumentList
   * Input  : {String} If value is there it will check count if count 0 then it will navigate to that tab 
   * Output : {array} Initials
   * Desc   :  Get Lists of Intials 
   */
  GetInitialDocumentList(taboption) {
    if (this.editF) this.editF.req = false;
    if (this.sharedRecord)
      this.documentService.ListOfInitials(this.sharedRecord.toemail).subscribe((res: any) => {
        if (res.length > 0) {
          this.initialList = []
          res.forEach(signelement => {
            let needToPush = true;
            this.initialList.forEach(element => {
              if ((signelement.type == 'font' && signelement.fontStyle == element.fontStyle && signelement.fontText == element.fontText) ||
                (signelement.type == 'signaturepad' && signelement.signaturebaseData == element.signaturebaseData)) {
                needToPush = false;
                return;
              }
            });
            if (needToPush) this.initialList.push(signelement);
          });
        }
      });
  }
  /**
  * Function name : setInitialDefaultSettings
  * Input  : {json} selected Initial
  * Output : {json} updated Initial document
  * Desc   :  To set default Initial or remove from default 
  */
  setInitialDefaultSettings(sign) {
    if (sign.setDelete) {
      var index = this.initialList.findIndex(x => x._id == sign._id)
      if (index >= 0) {
        this.initialList.splice(index, 1)
      }
      if (this.initialList.length == 0)
        this.tabactive = 'tab3'
    }
    this.documentService.setSignatureDefaultSettings(sign).subscribe(data => {
    })
  }
  /**
  * Function name : setSignatureDefaultSettings
  * Input  : {json} selected Signature
  * Output : {json} updated Signature document
  * Desc   :  To set default Signature or remove from default 
  */
  setSignatureDefaultSettings(sign) {
    if (sign.setDelete) {
      var index = this.SignatureList.findIndex(x => x._id == sign._id)
      if (index >= 0) {
        this.SignatureList.splice(index, 1)
      }
    }
    if (this.SignatureList.length == 0)
      this.tabactive = 'tab3'
    this.documentService.setSignatureDefaultSettings(sign).subscribe(data => {
    })
  }
  /**
  * Function name : setPhotoDefaultSettings
  * Input  : {json} selected Photo
  * Output : {json} updated Photo document
  * Desc   :  To set default Photo or remove from default 
  */
  setPhotoDefaultSettings(sign) {
    if (sign.setDelete) {
      var index = this.PhotoList.findIndex(x => x._id == sign._id)
      if (index >= 0) {
        this.PhotoList.splice(index, 1)
      }
      if (this.PhotoList.length == 0)
        this.tabactive = 'tab5'
    }
    this.documentService.setPhotoDefaultSettings(sign).subscribe(data => {
    })
  }
  /**
  * Function name : setStampDefaultSettings
  * Input  : {json} selected Stamp
  * Output : {json} updated Stamp document
  * Desc   :  To set default Stamp or remove from default 
  */
  setStampDefaultSettings(sign) {
    if (sign.setDelete) {
      var index = this.StampList.findIndex(x => x._id == sign._id)
      if (index >= 0) {
        this.StampList.splice(index, 1)
      }
      if (this.StampList.length == 0)
        this.tabactive = 'tab2'
    }
    this.documentService.setStampDefaultSettings(sign).subscribe(data => {
    })
  }
/**
  * Function name : updateorgemps
  * Input  : {json} login user data
  * Output : {String} success
  * Desc   :  To update the sharepeople record
  */
  updateorgemps(e) {
    this.organizationService.updateorgsharingpeople(this.documentRecord._id, e).subscribe(data => {
    })
  }
/**
  * Function name : GetPhotoDocumentList
  * Input  : {String} If value is there it will check count if count 0 then it will navigate to that tab 
  * Output : {array} Photos
  * Desc   :  Get Lists of Photos 
  */
  GetPhotoDocumentList(taboption) {
    if (this.sharedRecord)
      this.documentService.ListOfPhotos(this.sharedRecord.toemail).subscribe((res: any) => {
        if (res.length >= 0)
          this.PhotoList = res;
      });
  }
  /**
  * Function name : GetStampDocumentList
  * Input  : {String} If value is there it will check count if count 0 then it will navigate to that tab 
  * Output : {array} Stamps
  * Desc   :  Get Lists of Stamps 
  */
  GetStampDocumentList(taboption) {
    if (this.sharedRecord)
      this.documentService.ListOfStamps(this.sharedRecord.toemail).subscribe((res: any) => {
        this.StampList = res;
      });
  }
 /**
   * Function name : selectSignature
   * Input  : {json} field
   * Output : {json} selected Signature
   * Desc   :  Get selected signature from siagnature list 
   */
  selectSignature(data, title) {
    this.editF.req = false
    this.spliceRequitedField(this.editF)
    let date = new Date()
    if (data._id) this.editF.signatureId = data._id;
    if (data.type) this.editF.signatureType = data.type
    if (data.signaturebaseData) this.editF.signaturebaseData = data.signaturebaseData
    if (data.path) this.editF.path = data.path
    if (data.size) this.editF.size = data.size
    if (data.name) this.editF.name = data.name
    if (data.encryptedid) this.editF.encryptedid = data.encryptedid
    if (data.fontStyle) this.editF.fontStyle = data.fontStyle
    if (data.fontText) this.editF.fontText = data.fontText
    this.editF.latitude = this.latitude
    this.editF.longitude = this.longitude
    this.editF.created_at = date
    data.created_at = date
    data.fieldId = this.editF.id
    this.ResetFieldFonts(this.editF)
    this.savedocLogs(this.sharedRecord.fileid._id, data, title)
  }
 /**
   * Function name : selectPhoto
   * Input  : {json} field
   * Output : {json} selected Photo
   * Desc   :  Get selected photo from photo list 
   */
  selectPhoto(data) {
    this.editF.req = false
    this.spliceRequitedField(this.editF)
    if (data.bottlenecksCreated == false && this.editF.authentication == true) {
      this.documentService.bottlenecksCreationForPhoto(data).subscribe((result: any) => {
        if (result._id && result.bottlenecksCreated) {
          this.savedPhoto = data
          let dialogRef = this.dialog.open(CommonDialogComponent, { data: { name: 'aiauthenticate' }, disableClose: false, width: '500px', panelClass: "deletemod" });
          dialogRef.afterClosed().subscribe(res => {
            if (res) {
              this.authenticateFun(data._id,'selectPhoto',data)
            }
          })
        }
        else
          this.documentService.openSnackBar('Choose other photo', "X")
      }, error => {
        this.documentService.openSnackBar(error, "X")
      })
    }
    else if (data.bottlenecksCreated == true && this.editF.authentication == true) {
      this.savedPhoto = data
      let dialogRef = this.dialog.open(CommonDialogComponent, { data: { name: 'aiauthenticate' }, disableClose: false, width: '500px', panelClass: "deletemod" });
      dialogRef.afterClosed().subscribe(res => {
        if (res) {
          this.authenticateFun(data._id,'selectPhoto',data)
        }
      })
    }
    else {
      this.savedPhoto = data
      this.setPhoto('select')
    }
  }
  /**
  * Function name : selectStamp
  * Input  : {json} field
  * Output : {json} selected stamp
  * Desc   :  Get selected stamp from stamp list 
  */
  selectStamp = function (data) {
    this.editF.req = false
    this.spliceRequitedField(this.editF)
    let date = new Date()
    if (data._id) this.editF.stampId = data._id
    if (data.type) this.editF.stampType = data.type
    if (data.path) this.editF.path = data.path
    if (data.size) this.editF.size = data.size
    if (data.name) this.editF.name = data.name
    if (data.encryptedid) this.editF.encryptedid = data.encryptedid
    this.editF.latitude = this.latitude
    this.editF.longitude = this.longitude
    this.editF.created_at = date
    data.created_at = date
    data.fieldId = this.editF.id
    this.savedocLogs(this.sharedRecord.fileid._id, data, 'Stamp')
  }
  /**
  * Function name : submit
  * Input  : {json} 
  * Output : {array} Fields with values
  * Desc   :  Add the fields in filedvalue collection and fieldvalues
  */
  submit = function (e) {
    if (document.getElementById('myModal12345')) { this.isloading = false }
    if (this.requiredFieldsCounts == 0) {
      this.fieldemails = this.fields.find(x => (x.type == 'email' || x.type == 'mobilenumber') && !x.fieldvalidationCheck);
      this.fieldminlength = this.fields.find(x => (x.type == 'name' || x.type == 'text' || x.type == 'email' || x.type == 'mobilenumber' || x.type == 'company') && x.minlengtherror)
      if (this.fieldemails || this.fieldminlength) {
        let dialogopem = this.dialog.open(CommonDialogComponent, { data: { title: 'dependency', name: 'dependency', content: "Unable To submit data due to invalid data Entered" }, width: '500px', panelClass: 'deletemod', disableClose: false });
      }
      else if (!this.fieldemails) {
        let dialogRef = this.dialog.open(CommonDialogComponent,
          { data: { name: 'sharesubmit', cancel: true, content: 'Are you sure you want to submit the file?' }, width: '500px', panelClass: "deletemod", disableClose: false });
        dialogRef.afterClosed().subscribe(res => {
          if (res) {
            this.fields.forEach(async element => {
              if (element && element.type && (element.type == 'signature' || element.type == 'initial') ) {
                var div = $("#" + element.id + '-input');
                element['fontsize'] = div.css('font-size')
              }
              element.latitude=this.latitude?this.latitude:'';
              element.longitude=this.longitude?this.longitude:'';
              if (element.people) {
                if ((element.type == 'initial' || element.type == 'signature' || element.type == 'Photo' || element.type == 'Stamp') && element.required == true && element.people == this.sharedRecord.toemail && !(element.signatureId || element.photoId || element.stampId)) {
                  element.req = true
                }
                else if (element.value == undefined) {
                  await this.validateField(e, element)
                }
                else {
                  this.validateField(element.value, element)
                }
              }
            });
            this.requiredFiled = this.fields.find(x => x.req || (x.error == "Fill this field" || x.toucherror == "Fill this field"));
            if (this.requiredFiled) {
              document.getElementById('reqFieldModal').click()
              return;
            }
            var name
            if (this.profiledata.name) name = this.userservice.decryptData(this.profiledata.name)
            else {
              var nameArray = this.sharedRecord.toemail.split('@')
              name = nameArray[0]
            }
            this.isloading = true
            if (!this.locationdata) this.locationdata = JSON.parse(localStorage.getItem('myip'));
            document.getElementById('basicExampleModal').click()
            this.isloading = false
            this.finished = true;
            console.log(this.fields)
            this.documentService.updateSharedFieldsValue({ name: name, uid: this.sharedRecord.toid ? this.sharedRecord.toid : null, email: this.sharedRecord.toemail ? this.sharedRecord.toemail : null, fieldvalues: this.fields, documentid: this.sharedRecord.fileid._id, tomail: this.sharedRecord.fromid.email, IpAddress: (this.locationdata) ? this.locationdata.ip : ' ' }).subscribe(async res => {
              this.documentService.getCurrentVersionDocFieldWithValues({ documentid: this.documentRecord._id, versionid: this.documentRecord.versionid }).subscribe(async currentVersionDocFieldOptions => {
                this.fields = currentVersionDocFieldOptions;
                for (let field of this.fields) {
                  if (this.PdfWidth) {
                    field.width = (field.width / field.pageWidth) * this.PdfWidth
                    field.height = (field.height / field.pageHeight) * this.PdfHeight
                    field.left = (field.left / field.pageWidth) * this.PdfWidth
                    field.top = (field.top / field.pageHeight) * this.PdfHeight
                  }
                }
                await this.documentService.updateSharingpeopleRecord({ _id: this.sharedRecord._id, signed: true }).subscribe(data => {
                  this.documentStatusUpdate(this.fields)
                })
                this.documentService.createBulkFieldLogs(this.LogsList).subscribe(data => { })
                // document.getElementById('basicExampleModal').click()
                this.isloading = false
                this.finished = true;
                this.documentService.openSnackBar("Submitted Successfully", "X");
                if (this.pageInfo.length > 0)
                  this.auditlogs.pageInfo = this.pageInfo
                clearInterval(this.pageinterval);
                if (this.auditlogs) this.generalservice.updatetime(this.auditlogs, this.endtime).subscribe(data => {
                  this.auditlogsResult = data
                });
                this.pageinterval = setInterval(() => {
                  this.pageInfo[this.pageNo - 1].time = ++this.pageInfo[this.pageNo - 1].time;
                }, 1000)
                this.savedocLogs(this.sharedRecord.fileid._id, '', 'Submitted');
                if (this.profiledata && this.profiledata.email) {
                  const result = {
                    fromid: this.sharedRecord.toid ? this.sharedRecord.toid._id : null,
                    toid: this.sharedRecord.fromid,
                    sharingPeopleId: this.sharedRecord._id,
                    type: 'submit',
                    fromemail: this.sharedRecord.toemail,
                    documentid: this.sharedRecord.fileid._id
                  }
                  this.generalservice.createnotification(result).subscribe(response => {
                  });
                }
              })
            })
          }
        });
      }
    }
    else {
      document.getElementById('reqFieldModal').click()
    }
  }
// close submitted dialog
  createFolderDialogClose() {
    document.getElementById('closeReqModal').click()
  }
// To validate fields
  validateField = async function (e, f) {
    console.log(f)
    console.log(f.f)
    if (f.type && f.restrict != 'readonly' && !f.insertedemail && (!f.people || f.people == this.sharedRecord.toemail)) {
      $("#" + f.id + "-input").attr("tabindex", 1).focus();

      $("#" + f.id + "-input").addClass("focuscolor");
    }
    if (f.email) {
      if (f.required && (e == '' || e.length == 0 || e.length == undefined) && f.email == this.sharedRecord.toemail) {
        f.error = "Fill this field";
        f.toucherror = false;
      }
      else if (f.required && e.length == 0 && f.email == this.sharedRecord.toemail)
        f.error = "Fill this field";
      else {
        f.error = false;
        f.toucherror = false;
      }
    }
  }
  // To validate field when go out from field
  validateFieldtouch(e, f) {
    if (f.email) {
      if (f.required && f.value == undefined && f.email == this.sharedRecord.toemail) {
        f.touched = true;
        f.error = false;
        f.toucherror = "Fill this field";
      }
    }
    else {
      f.touched = false;
      if (f.minlengtherror) f.valueDecr = false
      if (f.value && f.required && f.people == this.sharedRecord.toemail && !f.minlengtherror) {
        var index = this.requiredFieldsCount.findIndex(x => x.id == f.id)
        this.spliceRequitedField(f)
        $("#" + f.id).removeAttr("tabindex");
        $("#" + f.id).removeClass("focuscolor");
        $("#" + f.id + "-input").addClass("label");
        $("#" + f.id + "-input").removeClass("drag-box-label");
      }
      if (!f.value && f.restrict == 'required' && !f.minlengtherror) {
        if (!this.requiredFieldsCount.some(x => x.id == f.id) && (f.people && f.people == this.sharedRecord.toemail)) this.requiredFieldsCount.push(f);
        this.requiredFieldsCounts = this.requiredFieldsCount.length;
        f.valueDecr = false
      }
    }
  }
  // To open chat
  test() {
    this.versions = false;
    this.shownoti = false;
    this.commentshownotifitab = false;
    if (!this.newChat && this.openChat) {  //when notification is already opened  to show pages
      this.showpages = true;
      this.newChat = false;
      this.openChat = false
    }
    else if (this.newChat && !this.openChat) { //when chat is already opened  to show pages
      this.showpages = true;
      this.newChat = false;
      this.openChat = false
    }
    else if (this.chatnotificationlogs.length && sessionStorage.getItem("chatid") && this.sharedRecord && this.sharedRecord.Chat) {
      this.newChat = true;
      this.openChat = false;
      this.showpages = false
      if (this.sharedRecord) this.sharedRecord.fileid._id = sessionStorage.getItem("chatid")
      sessionStorage.removeItem("chatid")
    }
    else if ( (this.chatnotificationlogs.length )) {
      console.log("if", this.newChat)
      this.newChat = false;
      this.showpages = false
      this.openChat = true
    }
    else {
      this.newChat = true;
      this.openChat = false;
      if (this.image) { this.image = false } else {
        this.image = true
      }
    }
    
  }
  // assign chatdata
  sendchatdata = function () {
    this.chatdata.from = this.viewRecord.uid._id;
    this.chatdata.to = this.viewRecord.bankNo._id;
    this.chatdata.loanDocID = this.viewRecord._id;
    this.chatdata.type = "loan";
  }


  onLoading() {
    this.PDFLoading = false;
  }
  /**
  * Function name : loadPDF
  * Input  : event
  * Output : pdfwidth
  * Desc   :  set pdf width on  Load PDF Content 
  */
  loadPDF(pdf) {
    $(".blog-post").width($(".page").width());
    $(".textLayer").css("border", '1px solid #000');
    this.onWindowResize()
  }

  incrementPage(amount: number) {
    this.page += amount;
  }
// to call LoadFields,getSharedPeoples,loadOutline,getpdfSizes,loadAdditionalData,additionalData and getmodeldata
  afterLoadComplete(pdf) {
    this.pdf = pdf;
    this.LoadFields();// Load Fields Values
    this.getSharedPeoples()
    var v = this.pdf.numPages.toString()
    for (var i = 1; i <= this.pdf.numPages; i++) {
      this.pagenumbers.push(i.toString().padStart(this.pdf.numPages.toString().length, '0'))
      this.pageInfo.push({ pageNo: i, time: 0,type: this.sharedRecord.view?'Review':'Signature'})
    }
    this.pageinterval = setInterval(() => {
      this.pageInfo[this.pageNo - 1].time = ++this.pageInfo[this.pageNo - 1].time;
    }, 1000)
    this.loadOutline();
    this.getpdfSizes()
    this.loadAdditionalData();
    this.additionalData()
    this.getmodeldata();
    this.isloading = false;
    setTimeout(() => {
      this.PdfHeight = $(".page:first").height();
      this.PdfWidth = $(".page:first").width();
      $('.z00mout').addClass('c0lric0'); 

    }, 100)
  }

  loadOutline() {
    this.pdf.getOutline().then((outline: any[]) => {
      this.outline = outline;
    });
  }
 /**
 * Function name : pdfZoomIn
 * Desc   : To increase zoom level on ZoomIn
 */
  pdfZoomIn() {
    this.zoomWidth = $(".page").width()
    if (this.zoomVal <1.5) {
      this.zoomVal += 0.1
      this.zoomVal = Number(this.zoomVal.toFixed(1));
       $('.z00mout').removeClass('c0lric0')
     }
    else{
      $('.z00min').addClass('c0lric0')

    }
  }
  /**
  * Function name : pdfZoomOut
  * Desc   : To decrease zoom level on ZoomOut
  */
  pdfZoomOut() {
    this.zoomWidth = $(".page").width()
    if (this.zoomVal > 1) {
      $('.z00min').removeClass('c0lric0')
      this.zoomVal -= 0.1;
      this.zoomVal = Number(this.zoomVal.toFixed(1));

    }
    if(this.zoomVal==1){
      $('.z00mout').addClass('c0lric0')
    }
  }
  /**
  * Function name : pdfZoomreset
  * Desc   : set zoomval=1 on ZoomReset
  */
  pdfZoomreset() {
    this.zoomWidth = $(".page").width();
    $('.z00min').removeClass('c0lric0');
    $('.z00mout').addClass('c0lric0'); 
    this.zoomVal = 1
  }
 /**
  * Function name : pdfZoomMax
  * Desc   : set zoomval=1 on Maxzoom
  */
  pdfZoomMax()
  {
    $('.z00mout').removeClass('c0lric0'); 
    $('.z00min').addClass('c0lric0');
    this.zoomVal = 1.5;
  }

  /**
   * Function name : loadWaterMark
   * Input : {json}
   * Output :updated watermark
   * Desc : To change watermark css
   */
  loadWaterMark() {
    let text: any = this.waterMark;
    var fontSize = text.fontsize.substring(0, 2);
    var contentL = text.content.length;
    if (!text.location || text.location == '') return false;
    $(".remove_watermark").remove();
    var css = 'font-size:' + text.fontsize + '; font-family:"' + text.fontfamily + '";position: absolute;';
    $("body").append("<div class='remove_watermark' style='" + css + "'>" + text.content + "</div>");
    var css = '';
    var mark_width = $(".remove_watermark:last").width();
    $(".remove_watermark").hide();
    //watermark calculation
    var m = Math.sin(text.rotate * Math.PI / 180) / 2;
    var val = Math.abs(mark_width * m);
    var val_left = 0;
    if (text.rotate > 85 && text.rotate < 95) val_left = (mark_width - fontSize) / 2;
    else val_left = (Math.abs(val * Math.sin(text.rotate * Math.PI / 180)) + fontSize) / 2;
    if (text.location == 'top_left') css += '.textLayer:before{top:0;left:0; left: -' + val_left + 'px; top:' + val + 'px;';                          //top-left 
    else if (text.location == 'top_right') css += '.textLayer:before{ top:0; right:0; right: -' + val_left + 'px; top:' + val + 'px;';                //top-right
    else if (text.location == 'middle') css += '.textLayer{ display:flex;justify-content:center;align-items: center;} .textLayer:before{';      //middle 
    else if (text.location == 'bottom_left') css += '.textLayer:after{ bottom:0; left: 0; left: -' + val_left + 'px; bottom:' + val + 'px;';        //bottom-left
    else if (text.location == 'repeat') css += '.textLayer{ display:flex;justify-content:center;align-items: center;} .textLayer:before{';
    else css += '.textLayer:after{ right: 0; bottom:0; right: -' + val_left + 'px; bottom:' + val + 'px;';                                        //bottom-right
    if (text.content && text.content != '' && text.location != 'repeat') css += 'content:' + '"' + text.content + '";';
    else if (text.content && text.content != '' && text.location == 'repeat') css += 'content:' + '"' + (text.content + ' ').repeat(10000) + '"; width: 200%; ';
    if (text.line_hight && text.line_hight != '' && text.location == 'repeat') css += ' line-height: ' + text.line_hight + '; ';
    if (text.color && text.color != '') css += 'color:' + '' + text.color + ';';
    if (text.fontsize && text.fontsize != '') css += 'font-size:' + text.fontsize + ';';
    if (text.fontfamily && text.fontfamily != '') css += 'font-family:' + '"' + text.fontfamily + '";';
    if (text.weight) css += "font-weight: bold; ";
    if (text.style) css += "font-style: italic; ";
    if (text.decoration) css += "text-decoration: underline; ";
    if (text.rotate && text.rotate != '') css += "transform: rotate(" + text.rotate + "deg);";
    if(text.photo) css += "background-image: url('"+text.photo+"'); height: "+text.picWidth+";background-position: center; background-repeat: no-repeat;background-size: 100% 100%;width: "+text.picWidth+";";
    css += 'position: absolute;}';
    $("style[data-custom*='delete']").remove();
    $(".page:first").after("<style data-custom='delete'>" + css + "</style>");
  }
 /**
 * Function name : getComments
 * Input  : {String} fileid
 * Output : {array} comments
 * Desc   :  Getting Comments
 */
  getComments() {
    if (this.sharedRecord.fileid._id) {
      var id = { id: this.sharedRecord.fileid._id }
      this.documentService.getcomments(id).subscribe(data => {
        this.commentsdata = data
        this.childcomments = []
        this.parentcomment = []
        this.commentsdata.forEach(element => {
          if (element.uid && element.uid._id != this.profiledata.id) { element.coordinatey -= 15; }
          else if(element.email)  { element.coordinatey -= 15; }
          if (element.parentcommentid) {
            if (element.uid) {
              if (element.uid._id == this.sharedRecord.toid._id) {
                element.isreply = true
              }
            }
            else {
              if (element.people == this.sharedRecord.toemail) {
                element.isreply = true
              }
            }
            this.childcomments.push(element)
          }
          else {
            if (element.uid) {
              if (this.sharedRecord.toid &&element.uid._id == this.sharedRecord.toid._id) {
                element.isreply = true
                this.accessbutton = true
              }
            }
            else {
              if (element.people == this.sharedRecord.toemail) {
                element.isreply = true
              }
            }
            this.parentcomment.push(element)
          }
        })
      })
    }
  }
  /**
  * Function name : addComment
  * Input : {json} event
  * Output: {json} comment
  * Desc : Insert / add New comment on server
  */
  addComment(val, commentdata) {
    this.comment = val.comment
    this.documentid = val._id
    this.editlabel = true
    this.formSubmitted = true
    val.value.documentid = this.sharedRecord.fileid._id,
      val.value.commentedlines = this.commentedlines,
      val.value.coordinatex = this.coordinatex,
      val.value.height = this.coordinatehight,
      val.value.width = this.coordinatewidth,
      val.value.coordinatey = this.coordinatey - this.PdfLeftNosideBar
    val.value.showComment = true
    if (this.sharedRecord.toid) {
      val.value.uid = this.sharedRecord.toid._id
      val.value.name = this.profiledata.name
    }
    val.value.email = this.sharedRecord.toemail
    var nameArray = this.sharedRecord.toemail.split('@')
    val.value.name = nameArray[0]
    if (val.value.comment && val.value.comment.length) {
      this.formSubmitted = false
      this.documentService.postcomments(val.value).subscribe((data: any) => {
        commentdata.commentbtn = false
        this.activeComment = []
      })
    }
  }

  /**
  * Function name : handleClick
  * Input : {json} event
  * Output:selct text
  * Desc : select text in pdf
  */
  handleClick = async function (e) {
    if (!this.locationdata) this.locationdata = JSON.parse(localStorage.getItem('myip'));
    this.getpdfSizes();
    $(".blog-post").width($(".page").width());
    var selection = window.getSelection();
    var oRange = selection.getRangeAt(0); //get the text range
    var oRect = oRange.getBoundingClientRect();
    this.commentedlines = selection.toString()
    var docwidth = document.getElementById('blog-post').offsetWidth;
    var top = oRect.top - this.PdfTop - document.getElementById('docheader').offsetHeight + this.PdfTopScroll;
    var offestLeft = ($('.parentClass').width() / 100) * 25 + 5;
    var left = oRect.left - offestLeft;
    if (this.zoomVal != 1) {
      var l = 0;
      var NH = $(".page:first").height();
      var NW = $(".page:first").width();
      var heightPercentage = top / (NH / 100);
      top = (this.PdfHeight / 100) * heightPercentage;
      var widthPercentage = left / (NW / 100);
      left = (this.PdfWidth / 100) * widthPercentage;
      top = (this.PdfHeight / 100) * heightPercentage;
    }
    var m = 0;
    var pageNo;
    var h = 0;
    var PDFheights = [];
    let pgNo = 1
    $("div.pdfViewer").find("div.page").each(function () {
      PDFheights.push({ start: h, end: h + $(this).height() })
      pgNo++;
      h = h + ((pgNo - 1) > 0 ? (10) : 0) + $(this).height();
    })
    PDFheights.forEach(page => {
      m++;
      if (page.start <= top && page.end >= top) {
        pageNo = m++;
      }
    });
    var mousedata = {
      coordinatex: top,
      coordinatey: left,
      width: oRect.width,
      height: oRect.height,
      text: selection.toString(),
      message: 'selected',
      documentid: this.sharedRecord.fileid._id,
      isFile: true,
      latitude: this.latitude,
      longitude: this.longitude,
      Address: this.Address,
      uid: this.sharedRecord.toid ? this.sharedRecord.toid._id : null,
      email: this.sharedRecord.toemail,
      IpAddress: (this.locationdata) ? this.locationdata.ip : ' ',
      pageWidth: $(".page:first").width(),
      pageHeight: $(".page:first").height(),
      pageNo: pageNo
    }
    if (this.latestrecord) {
      this.latestrecord.updatedAt = moment().format()
      await this.generalservice.updatetime(this.latestrecord, this.endtime).subscribe(data => {
      });
    }
    if (oRect.height <= 100) {
      this.documentService.savemousemovement(mousedata).subscribe(data => {
        this.latestrecord = data
      });
    }
    this.coordinatex = top
    this.coordinatey = oRect.left - offestLeft
    this.coordinatewidth = oRect.width;
    this.coordinatehight = oRect.height;
    this.activeComment = [];
    if (selection.toString().length > 0) {
      if (this.sharedRecord.comment) {
        if (oRect.height <= 100)
          this.activeComment.push({ top: top - 2, docwidth: docwidth, left: oRect.left - offestLeft, selectText: 'selection.toString()', comment: '', active: true, height: oRect.height, width: oRect.width, commentbtn: false })
        else
          this.documentService.openSnackBar("comments are not allowed for this text", "X");
      }
    }
    //to remove heatmap tootip
//var heat = this.heatmaps.filter(x => x.message == 'selected');
if(this.heatmaps && this.heatmaps.length)this.heatmaps.map((x)=> { if(x.message == 'selected')x.tooltip = false;  return x});
  }
  /**
   * Function name : openModel
   * Input : field,id
   * Output :open modal
   * Desc : open modal based on id
   */
  openModel = function (id, field) {
    this.req = false
    this.selectimg = null
    this.added = null
    this.countrylist = []
    this.showlist = false
    this.imagedata=null;
    this.croppedImage=null;
    this.type=null;
    this.webcamImage=null;
    this.showWebcam=false;
    this.phone=null;
    this.enteredvalue=null;
    this.added=null;
    this.searchcountry=null
    console.log(field)
    if (this.sharedRecord.view || this.finished || (field.restrict && (field.readonly && field.people === this.sharedRecord.toemail) )) return true;
    if (this.profiledata.name)
      this.preview = this.userservice.decryptData(this.profiledata.name)
    if (id == 'signatureModalBtn') {
      if (this.SignatureList.length > 0) this.tabactive = 'tab1'
      else this.tabactive = 'tab3'
    }
    else if (id == 'photoModalBtn') {
      if (this.PhotoList.length > 0) this.tabactive = 'tab1';
      else this.tabactive = 'tab5'
    }
    else if (id == 'stampModalBtn') {
      if (this.StampList.length > 0) this.tabactive = 'tab1';
      else this.tabactive = 'tab2'
    }
    else if (id == 'initialModalBtn') {
      if (this.initialList.length > 0) this.tabactive = 'tab1';
      else this.tabactive = 'tab3'
    }
    if (!field.people || field.people == this.sharedRecord.toemail) {
      this.editF = field
      document.getElementById(id).click();
      if ((this.SignatureList.length == 0 && id == 'signatureModalBtn') || (this.initialList.length == 0 && id == 'initialModalBtn')) {
        setTimeout(() => {
          this.signature()
        }, 1000);
      }
    }
  }
  // Preview of signature from signature pad
  showImage(data) {
    if (this.signatureValidation && this.signatureValidation.length > 0) this.signatureImage = data;
    this.type = "signaturepad"
  }
  //signature pad width on resize window
  signature() {
    window.dispatchEvent(new Event('resize'));
  }
  /**
   * Function name : onFileSelected
   * Input : event,title,signtype
   * Output :{String} 
   * Desc :Based on signtype change signtype variable value
   */
  onFileSelected(fileInput: any, title: any, signtype) {
    this.imageFile = fileInput
    if (title == "signature") {
      this.type = "fileupload"
      this.filesToUpload = <Array<File>>this.imageFile.target.files;
      const formData: any = new FormData();
      const files: Array<File> = this.filesToUpload;
      this.signtype = signtype
    }
    else if (title == "photo") {
      this.type = "photoupload"
      this.filesToUpload = <Array<File>>this.imageFile.target.files;
      const formData: any = new FormData();
      const files: Array<File> = this.filesToUpload;
    }
    else if (title == "stamp") {
      this.type = "stampupload"
      this.filesToUpload = <Array<File>>this.imageFile.target.files;
      const formData: any = new FormData();
      const files: Array<File> = this.filesToUpload;
    }
  }
  // cropping of image
  imageCropped(event: ImageCroppedEvent) {
    this.cropimageData = event
    this.croppedImage = event.base64;
  }
  // To select font in signature modal
  selectFont(font, preview) {
    this.fonttype = preview;
    this.fontstyle = font;
    this.type = "font"
  }
  // To validate mobile number
  mobileNumberValidation(form, fromsendlink) {
    this.req = false
    if (!fromsendlink) this.resend = false
    if (form.value.enteredvalue != null && this.added != null) {
      var phnnumber = this.added + String(form.value.enteredvalue)
      var number = form.value.enteredvalue.toString()
      if (number.length > 4) {
        var c = phoneUtil.parse(phnnumber);//It should works and give you some output
        var isValid = phoneUtil.isValidNumber(c); // returns true
        if (isValid) return phnnumber
        else return false
      }
      else return false
    }
    else return false
  }

  /**
  * Function name : sendLink
  * Input : {json,boolean,String} 
  * Output: {json} mobilelink data
  * Desc : send link to given mobile number 
  */
  sendLink = function (uploadlinkForm, valid, type) {
    if (!this.locationdata) this.locationdata = JSON.parse(localStorage.getItem('myip'));
    this.req = false
    if (this.added != null && uploadlinkForm.value.enteredvalue) {
      var val = this.mobileNumberValidation(uploadlinkForm, true)
      this.req = val ? false : true
      if (valid == true && val) {
        uploadlinkForm.value.phNumber = val
        uploadlinkForm.value.type = type;
        uploadlinkForm.value.documentid = this.sharedRecord.fileid._id;
        uploadlinkForm.value.fieldid = this.editF.id;
        uploadlinkForm.value.uid = this.profiledata.id;
        uploadlinkForm.value.email = this.profiledata.email;
        uploadlinkForm.value.fromIP = (this.locationdata) ? this.locationdata.ip : ' '
        if (this.editF.authentication) uploadlinkForm.value.authentication = this.editF.authentication;
        this.documentService.sendingLink(uploadlinkForm.value).subscribe(data => {
          this.resend = true
          this.documentService.openSnackBar("Link Sent Successfully", "X")
        })
      }
      else {
        this.documentService.openSnackBar("Enter Valid Mobile Number", "X")
      }
    } else {
      this.documentService.openSnackBar("Choose Country and Enter Valid Mobile Number", "X")
    }
  }
  // set preview to fontvalue
  save(preview) {
    this.fontvalue = preview;
  }
  /**
  * Function name : editField
  * Input : {json} field
  * Output : {json} selected field data
  * Desc : To get current field
  */
  editField(item: any, index: number) {
    if (item.type && item.restrict != 'readonly' && !item.insertedemail && (!item.people || item.people == this.sharedRecord.toemail)) {
      $("#" + item.id + "-input").attr("tabindex", 1).focus();
      $("#" + item.id + "-input").addClass("focuscolor");
    }
    this.editF = item;
  }
  //field highlight on focusing
  focusfield(item) {
    if (item.type && item.restrict != 'readonly' && !item.insertedemail && (!item.people || item.people == this.sharedRecord.toemail)) {
      $("#" + item.id + "-input").attr("tabindex", 1).focus();

      $("#" + item.id + "-input").addClass("focuscolor");
    }
  }
  /**
   * Function name : getAllDocVersions
   * Input  : {String} fileid
   * Output : {array} All versions
   * Desc   :  Get version of specific file
   */
  getAllDocVersions = function (id) {
    this.documentService.getAllDocVersions(id).subscribe(allDocVersions => {
      this.allDocVersionsResult = allDocVersions
    })
  };
  /**
   * Function name : savedocLogs
   * Input : filedata,filepath,messgae
   * Output :{json} documentlog
   * Desc : save documentlogs in documentlog collection
   */
  savedocLogs(fileid, fielddata, message) {
    if (!this.locationdata) this.locationdata = JSON.parse(localStorage.getItem('myip'));
    if (message == 'Closed' || message == 'Submitted' || message == 'Reviewed') {
      let sigdata = {
        latitude: this.latitude,
        longitude: this.longitude,
        message: message,
        documentid: this.sharedRecord.fileid ?this.sharedRecord.fileid._id:this.fileid,
        uid: this.sharedRecord.toid,
        email: this.sharedRecord.fromid.email,
        toemail: this.sharedRecord.toemail,
        Opened_at: localStorage.getItem('CreatedAt'),
        endTime: moment().format("YYYY-MM-DDTHH:mm:ss"),
        IpAddress: (this.locationdata) ? this.locationdata.ip : ' ',
        sharedid: this.sharedid
      };
      this.documentService.createfieldlogs(sigdata).subscribe(data => { })
    }
    else {
      var signdata = {
        signatureId: message == 'Signature' || message == 'Initial' ? fielddata._id : undefined,
        photoId: message == 'Photo' ? fielddata._id : undefined,
        stampId: message == 'Stamp' ? fielddata._id : undefined,
        uid: this.sharedRecord.toid,
        email: this.sharedRecord.fromid.email,
        toemail: this.sharedRecord.toemail,
        latitude: this.latitude,
        longitude: this.longitude,
        documentid: this.sharedRecord.fileid._id,
        path: fielddata.pemFilePath,
        message: message,
        created_at: fielddata.created_at,
        IpAddress: (this.locationdata) ? this.locationdata.ip : ' ',
        fieldId: fielddata.fieldId,
        sharedid: this.sharedid
      };
      let isLogInserted = false
      this.LogsList.forEach((log, index) => {
        if (log.fieldId == signdata.fieldId) {
          log = signdata
          this.LogsList[index] = signdata
          isLogInserted = true
        }
      })
      if (!isLogInserted) this.LogsList.push(signdata)
    }
  }
  /**
   * Function name : signatureSubmit
   * Input : field,title
   * Output :{json} created signature
   * Desc : save signature in signature collection
   */
  signatureSubmit = function (title) {
    if (this.type == "signaturepad" && this.cropimageData && this.croppedImage) {
      this.isloading = true;
      if (title == 'signature') document.getElementById("signatureModalBtn").click();
      else if (title == 'initial') document.getElementById("initialModalBtn").click();
      var signatureData = { signdata: this.cropimageData, type: "signaturepad", signtype: title, uid: this.sharedRecord.toid ? this.sharedRecord.toid._id : null, email: this.sharedRecord.toemail ? this.sharedRecord.toemail : null }
      this.documentService.saveSignatureimages(signatureData).subscribe(data => {
        if (data)
          this.isloading = false;
        data.fieldId = this.editF.id
        if (title == 'signature') {
          this.savedocLogs(this.sharedRecord.fileid._id, data, 'Signature')
        } else {
          this.savedocLogs(this.sharedRecord.fileid._id, data, 'Initial')
        }
        if (data) {
          this.editF.signatureId = data._id;
          this.editF.signaturebaseData = data.signaturebaseData
          this.editF.signatureType = data.type
          this.signatureImage = {}
          this.editF.created_at = data.created_at
          this.editF.latitude = this.latitude
          this.editF.longitude = this.longitude
          this.spliceRequitedField(this.editF)
          if (this.signtype == 'signature') $("#uploadCaptureInputFileSignature").val('');
          if (this.signtype == 'initial') $("#uploadCaptureInputFileInitial").val('');
          this.type = null;
          this.signatureImage = null;
          this.cropimageData = null;
          this.signatureValidation = null;
        }
      })
    }
    else if (this.type == "fileupload" && this.imageFile) {
      this.isloading = true;
      if (title == 'signature') document.getElementById("signatureModalBtn").click();
      else if (title == 'initial') document.getElementById("initialModalBtn").click();
      this.cropimageData.file.name = this.filesToUpload[0].name
      this.filesToUpload = this.cropimageData;
      const formData: any = new FormData();
      const files = this.filesToUpload;
      this.cropimageData.file.name = 'signature.png'
      formData.append("uploads", this.filesToUpload.file, this.cropimageData.file.name);
      formData.append("type", "fileupload")
      formData.append("email", this.sharedRecord.toemail)
      if (this.sharedRecord.toid) formData.append("uid", this.sharedRecord.toid._id)
      formData.append("signtype", this.signtype)
      this.documentService.saveSignatureimages(formData).subscribe(data => {
        if (data)
          this.isloading = false;
        data.fieldId = this.editF.id
        if (title == 'signature') {
          this.savedocLogs(this.sharedRecord.fileid._id, data, 'Signature')
        } else {
          this.savedocLogs(this.sharedRecord.fileid._id, data, 'Initial')
        }
        this.imageFile = null
        this.croppedImage = null
        if (data) {
          this.editF.signatureId = data._id
          this.editF.path = data.path
          this.editF.size = data.size
          this.editF.signatureType = data.type
          this.editF.name = data.name
          this.editF.encryptedid = data.encryptedid
          this.editF.created_at = data.created_at
          this.editF.latitude = this.latitude
          this.editF.longitude = this.longitude
          this.spliceRequitedField(this.editF)
          $("#uploadCaptureInputFile").val('');
          this.type = null;
          this.imagedata = null
        }
      });
    }
    else if (this.type == "font" && this.fonttype && this.fontstyle) {
      console.log(this.fontstyle)
      this.isloading = true;
      var fontSignatureData = { fonttype: this.fonttype, fontstyle: this.fontstyle, type: "font", signtype: title, uid: this.sharedRecord.toid ? this.sharedRecord.toid._id : null, email: this.sharedRecord.toemail ? this.sharedRecord.toemail : null }
      if (this.isloading) {
        if (title == 'signature')
          document.getElementById("signatureModalBtn").click();
        else if (title == 'initial')
          document.getElementById("initialModalBtn").click();
      }
      this.documentService.saveSignatureimages(fontSignatureData).subscribe(data => {
        console.log(data)
        this.isloading = false;
        data.fieldId = this.editF.id
        if (title == 'signature') {
          this.savedocLogs(this.sharedRecord.fileid._id, data, 'Signature')
        } else {
          this.savedocLogs(this.sharedRecord.fileid._id, data, 'Initial')
        }
        if (data) {
          this.editF.signatureId = data._id
          this.editF.fontStyle = data.fontStyle
          this.editF.fontText = data.fontText
          this.editF.signatureType = data.type
          this.editF.created_at = data.created_at
          this.editF.latitude = this.latitude
          this.editF.longitude = this.longitude
          this.spliceRequitedField(this.editF)
          $("#uploadCaptureInputFile").val('');
          this.type = null;
          this.preview = this.fonttype = this.fontstyle = null;
        }
        this.ResetFieldFonts(this.editF)

      })
    }
    else this.documentService.openSnackBar("Select/Draw/Type/Choose " + title, 'X')
  }
  /**
   * Function name : photoSubmit
   * Input : field
   * Output :{json} created photo
   * Desc : save photo in photo collection
   */
  photoSubmit = function () {
    if (this.cropimageData && (this.webcamImage || this.filesToUpload[0])) {
      var files = []
      if (this.type == "photoupload") {
        this.isloading = true
        document.getElementById("photoModalBtn").click();
        files.push(this.filesToUpload[0]);
      }
      else {
        var blob = this.dataURItoBlob(this.webcamImage.imageAsDataUrl);
        files.push(blob);
        this.isloading = true
        document.getElementById("photoModalBtn").click();
      }
      files.push(this.cropimageData.file)
      const formData: any = new FormData();
      this.spliceRequitedField(this.editF)
      files.forEach(element => {
        formData.append("uploads", element, element.name ? element.name : 'photo.png');
      })
      formData.append("type", this.type ? this.type : "captured")
      formData.append("authentication", this.editF.authentication == true ? true : false)
      formData.append("email", this.sharedRecord.toemail)
      if (this.sharedRecord.toid && this.sharedRecord.toid._id) formData.append("uid", this.sharedRecord.toid._id)
      this.documentService.savePhotoimages(formData).subscribe(data => {
        this.isloading = false
        this.savedPhoto = null
        if (data._id && data.authentication) {
          this.savedPhoto = data
          let dialogRef = this.dialog.open(CommonDialogComponent, { data: { name: 'aiauthenticate' }, disableClose: false, width: '500px', panelClass: "deletemod" });
          dialogRef.afterClosed().subscribe(res => {
            if (res) {
              this.authenticateFun(data._id,'savePhoto',data)
            }
          })
        }
        else if (data._id && !data.authentication) {
          this.savedPhoto = data
          this.setPhoto('submit')
        }
        else if (data.message)
          this.documentService.openSnackBar('Choose other photo', "X")
      }, error => {
        this.documentService.openSnackBar(error, "X")
      })
    }
  }
  /**
   * Function name : stampSubmit
   * Input : field
   * Output :{json} created stamp
   * Desc : save stamp in stamp collection
   */
  stampSubmit = function () {
    if (this.type == "stampupload") {
      document.getElementById("stampModalBtn").click();
      this.isloading = true
      this.cropimageData.file.name = this.filesToUpload[0].name
      this.filesToUpload = this.cropimageData;
      const formData: any = new FormData();
      const files = this.filesToUpload;
      this.cropimageData.file.name = 'stamp.png'
      formData.append("uploads", this.filesToUpload.file, this.cropimageData.file.name);
      formData.append("type", "stampupload")
      formData.append("email", this.sharedRecord.toemail)
      if (this.sharedRecord.toid) formData.append("uid", this.sharedRecord.toid._id)
      this.documentService.saveStampimages(formData).subscribe(data => {
        if (data) {
          data.fieldId = this.editF.id
          this.savedocLogs(this.sharedRecord.fileid._id, data, 'Stamp')
        }
        this.imageFile = null
        this.croppedImage = null
        this.imagedata = data
        if (data) {
          this.editF.stampId = data._id
          this.editF.path = data.path
          this.editF.size = data.size
          this.editF.name = data.name
          this.editF.encryptedid = data.encryptedid
          this.editF.stampType = data.type
          this.editF.created_at = data.created_at
          this.editF.latitude = this.latitude
          this.editF.longitude = this.longitude
          this.spliceRequitedField(this.editF)
          $("#uploadCaptureInputFileStamp").val('');
          this.isloading = false
        }
      });
    }
    else this.documentService.openSnackBar("Select/Choose Stamp", 'X')
    this.type = null;
    this.imagedata = null
  }
  /**
  * Function name : getonlineusers
  * Input : {String} fileid
  * Output: {array} 
  * Desc : To get online users
  */
  Getonlineusers(documentid) {
    this.generalservice.GetonlineUsers(documentid).subscribe((data: any) => {
      this.onlineusers = data
      console.log(this.onlineusers)
    })
  }
  // update online user updatetime 
  ngOnDestroy() {
    clearInterval(this.Interval);
    clearInterval(this.pageinterval);
    if (this.auditlogsResult) this.auditlogs = this.auditlogsResult
    if (this.pageInfo.length > 0)
      if (this.auditlogs) this.auditlogs.pageInfo = this.pageInfo
    if (this.IframePrint !== '') this.IframePrint.parentNode.removeChild(this.IframePrint); // Iframe print for closing the print popup while clicking the back button
    if (this.stream) this.stopRecording()
    if (this.onlinedata) this.generalservice.offline(this.onlinedata).subscribe(data => { })
    if (this.auditlogs) this.generalservice.updatetime(this.auditlogs, this.endtime).subscribe(data => {
      this.auditlogsResult = data
    });
    if (this.latestrecord) {
      this.latestrecord.updatedAt = moment().format()
      this.generalservice.updatetime(this.latestrecord, this.endtime).subscribe(data => {
      });
    }
    if (this.profiledata && this.profiledata.email == this.sharedRecord.toemail) {
      this.savedocLogs(this.sharedRecord.fileid ? this.sharedRecord.fileid._id : this.sharedRecord.folderid, '', 'Closed')
      if ((!this.sharedRecord.view && !this.sharedRecord.signed) || (!this.sharedRecord.edit && !this.sharedRecord.reviewed)) {
        var result: any
        result = {
          toid: this.sharedRecord.fromid,
          documentid: this.sharedRecord.fileid ? this.sharedRecord.fileid._id : this.sharedRecord.folderid,
          sharingPeopleId: this.sharedRecord._id,
          fromemail: this.sharedRecord.toemail,
          type: 'closed'
        }
        if (this.sharedRecord.toid && this.sharedRecord.toid._id) {
          result.fromid = this.sharedRecord.toid._id;
        }
        this.generalservice.createnotification(result).subscribe(response => {
        });
      }
    }
    this.socketDisconnect();
    clearInterval(this.clearintervaldata);
    $('body').addClass('noselect');

  }
// sow reply button
  opening(val) {
    if (this.sharedRecord.toid._id == val.uid._id) {
      this.reply = false
    }
    if (this.sharedRecord.toid._id != val.uid._id) {
      this.reply = true
    }
  }
  /**
  * Function name : editcomment
  * Input : {json} comment
  * Output: {json} updated comment
  * Desc : Edit comment
  */
  editcomment(val) {
    if (val.value.comment && val.value.comment.length)
      this.documentService.editcomments(val.value).subscribe(data => {
        this.editlabel = false
        this.edit = true
      })
  }
  /**
  * Function name : deletecomment
  * Input : {json} comment
  * Output: {String} 
  * Desc : Delete comment
  */
  deletecomment(val, title) {
    if (title == 'resolve')
      val.resolve = true
    else if (title == 'delete')
      val.ok = true
    this.documentService.deletecomments(val._id, title).subscribe(data => {
    })
  }
  // cancel the comment
  cancel() {
    this.comment = null
    this.editlabel = false
    this.edit = true
  }
  // To assign comment data to comment variable
  comment1(val) {
    this.edit = false
    this.editlabel = true
    this.comment = val.comment
    this.documentid = val._id
  }
  // To open specific comment
  openSpecificComment(data) {
    this.comment = null
    this.commentid = data._id
    data.showComment = !data.showComment
  }
  // To show comment
  commentfield(data) {
    data.commentbtn = !data.commentbtn
  }
  // to close comment modal
  commetClose(data) {
    data.commentbtn = false
  }
  // assign selected comment to selectorid
  replycomment(data) {
    this.selectorid = data._id
  }
  /**
  * Function name : replycommentdata
  * Input : {json} event
  * Output: {json} reply comment
  * Desc : give reply to parent comment
  */
  replycommentdata(val, commentForm) {
    this.formSubmitted = true
    if (commentForm.value.replyField && commentForm.value.replyField.length) {
      if (this.loggedIn == 'true') val.name = this.profiledata.name
      else {
        var nameArray = this.sharedRecord.toemail.split('@')
        val.name = nameArray[0]
      }
      this.replyData = {
        documentid: val.documentid,
        commentedlines: val.commentedlines,
        coordinatex: val.coordinatex,
        coordinatey: val.coordinatey,
        parentcommentid: val._id,
        comment: commentForm.value.replyField,
        uid: this.sharedRecord.toid,
        email: this.sharedRecord.toemail,
        name: val.name
      }
      this.documentService.replycomments(this.replyData).subscribe(data => {
        this.formSubmitted = false
        commentForm.resetForm();
      })
    }
  }
  /**
  * Function name : auditlog
  * Input : {json} 
  * Output: {json} get created auditlog
  * Desc : To save logs 
  */
  auditlog(uid) {
    var mousedata: any;
    var locationdata = JSON.parse(localStorage.getItem('currentLocation'));
    this.latitude = this.latitude ? this.latitude : (locationdata) ? locationdata.latitude : undefined;
    this.longitude = this.longitude ? this.longitude : (locationdata) ? locationdata.longitude : undefined;
    mousedata = {
      message: 'Viewed',
      documentid: this.sharedRecord.fileid,
      isFile: true,
      latitude: this.latitude,
      longitude: this.longitude,
      Address: this.Address,
      email: this.sharedRecord.fromid.email,
      toemail: this.sharedRecord.toemail,
      IpAddress: (this.locationdata) ? this.locationdata.ip : ' ',
      sharedid: this.sharedid
    }
    if (this.sharedRecord.toid && this.sharedRecord.toid._id) mousedata.uid = this.sharedRecord.toid._id
    this.documentService.savemousemovement(mousedata).subscribe(data => {
      this.auditlogs = data
      localStorage.setItem('CreatedAt', this.auditlogs.created_at);
    });
  }
  // to set pencolor in signature pad
  colorcodefun(x) {
    this.pencolor = x
    this.isOpenPad = false;
    this.croppedImage = null
    this.cropimageData = null
    this.signatureValidation = null
    this.signatureImage = null
    setTimeout(() => {
      this.isOpenPad = true;
    }, 100);
    this.signature()
  }
  // To clear signature when we select another tab
  clearsign() {
    this.signatureImage = null;
    this.cropimageData = null;
    this.croppedImage = null;
    this.signatureValidation = false
  }
  /**
  * Function name : dependencyCheck
  * Input : {array} 
  * Output: {array} dependency fields
  * Desc : Check for depadancy for document or field 
  */
  dependencyCheck(DocFields) {
    console.log(DocFields)
    return new Promise(async (resolve, reject) => {
      this.isloading = true
      this.opendependencypopup = false
      if (DocFields.length) {
        var id
        if (this.sharedRecord.folderid) id = this.sharedRecord.folderid
        else if (this.sharedRecord.fileid) id = this.sharedRecord.fileid._id
        this.documentService.getsharingpeople(id).subscribe((sharerecords: any) => {
          var insertedFields = DocFields.filter(field => field.insertedemail)
          var dependencyFields = DocFields.filter(field => field.people == this.sharedRecord.toemail && field.dependency)
          var myFields = DocFields.filter(field => field.people == this.sharedRecord.toemail)
          var showedDependencyFields
          if (dependencyFields.length) {
            if(dependencyFields.some(depField =>depField.dependencytype == "Finish")) dependencyFields = dependencyFields.filter(depField => (sharerecords.some(people =>  !depField.insertedemail && (people.toemail == depField.dependency) && !((people.signed && !people.view) || (people.reviewed && people.view)))))
            else if(dependencyFields.some(depField =>depField.dependencytype == "View Access")) dependencyFields = dependencyFields.filter(depField => (sharerecords.some(people => (people.toemail == depField.dependency) && !((people.signed && !people.view) || (people.reviewed && people.view)))))
            if (dependencyFields.length) {
              dependencyFields.forEach(depField => {
                DocFields.forEach(field => {
                  if (depField.dependencytype == "Finish") this.documentdependency = true
                  if (depField.id == field.id) {
                    // var index = this.requiredFieldsCount.findIndex(x => x.id == field.id);
                    // this.requiredFieldsCount.splice(index, 1);
                    // this.requiredFieldsCounts = this.requiredFieldsCount.length;
                    field.class = 'disableDiv'
                    $($("#" + field.id).prop('title', 'This field has a dependency with ' + field.dependency + '!'))
                  }
                });
              });
              this.isloading = false
              showedDependencyFields = dependencyFields.filter(depField => depField.dependencytype == 'View Access')
              if (showedDependencyFields.length && !this.opendependencypopup) {
                this.opendependencypopup = true
                this.documentdependency = false
                this.DependencyPopup(showedDependencyFields)
                resolve();
              }
              else resolve();
            }
            else {
              this.documentdependency = true
              resolve();
            }
          }
          else {
            this.documentdependency = true
            resolve();
          }
        }, error => {
          resolve();
        })
      }
      this.isloading = false
    })
  }
  // To open dependency popup
  DependencyPopup(fields) {
    if (fields.length) {
      let content = ''
      let contentArray = []
      fields.forEach((field, index) => {
        if (field.dependency)
          contentArray.push(field.dependency)
      });
      const uniqueset = new Set(contentArray)
      content = Array.from(uniqueset).join(', ')
      this.dialogRefDependency = this.dialog.open(CommonDialogComponent,
        { data: { title: 'dependency', name: 'dependency', content: 'This document has dependency! You cannot access the document until ' + content + ' submit the document.' }, width: '500px', panelClass: "deletemod", disableClose: false });
      this.dialogRefDependency.afterClosed().subscribe(res => {
        if (res) {
          this.Locations.back();
        }else {
          this.Locations.back();
        }
      })
    }
  }
  // Shows the newly submited data in the document through mobile submission
  updateFromMobile(newContent) {
    if (this.sharedRecord.fileid._id == newContent.documentid) {
      if ((newContent.type == 'signature' || newContent.type == 'initial') && newContent.signatureId && newContent.signaturebaseData && newContent.signatureType) {
        if (newContent.type == 'signature') document.getElementById("signatureModalCloseBtn").click();
        else if (newContent.type == 'initial') document.getElementById("initialModalCloseBtn").click();
        this.fields.forEach(field => {
          if (field.id != newContent.fieldid) return;
          field.req = false
          this.spliceRequitedField(field)
          let date = new Date()
          if (newContent.signatureId) field.signatureId = newContent.signatureId;
          if (newContent.signaturebaseData) field.signaturebaseData = newContent.signaturebaseData;
          if (newContent.signatureType) field.signatureType = newContent.signatureType;
          if (newContent.path) field.path = newContent.path
          if (newContent.size) field.size = newContent.size
          if (newContent.name) field.name = newContent.name
          if (newContent.encryptedid) field.encryptedid = newContent.encryptedid
          field.latitude = this.latitude
          field.longitude = this.longitude
          field.created_at = date
          let logFieldData = {
            created_at: date,
            fieldId: field.id,
            pemFilePath: newContent.pemFilePath,
            _id: newContent.signatureId
          }
          if (newContent.type == 'signature')
            this.savedocLogs(this.sharedRecord.fileid._id, logFieldData, 'Signature')
          else if (newContent.type == 'initial')
            this.savedocLogs(this.sharedRecord.fileid._id, logFieldData, 'Initial')
        })
      }
      else if (newContent.type == 'photo' && newContent.photoId && newContent.photoType) {
        document.getElementById("photoModalCloseBtn").click();
        this.fields.forEach(field => {
          if (field.id != newContent.fieldid) return;
          field.req = false
          this.spliceRequitedField(field)
          let date = new Date()
          if (newContent.photoId) field.photoId = newContent.photoId;
          if (newContent.photoType) field.photoType = newContent.photoType;
          if (newContent.photobaseData) field.photobaseData = newContent.photobaseData;
          if (newContent.path) field.path = newContent.path
          if (newContent.size) field.size = newContent.size
          if (newContent.name) field.name = newContent.name
          if (newContent.encryptedid) field.encryptedid = newContent.encryptedid
          field.latitude = this.latitude
          field.longitude = this.longitude
          field.created_at = date
          let logFieldData = {
            created_at: date,
            fieldId: field.id,
            pemFilePath: newContent.pemFilePath,
            _id: newContent.photoId
          }
          this.savedocLogs(this.sharedRecord.fileid._id, logFieldData, 'Photo')
        })
      }
      else if (newContent.type == 'stamp' && newContent.stampId && newContent.stampType) {
        document.getElementById("stampModalCloseBtn").click();
        this.fields.forEach(field => {
          field.req = false
          this.spliceRequitedField(field)
          let date = new Date()
          if (field.id != newContent.fieldid) return;
          if (newContent.stampId) field.stampId = newContent.stampId;
          if (newContent.stampType) field.stampType = newContent.stampType;
          if (newContent.path) field.path = newContent.path
          if (newContent.size) field.size = newContent.size
          if (newContent.name) field.name = newContent.name
          if (newContent.encryptedid) field.encryptedid = newContent.encryptedid
          field.latitude = this.latitude
          field.longitude = this.longitude
          field.created_at = date
          let logFieldData = {
            created_at: date,
            fieldId: field.id,
            pemFilePath: newContent.pemFilePath,
            _id: newContent.stampId
          }
          this.savedocLogs(this.sharedRecord.fileid._id, logFieldData, 'Stamp')
        })
      }
    }
  }
  /**
  * Function name : updateFieldCss
  * Input  : {json} field
  * Output : {json} field with updated css
  * Desc   :  Update Css As per field configuaration
  */
  updateFieldCss(field) {
    if (field.type == 'date' && field.timepicker) {
      field.settings.timePicker = true
    }
    for (let prop in field) {
      if (prop.substring(0, 4) == 'css-') {
        if (prop.substring(4) == 'transform') {
          $("#" + field.id).css(prop.substring(4), "rotate(" + field[prop] + "deg)");
          $("#" + field.id).css('msTransform', "rotate(" + field[prop] + "deg)");
          $("#" + field.id).css('MozTransform', "rotate(" + field[prop] + "deg)");
          $("#" + field.id).css('OTransform', "rotate(" + field[prop] + "deg)");
          $("#" + field.id).css(prop.substring(4), "rotate(" + field[prop] + "deg)");
        }
        else if (field[prop] != false) $("#" + field.id + '-input').css(prop.substring(4), field[prop]);
        else $("#" + field.id + '-input').css(prop.substring(4), '');
      }
    }
    if (field.type == 'radiobutton' && field['css-font-size']) { // Update radio button size
      let oldpdfwidth = field.pageWidth ? field.pageWidth : this.PdfWidth
      let radiobuttonwidth = ((13 / 16) * parseInt(field['css-font-size']) * (this.PdfWidth / oldpdfwidth))
      let oldpdfheight = field.pageWidth ? field.pageWidth : this.PdfWidth
      let radiobuttonheight = ((13 / 16) * parseInt(field['css-font-size']) * (this.PdfHeight / oldpdfheight))
      setTimeout(() => {
        $("#" + field.id + '-input').find('input').css('width', radiobuttonwidth + 'px');
        $("#" + field.id + '-input').find('input').css('height', radiobuttonwidth + 'px');
      }, 10);
    }
    if (this.documentRecord.waterMark) {
      this.waterMark = this.documentRecord.waterMark;
      setTimeout(() => {
        this.loadWaterMark();
      }, 1000);
    }
    this.ResetFieldFonts(field);
  }
  // Lable Field Settings 
  lableKeyUp(event, field) {
    if (field.type == 'label') {
      $('#' + field.id + '-input').css('font-size', field['css-font-size']);
      field.value = event.target.textContent;
    }
    else {
      var fontsize = $('#' + field.id + '-input').css('font-size');
      if (event.target.value.length > 30) field.width = event.target.value.length * fontsize.substring(0, fontsize.length - 2) / 2;
      field.value = event.target.value;
    }
  }
  // Video Recording
  ngAfterViewInit() {
    // set the initial state of the video
    if (this.video) {
      let video: HTMLVideoElement = this.video.nativeElement;
      video.muted = false;
      video.controls = true;
      video.autoplay = false;
    }
  }
  // To check camera access
  startRecording() {
    if (navigator.mediaDevices) navigator.mediaDevices.getUserMedia(this.mediaConstraints).then(this.successCallback.bind(this), this.errorCallback.bind(this));
    else this.errorCallback({ name: 'Mediainterface does not support' })
  }
  
  //To read video and get response as an ArrayBuffer
   readAsArrayBuffer(blob) {
    return new Promise((resolve, reject)=>{
      const reader = new FileReader();
      reader.readAsArrayBuffer(blob);
      reader.onloadend = ()=>{ resolve(reader.result); };
      reader.onerror = (ev)=>{ reject(ev); };
    });
  }
  
  //To handle camera errors
  errorCallback(error) {
    this.videorecordChecking = false
    let str = String(error)
    let err
    if (str.includes('Requested device not found') || error.name.includes('NotFoundError') || error.message.includes('Invalid constraint')) err = 'Camera not found'
    else if (str.includes('Permission dismissed')) err = 'Camera Permission dismissed'
    else if (str.includes('Permission denied') || error.name.includes('NotAllowedError' || error.message.includes('The request is not allowed by the user agent or the platform in the current context, possibly because the user denied permission.')) || error.name.includes('PermissionDeniedError')) err = 'Camera Permission denied'
    else if (str.includes('Could not start video source') || error.name.includes('AbortError')) err = 'Already camera running for other purpose'
    else if (error.name.includes('Mediainterface does not support') || !navigator.mediaDevices) err = "Your browser doesn't support MediaInterface to acces webcam"
    else err = error.message | error.name
    this.showWebcam = false;
    this.isloading = false
    let dialogRef22 = this.dialog.open(CommonDialogComponent,
      { data: { name: 'fields', cancel: true, content: err ,showretry:true}, width: '500px', panelClass: "deletemod", disableClose: false });
    dialogRef22.afterClosed().subscribe(res => {
      if (res) {
        dialogRef22.close();
        this.startRecording()
      }
      else
        this.Locations.back();
    });
  }
// Record video
  successCallback(stream: MediaStream) {
    this.stream = stream;
    let video: HTMLVideoElement = this.video.nativeElement;
    video.srcObject = (stream);
    var config = {
      mimeType: 'video/webm', // vp8, vp9, h264, mkv, opus/vorbis
      audioBitsPerSecond : 256 * 8 * 1024,
      videoBitsPerSecond : 256 * 8 * 1024,
      bitsPerSecond: 256 * 8 * 1024,  // if this is provided, skip above two
      checkForInactiveTracks: true,
      timeSlice: 1000, // concatenate intervals based blobs
      ondataavailable: function() {} // get intervals based blobs
  }
    try {
     var  recorder = new MediaRecorder(stream,config);
    } catch (e) {
      console.error('Exception while creating MediaRecorder: ' + e);
      return;
    }
  ;
    this.Recorder = recorder;
    this.stream = stream;
    this.toggleControls();
    this.Recorder.start(100);
    this.Recorder.ondataavailable=((event)=>{
     this.recordedChunks.push(event.data)
    })
    this.videorecordChecking = true
  }
// Switches the states of the video
  toggleControls() {
    let video: HTMLVideoElement = this.video.nativeElement;
    video.muted = !video.muted;
    video.controls = !video.controls;
    video.autoplay = !video.autoplay;
  }
// stop video record
 async stopRecording() {
    this.Recorder.stop();
    this.stream.getTracks().forEach(track => { track.stop(); });
    this.stream=null;
     var blob = new Blob(this.recordedChunks, {type: "video/webm"});
    var result
    var decoder = new ebml.Decoder();
    var tools = ebml.tools;
    const reader = new ebml.Reader();
    result= await this.readAsArrayBuffer(blob);
        var ebmlElms = decoder.decode(result);
        ebmlElms.forEach(function(element) {
            reader.read(element);
        })
        reader.stop();
        var refinedMetadataBuf = tools.makeMetadataSeekable(reader.metadatas, reader.duration, reader.cues);
        var body = result.slice(reader.metadataSize);
        var newBlob = new Blob([refinedMetadataBuf, body], {
            type: 'video/webm'
        });
        var formData = new FormData();
      formData.append('video[]', newBlob, 'video.mp4')
    if (this.sharedRecord) {
      formData.append('documentid', this.sharedRecord.fileid._id)
      formData.append('sharedid', this.sharedRecord._id)
      if (this.sharedRecord.toid) formData.append('uid', this.sharedRecord.toid._id)
      formData.append('email', this.sharedRecord.toemail)
    }
    this.documentService.uploadVideo(formData).subscribe(res => {
    })
  }

// To download video
  download() {
    this.recordRTC.save('video.mp4');
  }

  // toggle webcam on/off
  public showWebcam = false;
  public allowCameraSwitch = true;
  public multipleWebcamsAvailable = false;
  public deviceId: string;
  public videoOptions: MediaTrackConstraints = {
  };
  public errors: WebcamInitError[] = [];

  // latest snapshot
  public webcamImage: WebcamImage = null;

  // webcam snapshot trigger
  private trigger: Subject<void> = new Subject<void>();
  // switch to next / previous / specific webcam; true/false: forward/backwards, string: deviceId
  private nextWebcam: Subject<boolean | string> = new Subject<boolean | string>();

  TakePicture() {
    WebcamUtil.getAvailableVideoInputs()
      .then((mediaDevices: MediaDeviceInfo[]) => {
        this.multipleWebcamsAvailable = mediaDevices && mediaDevices.length > 1;
      });
  }
  // triggers snapshot
  public triggerSnapshot(): void {
    this.trigger.next();
  }
  // To toggle webcam on/off
  public toggleWebcam(): void {
    this.showWebcam = !this.showWebcam;
  }
  // Handle camera errors
  public handleInitError(error: WebcamInitError): void {
    var err;
    if (error.message.includes('Requested device not found') || error.message.includes('The object can not be found here.') || error.message.includes('Invalid constraint')) err = 'Camera not found'
    else if (error.message.includes('Permission dismissed')) err = 'Camera Permission dismissed'
    else if (error.message.includes('Permission denied') || error.message.includes('The request is not allowed by the user agent or the platform in the current context.') || error.message.includes('The request is not allowed by the user agent or the platform in the current context, possibly because the user denied permission.')) err = 'Camera Permission denied'
    else if (error.message.includes('Could not start video source') || error.message.includes('Starting video failed')) err = 'Already camera running for other purpose'
    else if (error.message.includes('Only secure origins are allowed')) err = 'Only secure origins are allowed the camera'
    else if (error.message.includes('Mediainterface does not support') || !navigator.mediaDevices) err = "Your browser doesn't support MediaInterface to acces webcam"
    else err = error.message
    this.showWebcam = false
    if (err) this.documentService.openActionSnackBar(err, 'X')
    this.errors = []
    this.errors.push(error);
  }
  // true => move forward through devices
  // false => move backwards through devices
  // string => move to device with given deviceId
  public showNextWebcam(directionOrDeviceId: boolean | string): void {
    this.nextWebcam.next(directionOrDeviceId);
  }
  // Assign image capture data to webcamImage variable
  public handleImage(webcamImage: WebcamImage): void {
    this.webcamImage = webcamImage;
  }
  // Convert base64 to blob
  dataURItoBlob(dataURI) {
    // convert base64/URLEncoded data component to raw binary data held in a string
    var byteString;
    if (dataURI.split(',')[0].indexOf('base64') >= 0)
      byteString = atob(dataURI.split(',')[1]);
    else
      byteString = unescape(dataURI.split(',')[1]);
    // separate out the mime component
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    // write the bytes of the string to a typed array
    var ia = new Uint8Array(byteString.length);
    for (var i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ia], { type: mimeString });
  }
  // To check camera acces for Face Recognization
  authenticateFun = async function (id,title,data) {
    if (navigator.mediaDevices) navigator.mediaDevices.getUserMedia(this.mediaConstraints).then(this.authenticateCheck.bind(this, id,title,data), this.cameraErrorCallback.bind(this)).then(stream=>{ if(stream) stream.getTracks().forEach(track =>  track.stop()); });
    else this.cameraErrorCallback({ name: 'Mediainterface does not support' })
  }
  
  // Assign photo id to authinput and open authenticate component
  authenticateCheck(id,title,data,stream) {
    stream.getTracks().forEach(track =>  track.stop())
    this.authIput = id
    this.authenticate = true;
    this.authenticateData = data,
    this.authenticateTitle = title
  }
  //To handle camera errors
  cameraErrorCallback(error) {
    let str = String(error)
    let err
    if (str.includes('Requested device not found') || error.name.includes('NotFoundError') || error.message.includes('Invalid constraint')) err = 'Camera not found'
    else if (str.includes('Permission dismissed')) err = 'Camera Permission dismissed'
    else if (str.includes('Permission denied') || error.name.includes('NotAllowedError' || error.message.includes('The request is not allowed by the user agent or the platform in the current context, possibly because the user denied permission.')) || error.name.includes('PermissionDeniedError')) err = 'Camera Permission denied'
    else if (str.includes('Could not start video source') || error.name.includes('AbortError')) err = 'Already camera running for other purpose'
    else if (error.name.includes('Mediainterface does not support') || !navigator.mediaDevices) err = "Your browser doesn't support MediaInterface to acces webcam"
    else err = error.message | error.name
    this.showWebcam = false
    let dialogRef22 = this.dialog.open(CommonDialogComponent,
      { data: { name: 'videorecord', cancel: false, content: err }, width: '500px', panelClass: "deletemod", disableClose: false });
    dialogRef22.afterClosed().subscribe(res1 => {
    });
  }
  // close the authenticate component
  modelClosing(event: any) {
    this.camLoaderSuccess = false;
    this.camLoaderFail = false;
    this.authenticate = false;
    if (event.res == 'success') {
      this.camLoaderSuccess = true;
      document.getElementById('modalOpenBtn').click();
    }
    else if (event.res == 'failed') {
      this.camLoaderFail = true;
      document.getElementById('modalOpenBtn').click();
    }
  }
  // again open camera for Face Recognization
  retry() {
    document.getElementById('modalClosBtn').click();
    this.camLoaderSuccess = false;
    this.camLoaderFail = false;
    this.authenticate = true;
  }
  // close camera
  closemsgmodal() {
    document.getElementById('modalClosBtn').click();
    this.camLoaderSuccess = false;
    this.camLoaderFail = false;
  }
  // shows photo from mobile link data submission
  setPhoto(title) {
    var data = this.savedPhoto
    if (data && this.editF) {
      this.editF.req = false
      this.spliceRequitedField(this.editF)
      let date = new Date()
      if (data._id) this.editF.photoId = data._id
      if (data.type) this.editF.photoType = data.type
      if (data.path) this.editF.path = data.path
      if (data.size) this.editF.size = data.size
      if (data.name) this.editF.name = data.name
      if (data.encryptedid) this.editF.encryptedid = data.encryptedid
      if (data.photobaseData) this.editF.photobaseData = data.photobaseData
      this.editF.latitude = this.latitude
      this.editF.longitude = this.longitude
      this.editF.created_at = date
      data.created_at = date
      data.fieldId = this.editF.id
      this.savedocLogs(this.sharedRecord.fileid._id, data, 'Photo')
      this.imageFile = null
      this.croppedImage = null
      this.type = null;
      this.imagedata = null
      $("#uploadCaptureInputFile").val('');
      document.getElementById("photoModalCloseBtn").click();
    }
  }
  /**
  * Function name : savePhoto
  * Input : {json}  webcamdata
  * Output: {json}photo data
  * Desc : save photo in photo collection
  */
  savePhoto() {
    if (this.webcamImage) {
      var data = { photobaseData: this.webcamImage.imageAsDataUrl, type: "captured" }
      this.documentService.savePhotoimages(data).subscribe((data: any) => {
        if (data && this.editF) {
          this.editF.photoId = data._id
          this.editF.photobaseData = data.photobaseData
          this.editF.photoType = data.type
          this.webcamImage = null;
          this.showWebcam = false;
          $("#uploadCaptureInputFile").val('');
          document.getElementById("photoModalCloseBtn").click();
        }
      });
    }
    else {
      this.documentService.openSnackBar("First Capture the photo", "X");
    }
  }
  /**
   * Function name : logout
   * Desc   :  Logout by clicking logout button
   */
  logout() {
    this.cookieService.delete('token')
    let type = { type: "disconnect" }
    var sub = this.dataservice.Connectsocket(type)
      .subscribe(quote => { });
    this.adminService.logout();
  }
  // set webcamImage to null when we click on cancel
  Cancel() {
    this.webcamImage = null;
  }
  // To open particular tab
  tabOpen(title) {
    this.tabactive = title;
    this.croppedImage = this.imageFile = null;
    this.showlist = false
  }
  // Shows all versions
  showversion() {
    var vers = !this.versions;
    if (vers) {
      this.showpages = false;
      this.heatmaps = [];
    }
    else this.showpages = true;
  }
  // Close versions
  closeversion() {
    this.versions = false
    this.showpages = true;
  }
  // navigate to page on clicking on image
  gotoPage(i) {
    var x = $("div.page:eq(" + (i - 1) + ")").position();
    $("#style-1").scrollTop(parseInt(x.top));
  }
  // Emits the active deviceId after the active video device has been switched.
  public cameraWasSwitched(deviceId: string): void {
    this.deviceId = deviceId;
  }
  //  An Observable to trigger image capturing. When it fires, an image will be captured and emitted 
  public get triggerObservable(): Observable<void> {
    return this.trigger.asObservable();
  }
  //Can be used to cycle through available cameras (true=forward, false=backwards), or to switch to a specific device by deviceId (string)
  public get nextWebcamObservable(): Observable<boolean | string> {
    return this.nextWebcam.asObservable();
  }
  //Address from position
  public getAddressFromLatLng(query: string) {
    this.geocoder.reverseGeocode({ prox: query, mode: "retrieveAddress" }, result => {
      if (result.Response.View.length > 0) {
        if (result.Response.View[0].Result.length > 0) {
          var location = result.Response.View[0].Result[0].Location.Address
          this.Address = location.Label
        } else {
        }
      } else {
      }
    }, error => {
    })
  }
  //Check page number while pdf scrolling  
  onPdfScroll(e) {
    var scroll = $("#style-1").scrollTop();
    var PDFheights = [];
    var h = 0;
    $("div.pdfViewer").find("div.page").each(function () {
      PDFheights.push({ start: h, end: h + $(this).height() })
      h = h + $(this).height();
    })
    var i = 0;
    PDFheights.forEach(page => {
      i++;
      if (page.start <= scroll && page.end >= scroll) this.pageNo = i++;
    });
    if (this.requiredFieldsCount.length > 0) {
      var fields = this.requiredFieldsCount.sort(function (a, b) { return a.top - b.top; });
      var height = 0;
      for (let i = 0; i < fields.length; i++) {
        if (!this.validfield(fields[i])) {
          height = fields[i].top + fields[i].height;
          break;
        }
      }
      var scroll = $("#style-1").scrollTop();
      var hei = Math.abs(height) + this.PdfTop + $("#docheader").height();
      if (height < $(window).height() / 2 && scroll < 50) {
        this.arrowClass = 'ArrowCenter'
        $(".upIndicator").css("top", Math.round(hei / ($(window).height() / 100)) + '%');
      }
      else {
        height -= ($("#style-1").height() / 2);
        $(".upIndicator").css("top", '50%');
        if (height - 50 > scroll) this.arrowClass = 'ArrowTop';
        else if (height - 50 <= scroll && height + 50 >= scroll) this.arrowClass = 'ArrowCenter';
        else if (height + 50 < scroll) this.arrowClass = 'ArrowDown';
      }
    }
  }
// shows pdf images
  showsideimages() {
    if (!this.showpage) {
      this.showpage = true
    } else {
      this.showpage = false
    }
  }
// check the required fields
  validfield(field) {
    if (field.restrict == 'required' && (!field.value || field.value == '')) return false;
    else if (field.restrict == 'required' && (field.value && (field.minlengtherror || !field.fieldvalidationCheck))) return false;
    else if ((field.type == "signature" || field.type == "intial") && field.restrict == 'required' && (!field.signatureId || field.signatureId == '')) return false;
    else if (field.type == "text" && field.type == "email" && field.type == "photo" && field.type == "stamp" && field.restrict == 'required' && field.value != "") return true
    else return true;
  }
  // Focus on next required field on clicking on required field button
  nextField() {
    var lisfields = this.requiredFieldsCount.filter(element => element.people && element.people == this.sharedRecord.toemail && !(element.value || element.insertedemail || element.signatureId || element.photoId || element.stampId))
    if (this.requiredFieldsCount.some(x => x.minlengtherror || x.fieldvalidationCheck == false)) {
      lisfields.push(this.requiredFieldsCount.find(element => (element.value && (element.minlengtherror || !element.fieldvalidationCheck))))
    }
    var fields = lisfields.sort(function (a, b) {
      return a.top - b.top;
    });
    for (let i = 0; i < fields.length; i++) {
      if (!this.validfield(fields[i])) {
        if (fields[i].type && (fields[i].people == this.sharedRecord.toemail))
          $("#" + fields[i].id + "-input").attr("tabindex", 1).focus();
        $("#" + fields[i].id + "-input").addClass("focuscolor");
        break;
      }
    }
    this.onPdfScroll('e')
  }
  /**
   * Function name : heatMaps
   * Input : {String} fileid 
   * Output: {array} documentlogs
   * Desc : Get heatmaps of specific file
   */
  heatMaps = function () {
    var heatmap = !this.heatmapss;
    if (heatmap) {
      this.heatmapLoading = true;
      this.ReviewMode = true;
      var doc = { _id: this.sharedRecord.fileid._id }
      this.selectedcount = 0; this.viewedcount = 0;
      this.documentService.getDocumentLogs(doc).subscribe(data => {
        this.heatmaps = data;
        this.heatmapLoading = false;
        if (this.sharedRecord.fileid._id) {
          for (var i = 0; i < this.heatmaps.length; i++) {
            if (this.heatmaps[i].message == 'Viewed') {
              this.viewedcount += 1;
            }
            else if (this.heatmaps[i].message == 'selected') {
              this.heatmaps[i].top = this.heatmaps[i].coordinatex - 18;
              this.heatmaps[i].left = this.heatmaps[i].coordinatey;
              this.heatmaps[i].tooltipleft = (this.heatmaps[i].width / 2) - 75;
              this.heatmaps[i].diff = this.getDataDiff(new Date(this.heatmaps[i].createdAt), new Date(this.heatmaps[i].updatedAt));

              this.selectedcount += 1;
            }
          }
        }
      });
    }
    else this.heatmaps = [];
  }
 // select text when selecting text for heatmaps
 mouseentered(data) {
   if(data && data.coordinatey){
     if(data.coordinatey<=200){
      this.heatmap_tooltip=true;
     }
     else{
      this.heatmap_tooltip=false;
     }
   }

   if((data && data.coordinatex)){
    if(data.coordinatex<=120){
     this.heatmap_tooltip1=true;
    }
    else{
     this.heatmap_tooltip1=false;
    }
  }
  var heat = this.heatmaps.filter(x => x.message == 'selected');
  heat.forEach(element => {
    if(element._id==data._id){
      element.tooltip=true
    }
    else element.tooltip=false
  });
  this.selectedcount = 0, this.name = [];
  for (var i = 0; i < this.heatmaps.length; i++) {
    if (this.heatmaps[i].message == 'selected' && Math.round(this.heatmaps[i].coordinatex) == Math.round(data.coordinatex)
      && Math.round(this.heatmaps[i].coordinatey) >= Math.round(data.coordinatey) &&
      Math.round(this.heatmaps[i].coordinatey) < Math.round(data.coordinatey + data.width)) {
      if (this.heatmaps[i].uid.name) { this.name.push({ name: this.heatmaps[i].uid.name, date: this.heatmaps[i].created_at, diff: this.heatmaps[i].diff }); }
      else { this.name.push({ name: this.heatmaps[i].email.split('@')[0], date: this.heatmaps[i].created_at, diff: this.heatmaps[i].diff }); }
      this.selectedcount += 1;
    }
  }
}
  /**
  * Function name : printpdfDoc
  * Input : {json} file 
  * Output: {String} file path
  * Desc :  Pdf print 
  */
  printpdfDoc() {
    this.isloading = true;
    this.documentService.pdfPrint(this.documentRecord).subscribe((data: any) => {
      this.isloading = false;
      var xhr = new XMLHttpRequest()
      xhr.open("GET", data.path)
      xhr.responseType = 'blob'
      xhr.onload = () => {
        var blob = new Blob([xhr.response], { type: 'application/pdf' });
        const blobUrl = URL.createObjectURL(blob);
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = blobUrl;
        document.body.appendChild(iframe);
        this.IframePrint = iframe;
        iframe.contentWindow.print();
      }
      xhr.send()
    })
  }
  // splice record from required fields array if field contains value
  spliceRequitedField(field) {
    this.requiredFieldsCount.forEach((element, index) => {
      if (element.id == field.id) {
        this.requiredFieldsCount.splice(index, 1)
        this.requiredFieldsCounts = this.requiredFieldsCount.length;
        $("#" + field.id).removeAttr("tabindex");
        $("#" + field.id).removeClass("focuscolor");
        $("#" + field.id + "-input").addClass("label");
        $("#" + field.id + "-input").removeClass("drag-box-label");
      }
    });
  }
  // To check validation of email
  validateemail(field) {
    if (!field.minlengtherror) {
      var pattern = field.pattern
      var index = this.fields.findIndex(x => x.id == field.id);
      if (field.value == '') {
        field.fieldvalidationCheck = true;
        if (field.restrict == 'required' && (field.people && field.people == this.sharedRecord.toemail) && !this.requiredFieldsCount.some(x => x.id == field.id)) this.requiredFieldsCount.push(field);
        this.requiredFieldsCounts = this.requiredFieldsCount.length;
      }
      else if (field.value) {
        if (field.type == 'email') pattern = (pattern.substring(1, (pattern.length - 1)));
        var regexp = new RegExp(pattern)
        field.fieldvalidationCheck = false;
        if (field.type == 'mobilenumber' && field.value.length >= 25) { field.fieldvalidationCheck = false; }
        else if (regexp.test(field.value)) {
          field.fieldvalidationCheck = true;

          if (field.required && field.people == this.sharedRecord.toemail) {
            var indx1 = this.requiredFieldsCount.findIndex(x => x.id == field.id);
            this.spliceRequitedField(field)
            $("#" + field.id).removeAttr("tabindex");
            $("#" + field.id).removeClass("focuscolor");
            $("#" + field.id + "-input").addClass("label");
            $("#" + field.id + "-input").removeClass("drag-box-label");
          }
        }
        else {
          if (field.restrict == 'required' && (field.people && field.people == this.sharedRecord.toemail) && !this.requiredFieldsCount.some(x => x.id == field.id)) this.requiredFieldsCount.push(field);
          this.requiredFieldsCounts = this.requiredFieldsCount.length;
          this.nextField()
        }
      }
    }
  }
  // Set Download options berore download  / opening the popup
  setDownload() {
    this.downloadType = 'computer'
    this.downloadFile = 'current'
    this.withlog = false;
    this.pdfPinSet = false;
    this.pdfPin = '';
    this.email = '';
  }
  /**
  * Function name : pdfDownload
  * Input : {String} Authorized token 
  * Output: {String} file path
  * Desc :  Pdf Download from URL
  */
  pdfDownload(token) {
    if (this.downloadFile == 'withoutchanges') this.withlog = undefined;
    var downloaddata = {
      id: this.documentRecord._id,
      name: this.documentRecord.name,
      downloadType: this.downloadType,
      downloadFile: this.downloadFile,
      withlog: this.withlog,
      pdfPinSet: this.pdfPinSet,
      pdfPin: this.pdfPin,
      access_token: '',
      scope: this.scope,
      token_type: '',
      expiry_date: '',
      email: this.email
    }
    if (token) {
      downloaddata.access_token = token.access_token;
      downloaddata.token_type = token.token_type;
      downloaddata.expiry_date = token.expires_at;
    }
    if (this.downloadType != 'attachment') {
      document.getElementById('savetempclose').click()
      this.isloading = true
      this.documentService.pdfDownload(downloaddata).subscribe((data: any) => {
        if (data.path && downloaddata.downloadType == "computer") {
          this.isloading = false
          var xhr = new XMLHttpRequest()
          xhr.open("GET", data.path)
          xhr.responseType = 'blob'
          xhr.onload = function () {
            saveAs(xhr.response, downloaddata.name);
          }
          xhr.send()
        }
        else if (downloaddata.downloadType == 'drive') {
          this.isloading = false
          if (!NgZone.isInAngularZone()) this._ngZone.run(() => {
            this.documentService.openSnackBar("File Export To Drive", "X");
          });
        }
        else this.isloading = false
      });
    }
    else if (this.downloadType == 'attachment') {
      if (this.email == null || this.email == '') {
        this.documentService.openSnackBar("Please Enter Email", "X");
      }
      else {
        var regexp = new RegExp('([A-Za-z]|[0-9])[A-Za-z0-9.]+[A-Za-z0-9]@((?:[-a-z0-9]+\.)+[a-z]{2,})')
        if (regexp.test(this.email)) {
          document.getElementById('savetempclose').click()
          this.isloading = true
          this.documentService.pdfDownload(downloaddata).subscribe((data: any) => {
            if (downloaddata.email && downloaddata.downloadType == "attachment" && data.path) {
              this.isloading = false
              this.documentService.openSnackBar("File Sent To Email", "X");
            }
            else this.isloading = false
          });
        }
        else {
          this.documentService.openSnackBar("Please Enter Valid  Email", "X");
        }
      }
    }
  }
  // Shows countries dropdown
  showdropdown(event, title) {
    this.mobiledemo = !this.mobiledemo
    this.showlist = true
    this.listshow = false
    if (title == 'signature') {
      setTimeout(() => {
        $("#openmodel1").focus();
      }, 100);
    }
    if (title == 'initial') {
      setTimeout(() => {
        $("#openmodel2").focus();
      }, 100);
    }
    if (title == 'photo') {
      setTimeout(() => {
        $("#openmodel3").focus();
      }, 100);
    }
    if (title == 'stamp') {
      setTimeout(() => {
        $("#openmodel4").focus();
      }, 100);
    }
    event.stopPropagation();
  }
  // Shows countries dropdown
  showdropdownclose() {
    if (this.listshow) {
      this.showlist = false
      this.mobiledemo = false
    }
    else this.listshow = false
  }
  // shows particular country based on give text
  listshow1(event) {
    event.stopPropagation();
    this.listshow = true
    this.showlist = true
  }
  // To load Google Drive authentication picker
  loadGoogleDrive() {
    gapi.load('auth', { 'callback': this.onAuthApiLoad.bind(this) });
  }
  //Gogole Drive Login
  onAuthApiLoad() {
    gapi.auth.authorize(
      {
        'client_id': this.clientId,
        'scope': this.scope,
        'immediate': false
      },
      this.handleAuthResult);
  }
  //Success callback
  handleAuthResult = (authResult) => {
    if (authResult && authResult.access_token) this.pdfDownload(authResult)
  }
  /**
  * Function name : getOfflineNotification
  * Input : {String} loginuserid 
  * Output: {array} All notifications
  * Desc :  gets all the notifcation of the user 
  */
 getOfflineNotification() {
   if(this.sharedRecord.accesstype == 'Allowusers'){
  this.generalservice.getOfflinenotification().subscribe((data: any) => {
    this.notificationlogs = data.filter(element =>element.type != 'chat' && element.active)
    this.chatnotificationlogs = data.filter(element =>element.type == 'chat' )
    this.chatnotificationlogs.sort((a, b) => {
      if (a.documentid._id == this.sharedRecord.fileid._id) { return -1; }
      else  { return 1; }
    })
    console.log(this.chatnotificationlogs)
    if(this.chatnotificationlogs.length == 0 && this.openChat) this.newChat = true
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
}
  /**
  * Function name : getDataDiff
  * Input  : created date,curren date
  * Output : {json} 
  * Desc   :  Get Time differnace for notifications
  */
  getDataDiff(startDate, endDate) {
    var diff = endDate.getTime() - startDate.getTime();
    var days = Math.floor(diff / (60 * 60 * 24 * 1000));
    var hours = Math.floor(diff / (60 * 60 * 1000)) - (days * 24);
    var minutes = Math.floor(diff / (60 * 1000)) - ((days * 24 * 60) + (hours * 60));
    var seconds = Math.floor(diff / 1000) - ((days * 24 * 60 * 60) + (hours * 60 * 60) + (minutes * 60));
    return { day: days, hour: hours, minute: minutes, second: seconds };
  }

  // clears selected notification
  clearnotification(id) {
    id.active = false
    this.generalservice.markedread(id).subscribe(data => {
      this.getOfflineNotification()
      this.getNotificationCount()
    })
  }

  //updates all unread notifications
  clearAllNotifications(data) {
    this.generalservice.clearAllNotifications(data).subscribe(data => {
      this.getOfflineNotification();
      this.notificationlogs = [];
    });
  }
  // To show notifications
  shownot() {
    this.shownoti = true
    this.commentshownotifitab = false;
  }
  // To hide notifications
  hidenot() {
    this.shownoti = false
    this.chatshownotifitab = false
    this.commentshownotifitab = false
  }
// scroll for notifications
  @HostListener('scroll')
  public asd(): void {
    this.shownoti = false
  }
  //updates all unread notifications
  clearAllNotificationsactive(data) {
    if (this.enablenotificationlist) {
      this.enablenotificationlist = false
    }
    else { this.enablenotificationlist = true }
    if (this.Notificationscount) {
      this.Notificationscount = 0;
      var data1 = data.filter(x => !x.read && x.type !='chat');
      this.generalservice.clearAllNotificationsactive(data1).subscribe(data => {
        this.getOfflineNotification();
      });
    }
  }
   /**
  * Function name : Searchcountries
  * Input  : entry text,event,modalid
  * Output : {array} countries
  * Desc   :  Get countries based on given text 
  */
  Searchcountries(searchcountry, e, id) {
    if (e.key != "ArrowDown") {
      if (e.key != "ArrowUp") {
        if (searchcountry.length > 0) this.userservice.getcountries({ searchcountry: searchcountry }).subscribe(data => {
          this.countrylist = data
        })
      }
    }
    if (e.key == "Enter") {
      this.addcountry(searchcountry, id);
    }
    if ((searchcountry.length == 0 && e.key == "Backspace") || (searchcountry.length == 0 && e.key == "Delete")) {
      this.added = null;
      this.selectimg = ''
    }
  }
  /**
  * Function name : addcountry
  * Input  : country,modalid
  * Output : {String} add selected countryname,code
  * Desc   :  add country to field 
  */
  addcountry(country, id) {
    this.req = false
    this.mobiledemo = false
    this.showlist = false
    this.added = null;
    setTimeout(() => {
      $("#" + id).focus();
      this.searchcountry = country.name;
      this.added = country.dial_code;
      this.selectimg = country.code
    }, 10);
  }
  /**
  * Function name : checkisnum
  * Input  : {String} keys
  * Output : {String} restrict keycodes
  * Desc   :  restrict keycodes in mobile link input field
  */
  checkisnum(event) {
    var number = event.srcElement.value.toString()
    var key = window.event ? event.keyCode : event.which;
    if (event.keyCode === 8 || event.keyCode === 46 || event.keyCode == 13 || event.keyCode == 37 || event.keyCode == 39 || (event.ctrlKey == true && event.keyCode == 65)) { }
    else if (event.shiftKey == true && (key > 48 || key < 57)) event.preventDefault()
    else if ((key < 48 || key > 57) && (key < 96 || key > 105)) event.preventDefault()
    else if (number.length > 15) event.preventDefault()
  }
  // To display data on  country selection
  displayFn(user): string | undefined {
    return user ? (user.name) : undefined;
  }
  // To check whether save dialog is opened or not on click broser back button
  confirmationdialog() {
    var sampledata = this.documentService.getStartUrl();
  console.log(sampledata)
    if (sampledata && sampledata.split('/')[2] == 'allowusers') {
      if (this.loggedIn == 'true') {
        if (this.profiledata.type == 'individual') this.router.navigate(['/individual/home/myfiles'])
        else if (this.profiledata.type == 'organisation' || this.profiledata.type == 'employee') this.router.navigate(['/organization/home/myfiles'])
      }
      else {
        this.Locations.back();
      }
    } else {
      this.Locations.back();
    }
  }
  /**
  * Function name : checkpassword
  * Input : {String} oldPassword  
  * Output: {String} 
  * Desc :  check old passsword
  */
  checkpassword(oldPassword) {
    this.samePassword = oldPassword;
    if (oldPassword != '' && oldPassword != undefined) {
      this.userservice.checkpassword(oldPassword).subscribe(data => {
        var res: any = data
        if (res.result == 'Old password mismatch') {
          this.isOldPassword = true;
          this.errorres = res.result;
        }
        else if (res.result == 'matched')
          this.isOldPassword = false;
      })
    }
  }
  //validate password
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
  // check new password doesnot match to old password
  checkpassword1(oldPassword) {
    if (oldPassword == this.samePassword) {
      this.isOldPassword1 = true;
      this.errorres = "Old password mismatch";
    }
    this.validate(oldPassword)
  }
  // reset form values when click cancel in changepassword
  cancel1(user) {
    if (user) { user.resetForm(); this.formSubmitted = false; this.isOldPassword = false; this.isOldPassword1 = false }
  }
  /**
   * Function name : otpfun
   * Input : {json}   
   * Output: {String} 
   * Desc :  new password update 
   */
  otpfun = function (user) {
    if (!this.locationdata) this.locationdata = JSON.parse(localStorage.getItem('myip'));
    this.errorres = ""
    this.displayerror = false
    this.formSubmitted = true
    if (user.valid && user.value.oldpass != user.value.newpass && user.value.newpass == user.value.pwd3 && !this.isOldPassword) {
      user.value.IpAddress = (this.locationdata) ? this.locationdata.ip : ' ';
      this.userservice.changePass(user.value).subscribe(data => {
        var res = data;
        user.resetForm();
        this.formSubmitted = false
        document.getElementById("changePassCloseBtn").click();
        if (res.result == "success") {
          this.documentService.openSnackBar("Password Changed Successfully", "X");
        }
      })
    }
  }
  //ipad  popups open while double click
  openmodels(e, id, fileid) {
    var time2 = e.timeStamp;
    var time1 = e.currentTarget.dataset.lastTouch || time2;
    var dt = time2 - time1;
    var fingers = e.touches.length;
    e.currentTarget.dataset.lastTouch = time2;
    if (!dt || dt > 500 || fingers > 1) return; // not double-tap
    else {
      this.openModel(id, fileid)
    }
    e.preventDefault();
    e.target.click();
  }
  // Restrictspacekey in change password
  Restrictspacekey(event) {
    if (event.keyCode == 32) {
      return false;
    }
  }
  //Field minlength checking
  checkingMinvalue(field) {
    if ((field.value != '' || field.value != undefined) && (field.value && field.value.length < field.minlength)) {
      field.minlengtherror = true
      if (field.type == 'email' || field.type == 'mobilenumber') field.fieldvalidationCheck = true
      if (field.restrict == 'required' && (!field.people || field.people == this.sharedRecord.toemail) && !this.requiredFieldsCount.some(x => x.id == field.id)) this.requiredFieldsCount.push(field);
      this.requiredFieldsCounts = this.requiredFieldsCount.length;
    }
    else {
      field.minlengtherror = false
    }
  }
  // assign password to global variables based on type
  checkpasswor(data, type) {
    if ((data.value == '' || data.value == undefined) && this.iebrowser) {
      if (type == 'old') {
        this.invalidoldpassword = true
      }
      else if (type == 'new1') {
        this.invalidnewpas = true

      }
      else if (type == 'new2') {
        this.invalidconfpas = true
      }
    }
    else {
      if (type == 'old') {
        this.invalidoldpassword = false
      }
      else if (type == 'new1') {
        this.invalidnewpas = false
      }
      else if (type == 'new2') {
        this.invalidconfpas = false
      }
    }
  }
  // show finish button in mobile
  showfinishbutton() {
    this.finishbuttonmobile = true
  }
  // Hide finish button in mobile
  hidefinishbutton() {
    this.finishbuttonmobile = false

  }
 /**
  * Function name : review
  * Input  : {json} 
  * Output : {json} updated shared record
  * Desc   :  update shared record
  */
  review() {
    if (!this.sharedRecord.reviewed) {
      let dialogdata = this.dialog.open(CommonDialogComponent,
        { data: { name: 'sharesubmit', cancel: true, content: 'Are you sure you want to Review the file?' }, width: '500px', panelClass: "deletemod", disableClose: false });
      dialogdata.afterClosed().subscribe(res => {
        if (res) {
          document.getElementById('basicExampleModal').click()
          // this.isloading = true;
          this.sharedRecord.reviewed = true
          this.reviewfile = true
          this.documentService.updateSharingpeopleRecord({ _id: this.sharedRecord._id, reviewed: true }).subscribe(data => {
           this.savedocLogs(this.sharedRecord.fileid._id, '', 'Reviewed');
            this.documentStatusUpdate(this.fields)
            if (this.profiledata && this.profiledata.email) {
              const result = {
                fromid: this.sharedRecord.toid ? this.sharedRecord.toid._id : null,
                toid: this.sharedRecord.fromid,
                sharingPeopleId: this.sharedRecord._id,
                type: 'reviewed',
                fromemail: this.sharedRecord.toemail,
                documentid: this.sharedRecord.fileid._id
              }
              this.generalservice.createnotification(result).subscribe(response => {
              });
            }
            this.isloading = false;
          })
        }
      })
    }
  }
  // To allow only numbers 
  numberOnly(event): boolean { // to allow only numbers
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode == 32 || charCode == 45 || charCode == 43) return true;
    else if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }
  // Opening URL mismatch popup
  urlMismatch()
  {
    this.notAuthorized = false 
    this.isloading = false
    this.router.navigate(["/unauthorized"], {skipLocationChange: true})
  }
  backToPage()
  {
    if(this.loggedIn == 'false'|| (this.profiledata.email != this.sharedRecord.toemail || !this.profiledata.token)){

      this.router.navigate(["/"])
    }
    else if(this.loggedIn == 'true' && (this.profiledata._id == this.sharedRecord.toid)){
      if (this.profiledata.type == 'individual') this.router.navigate(['/individual/home/myfiles'])
      else if (this.profiledata.type == 'organisation' || this.profiledata.type == 'employee') this.router.navigate(['/organization/home/myfiles'])
    }
  }

  /**
   * Function name : agreeToSign
   * Input : shareDoc, agreetoSign
   * Output : agreetoSign updates as true
   * Desc : To check and update agreetosign status
   */
  agreeToSign(shareDoc, agreetoSign) {

    if (agreetoSign) {
      var data = { _id: shareDoc._id, agreetoSign: agreetoSign };
        this.documentService.put('sharingpeoples/sharedoc/update/' + data._id, data).subscribe(data => {
      if(agreetoSign){
        document.getElementById('agreetoSignclose').click();
        this.LoadSharingRecord();
        this.isloading=true
      }
        });

    }
    else this.documentService.openSnackBar("Agree to our Terms and Conditions and Privacy Policy", "X")
  }
  /**
   * Function name : agreetoreview
   * Input : shareDoc, agreereview
   * Output : agreereview updates as true
   * Desc : To check and update agreereview status
   */
  agreetoreview(doc, agreereview) {
   var data = { _id: doc._id, agreetoReview: agreereview };
    if (agreereview && data && data._id) {
        this.documentService.put('sharingpeoples/sharedoc/update/' + data._id, data).subscribe(data => {
          if (agreereview) {
            document.getElementById('agreetoSignclose').click();
            this.LoadSharingRecord();
            this.isloading=true
          }
        });

    }
    else this.documentService.openSnackBar("Agree to our Terms and Conditions and Privacy Policy", "X")
  }
  /**
   * Function name : LocationBack
   * Input : null
   * Desc : navigate to back 
   */
  LocationBack(){
    this.Locations.back()
  }
    /**
   * Function name : NotificationNavigate
   * Input{object}: notification record
   * Output : navigate to respective file or folder when click on respective notification
   */
  NotificationNavigate(data){
    this.hidenot()
    console.log(this.newChat , this.openChat)
    if(data.documentid && data.documentid._id == this.sharedRecord.fileid._id  && data.type == 'chat') {
      this.newChat = true
      this.openChat = false
    }
    else if(data.documentid && data.documentid._id == this._id){
    this.hidenot()
    }
    else{
      this.openChat = false
      this.newChat = false
      this.generalservice.NotificationNavigate(data,this.sharedRecord.fileid._id);
    }
  }
    /**
   * Function name : termsandpol
   * Input : null
   * Output : Navigation to termsandcondition page.
   * Desc : To navigate to termsandcondition page, when user clicks on 'Terms and Conditions'.
   */
  termsandpol() {
    window.open(this.frontEndConfig.frontendurl + '/termsandcondition', '_blank');
  }

   /**
   * Function name : privacypolicy
   * Input : null
   * Output : Navigation to privacypolicy page.
   * Desc : To navigate to privacypolicy page, when user clicks on 'Privacy Policy'.
   */
  privacypolicy() {
    window.open(this.frontEndConfig.frontendurl + '/privacypolicy', '_blank');
  }
     /**
   * Function name : sessionsClear
   * Output : to clear all other session of particular user
   */
  sessionsClear()
  {
    this.userservice.clearAll().subscribe(data => {
      this.documentService.openActionSnackBar(data,'x')
    })
  }
  /**
* Function name : commentBlockSelect
* input(object):selected comment object
* Output : to hightlight selected comment section
*/
  commentBlockSelect(com) {
    this.SelectedCom = com;
  }
   /**
   * Function name : getNotificationCount
   * Input : null
   * Output : Notification count
   * Desc : to get count of notification
   */
  getNotificationCount() {
   if(this.sharedRecord.accesstype == 'Allowusers'){
    this.generalservice.countNotifications().subscribe((data: any) => {
      this.Notificationscount = data
    })
  }
  }
}
