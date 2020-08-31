import { Component, OnInit, Output, EventEmitter, OnDestroy, Input, HostListener, ɵConsole, Renderer2, NgZone } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DocumentService } from '../../document.service';
import { DocFields } from './docfields';
import { CdkDragEnd } from '@angular/cdk/drag-drop';
import { Router } from "@angular/router";
import { UserService } from '../../user.service';
import { Subject } from 'rxjs';
import { ResizeEvent } from 'angular-resizable-element';
import { MatDialog } from '@angular/material';
import { FormControl } from '@angular/forms';
import { FrontEndConfig } from '../../frontendConfig';
import { AdminService } from '../../admin.service';
import { GeneralService } from '../../general.service';
import { DataService } from '../../core/data.service';
import { OrganizationFileSharingComponent } from '../../organization/organization-file-sharing/organization-file-sharing.component'
import { MatSelect } from '@angular/material';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { MatAutocomplete } from '@angular/material';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { ViewChild, ElementRef,ChangeDetectorRef } from '@angular/core';
import { WebcamImage, WebcamInitError, WebcamUtil } from 'ngx-webcam';
import * as _moment from 'moment';
import { FormGroup, Validators } from '@angular/forms';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { CommonDialogComponent } from '../../public/common-dialog/common-dialog.component';
import { SharepopupComponent } from '../sharepopup/sharepopup.component';
import { ColorPickerService } from 'ngx-color-picker';
import { DatePipe } from '@angular/common'
import libphonenumber from 'google-libphonenumber';
import { Location, LocationStrategy } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { SignupdialogboxComponent } from '../../public/signupdialogbox/signupdialogbox.component';

const phoneUtil = libphonenumber.PhoneNumberUtil.getInstance();
const moment = (_moment as any).default ? (_moment as any).default : _moment;
declare var H: any;
declare var $: any;
declare var w: any;
declare var p: any;
declare var document: any;
declare var gapi: any;
interface countrycodes { name: string; }
export const Date_Format = { fullPickerInput: 'DD/MM/YYYY' };
@Component({
  selector: 'app-agreementcopy',
  templateUrl: './agreementcopy.component.html',
  styleUrls: ['./agreementcopy.component.css'],

})

export class AgreementcopyComponent implements OnInit, OnDestroy {
  // Decalare Variable / Constants
  phoneForm = new FormGroup({
    phone: new FormControl(undefined, [Validators.required])
  });

  formControl = new FormControl(); // Declaring Form Controlls
  formControlForDependency = new FormControl(); // Declaring Form Controlls

  filteredOptions: Observable<User[]>;
  public countryFilterCtrl: FormControl = new FormControl();
  public filteredBanks: ReplaySubject<countrycodes[]> = new ReplaySubject<countrycodes[]>(1);
  public countryCtrl: FormControl = new FormControl();
  @ViewChild('auto') matAutocomplete: MatAutocomplete;
  @ViewChild('fruitInput') fruitInput: ElementRef;
  @ViewChild('pdfViewer') pdfViewer;
  header_button: any = 'review'; // Header Button Style
  fontStyle; // Signature Font
  phone;
  heatmapss: Boolean = false; // for displaying heatmaps
  disableShareButton = false;  // to disabe the share button
  templateMsg: any; // to display template msg(success or overrieded)
  //Decalre PDF top and left
  PdfHeight: any = 0; // OnLoad PDf get Height
  PdfWidth: any = 0; // OnLoad Pdf Get width;
  PdfTop: any = 0; // Pdf Top distance
  PdfTopScroll: any = 0; // Pdf Top distance + Scroll Distance
  PdfLeft: any = 0; // Pdf Left distance
  PdfLeftNosideBar: any = 0; // Pdf Without side bar left side distance
  pdfZoom: any = 0; //PDf Zoom Percentage
  endtime: any // Pdf Close time for Log
  serverurl = this.frontendconfig.getserverurl(); // Gettting Server URL from configuired file
  filesToUpload: Array<File> = []; // Uploaded Files info
  fields: any = []; // Configured fields
  Updatedfields = []; // While saving we will store fields to this array
  insertfield: Boolean = false; // Insert fields : Whenever click the new fild it will active as true
  setF = ''; // Set EditField
  imagedata: any // Image Data for upload 
  croppedImage: any = ''; // After Cropping Image
  cropimageData: any // After Cropping Image Data
  activeComment: any = []; // New Comment object will push on handleClick function
  commentedlines  //Comments lists 
  coordinatex // Comment / Click Coordinates X-axis
  coordinatey // Comment / Click Coordinates Y-axis
  coordinatewidth // Comment / Click Coordinates Width
  coordinatehight // Comment / Click Coordinates Height
  editCommsentSection = false // comment Editable 
  documentid // Current Document ID
  type: any // Ppup Tabs Type
  reply = false // Comment Reply
  parentcomment = [] // List of Parent Comments
  childcomments = []; // List of Child Comments
  notificationlogs = []; // Notification for Dpcument page
  chatnotificationlogs = []
  chatnotificationlogsCount = 0
  emailarray = []; //Lists of People
  templates = []; // Lists of Templates
  PDFheights = [];// GEt Pdf Pages Hights
  overwritebtn = false // Template Overwrite button bydefault it's false
  tabactive // Acive Tab
  templatebtn = false //Save Template Button
  Timediffarance: any // Notifcations time diffarance
  NotificationData: any // Notifications data to clear notifications
  Notificationscount: any // Get Notifcations count
  templateedit = false // Template Edit Button
  preview // For Prview conetnt 
  isloading: boolean = true; // For loader Appearance
  alluseremails: any = [] // All User Emails 
  id: any; // Encryppted Docuemt Id
  _id: any; // Docuemt Id (Duplicated)
  editF: any; // Selected field for Edit
  fieldIndex: any; // Edit Field index for deleting
  selectedDoc: any; // Document Info from Docuemnt collection
  fontstyle //Selected Font Style
  fonttype = false; // Selected Font Type
  fontvalue: any; // Selected Forn Value
  commentsdata // List of comments 
  profiledata // User Info
  imageFile: any // Input Image
  allDocVersionsResult = [] // Get List of Versions
  currentVersionDocFieldsResult: any; // Updated Versions fields details
  fieldValues: any; // Field Values for Updateing
  curVerSharedPeopleList: any; // Current Version Shared People Lists
  SignatureList = []; // Get Existing signatures lists
  PhotoList = [] // Get Existing Phots lists
  StampList = [] // Get Existing Stamp lists
  onlineusers = []// Get List of Online Users 
  onlinedata // 
  zoomVal = 1; // PDF Zoom 
  zoomWidth  // Before zoom we will caliculate width
  zoomHeight  // Before zoom we will caliculate height
  initialList = []
  lastSelect;
  sharedemails: any //list of shared users
  auditlogs: any
  auditlogsResult: any
  editversion: any
  selectedVersion: any
  closeChat = false
  commentbtn = false
  favoritedoc: any
  removefav: boolean = false
  validemail: boolean = false
  watermarkLoading: Boolean = false;
  waterMark: any = { fontsize: '14px', content: '', fontfamily: 'Arial', color: '#201d1d', location: 'middle' ,picHeight:'10%',picWidth:'10%',watermarkTitle:"text"};
  PDFLoading = true;
  countrycodes
  sharedusers = []
  options: User[] = []
  oldFieldData = []
  currentTab = 0;
  platform: any
  latitude: any
  longitude: any
  geocoder: any;
  Address: any
  modelshow = false;
  restorebtn: any;
  watermarkset: any
  shareform: boolean = true;
  resultData: any
  formSubmitted = false
  comment
  selectorid: any
  replyData: any
  clearselect = false
  editIcons = this.docFields.getEditIcon(); //To get editicons
  ConfigFields = this.docFields.getConfigFields(); // To get the edit fields
  _presetFonts = this.docFields.getPresetFonts(); // To get the font families
  waterMarkFonts = this.docFields.getWaterMarkFonts(); // To get font families for watermark
  waterMarkSize = this.docFields.getWaterMarkSize(); // To get font sizes for watermark
  watermarkWidth = this.docFields.getwatermarkWidth();//To get watermark width and height
  savebutton
  ReviewMode
  ver
  enablenotificationlist: Boolean = false
  // veriable declaration for pdf download
  downloadType;
  downloadFile;
  withlog;
  pdfPinSet;
  pdfPin;
  sharebutton: boolean = true
  recepients: boolean = true
  email
  callGlobalMouseMove: boolean = false;
  callGloablMouseDown: boolean = false
  callGloablMouseUp: boolean = true
  globalMouseMove: Function;
  globalMouseUp: Function;
  testVerify: Boolean = false
  mouseDownClass: any
  templatename: any;
  TemplateName
  buttonhide
  copdocument
  scrollHeight
  fieldHeight
  notificationshow: boolean = false
  resend = false
  mobiledemo: boolean
  showlist: boolean = false
  listshow: boolean = false
  // Change password start
  isOldPassword: boolean = false
  isOldPassword1: boolean = false
  samePassword
  passwordMinLength: Boolean = false;
  passwordupper: Boolean = false;
  passwordLower: Boolean = false;
  passwordNumber: Boolean = false;
  passwordSpecial: Boolean = false;
  errorres
  hide1 = true;
  displayerror
  oldpass
  newpass
  pwd3
  IpAddress
  selectRecord // slecting particular record for emails
  hideshareform: boolean = true
  windowwidth // for mobile click events
  hidesettings: boolean = false // for mobile double click to hide settigs form 
  focus
  printclose // close print iframe while click on browser back button press
  divsigpadWidth
  IframePrint: any = ''; // Iframe print for closing the print popup while clicking the back button
  search
  iebrowser // for prevalidations errors in ie only
  invalidoldpassword // for ie invalid old password
  invalidnewpas // for ie invalid new password
  invalidconfpas // for ie invalid new confirm  password
  clearintervaldata
  existingtemplate: boolean = false
  mobiletogglebutton  // enable toogle button when mobile mode 
  templatepatternerror: boolean = false // show validation error messages in edit template
  templatenamelengtherror: boolean = false // show min and max length error  messages in edit template
  SelectedCom:any//selected comment selection
  accessbutton = false
  searchcountry
  countrylist
  added: any
  enteredvalue: any
  selectimg: any
  isTemplateSelected = false
  isFileSaved = true
  isClickedOnSaveBtn = false
  addFieldwidthHeight = true
  templateShowbtn = false
  interval
  signatureValidation: any
  signatureImage;
  pencolor = '#000000'
  isOpenPad = true
  signtype: any
  pdf;
  outline;
  replyForm
  chatdata = {};
  chatHistory: any;
  openChat = false;
  isCalledngOnDestroy = false
  canedit = false;
  hideedit = true;
  hidesave = false;
  selectedTemplateId: any;
  versionNameRequired: any = false;
  restoreVersionId: any;
  selectedversionid
  templateid
  req: boolean = false
  authenticate: Boolean = false
  authIput
  camLoaderSuccess: Boolean = false
  camLoaderFail: Boolean = false
  mediaConstraints: any = {
    video: {
      mandatory: {
        minWidth: 1280,
        minHeight: 720
      }
    }, audio: true
  };
  templateSave : boolean = false
  //change password end
  // ===================================== google drive ============================================
  // developerKey = 'AIzaSyDIakE88g3pgG36he3rlTInCxbieEfGHWE';
  // clientId = "776655235606-6cmql5v21klsgb0fanlog4qhai8v98pq.apps.googleusercontent.com"
  developerKey = 'AIzaSyB4L-PhNuvZHw4wbVOjS93VV0uCAgXHUc0';
  clientId = "778273248008-3rlo8d96pebk6oci737ijtbhmla253gr.apps.googleusercontent.com"
  scope = [
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/drive.appdata',
    'https://www.googleapis.com/auth/drive.file'
  ].join(' ');
  username: any;//to display username in navbar
  commentid
  pageNo: any = 1;
  ///// Heat maps start
  //heat maps 
  viewedcount = 0;
  selectedcount = 0
  name: any = [];
  heatmaps
  notAuthorized 
  authenticateData
  authenticateTitle
  dependencyEmailerror: boolean;
  filteredOptionsForDependency
  alluseremailsForDependency
  editTemplateid :any
  templateback = false
  chatshownotifitab: boolean = false
  commentshownotifitab: boolean = false
  fieldsForDelete = []
  // watermarkTitle = "text"
  urldata :any //url data 
  notificationType:Subscription
  cdkdragVlaue:boolean = false
  macos: boolean = false; //  detect MAC os

  newChat = false
  heatmap_tooltip = false;//heatmaps tooltip
  heatmap_tooltip1 = false;//heatmaps tooltip
  // Refresh browser
  @HostListener('window:beforeunload', ['$event'])
  beforeunloadHandler(event) {
    this.ngOnDestroy();
  }

  @HostListener("window:beforeunload", ["$event"]) unloadHandler(event: Event) {
    if(!this.isEqual(this.fields, this.oldFieldData)){
     console.log("Processing beforeunload...");
     // Do more processing...
     event.returnValue = true;
    }
  }
  // To handle Browser Back button
  @HostListener('window:popstate', ['$event'])
  async onPopState(event) {
    this.newChat = false
    console.log(this.fields, this.oldFieldData,this.isFirstClick,this.editTemplateid,await this.isEqual(this.fields, this.oldFieldData))
    if (document.getElementById('centralModallg').style && document.getElementById('centralModallg').style.display) document.getElementById('signatureModalCloseBtn').click()
    if (document.getElementById('stampModal').style && document.getElementById('stampModal').style.display) document.getElementById('stampModalCloseBtn').click()
    if (document.getElementById('photoModal').style && document.getElementById('photoModal').style.display) document.getElementById('photoModalCloseBtn').click()
    if (document.getElementById('initialModal').style && document.getElementById('initialModal').style.display) document.getElementById('initialModalCloseBtn').click()
    if (document.getElementById('messageModal').style && document.getElementById('messageModal').style.display) document.getElementById('modalClosBtn').click()
    if (!this.isFileSaved && this.isClickedOnSaveBtn) {
      (!this.isFirstClick) ? (this.isFirstClick = true, this.isClickedOnSaveBtn = false, console.log(1), this.Locations.back()) : false
      this.isAlreadyOpened = true
    }
    else if (this.header_button == 'versions' && this.restorebtn) {
      if (!this.isFirstClick) {
        this.isFirstClick = true
        this.Locations.back()
      }
    }
    else if (!await this.isEqual(this.fields, this.oldFieldData) && !this.isAlreadyOpened ) {
      if (this.youCanSave) {
        await this.confirmationdialog()
        this.isFirstClick = true
        this.templateback=true;      
        if (!this.isCalledngOnDestroy) this.Locations.back()
      }
      else {
        this.documentService.openSnackBar("You can't save the changes on this file because, some one already submited their details", "X")
        this.isAlreadyOpened = true
        this.Locations.back()
      }
    }
    else if (await this.isEqual(this.fields, this.oldFieldData) && !this.isFirstClick ) {
      this.isFirstClick = true
      if (this.isAlreadyOpened) return true
      this.Locations.back()
      // window.history.back();
    }
    else if(this.editTemplateid && !this.templateback){
      this.templateback = true
      this.Locations.back()

    }
  }
  // signaturepad,scroll width based on device width 
  @HostListener('window:load', ['$event'])
  onLoad(event) {
    var s = window,
      d = document,
      x = s.innerWidth,
      y = s.innerHeight;
    this.windowwidth = x
    this.scrollHeight = window.innerHeight - 125;
    this.fieldHeight = this.scrollHeight - 180;
    if ((x <= 1300) && (x >= 1920)) {
      this.divsigpadWidth = 530
    }
    else if ((x <= 1300) && (x >= 1024)) {
      this.divsigpadWidth = 600
    }
    else if ((x <= 1024) && (x >= 600)) {
      this.divsigpadWidth = 320
    }
    else if ((x <= 600) && (x >= 320)) {
      this.divsigpadWidth = 280
    }
    else {
      this.divsigpadWidth = 600
    }
  }
  // signaturepad,chatmodal width based on device width in window resizing
  @HostListener('window:resize', ['$event'])
  onResize(event) {
   setTimeout(()=>{
    var s = window,
    d = document,
    x = s.innerWidth,
    y = s.innerHeight;
  this.windowwidth = x
  this.scrollHeight = y - 125;
  this.fieldHeight = this.scrollHeight - 180;
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
   },500)
   
  }
  private _onDestroy = new Subject<void>();
  public filteredEntities: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  @ViewChild('singleSelect') singleSelect: MatSelect;
  @Input() set dataa(dataa: any[]) {
    this._data = dataa;
    // load the initial entity list
    this.filteredEntities.next(this.dataa.slice());
  }
  get dataa(): any[] {
    return this._data;
  }
  private _data: any[];
  @Output() onSelectionChange: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild('form') form;
  isAlreadyOpened: boolean = false
  initailload: boolean = false
  isFirstClick: boolean = false
  constructor(public ref : ChangeDetectorRef,private _ngZone: NgZone, private generalservice: GeneralService, private adminService: AdminService, public cookieService: ColorPickerService, public dataService: DataService,
    public dataservice: DataService, private router: Router, public activatedroute: ActivatedRoute, private frontendconfig: FrontEndConfig, private docFields: DocFields,
    private documentService: DocumentService, private userService: UserService, public dialog: MatDialog, public datepipe: DatePipe, private renderer: Renderer2,
    private locationStrategy: LocationStrategy, private Locations: Location, private http: HttpClient) {
    var sub = this.dataservice.Connectsocket({ type: "connect" }).subscribe(quote => { var stockQuote = quote });
      if (this.documentService.getStartUrl() != '/' || (this.documentService.getStartUrl() == '/' && history.length == 1)){
        history.pushState(null, null, location.href);
        console.log("pushed",history.length)
      }
    this.mobiledemo = false
    activatedroute.params.subscribe(val => {
      if(sessionStorage.getItem("chatid") )
      {
       this.chatOpen()
      }
      if (this.initailload)
        this.ngOnInit()
      else this.initailload = true
    });

  }
  ngOnInit() {
    $('body').removeClass('noselect'); // enable user selection for comments 
    this.windowwidth = window.innerWidth
    this.divsigpadWidth = 600
    this.scrollHeight = window.innerHeight - 125;
    this.fieldHeight = this.scrollHeight - 180;
    this.templatename = "";
    this. urldata = this.router.url.split('/');
    var templdata = this.urldata[3].split('.')
    if(templdata.length == 2)  {
      this.header_button = 'review'; 
      this.isFirstClick = true
      this.fields = []
      this.oldFieldData = []
      let data = {
        fileid: templdata[0],
        sharedid:templdata[1]
      }
      this.adminService.getProfile().subscribe(data => {
        this.profiledata = data
        if (this.profiledata.type == "organisation") this.username = this.profiledata.companyname
        else this.username = this.profiledata.name
      })
    
      this.documentService.decryptedvalues(data).subscribe((decryptdata: any) => {
        console.log(decryptdata)
        this._id = decryptdata.fileid;
        this.editTemplateid = decryptdata.sharedid
        // Get  Document
        this.documentService.getSelectedDoc(this._id,'Allowusers').subscribe((data:any) => {
          console.log(data)
            this.notAuthorized = true 
            this.selectedDoc = data
            if (this.selectedDoc) {
              setTimeout(() => {
                this.getSelectedTemplate(decryptdata.sharedid,'templateedit');
              }, 1000);
            }
        }, error => { 
          this.urlMismatch()
         });
        })
    }  
    else{
  
      this.fields = []
      this.oldFieldData = []
      this.youCanSave = false
      this.editTemplateid = null
      this.getTemplate();
      this.globalMouseMove = this.renderer.listen('document', 'mousemove', e => {
        if (this.callGloablMouseDown && this.callGlobalMouseMove && !this.callGloablMouseUp) {
          this.onWindowPress(e, this.mouseDownClass.id, this.mouseDownClass)
        }
      });
      this.globalMouseUp = this.renderer.listen('document', 'mouseup', e => {
        this.callGloablMouseDown = false;
        this.callGlobalMouseMove = false
        this.callGloablMouseUp = true
      });
      // Filter Emails lists by autocomplete 
      this.filteredOptions = this.formControl.valueChanges.pipe(startWith(''), map(value => this._filteremailcheck(value)));
      this.filteredOptionsForDependency = this.formControlForDependency.valueChanges.pipe(startWith(''), map(value => this._filteremailcheckForDependency(value)));
      
      //  Get User GEO Locations     
      this.platform = new H.service.Platform({
        "app_id": 'xeeSniVGFJguQieOyDvg',
        "app_code": 'CYXw3RyDsetaa5pSVf3EAw'
      });
      window.onbeforeunload = function (e) {
        return "Do you want to exit this page?";
      };
      this.geocoder = this.platform.getGeocodingService();
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
          this.latitude = position.coords.latitude;
          this.longitude = position.coords.longitude;
          var query = this.latitude + ',' + this.longitude
        }, error => {
          this.documentService.openSnackBar("Your Location is Blocked please Allow for security reasons", "X")
          this.latitude = undefined;
          this.longitude = undefined;
        });
      }
      var data = {
        fileid: this.router.url.substring(this.router.url.lastIndexOf('/') + 1)
      }
      this.documentService.decryptedvalues(data).subscribe((data: any) => {
        this._id = data.decryptdata;
        // Get  Document
        this.documentService.getSelectedDoc(this._id,'Allowusers').subscribe((data:any) => {
          console.log(data)
            this.notAuthorized = true 
            this.selectedDoc = data
            if (this.selectedDoc.waterMark) {
              this.waterMark = this.selectedDoc.waterMark;
              setTimeout(() => {
                this.loadWaterMark();
              }, 1000);
            }
            this.documentService.getparticularfavorite(this._id).subscribe(data => {
              this.favoritedoc = data
              if (this.favoritedoc.length > 0) this.removefav = true;
              else this.removefav = false
            });
        }, error => { 
          this.urlMismatch()
         });
        // this.documentFieldDataGetting();
        this.sharedpeoples(this._id)
      }, error => { 
       });
      // Get Login User Details (Profiel Info)
      this.adminService.getProfile().subscribe(data => {
        this.profiledata = data
        if (this.profiledata.type == "organisation") this.username = this.profiledata.companyname
        else this.username = this.profiledata.name
        this.createonlineUsers()
        // Store Doc Opened Info on Audit log file
        // this.auditlog(this.profiledata._id);
        // Get Notifications
        this.getOfflineNotification();
        this.getNotificationCount()
        this.getmodeldata();
      })
      this.GetListOftemplates()
      this.IpAddress = JSON.parse(localStorage.getItem('mylocation'));
      var ipdata = localStorage.getItem('ipaddress')
      if (!this.IpAddress) this.IpAddress = this.userService.decryptData(ipdata)
      //Internet explorer header fix
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
    }
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
  * Function name : callMouseDown
  * Input : {json} field
  * Output : set true to callGlobalMouseMove
  * Desc : to call onwindowpress function when mousedown
  */
  callMouseDown(className) {
    this.callGloablMouseDown = true
    this.callGlobalMouseMove = true
    this.callGloablMouseUp = false
    this.mouseDownClass = className
  }
  /**
  * Function name : callMouseOut
  * Input : {json} field
  * Output : set true to callGlobalMouseMove,callGloablMouseDown
  * Desc : to call onwindowpress function when mouseout
  */
  callMouseOut(className) {
    this.callGlobalMouseMove = true;
    this.callGloablMouseDown = true
  }
  /**
   * Function name : createonlineUsers
   * Input : {json}
   * Output :{json} onlineuser data
   * Desc : create online user when file is opened
   */
  createonlineUsers() {
    var log = {
      fileid: this._id,
      uid: this.profiledata._id,
      viewStatus: true,
      email: this.profiledata.email
    }
    this.generalservice.onlineuser(log).subscribe(data => {
      this.onlinedata = data
      this.getonlineusers()
    })
  }
  /**
  * Function name : LoadData
  * Desc :To get ontime reflection
  */
  LoadData() {
    this.dataService.newNotificationReceived().subscribe(data => {
      this.getOfflineNotification();
      this.getNotificationCount()
    })
    this.dataservice.onlineusers().subscribe(data => {
      console.log(data)
      if (data.fileid == this.selectedDoc._id) {
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
    this.dataservice.mobilelinkupdate().subscribe(data => {
      this.updateFromMobile(data);
    })
    this.endtime = moment().format()
    // Get Updated Comments lists
    this.dataservice.newCommentReceived().subscribe(data => {
      this.getComments()
    })
    this.dataservice.newChatReceived().subscribe(data => {
      // alert()
      console.log(data)
      if(data.documentid == this._id)
      this.newChat = true;
    })
    this.dataservice.FieldsValueUpdate().subscribe(data => {
      if (data.documentid == this.selectedDoc._id) {
        this.documentFieldDataGetting()
        this.youCanSave = false
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
    this.dataservice.documentUpdate().subscribe(data => {
      if (data._id == this.selectedDoc._id) {
        if (data.uid === this.profiledata._id) {
          this.selectedDoc = data
        }
        else {
          this.urlMismatch()
        }
      }
    });
    this.dataservice.newfavorite().subscribe(data => {
      if(data.fileid == this._id && data.uid === this.profiledata._id){
        this.documentService.getparticularfavorite(data.fileid).subscribe(favdata => {
          this.favoritedoc = favdata
          console.log(this.favoritedoc)
          if (this.favoritedoc.length > 0 ) this.removefav = true;
          else this.removefav = false
        }); 
      }
     
    })
    this.dataservice.newMessageReceived().subscribe(data => {
      if (data.fileid == this.selectedDoc._id)
        this.sharedpeoples(this._id)
      if (data.fileid == this.selectedDoc._id && data.signed)
        this.youCanSave = false
    });
    this.dataService.documentLogsUpdate().subscribe(data => {
      console.log(data)
      if (data.documentid == this.selectedDoc._id && this.header_button == 'heatmaps') {
        this.heatMaps();
      }
    })
    // GET comments lists
    this.getComments()
    this.getAlreadySharedPersons()
  }
  /**
  * Function name : getAlreadySharedPersons
  * Input : login user id(authorized headers)
  * 
  * Output : {array} shared emails
  * Desc : To get List of shared Emails
  */
  getAlreadySharedPersons() {
    this.documentService.getSharePeopleEmails().subscribe((data: any) => {
      this.sharedusers = data
      this.sharedusers.forEach(element => {
        this.options.push(element.email)
        if (element.toid) {
          if (this.alluseremails.length > 0) {
            var shared = (this.alluseremails.some(element1 => element1 == element.toid.email))
            if (!shared) {
              this.alluseremails.push(element.toid.email)
            }
          }
          if (this.alluseremails.length == 0) {
            this.alluseremails.push(element.toid.email)
          }
        }
        if (!element.toid) {
          if (this.alluseremails.length > 0) {
            var shared = (this.alluseremails.some(element1 => element1 == element.toemail))
            if (!shared) {

              this.alluseremails.push(element.toemail)
            }
          }
          if (this.alluseremails.length == 0) {
            this.alluseremails.push(element.toemail)
          }
        }
        this.alluseremailsForDependency = this.alluseremails
      });
    })
  }
  /**
   * Function name : documentFieldDataGetting
   * Input : fileid
   * Output : {array}  fields
   * Desc : Gettiong Document fields Data
   */
  fieldset:any
  documentFieldDataGetting() {
    return new Promise(async (resolve, reject) => {
      await this.documentService.getSelectedDoc(this._id,'Allowusers').subscribe((data:any) => {
        if(true){
          this.selectedDoc = data
          this.documentService.getCurrentVersionDocFieldWithValues({ documentid: this.selectedDoc._id, versionid: this.selectedDoc.versionid ? this.selectedDoc.versionid : null }).subscribe(currentVersionDocFieldOptions => {
            this.fieldset = currentVersionDocFieldOptions;
            let i = 0;
            if(this.fieldset.length >0){
              for (let field of this.fieldset) {
                if (this.PdfWidth) {
                  field.width = (field.width / field.pageWidth) * this.PdfWidth
                  field.height = (field.height / field.pageHeight) * this.PdfHeight
                  field.left = (field.left / field.pageWidth) * this.PdfWidth
                  field.top = (field.top / field.pageHeight) * this.PdfHeight
                }
                if (field.type == 'date' && field.value) field.value = new Date(field.value);
                setTimeout(() => { this.updateFieldCss(field); }) //After Div insert in html then only it needs to be call
                setTimeout(() => {
                  if (this.header_button == 'insertField' || this.header_button == 'saveFile') $("#" + field.id + "-input").resizable();
                  if (((field.type == 'signature' || field.type == 'initial' || field.type == 'Photo' || field.type == 'Stamp') && (field.insertedemail || field.signatureId || field.photoId || field.stampId)))
                    $("#" + field.id + "-input").attr("contenteditable1", false)
                  ++i;
                  console.log(this.urldata.length)
                  if (i == this.fields.length - 1) {
                    if (this.urldata.length == 5) {
                      this.focusDependencyField();
                    }
                    this.oldFieldData = JSON.parse(JSON.stringify(this.fields))
                  }
                  if (this.fields.length == 1) {
                    if (this.urldata.length == 5) {
                      this.focusDependencyField();
                    }
                    this.oldFieldData = JSON.parse(JSON.stringify(this.fields))
                  }
                }, 10)
                this.fields = this.fieldset
              }
            }
            else{
              this.fields = this.fieldset   
            }
            resolve(true)
          }, error => { resolve(false) });
        }
      }
      , error => { 
        this.urlMismatch()
       }
      );
    })
  }


 /**
   * Function name : focusDependencyField
   * Input  : url
   * Output : focus Dependency Field  
   */
  focusDependencyField()
  {
    var data = {
      fileid: this.urldata[3]
    }
    this.documentService.decryptedvalues(data).subscribe((data: any) => {
    var field= this.fields.find(x=>x.id==data.decryptdata)
    var index= this.fields.findIndex(x=>x.id==data.decryptdata)
    this.buttonActive('insertField');
    this.openChat=false;
    this.savebutton=true;
    if(!this.newChat) this.shareform=true;
    this.editField(field,index,null);
    this.showpanel();
    this.ref.detectChanges();

    })
  }
  /**
   * Function name : getpdfSizes
   * Input  : pdf width,height
   * Output : {number}  
   * Desc   : calculation of pdftop and pdfleftsidebar
   */
  getpdfSizes() {
    this.PdfTop = document.getElementById('docheader').offsetHeight + document.getElementById('progress_bar').offsetHeight + document.getElementById('topbar').offsetHeight + ($('#staticbar-top').outerHeight(true) - $('#blog-post').outerHeight(true));
    this.PdfTopScroll = $("#doc-view").scrollTop();
    this.PdfLeft = $('#docsidebar').outerWidth(true) + (($("#doc-view").width() - $('#blog-post').width()) / 2);
    this.PdfLeftNosideBar = ($("#doc-view").width() - $('#blog-post').width()) / 2;
  }
  /**
   * Function name : sharedpeoples
   * Input  : fileid
   * Output : {array} sharedpeoples
   * Desc   : To get sharedpeoples of specific document
   */
  sharedpeoples(id) {
    this.documentService.getsharingpeople(id).subscribe(data => {
      this.sharedemails = data;
    })
  }
  /**
    * Function name : getFieldLeft
    * Input  : {json} field
    * Output : {number} field left value
    * Desc   : To get field left as per zoom Level
    */
  getFieldLeft(field, t) {
    var left = 0;
    if ((field.left || field.coordinatey) && this.zoomVal != 1) {
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
    var sidebar = 0;
    if (this.PdfLeftNosideBar > 0) sidebar = this.PdfLeftNosideBar;
    return left + sidebar - (parseInt($("#blog-post").css('border-left-width')));
  }
  /**
   * Function name : getFieldTop
   * Input  : {json} field
   * Output : {number} field Top value
   * Desc   :  Get Field Top as per zoom Level
   */
  getFieldTop(field) {
    var top = 0;
    if ((field.top || field.coordinatex) && this.zoomVal != 1) { //Only zoom section
      var perc = this.getPercentageChange(parseInt(this.PdfWidth), parseInt($(".page:first").width()));
      if (!field.selectText && field.top) {
        var l = (field.top / 100) * perc;
        top = field.top - l;
      } else if (field.coordinatex) {
        var l = ((field.coordinatex) / 100) * perc;
        top = field.coordinatex + (document.getElementById('progress_bar').offsetHeight + ($('#staticbar-top').outerHeight(true) - $('#blog-post').outerHeight(true))) - l;
      }
      else if (field.selectText) {
        var l = (field.top / 100) * perc;
        top = field.top - l;
      }
    }
    else if (field.top) { top = field.top; }
    else if (field.coordinatex) {
      top = field.coordinatex + document.getElementById('progress_bar').offsetHeight + ($('#staticbar-top').outerHeight(true) - $('#blog-post').outerHeight(true))
    }
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
      $("#" + field.id + "-input").parents('div.ui-wrapper').height($("#" + field.id + "-input").height())
      var perc = this.getPercentageChange(parseInt(this.PdfWidth), parseInt($(".page:first").width()));
      var l = (field.height / 100) * perc;
      return field.height - l;
    }
    else {
      $("#" + field.id + "-input").parents('div.ui-wrapper').height($("#" + field.id + "-input").height())
      return field.height;
    }
  }
  /**
   * Function name : getFieldWidth
   * Input  : {json} field
   * Output : {number} field width value
   * Desc   :  Get Field width as per zoom Level
   */
  getFieldWidth(field) {
    if (field.width && this.zoomVal != 1) {
      $("#" + field.id + "-input").parents('div.ui-wrapper').width($("#" + field.id + "-input").width())
      var perc = this.getPercentageChange(parseInt(this.PdfWidth), parseInt($(".page:first").width()));
      var l = (field.width / 100) * perc;
      return field.width - l;
    }
    else {
      $("#" + field.id + "-input").parents('div.ui-wrapper').width($("#" + field.id + "-input").width())
      return field.width;
    }
  }
  // Resize fields on window resize
  onWindowResize() {
    this.getpdfSizes();
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
    * Function name : drop
    * Input  : event,field
    * Output :  field left,top values 
    * Desc   :  Update field values after draging and field are not dropped in outof pdf border
    */
   drop(event: CdkDragEnd, field) {
    //  alert()
    if (event['source']['_dragRef']['_passiveTransform']) {
      var t = field.top + event['source']['_dragRef']['_passiveTransform']['y'];
      var l = field.left + event['source']['_dragRef']['_passiveTransform']['x']
      if ((/Edge\/\d./i.test(navigator.userAgent) || (!!(window as any).MSInputMethodContext && !!(document as any).documentMode)))
        var PdfWidth = $('#blog-post').width() - 8
      else
        var PdfWidth = $('#blog-post').width() - 0
        var m = 0;
        var pageNo = 0;
        this.PDFheights.forEach(page => {
          m++;
          if (page.start <= t + field.height && page.end+10 >= t + field.height) {
            pageNo = m++;
           
          }
        });
      field.pageNo = pageNo
    //  console.log(PdfWidth , l + field.width ,  $('#blog-post').height() > t + field.height)
      if (l > 0 && PdfWidth > l + field.width && t > 0 && $('#blog-post').height() > t + field.height) {
        field.top = field.top + event['source']['_dragRef']['_passiveTransform']['y']
        field.left = field.left + event['source']['_dragRef']['_passiveTransform']['x']
      }
      if ((this.PDFheights[pageNo - 1] && t + field.height > this.PDFheights[pageNo - 1].end)) {
        field.top = this.PDFheights[field.pageNo - 1].end - field.height
      }
      else if(this.PDFheights[pageNo-1] && t < this.PDFheights[pageNo-1].start) {
        field.top = this.PDFheights[field.pageNo -1].start
      }
      else if(this.PDFheights[pageNo - 1] === 0) {
        field.top = this.PDFheights[field.pageNo ].start
      }
    
      event['source']['element']['nativeElement']['style']['transform'] = 'translate3d(0,0,0)';
      event['source']['_dragRef']['_activeTransform'] = { x: 0, y: 0 };
      event['source']['_dragRef']['_passiveTransform'] = { x: 0, y: 0 };
      
    }
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
    this.onWindowResize();
  }
  /**
  * Function name : afterLoadComplete
  * Input  : event
  * Output : get watermark and fields data
  * Desc   : To load watermark,fields data 
  */
  youCanSave: boolean = true
  async afterLoadComplete(pdf) {
    this.pdf = pdf;
    this.loadOutline();
    this.onWindowResize();
    if(!this.editTemplateid) this.loadWaterMark();
    if(!this.editTemplateid) this.LoadData();
    this.isloading = false;
    setTimeout(() => {
      this.PdfHeight = $(".page:first").height();
      this.PdfWidth = $(".page:first").width();
      this.setPdfHeights()
      if(!this.editTemplateid) this.documentFieldDataGetting()
      $('.z00mout').addClass('c0lric0');
    }, 100)
    if(!this.editTemplateid) this.youCanSave = await this.canSave() ? true : false// For the reason of decreasing confirmation dialog box loading 
  }
  /**
 * Function name : setPdfHeights
 * Input  : pages height,width
 * Output : {array} every page start and end
 * Desc   : Calculate every page start and end
 */
  setPdfHeights() {
    var h = 0;
    var PDFheights = [];
    this.PDFheights = []
    let pgNo = 1
    $("div.pdfViewer").find("div.page").each(function () {
      PDFheights.push({ start: h, end: h + $(this).height() })
      pgNo++;
      h = h + ((pgNo - 1) > 0 ? (10) : 0) + $(this).height();
    })
    this.PDFheights = PDFheights
  }
  /**
 * Function name : pdfZoomIn
 * Desc   : To increase zoom level on ZoomIn
 */
  pdfZoomIn() {
    this.zoomWidth = $(".page").width()
    if (this.zoomVal < 1.5) {
      this.zoomVal += 0.1;
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

     if (this.zoomVal == 1) {
      $('.z00mout').addClass('c0lric0')
      for (let field of this.fields) {
        if ($("#" + field.id + "-input").width() != $("#" + field.id + "-input").parents('div.ui-wrapper').width() || $("#" + field.id + "-input").height() != $("#" + field.id + "-input").parents('div.ui-wrapper').height()) {
          $("#" + field.id + "-input").parents('div.ui-wrapper').height($("#" + field.id + "-input").height())
          $("#" + field.id + "-input").parents('div.ui-wrapper').width($("#" + field.id + "-input").width())
        }
      }
    }
  }
  /**
   * Function name : pdfZoomreset
   * Desc   : set zoomval=1 on ZoomReset
   */
  pdfZoomreset() {
    this.zoomWidth = $(".page").width();
    $('.z00min').removeClass('c0lric0');
    $('.z00mout').addClass('c0lric0')
    for (let field of this.fields) {
      if ($("#" + field.id + "-input").width() != $("#" + field.id + "-input").parents('div.ui-wrapper').width() || $("#" + field.id + "-input").height() != $("#" + field.id + "-input").parents('div.ui-wrapper').height()) {
        $("#" + field.id + "-input").parents('div.ui-wrapper').height($("#" + field.id + "-input").height())
        $("#" + field.id + "-input").parents('div.ui-wrapper').width($("#" + field.id + "-input").width())
      }
    }
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
 * Function name : updateFieldCss
 * Input  : {json} field
 * Output : {json} field with updated css
 * Desc   :  Update Css As per field configuaration
 */
  updateFieldCss(field) {
    var css = "#" + field.id + "{ ";
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
    if (field.people) this.RecipientMails();
    if (field.type == 'radiobutton' && field['css-font-size']) { // Update radio button size
      var w = field['css-font-size'].substring(0, field['css-font-size'].length - 2)
      let oldpdfwidth = field.pageWidth ? field.pageWidth : this.PdfWidth
      let radiobuttonwidth = ((13 / 16) * parseInt(field['css-font-size']) * (this.PdfWidth / oldpdfwidth))
      let oldpdfheight = field.pageWidth ? field.pageWidth : this.PdfWidth
      let radiobuttonheight = ((13 / 16) * parseInt(field['css-font-size']) * (this.PdfHeight / oldpdfheight))
      setTimeout(() => {
        $("#" + field.id + '-input').find('input').css('width', radiobuttonwidth + 'px');
        $("#" + field.id + '-input').find('input').css('height', radiobuttonwidth + 'px');
      }, 10);
     
    }
    if (field.type == 'radiobutton' || field.type == 'dropdown' && field.opt != undefined && !field.radiobuttondisplay) {
      var options = []
      options = field.optionvalue ? field.optionvalue : []
      field.optionvalue = field.opt.split(',')
      if(field.optionvalue.length === 1 && field.optionvalue[0] === ''){
        this.documentService.openSnackBar('Should keep atleast one','x')
        field.optionvalue[0] = options[0]
        field.opt =  options[0] 
      }
    }
    if (field.type == 'email') field.fieldvalidationCheck = true
    else if (field.type == 'mobilenumber') field.fieldvalidationCheck = true
    if (field.restrict == "required") {
      field.required = true;
      field.readonly = false;
    }
    else if (field.restrict == "hidden") field.hidden = true;
    else if (field.restrict == "readonly") {
      field.readonly = true;
      field.required = false;
    }
    this.onWindowPress(false, field.id, field)
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
        {
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
            div.css('font-size', (fontsizeInvw) + 'vw');
          }
        }
        if (field && field.type && field.type == 'date') {
        }
      }
    }
  }
  /**
 * Function name : UpdateDateFormat
 * Input  : {json} field
 * Output : {number} date with format
 * Desc   :  Update Date format as per date settings
 */
  UpdateDateFormat(field) {
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
  /**
  * Function name : RecipientMails
  * Desc   :   Fields people will push to recipnt emails lists
  */
 RecipientMails() {
  this.emailarray = []
  var uniqueEmails = [];
  this.fields.forEach(element => {
    if (element.people) {
      var regexp = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
      var x = regexp.test(element.people)
      if (x) {
        var present = (uniqueEmails.some(element1 => (element1 == element.people) ))
        console.log(present)
        if (!present) {
          uniqueEmails.push(element.people)
          this.emailarray.push({ "email": (element.people).trim() })
        }
       
      }  
    }
    if (element.dependency) {
      var regexp = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
      var x = regexp.test(element.dependency)
      if (x) {
        var present = (uniqueEmails.some(element1 => element1 == element.dependency))
        if (!present) {
          uniqueEmails.push(element.dependency)
          this.emailarray.push({ "email": (element.dependency).trim() })
        }
        
      }
    }
  })
}
  /**
 * Function name : logout
 * Desc   :  Logout by clicking logout button
 */
  async logout() {
    if (!this.isFileSaved && this.isClickedOnSaveBtn) {
      (!this.isFirstClick) ? (this.isFirstClick = true, this.isClickedOnSaveBtn = false, console.log(1), this.Locations.back()) : false
      this.isAlreadyOpened = true
    }
    else if (this.header_button == 'versions' && this.restorebtn) {
      if (!this.isFirstClick) {
        this.isFirstClick = true
        this.dataService.Connectsocket({ type: "disconnect" }).subscribe(quote => { });
        this.adminService.logout();       }
    }
    else if (!await this.isEqual(this.fields, this.oldFieldData) && !this.isAlreadyOpened) {
      if (this.youCanSave) {
        var tosave=await this.confirmationdialog()
        this.isFirstClick = true
        if (!tosave) {
          this.dataService.Connectsocket({ type: "disconnect" }).subscribe(quote => { });
          this.adminService.logout(); 
        }
      }
      else {
        this.documentService.openSnackBar("You can't save the changes on this file because, some one already submited their details", "X")
        this.isAlreadyOpened = true
        this.dataService.Connectsocket({ type: "disconnect" }).subscribe(quote => { });
        this.adminService.logout();       }
    }
    else{
      this.dataService.Connectsocket({ type: "disconnect" }).subscribe(quote => { });
      this.adminService.logout(); 
    }
   
  }

  /**
 * Function name : getComments
 * Input  : {String} fileid
 * Output : {array} comments
 * Desc   :  Getting Comments
 */
  getComments() {
    var id = { id: this._id }
    this.documentService.getcomments(id).subscribe(data => {
      this.commentsdata = data
      this.childcomments = []
      this.parentcomment = []
      this.commentsdata.forEach(element => {
        if (element.uid && element.uid._id != this.profiledata._id) { element.coordinatey += 15; }
        else if(element.email)  { element.coordinatey += 15; }
        if (element.parentcommentid) {
          if (element.uid) {
            if (element.uid._id == this.profiledata._id) element.isreply = true
          }
          else {
            if (element.email == this.profiledata.email) element.isreply = true
          }
          this.childcomments.push(element)
        }
        else {
          if (element.uid) {
            if (element.uid._id == this.profiledata._id) element.isreply = true; this.accessbutton = true;
          }
          else {
            if (element.email == this.profiledata.email) element.isreply = true
          }
          this.parentcomment.push(element)
        }
      })
    })
  }
  /**
  * Function name : getTemplate
  * Input  : {String} login userid
  * Output : {array} templates
  * Desc   :  To get template of particular user
  */
  getTemplate() {
    if (this._id && this.selectedTemplateId) {
      this.documentService.gettempltes().subscribe((data: any) => {
        this.templates = data
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
  /**
    * Function name : add
    * Input  : {json} selected field
    * Output : {json} updated field
    * Desc   :  check email validation
    */
  add(item,focus,title) {
    if(title === 'people'){
      // if(focus)item.emailvalid = true
      var regexp = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
      if (!(regexp.test(item.people)) && item.people != undefined && item.people != ""){ 
        item.emailvalid = false
      }
      else{item.emailvalid = true}
      if (item.people == '') delete item.people
      if (item.people == undefined) delete item.people
      if(focus)item.emailvalid = true
      else if((regexp.test(item.people))){
        if(item.dependency === item.people){
          this.documentService.openSnackBar('Email should be vary','x')
          item.people = null
        }
      }
    }
    else if(title === 'dependency')
    {
      // if(focus)item.dependencyEmailerror = true
      var regexp = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
      if (!(regexp.test(item.dependency)) && item.dependency != undefined && item.dependency != ""){ 
        item.dependencyEmailerror = false
      }
      else{item.dependencyEmailerror = true}
      if (item.dependency == '') delete item.dependency
      if (item.dependency == undefined) delete item.dependency
      if(focus)item.dependencyEmailerror = true
      else if((regexp.test(item.dependency))){
        if(item.dependency === item.people){
          this.documentService.openSnackBar('Email should be vary','x')
          item.dependency = null
        }
      }
    }
   
    this.updateFieldCss(item)
  }
  /**
   * Function name : _filteremailcheck
   * Input  : {String} text
   * Output : {array} matched emails
   * Desc   :  filter emails based on given text
   */
  private _filteremailcheck(value: string): User[] {
    if (value != undefined && value.length) {
      const filterValue = value.toLowerCase();
      return this.alluseremails.filter(option => option.toLowerCase().includes(filterValue));
    }
    else return []
  }
  private _filteremailcheckForDependency(value: string): User[] {
    if (value != undefined && value.length) {
      const filterValue = value.toLowerCase();
      return this.alluseremailsForDependency.filter(option => option.toLowerCase().includes(filterValue));
    }
    else return []
  }
  //to close edit field form
  closeEditform = function () {
   
    this.editF = null;
    this.shareform = true;
    this.fieldIndex = false;
    this.setF = '';
    $(".page").css("z-index", 8);
  }
  /**
   * Function name : GetInitialDocumentList
   * Input  : {String} If value is there it will check count if count 0 then it will navigate to that tab 
   * Output : {array} Initials
   * Desc   :  Get Lists of Intials 
   */
  GetInitialDocumentList(taboption) {
    this.documentService.ListOfInitials(this.profiledata.email).subscribe((res: any) => {
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
        if (taboption && this.initialList.length > 0) this.tabactive = 'tab1';
      } else if (taboption && this.initialList.length == 0) {
        this.tabactive = taboption;
        this.signature()
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
   * Function name : GetSignatureDocumentList
   * Input  : {String} If value is there it will check count if count 0 then it will navigate to that tab 
   * Output : {array} Signatures
   * Desc   :  Get Lists of Signatures 
   */
  GetSignatureDocumentList(taboption) {
    this.documentService.ListOfSignatures(this.profiledata.email).subscribe((res: any) => {
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
        if (taboption && this.SignatureList.length > 0) this.tabactive = 'tab1';
      } else if (taboption && this.SignatureList.length == 0) {
        this.tabactive = taboption;
        this.signature()
      }
    });
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
      if (this.SignatureList.length == 0)
        this.tabactive = 'tab3'
    }
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
  //signature pad width on resize window
  signature() {
    window.dispatchEvent(new Event('resize'));
  }

  /**
  * Function name : GetPhotoDocumentList
  * Input  : {String} If value is there it will check count if count 0 then it will navigate to that tab 
  * Output : {array} Photos
  * Desc   :  Get Lists of Photos 
  */
  GetPhotoDocumentList(taboption) {
    this.documentService.ListOfPhotos(this.profiledata.email).subscribe((res: any) => {
      if (res.length >= 0)
        this.PhotoList = res;
    });
    if (taboption && this.PhotoList.length > 0) this.tabactive = 'tab1';
    else if (taboption && this.PhotoList.length == 0) this.tabactive = taboption;
  }

  /**
  * Function name : GetStampDocumentList
  * Input  : {String} If value is there it will check count if count 0 then it will navigate to that tab 
  * Output : {array} Stamps
  * Desc   :  Get Lists of Stamps 
  */
  GetStampDocumentList(taboption) {
    this.documentService.ListOfStamps(this.profiledata.email).subscribe((res: any) => {
      if (res.length > 0)
        this.StampList = res;
    });
    if (taboption && this.StampList.length > 0) this.tabactive = 'tab1';
    else if (taboption && this.StampList.length == 0) this.tabactive = taboption;
  }
  /**
   * Function name : selectSignature
   * Input  : {json} field
   * Output : {json} selected Signature
   * Desc   :  Get selected signature from siagnature list 
   */
  selectSignature = function (data, title) {
    if (this.editF) $("#" + this.editF.id + "-input").attr("contenteditable1", false)
    if (data._id) this.editF.signatureId = data._id;
    if (data.type) this.editF.signatureType = data.type
    if (data.signaturebaseData) this.editF.signaturebaseData = data.signaturebaseData
    if (data.path) this.editF.path = data.path
    if (data.size) this.editF.size = data.size
    if (data.name) this.editF.name = data.name
    if (data.link) this.editF.link = data.link
    if (data.encryptedid) this.editF.encryptedid = data.encryptedid
    if (data.fontStyle) this.editF.fontStyle = data.fontStyle
    if (data.fontText) this.editF.fontText = data.fontText
    this.ResetFieldFonts(this.editF)
  }
  /**
   * Function name : selectPhoto
   * Input  : {json} field
   * Output : {json} selected Photo
   * Desc   :  Get selected photo from photo list 
   */
  selectPhoto(data) {
    if (data.bottlenecksCreated == false && this.editF.authentication == true) {
      this.documentService.bottlenecksCreationForPhoto(data).subscribe((result: any) => {
        console.log(result);
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
      this.setPhoto()
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
        if (searchcountry.length > 0) this.userService.getcountries({ searchcountry: searchcountry }).subscribe(data => {
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
    this.showlist = false
    this.mobiledemo = false
    this.req = false
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
  /**
  * Function name : selectStamp
  * Input  : {json} field
  * Output : {json} selected stamp
  * Desc   :  Get selected stamp from stamp list 
  */
  selectStamp = function (data) {
    if (this.editF) $("#" + this.editF.id + "-input").attr("contenteditable1", false)
    if (data._id) this.editF.stampId = data._id
    if (data.type) this.editF.stampType = data.type
    if (data.path) this.editF.path = data.path
    if (data.size) this.editF.size = data.size
    if (data.name) this.editF.name = data.name
    if (data.link) this.editF.link = data.link
    if (data.encryptedid) this.editF.encryptedid = data.encryptedid
  }
  /**
   * Function name : getAllDocVersions
   * Input  : {String} fileid
   * Output : {array} All versions
   * Desc   :  Get version of specific file
   */
  getAllDocVersions = function () {
    this.documentService.getAllDocVersions(this._id).subscribe(allDocVersions => {
      this.allDocVersionsResult = allDocVersions
    })
  };
  /**
   * Function name : GetListOftemplates
   * Input  : {String} userid
   * Output : {array} All templates
   * Desc   :  Get templates of login user
   */
  GetListOftemplates() {
    this.overwritebtn = false
    this.existingtemplate = false
    this.documentService.gettempltes().subscribe((data: any) => {
      this.templates = data;
    })
  }
  /**
  * Function name : getSelectedTemplate
  * Input : {String} template Id
  * Output : Template Data
  * Desc : To get selected template data
  */
  getSelectedTemplate = async function (data,title) {
    if (data == undefined) this.documentService.openSnackBar("Select Template", 'X')
    else {
      console.log(this.PdfHeight)
      this.documentService.getSelectedTemplate(data).subscribe((templatedata: any) => {
        this.fields = templatedata.fields;
       
        var diff = this.pageNo -(Math.min.apply(Math, this.fields.map(function(o) { return o.pageNo; })))
        var maxpageno =(Math.max.apply(Math, this.fields.map(function(o) { return o.pageNo; })))
        
        if(maxpageno > this.pdf.numPages && !this.editTemplateid){
          let dialogdata = this.dialog.open(CommonDialogComponent,
            { data: { name: 'sharesubmit', cancel: true, content: 'Template Document Is More Than Existing Document.Do You Wish To Continue?' }, width: '500px', panelClass: "deletemod", disableClose: false });
          dialogdata.afterClosed().subscribe(res => {
            if (res) {
             this.editTemplateChanges(diff,title)
            }
            else{
              this.backToOriginal()
            }
          })
        }
        else{
          this.editTemplateChanges(diff,title)
        }
       
        // if(title == 'templateedit') this.oldFieldData = JSON.parse(JSON.stringify(this.fields));
        console.log(this.isEqual(this.fields, this.oldFieldData))
        this.isTemplateSelected = true;
        document.getElementById("templatemodelclose").click()
      });
    }
  }
  editTemplateChanges(diff,title)
  {
    let i = 0;
    for (let field of this.fields) {
      if (this.PdfWidth) {
        field.width = (field.width / field.pageWidth) * this.PdfWidth
        field.height = (field.height / field.pageHeight) * this.PdfHeight
        field.left = (field.left / field.pageWidth) * this.PdfWidth
        field.top = (field.top / field.pageHeight) * this.PdfHeight
        if(!this.editTemplateid) field.top = field.top+(diff*this.PdfHeight)
        if(field.top>this.PDFheights[this.PDFheights.length-1].end && !this.editTemplateid){
          field.top = (field.top-(diff*this.PdfHeight))-((field.pageNo-this.pdf.numPages)*this.PdfHeight)
          
        }
        if (i == this.fields.length - 1 && title == 'templateedit') {
         
          setTimeout(() => {
          this.oldFieldData = JSON.parse(JSON.stringify(this.fields));
          },500)
        }
      }
      if (field.type == 'date' && field.value) field.value = new Date(field.value);
      setTimeout(() => { this.updateFieldCss(field); }) //After Div insert in html then only it needs to be call
      setTimeout(() => {
        if (this.header_button == 'insertField' || this.header_button == 'saveFile') $("#" + field.id + "-input").resizable();
        if (((field.type == 'signature' || field.type == 'initial' || field.type == 'Photo' || field.type == 'Stamp') && (field.insertedemail || field.signatureId || field.photoId || field.stampId)))
          $("#" + field.id + "-input").attr("contenteditable1", false)
      }, 10)
     
      ++i;

     
    }
  }
  minpageno = 0
  checkPageno(){
    this.fields.reduce(function(prev, curr) {
      // console.log(prev.pageNo,curr.pageNo)
      if(prev.pageNo < curr.pageNo ){
        console.log(prev,"pppp")
        this.minpageno = prev.pageNo
        return prev
      } 
      else{
        console.log(curr,"curr")
        this.minpageno = curr.pageNo
        return curr
      } 
  });
  }
  //getting current version fields on clicking backToOriginal button
  async backToOriginal() {
    this.isloading = true
    await this.documentFieldDataGetting()
    this.isTemplateSelected = false
    this.isloading = false
  }
  /**
   * Function name : editField
   * Input : {json} field
   * Output : {json} selected field data
   * Desc : To get current field
   */
  editField = function (item: any, index: number, event) {
    this.newChat=false
    if(event && event.ctrlKey)
    {
      let indexNum
      if (!this.fieldsForDelete.some(element => element.id === item.id)) {
        this.fieldsForDelete.push(item);
        if (this.fieldsForDelete.length > 1) { this.EnableDelete = true; }
      } else {
        indexNum = this.fieldsForDelete.findIndex((element) => {
          return (element.id === item.id);
        });
        this.fieldsForDelete.splice(indexNum, 1);
      }
      if(this.editF && this.editF.id === item.id) this.editF = null
    }
    else
    this.editF = item;
    if (this.header_button == 'insertField' || this.header_button == 'saveFile') {
      if (this.editF) {
        $("#" + this.editF.id + "-input").attr("tabindex", 1).focus();
        $("#" + this.editF.id + "-input").resizable();
      }
      this.openChat = false
      this.fieldIndex = index;
      var f = item;
      if (this.editF && this.editF.type == 'date') {
        setTimeout(() => {
          $(".date-clear").hide();
          $("." + f.pickerType + "-picker-dropdown").show();
          if (f.pickerType == 'date') {
            f.pickerT = 'calendar';
            f.dateformats = 'dd/MM/yyyy';
            f.timeformats, f.dateTimeformats = '';
          }
          else if (f.pickerType == 'time') {
            f.pickerT = 'timer';
            f.timeformats = 'hh:mm a';
            f.dateformats, f.dateTimeformats = '';
          }
          else {
            f.pickerT = 'both';
            f.dateTimeformats = 'dd/MM/yyyy hh:mm';
            f.dateformats, f.timeformats = '';
          }
          console.log(f)
        }, 10);
      }
      this.RecipientMails();
    }
  };
  //field highlight on focusing
  focusfield(item) {
    if (item.type && item.restrict != 'readonly' && !item.insertedemail && (!item.people || item.people == this.profiledata.email)) {
      $("#" + item.id + "-input").attr("tabindex", 1).focus();
      $("#" + item.id + "-input").addClass("focuscolor");
    }
  }
  /**
   * Function name : deleteField
   * Input : {json} field
   * Output : {array}  fields
   * Desc : To delete field from field array
   */
  deleteField = function (editF,title) {
    if(title == 'single'){
      this.fields.forEach((element, index) => {
        if (element.id == editF.id)
          this.fields.splice(index, 1)
      });
      this.closeEditform()
    }
    else if(title == 'multi'){
      let dialogRef = this.dialog.open(CommonDialogComponent, { data: { name: 'DeleteTemplate', content: "You want to delete the Selected Fields." }, width: '500px', panelClass: "deletemod" });
      dialogRef.afterClosed().subscribe(res => {
        if (res == 'DeletedTemplate') {
          var temp = JSON.parse(JSON.stringify(this.fieldsForDelete))
          temp.forEach((element, index) => {
            var i  = this.fields.findIndex(element1 => element1.id === element.id)
              console.log(element,index)
              this.fieldsForDelete=[]
              this.fields.splice(i, 1)    
          });
        }else{
          this.fieldsForDelete=[]
        }
      });
    }
    
  };

  clearOptionsArray(data, index) {
    this.editF.optionvalue.splice(index, 1)
  }
  /**
   * Function name : saveFieldSettings
   * Input : {array} field
   * Output : {json}  fields
   * Desc : Save Field Settings By clicking the save changes
   */
  saveFieldSettings = function (configField, editF) {
    if (editF.type == 'radiobutton' || editF.type == 'dropdown' && editF.opt != undefined && !editF.radiobuttondisplay) {
      var options = []
      options = this.editF.optionvalue ? this.editF.optionvalue : []
      editF.opt = editF.opt.split(',')
      this.editF.optionvalue = editF.opt
    }
    if (editF.restrict == "required") editF.required = true;
    else if (editF.restrict == "hidden") editF.hidden = true;
    else if (editF.restrict == "readonly") editF.readonly = true;
    this.documentService.openSnackBar("Saved Changes!", 'X')
  };
  /**
   * Function name : saveFile
   * Input : {array} field
   * Output : {array}  fields
   * Desc : To check previous fields and current fields changes
   */
  saveFile = async function (title) {
    return new Promise(async (resolve, reject) => {
      this.isloading = true
      this.isFileSaved = false
      if (this.zoomVal != 1) this.pdfZoomreset();
      if (!await this.isEqual(this.fields, this.oldFieldData)) {
        var saveRes = await this.canSave();
        if (saveRes) {
          this.LoadFieldConfig()
          await this.savefileFun();
          this.isloading = true;
          await this.documentFieldDataGetting();
          this.isloading = false;
          this.isFileSaved = true
          resolve(true)
        }
        else {
          this.documentService.openSnackBar("You can't save the changes on this file because, some one already submited their details", "X")
          this.isloading = false;
          this.isFileSaved = true
          resolve(true)
        }
      }
      else {
        this.isloading = false;
        this.isFileSaved = true
        resolve(true)
        if (title == 'fromsave')
          this.documentService.openSnackBar("No changes found to save the file.", "X")
      }
      this.closeEditform();
    });
  }
  // ipad modal open when double click
  openmodels(e, id, fileid) {
    var time2 = e.timeStamp;
    var time1 = e.currentTarget.dataset.lastTouch || time2;
    var dt = time2 - time1;
    var fingers = e.touches.length;
    e.currentTarget.dataset.lastTouch = time2;
    this.hidesettings = true
    if (!dt || dt > 500 || fingers > 1) return; // not double-tap
    else {
      this.hidesettings = false
      this.openModel(id, fileid)
    }
    e.preventDefault();
    e.target.click();
  }
  // To open insert field menu in mobile
  showpanel() {
    this.hidesettings = true
  }
  // ipad select versions while double click
  selectversions(e, versionData) {
    var time2 = e.timeStamp;
    var time1 = e.currentTarget.dataset.lastTouch || time2;
    var dt = time2 - time1;
    var fingers = e.touches.length;
    e.currentTarget.dataset.lastTouch = time2;
    if (!dt || dt > 500 || fingers > 1) return; // not double-tap
    else {
      this.currentVersionDoc(versionData)
    }
    e.preventDefault();
    e.target.click();
  }
  /**
   * Function name : LoadFieldConfig
   * Input : {array} field
   * Output : {array}  fields
   * Desc : Update filed hight, width, top, left  to validate 
   */
  LoadFieldConfig() {
    var i = 0;
    this.fields.forEach(element => {
      if (element.type == 'email') element.pattern = element.pattern.toString()
    });
    this.Updatedfields = JSON.parse(JSON.stringify(this.fields));
    for (let field of this.Updatedfields) {
      var m = 0;
      this.PDFheights.forEach(page => {
        m++;
        if (page.start <= field.top && page.end+10 >= field.top) {
          field.pageNo = m++;
          field.pageHeight = page.end - page.start;
          field.pageFieldHeight = field.top - page.start;
          field.pageWidth = $(".page:first").width();
        }
      });
      if (field && field.type && (field.type == 'signature' || field.type == 'initial' || field.type == 'Photo' || field.type == 'Stamp' || (field.type == 'label' && field.placeholder == "label"))) {
        var div = $("#" + field.id + '-input');
        field['css-font-size'] = div.css('font-size')
      }
      $("#" + field.id).parent(".editMode").css("transform", '');
      if (field.signatureId || field.photoId || field.stampId || (field.value && field.value != '')) {
        field.insertedemail = this.profiledata.email
        field.ownerField = true
      }
      else {
        field.insertedemail = undefined
      field.ownerField = false
      }

      i++;
    }
    return this.Updatedfields;
  }
  /**
    * Function name : savefileFun
    * Input : {json} field
    * Output : {json}  field
    * Desc : save fileds in filedoption collection 
    */
  savefileFun = function () {
    return new Promise(async (resolve, reject) => {
      if (!this.Updatedfields.find(x => (x.type == 'email' || x.type == 'mobilenumber') && !x.fieldvalidationCheck)) {
        // Adding new Version
        await this.documentService.saveVersion({ documentid: this._id, versionname: new Date().toLocaleString([], { hour12: true }) }).subscribe(async versionData => {
          if (this.selectedDoc) {
            //Update Version ID on Document File
            var newDoc = JSON.parse(JSON.stringify(this.selectedDoc))
            newDoc.versionid = versionData._id;
            this.documentService.updatefolder(newDoc).subscribe(async data => {
              // Insert Fields on field options 
              var finalData = { fields: this.Updatedfields, documentid: this._id, versionid: versionData._id }
              await this.documentService.saveFieldOptions(finalData).subscribe(async data => {
                this.documentService.openSnackBar("Saved Successfully", "X")
                this.isloading = false
                this.isTemplateSelected = false
                resolve(true);
              });
            })
          }
          else {
            this.documentService.openSnackBar("Not Saved", "X")
            this.isloading = false
            this.isTemplateSelected = false
          }
        })
      }
      else {
        this.isloading = false
        this.isTemplateSelected = false
        this.disableShareButton=false
        let dialogopem = this.dialog.open(CommonDialogComponent, { data: { title: 'dependency', name: 'dependency', content: "Unable To submit data due to invalid data Entered" }, width: '500px', panelClass: 'deletemod', disableClose: false });
      }
    })
  }
  
  /**
   * Function name : savetemplate
   * Input : {json} field
   * Output : {json}  field
   * Desc : Save as new template 
   */
  savetemplate = async function (templatename) {
    if (templatename) {
      if (this.zoomVal != 1) this.pdfZoomreset();
      for (let field of this.fields) {
        if (parseInt($("#" + field.id + "-input").css('border-left-width'))) {
          field.height = $("#" + field.id + '-input').height() + (2 * parseInt($("#" + field.id + "-input").css('border-left-width'))) + parseInt($("#" + field.id + "-input").css('padding-top')) + parseInt($("#" + field.id + "-input").css('padding-bottom'));
          field.width = $("#" + field.id + '-input').width() + (2 * parseInt($("#" + field.id + "-input").css('border-left-width'))) + +parseInt($("#" + field.id + "-input").css('padding-left')) + parseInt($("#" + field.id + "-input").css('padding-right'));
        }
        else if (parseInt($("#" + field.id + "-input").css('border-left-width')) && (/Edge\/\d./i.test(navigator.userAgent) || (!!(window as any).MSInputMethodContext && !!(document as any).documentMode))) {
          field.height = $("#" + field.id + '-input').height()
          field.width = $("#" + field.id + '-input').width()
        }
      }
      var saveRes = await this.canSave();
      if (saveRes) {
        let templatecheck = this.templates.some(temp => temp.templatename.toLowerCase().trim() === templatename.toLowerCase().trim())
        if (!templatecheck) {
          this.templateNameSave(templatename);
        } else {
          document.getElementById('savetempclose').click()
          this.templatename = templatename;
          this.RenameTemplate(templatename, [], 'save')
        }
      }
      else this.documentService.openSnackBar("You can't save template because, someone already submitted their details", "X")
    } else this.documentService.openSnackBar("Enter Template name", "X")
  }

  /**
    * Function name : edittemplate
    * Input : {json} templatedata
    * Output : {json}  templatedata
    * Desc : editing /deleting the template
    */
   edittemplate(data, title) {
    if (title == 'delete') {
      if (this.buttonhide != data._id) this.templateedit = false;
      this.selectedTemplateId = data._id;
      data.istemplate = false
      let dialogRef = this.dialog.open(CommonDialogComponent, { data: { name: 'DeleteTemplate', content: "You want to delete the Template." }, width: '500px', panelClass: "deletemod" });
      dialogRef.afterClosed().subscribe(res => {
        if (res == 'DeletedTemplate') {
          var index = this.templates.findIndex(x => x._id == data._id)
          if (index >= 0) {
            this.templates.splice(index, 1)
            this.documentService.edittemplate(data).subscribe((data: any) => {
              this.templateedit = false;
              this.getTemplate();
            });
            this.documentService.openSnackBar("Template has been deleted Successfully.", "X");
          }
        }
      });
    }
    if (data.templatename == "") this.documentService.openSnackBar("Enter Template Name", "X")
    if (data.templatename != "" && title == 'edit') {
      this.templateedit = false;
      let templatecheck = this.templates.some(temp => temp.templatename.toLowerCase().trim() === data.templatename.toLowerCase().trim())
      if (!templatecheck) {
        this.isloading = true;
        this.EditNameSave(data);
      } else {
        this.RenameTemplate(data.templatename, data, 'edit')
      }
    }
  }

  /**
  * Function name : RenameTemplate
  * Input : template name
  * Output : Existense status with changed name, if any
  * Desc : Checking availability for the same template name
  */
  RenameTemplate(name, data, type) {
    let count = 0
    let resultFileName
    var alltemplates=this.templates.slice(0)
    var index = alltemplates.findIndex(x => x._id == data._id)
    alltemplates.splice(index, 1)
    do {
      count++;
      resultFileName = name + '(' + count + ')'
      let isMatch = false
      for (let j = 0; j < alltemplates.length; j++) {
        if ((alltemplates[j] && (alltemplates[j].templatename.trim().toLowerCase() === resultFileName.toLowerCase()))) {
          isMatch = true;
          break;
        }
      }
      if (!isMatch)
        break;
    } while (alltemplates.length + 1 >= count)
    if (type === 'edit') {
      data.templatename = resultFileName;
      let dialogRef = this.dialog.open(CommonDialogComponent, { data: { name: 'TemplateRename', newName: resultFileName }, disableClose: false, width: '500px', panelClass: "deletemod" });
      dialogRef.afterClosed().subscribe(res => {
        if (res) {
          this.isloading = true;
          this.EditNameSave(data);
        } else { }
      })
    } else if (type === 'save') {
      let dialogRef = this.dialog.open(CommonDialogComponent, { data: { name: 'TemplateRename' }, disableClose: false, width: '500px', panelClass: "deletemod" });
      dialogRef.afterClosed().subscribe(res => {
      this.templateSave = false;
        if (res) {
          this.templateNameSave(resultFileName);
        } else {
          document.getElementById('saveastemplate').click()
          this.templatebtn = true;
         }
      })
    }

  }

  /**
 * Function name : EditNameSave
 * Input : templatename
 * Output : Template updation
 * Desc : Name update
 */
  EditNameSave(data) {
    this.documentService.edittemplate(data).subscribe((data: any) => {
      this.documentService.gettempltes().subscribe((tempData: any) => {
      this.templateSave = false
        this.templates = tempData;
        this.templateedit = false;
        this.isloading = false;
        this.documentService.openSnackBar("Template Updated Successfully", "X");
      });
    });
  }

  /**
  * Function name : templateNameSave
  * Input : templatename
  * Output : Template creation
  * Desc : Save as new template 
  */
  templateNameSave(templatename) {
    this.LoadFieldConfig()
    var finalData = { istemplate: true, templatename: templatename, fields: this.Updatedfields, encryptedid: this.selectedDoc.encryptedid, documentid: this._id, pageNo: this.pdf.numPages }
    this.documentService.saveFieldOptions(finalData).subscribe(data => {
      this.templateSave = false
      this.templatebtn = false
      this.templateShowbtn = false
      this.templatename = null;
      this.templateMsg = "Template Saved Successfully";
      this.GetListOftemplates()
      document.getElementById('savetempclose').click()
      document.getElementById('callpopup').click()
    });
  }

  /**
    * Function name : overridetemplate
    * Input : {json} field
    * Output : {json}  field
    * Desc : overriding the template
    */
  overridetemplate = async function (data) {
    if (this.zoomVal != 1) this.pdfZoomreset();
    for (let field of this.fields) {
      if (parseInt($("#" + field.id + "-input").css('border-left-width'))) {
        field.height = $("#" + field.id + '-input').height() + (2 * parseInt($("#" + field.id + "-input").css('border-left-width'))) + parseInt($("#" + field.id + "-input").css('padding-top')) + parseInt($("#" + field.id + "-input").css('padding-bottom'));
        field.width = $("#" + field.id + '-input').width() + (2 * parseInt($("#" + field.id + "-input").css('border-left-width'))) + +parseInt($("#" + field.id + "-input").css('padding-left')) + parseInt($("#" + field.id + "-input").css('padding-right'));
      }
      else if (parseInt($("#" + field.id + "-input").css('border-left-width')) && (/Edge\/\d./i.test(navigator.userAgent) || (!!(window as any).MSInputMethodContext && !!(document as any).documentMode))) {
        field.height = $("#" + field.id + '-input').height()
        field.width = $("#" + field.id + '-input').width()
      }
    }
    var saveRes = await this.canSave();
    if (saveRes) {
      console.log(saveRes)
      this.LoadFieldConfig()
      data.fields = this.Updatedfields
      var datas = { fields: this.Updatedfields, _id: data._id }
      this.documentService.overridetemplate(datas).subscribe((data: any) => {
        if (data) {
          this.overwritebtn = false
          this.templateMsg = "Template Overrided Successfully";
          document.getElementById("templatemodel").click();
          document.getElementById("savetempclose").click();
          document.getElementById('callpopup').click();
          document.getElementById("templatemodelclose").click();
        }
      });
    }
  }

  /**
    * Function name : canSave
    * Input : {String} fileid
    * Output : {boolean}  true/false
    * Desc : To check whether we have to save file or not
    */
  canSave() {
    return new Promise(async (resolve, reject) => {
      this.documentService.getCurVerSharedPeopleList({ documentid: this.selectedDoc._id }).subscribe(async (sharedPeopleList: any) => {
        if (sharedPeopleList.length) {
          var currentFieldVal = sharedPeopleList.filter(sharedPeople => sharedPeople.signed)
          if (currentFieldVal.length) resolve(false)
          else resolve(true)
        }
        else resolve(true)
      });
    })
  }
  /**
    * Function name : shareFile
    * Desc : call sharedemails and call savefile
    */
  shareFile = async function () {
    this.isloading = true;
    this.disableShareButton = true;
    this.RecipientMails()
    await this.saveFile('fromshare')
    this.isloading = false
    this.sharingDialog()
  }
  /**
    * Function name : EditSharedEmail
    * Input : {json} sharedrecord of selected user
    * Output : {json} updated shared user data
    * Desc : To update shared user data
    */
  EditSharedEmail(sharingrecord) {
    if (this.profiledata.type == 'individual' || (sharingrecord && sharingrecord.toid && sharingrecord.toid.type == 'individual')
      || (this.profiledata.type == 'employee' && !sharingrecord.organizationShare) || ((sharingrecord && sharingrecord.toid && sharingrecord.toid.type == 'employee') && !sharingrecord.organizationShare)) {
      const filedialog = this.dialog.open(SharepopupComponent, {
        width: '900px',
        height: '630px',
        disableClose: false,
        autoFocus: true,
        panelClass: 'test',
        data: { content: this.selectedDoc, emails: [], text: 'owner', title: "Signature", SharedRecordEdit: sharingrecord }
      });
      filedialog.afterClosed().subscribe(async result => {
        if (result == true || result == false || (result && !result.type)) {
          this.recepients = true
          this.sharebutton = true
          this.isloading = true
          if (result) {
            this.isloading = false
          }
          else {
            this.isloading = false;
          }
        }
        else{
          if(result.type && result.type=='dependency'){
            var field = this.fields.find(x => x.id == result.field);
            var index = this.fields.findIndex(x => x.id == result.field);
            this.buttonActive('insertField');
            this.openChat = false;
            this.savebutton = true;
            this.shareform = true;
            this.editField(field, index, null);
            this.showpanel();
            this.ref.detectChanges();
          }
        }
      });
    }
    else {
      const filedialog = this.dialog.open(OrganizationFileSharingComponent, {
        width: '900px',
        disableClose: false,
        autoFocus: false,
        panelClass: 'orgn',
        data: { content: this.selectedDoc, emails: [], text: 'owner', title: "Signature", SharedRecordEdit: sharingrecord }
      });
      filedialog.afterClosed().subscribe(async result => {
        if (result == true || result == false || result) {
          this.recepients = true
          this.sharebutton = true
          this.isloading = true
          if (result) {
            this.isloading = false
            this.header_button = 'review'
          }
          else {
            this.isloading = false;
          }
        }
      });
    }
  }
  /**
     * Function name : EditSharedEmail
     * Input : {json} sharedrecord of selected user
     * Output : {json} updated shared user data
     * Desc : Revoke the shared email
     */
  revokeFun(i) {
    if (i.revoke) {
      var revokeStatus = 'Un Revoke'
    }
    else {
      var revokeStatus = 'Revoke'
    }
    var content = 'Are you sure?, You want to ' + revokeStatus + ' the Sharing.'
    if (content) {
      var contentdata = []
      contentdata = content.split(',')
    }
    let dialogRef = this.dialog.open(CommonDialogComponent,
      { data: { name: 'fields', cancel: true, content: contentdata[0], data: contentdata[1] }, width: '500px', panelClass: "deletemod" });
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
      i.revokeStatus = revokeStatus
        i.revoke = !i.revoke
        this.documentService.sharingupdate(i).subscribe(data => {
          this.documentService.openSnackBar("Changes are updated", "X");
        })
      }
    });
  }
  /**
     * Function name : RemoveShareduser
     * Input : {json} sharedrecord of selected user
     * Output : {json} updated shared user data
     * Desc : Remove the Shared user
     */
  RemoveShareduser(doc) {
    var deleteDoc = true;
    let dependDoc = false
    if (this.oldFieldData.some(x => x.people == doc.toemail)) deleteDoc = false;
    if (this.oldFieldData.some(x => x.dependency === doc.toemail)) { dependDoc = true; }
    if (dependDoc) {
      let username = doc.toemail;
      if (doc.toid && doc.toid.type && doc.toid.type == "individual") username = doc.toid.name;
      else if (doc.toid && doc.toid.type && doc.toid.type == 'organisation') username = doc.toid.companyname;
      else if (doc.toid && doc.toid.type && doc.toid.type == 'employee') username = doc.toid.fname + ' ' + doc.toid.lname;
      else { username = doc.toemail.split('@')[0]; }
      const dialogRef22 = this.dialog.open(CommonDialogComponent,
        {
          data: { name: 'fields', cancel: false, content: username + ' have dependency with field(s), to check with field(s), click below ' },
          width: '500px', panelClass: 'deletemod', disableClose: false
        });
      dialogRef22.afterClosed().subscribe(res1 => {
        var field = this.oldFieldData.find(x => x.dependency == doc.toemail)
        if (res1) {
          dialogRef22.close(false);
          var field = this.fields.find(x => x.id == field.id);
          var index = this.fields.findIndex(x => x.id == field.id);
          this.buttonActive('insertField');
          this.openChat = false;
          this.savebutton = true;
          this.shareform = true;
          this.editField(field, index, null);
          this.showpanel();
          this.ref.detectChanges();

        }


      });

    }
    else if (!deleteDoc && !doc.revoke) {
      let username = doc.toemail;
      if (doc.toid && doc.toid.type && doc.toid.type == "individual") username = doc.toid.name;
      else if (doc.toid && doc.toid.type && doc.toid.type == 'organisation') username = doc.toid.companyname;
      else if (doc.toid && doc.toid.type && doc.toid.type == 'employee') username = doc.toid.fname + ' ' + doc.toid.lname;
      else { username = doc.toemail.split('@')[0]; }
      let dialogRef22 = this.dialog.open(CommonDialogComponent,
        { data: { name: 'fields', cancel: false, content: username + " has assigned with field, you can't delete it." }, width: '500px', panelClass: "deletemod" });
      dialogRef22.afterClosed().subscribe(res1 => {
        dialogRef22.close();
      });
    }
    else {
      const ConfirmationDiaBox = this.dialog.open(CommonDialogComponent,
        { data: { name: 'delete1' }, width: '500px', panelClass: 'deletemod' });
      ConfirmationDiaBox.afterClosed().subscribe(result => {
        if (result) {
          this.sharedemails.splice(this.sharedemails.indexOf(doc), 1);
          let completedEmails = this.sharedemails.filter(email => ((email.signed && email.reviewed) || (email.signed && !email.view) || (email.reviewed && email.view)));
          if (this.sharedemails.length == 0) {
            this.selectedDoc.status = 'upload'
          } else if (completedEmails.length === this.sharedemails.length) {
            this.selectedDoc.status = 'Completed'
          } else if (completedEmails.length !== 0 && completedEmails.length < this.sharedemails.length) {
            this.selectedDoc.status = 'Partially completed'
          } else if (completedEmails.length === 0) {
            this.selectedDoc.status = 'Waiting for Sign'
          }
          this.documentService.RemoveShareduser(doc).subscribe(data => {
            this.documentService.openSnackBar("Shared email removed the access on document", "X");
            this.documentService.updatefolder(this.selectedDoc).subscribe(resp => {
            })
          });
        }
      });
    }
  }
  /**
     * Function name : sharingDialog
     * Input : {String} user type
     * Output :open sharing dialog
     * Desc : open sharing dialog based on user type
     */
  sharingDialog() {
    this.documentService.getSelectedDoc(this._id,'Allowusers').subscribe((data: any) => {
      var doc = data
      // if(data.uid == this.profiledata._id)
      this.selectedDoc = data
      this.disableShareButton = false;
      if (doc && doc._id) {
        if (this.profiledata.type == 'individual') {
          const filedialog = this.dialog.open(SharepopupComponent, {
            width: '900px',
            height: '630px',
            disableClose: false,
            autoFocus: true,
            panelClass: 'test',
            data: { content: this.selectedDoc, emails: this.emailarray, text: 'owner', title: "Signature" }
          });
          filedialog.afterClosed().subscribe(async result => {
            if (result == true || result == false || (result && !result.type)) {
              this.recepients = true
              this.sharebutton = true
              this.isloading = true
              await this.documentFieldDataGetting();
              if (result) {
                this.isloading = false
                this.header_button = 'review'
              }
              else {
                this.isloading = false;
              }
            }
            else{
              if(result.type && result.type=="dependency"){ 
                var field = this.fields.find(x => x.id == result.field);
                var index = this.fields.findIndex(x => x.id == result.field);
                this.buttonActive('insertField');
                this.openChat = false;
                this.savebutton = true;
                this.shareform = true;
                this.editField(field, index, null);
                this.showpanel();
                this.ref.detectChanges();
              }
            }
          });
        }
        else {
          const filedialog = this.dialog.open(OrganizationFileSharingComponent, {
            width: '900px',
            disableClose: false,
            autoFocus: false,
            panelClass: 'orgn',
            data: { content: this.selectedDoc, emails: this.emailarray, text: 'owner', title: "Signature" }
          });
          filedialog.afterClosed().subscribe(async result => {
            if (result == true || result == false || result) {
              this.recepients = true
              this.sharebutton = true
              this.isloading = true
              await this.documentFieldDataGetting();
              if (result) {
                this.isloading = false
                this.header_button = 'review'
              }
              else {
                this.isloading = false;
              }
            }
          });
        }
      }
      else {
        this.recepients = true
        this.sharebutton = true
        this.documentService.openSnackBar("Not shared", "X")
      }
    });
  }

  //Drag functions 
  bindFunction() {
    setTimeout(function () {
      $(".field").unbind('mouseover');
      $(".field").unbind('mouseout');
      $(".field").bind('mouseover', function () {
        $(this).find("img.drag-icon").show();
      });
      $(".field").bind('mouseout', function () {
        $(this).find("img.drag-icon").hide();
      });
    }, 1000)
  }
  /**
     * Function name : val
     * Input : {json} event
     * Output :add fields to file
     * Desc : insert fields based on type
     */
  val(e) {
    this.getpdfSizes();
    console.log($("#doc-view").scrollLeft(), this.PdfLeftNosideBar, this.PdfLeft)
    this.filteredOptions = this.formControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filteremailcheck(value))
    );
    this.filteredOptionsForDependency = this.formControlForDependency.valueChanges.pipe(startWith(''), map(value => this._filteremailcheckForDependency(value)));

    if (this.setF != '') {
      var left
      var pattern, fieldvalidationCheck
      if (this.setF == 'email') {
        pattern = /([A-Za-z]|[0-9])[A-Za-z0-9.]+[A-Za-z0-9]@((?:[-a-z0-9]+\.)+[a-z]{2,})$/
        fieldvalidationCheck = true
      }
      else if (this.setF == 'mobilenumber') {
        pattern = "(([+][(]?[0-9]{1,3}[)]?)|([(]?[0-9]{4}[)]?))\s*[)]?[-\s\.]?[(]?[0-9]{1,3}[)]?([-\s\.]?[0-9]{3})([-\s\.]?[0-9]{2,4})"
        fieldvalidationCheck = true
      }
      else
        pattern = null
      if (this.PdfLeft < 0 && this.PdfLeftNosideBar < 0)
        left = e.pageX + $("#doc-view").scrollLeft() - $('#docsidebar').outerWidth(true);
      else if (this.PdfLeft > 0 && this.PdfLeftNosideBar < 0)
        left = e.pageX - this.PdfLeft + $("#doc-view").scrollLeft() + this.PdfLeftNosideBar
      else if (this.PdfLeftNosideBar > 0)
        left = e.pageX - this.PdfLeft + $("#doc-view").scrollLeft() - 0;
      else
        left = e.pageX + $("#doc-view").scrollLeft() - $('#docsidebar').outerWidth(true) + this.PdfLeftNosideBar;
      var top = e.pageY - this.PdfTop + this.PdfTopScroll;
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
    
      var originalLeft = left;//e.pageX - this.PdfLeft;
      var pw = $(".page:first").width() - 8
      var m = 0;
      var pageNo = 0;
      console.log(this.PDFheights,top)
      this.PDFheights.forEach(page => {
        m++;
        if (page.start <= top && page.end+10 >= top) {
          pageNo = m++;
         
        }
      });
      if (this.setF == 'signature' || this.setF == 'initial' || this.setF == 'Stamp') {
        var width = (this.PdfWidth / 100) * 20
        var height = (this.PdfHeight / 100) * 5
        if (((originalLeft + width) > pw)) {
          if ((/Edge\/\d./i.test(navigator.userAgent) || (!!(window as any).MSInputMethodContext && !!(document as any).documentMode))) var diff = originalLeft + width - $(".page:first").width() + 8.5;
          else var diff = originalLeft + width - $(".page:first").width() + 5;
          left = left - diff;
        }
        if ((top + height > this.PDFheights[pageNo - 1].end)) {
          top = this.PDFheights[pageNo - 1].end - height
        }
        else if(top < this.PDFheights[pageNo-1].start) {
          top = this.PDFheights[pageNo-1].start
        }
        var field = { type: this.setF, pageNo :pageNo,id: this._id + '-' + Math.floor(100000 + Math.random() * 900000), left: left, top: top, class: 'field', emailvalid: true,dependencyEmailerror:true, width: width, height: height, align: 'center' };
        this.fields.push(field);
      }
      else if (this.setF == 'Photo') {
        var width = (this.PdfWidth / 100) * 20
        var height = (this.PdfHeight / 100) * 14
        if ((originalLeft + width) > pw) {
          if ((/Edge\/\d./i.test(navigator.userAgent) || (!!(window as any).MSInputMethodContext && !!(document as any).documentMode))) var diff = originalLeft + width - $(".page:first").width() + 8.5
          else var diff = originalLeft + width - $(".page:first").width() + 5
          left = left - diff;
        }
        if ((top + height > this.PDFheights[pageNo - 1].end)) {
          top = this.PDFheights[pageNo - 1].end - height
        }
        else if(top < this.PDFheights[pageNo-1].start) {
          top = this.PDFheights[pageNo-1].start
        }
        this.fields.push({ type: this.setF, pageNo :pageNo,id: this._id + '-' + Math.floor(100000 + Math.random() * 900000), left: left, top: top, class: 'field', emailvalid: true,dependencyEmailerror:true, width: width, height: height, align: 'center' });
      } else if (this.setF == 'radiobutton' || this.setF == 'dropdown') {
        var width = (this.PdfWidth / 100) * 20
        var placeholder
        if (this.setF == 'dropdown'){
           placeholder = "Please select"
          height = (this.PdfHeight / 100) * 3
        } 
        else if (this.setF == 'radiobutton') {
          var height = (this.PdfHeight / 100) * 3
           placeholder = null
        }
        if ((originalLeft + width) > pw) {
          if ((/Edge\/\d./i.test(navigator.userAgent) || (!!(window as any).MSInputMethodContext && !!(document as any).documentMode))) var diff = originalLeft + width - $(".page:first").width() + 8.5
          else var diff = originalLeft + width - $(".page:first").width() + 5
          left = left - diff;
        }
        if ((top + height > this.PDFheights[pageNo - 1].end)) {
          top = this.PDFheights[pageNo - 1].end - height
        }
        else if(top < this.PDFheights[pageNo-1].start) {
          top = this.PDFheights[pageNo-1].start
        }
        var option = 'first,second'
        var optionvalue = option.split(',')
        this.fields.push({ type: this.setF,pageNo :pageNo, id: this._id + '-' + Math.floor(100000 + Math.random() * 900000), left: left, top: top, class: 'field', emailvalid: true,dependencyEmailerror:true, opt: 'first,second', optionvalue: optionvalue, width: width, height: height, 'css-font-size': '16px', 'css-font-family': 'Arial', placeholder: placeholder });
        if (this.setF == 'radiobutton') this.fields[this.fields.length - 1].radiobuttondisplay = 'side by side'
      }
      else if (this.setF == 'date') {
        var width = (this.PdfWidth / 100) * 22
        var height = (this.PdfHeight / 100) * 3
        if ((originalLeft + width) > pw) {
          if ((/Edge\/\d./i.test(navigator.userAgent) || (!!(window as any).MSInputMethodContext && !!(document as any).documentMode))) var diff = originalLeft + width - $(".page:first").width() + 8.5
          else var diff = originalLeft + width - $(".page:first").width() + 5
          left = left - diff;
        }
        if ((top + height > this.PDFheights[pageNo - 1].end)) {
          top = this.PDFheights[pageNo - 1].end - height
        }
        else if(top < this.PDFheights[pageNo-1].start) {
          top = this.PDFheights[pageNo-1].start
        }
        this.fields.push({ type: this.setF,pageNo :pageNo, id: this._id + '-' + Math.floor(100000 + Math.random() * 900000), left: left, top: top, class: 'field', emailvalid: true,dependencyEmailerror:true, width: width, height: height, pickerType: 'date', pickerT: 'calendar', dateacess: 'Edit', dateformats: 'dd/MM/yyyy', timeformats: 'hh:mm:ss', dateTimeformats: 'dd/MM/yyyy hh:mm', 'css-font-family': 'Arial', 'css-font-size': '16px', 'css-color': '#201d1d', align: 'left' });
      }
      else if (this.setF == 'checkbox') {
        var width = (this.PdfWidth / 100) * 13
        var height = (this.PdfHeight / 100) * (2.6)
        if ((originalLeft + width) > pw) {
          if ((/Edge\/\d./i.test(navigator.userAgent) || (!!(window as any).MSInputMethodContext && !!(document as any).documentMode)))
            var diff = originalLeft + width - $(".page:first").width() + 8.5
          else
            var diff = originalLeft + width - $(".page:first").width() + 4
          left = left - diff;
        }
        if ((top + height > this.PDFheights[pageNo - 1].end)) {
          top = this.PDFheights[pageNo - 1].end - height
        }
        else if(top < this.PDFheights[pageNo-1].start) {
          top = this.PDFheights[pageNo-1].start
        }
        this.fields.push({ type: this.setF, pageNo :pageNo,id: this._id + '-' + Math.floor(100000 + Math.random() * 900000), left: left, top: top, class: 'field', emailvalid: true,dependencyEmailerror:true, width: width, height: height });
      }
      else if (this.setF == 'label') {
        var width = (this.PdfWidth / 100) * 20
        var height = (this.PdfHeight / 100) * 3
        if ((originalLeft + width) > pw) {
          if ((/Edge\/\d./i.test(navigator.userAgent) || (!!(window as any).MSInputMethodContext && !!(document as any).documentMode)))
            var diff = originalLeft + width - $(".page:first").width() + 8.5
          else
            var diff = originalLeft + width - $(".page:first").width() + 4
          left = left - diff;
        }
        if ((top + height > this.PDFheights[pageNo - 1].end)) {
          top = this.PDFheights[pageNo - 1].end - height
        }
        else if(top < this.PDFheights[pageNo-1].start) {
          top = this.PDFheights[pageNo-1].start
        }
        this.fields.push({ type: this.setF,pageNo :pageNo, id: this._id + '-' + Math.floor(100000 + Math.random() * 900000), left: left, top: top, class: 'field', emailvalid: true,dependencyEmailerror:true, width: width, height: height, valueDecr: false, 'css-font-family': 'Arial', 'css-font-size': '16px', 'css-color': '#201d1d', placeholder: this.setF, pattern: pattern, fieldvalidationCheck: fieldvalidationCheck, align: 'left' });
      }
      else {
        console.log((this.PdfWidth / 100) * 20)
        var width = (this.PdfWidth / 100) * 20
        var height = (this.PdfHeight / 100) * 3
        if ((originalLeft + width) > pw) {
          if ((/Edge\/\d./i.test(navigator.userAgent) || (!!(window as any).MSInputMethodContext && !!(document as any).documentMode)))
            var diff = originalLeft + width - $(".page:first").width() + 8.5
          else
            var diff = originalLeft + width - $(".page:first").width() + 5
          left = left - diff;
        }
        if ((top + height > this.PDFheights[pageNo - 1].end)) {
          top = this.PDFheights[pageNo - 1].end - height
        }
        else if(top < this.PDFheights[pageNo-1].start) {
          top = this.PDFheights[pageNo-1].start
        }
        this.fields.push({ type: this.setF, pageNo :pageNo,id: this._id + '-' + Math.floor(100000 + Math.random() * 900000), left: left, top: top, class: 'field', emailvalid: true,dependencyEmailerror:true, width: width, height: height, valueDecr: false, 'css-font-family': 'Arial', 'css-font-size': '16px', 'css-color': '#201d1d', placeholder: this.setF, pattern: pattern, fieldvalidationCheck: fieldvalidationCheck, minlengtherror: false, heightincrease: true, align: 'left' });
      }
      this.bindFunction();
      this.setF = '';
      field = this.fields[this.fields.length - 1]
      setTimeout(() => {
        if (field.type) {
          this.editF = field
          console.log(this.editF)
          $("#" + field.id + "-input").attr("tabindex", 1).focus();
          $("#" + field.id + "-input").addClass("focuscolor");

        }
        this.onWindowPress(false, field.id, field)
        console.log("Timeout")
        if (field.type == 'date') this.assignRadio(field, 'pickerType')
      }, 10);
      $(".page").css("z-index", 8);
    }
    else {
      this.handleClick(e)
    }
  }

  // update the number in edit fields clicking on plus/minus button
  updateNumber(key, type) {
    if (typeof this.editF[key] == "undefined") this.editF[key] = 0;
    if (type == "plus") this.editF[key] = this.editF[key] + 1;
    else if (this.editF[key] > 0) this.editF[key] = this.editF[key] - 1;
  }
  // To get field left and top 
  setPosition(e, field) {
    document.getElementById(field.id).onmousedown = function (event) {
      let shiftX = event.clientX - document.getElementById(field.id).getBoundingClientRect().left;
      let shiftY = event.clientY - document.getElementById(field.id).getBoundingClientRect().top;
      moveAt(event.pageX, event.pageY);
      // centers the field at (pageX, pageY) coordinates
      function moveAt(pageX, pageY) {
        field.left = pageX - shiftX
        field.top = pageY - shiftY
      }
      function onMouseMove(event) {
        moveAt(event.pageX, event.pageY);
      }
      // (3) move the field on mousemove
      document.addEventListener('mousemove', onMouseMove);
      // (4) drop the field, remove unneeded handlers
      document.getElementById(field.id).onmouseup = function () {
        document.removeEventListener('mousemove', onMouseMove);
        document.getElementById(field.id).onmouseup = null;
        field.left -= document.getElementById('docsidebar').offsetWidth;
        field.top -= document.getElementById('docheader').offsetHeight;
      };
    };
  }
  // To set type
  setField(f) {
    this.setF = f;
    this.hideshareform = false
    $(".page").css("z-index", -1);
  }
  /**
  * Function name : assignRadio
  * Input : field,key
  * Output :date formats
  * Desc :Based on pickertype we can add formats
  */
  assignRadio(f, key) {
    if (f.type == 'date' && key == 'pickerType') {
      setTimeout(() => {
        $(".date-clear").hide();
        $("." + f.pickerType + "-picker-dropdown").show();
        if (f.pickerType == 'date') {
          f.pickerT = 'calendar';
          f.dateformats = 'dd/MM/yyyy';
          f.timeformats, f.dateTimeformats = '';
        }
        else if (f.pickerType == 'time') {
          f.pickerT = 'timer';
          f.timeformats = 'hh:mm a';
          f.dateformats, f.dateTimeformats = '';
        }
        else {
          f.pickerT = 'both';
          f.dateTimeformats = 'dd/MM/yyyy hh:mm';
          f.dateformats, f.timeformats = '';
        }
      }, 10);
    }
  }

  /**
 * Function name : onWindowPress
 * Input : field,fieldid
 * Output :field top and left 
 * Desc :Restrict fields resize and filed inserting in outof pdf
 */
onWindowPress(e:any, id, field) {
  
             
      if (this.header_button == 'insertField' || this.header_button == 'saveFile')
        $("#" + field.id + "-input").resizable(); 
      var w = $("#" + id + "-input").width();
      var h = $("#" + id + "-input").height();
      if (true) {
        var h = $("#" + id + "-input").height()
        var dw = $("#" + id).width();
        var dh = $("#" + id).height();
        if ((/Edge\/\d./i.test(navigator.userAgent) || (!!(window as any).MSInputMethodContext && !!(document as any).documentMode)))
          var PW = $(".page:first").width() - 12;
        else
          var PW = $(".page:first").width() - 8;
        var l = field.left + w;
        var t = field.top + h;
        var PH = $(".page:first").height()
        $("#" + id).width(w).height(h);
        clearInterval(this.interval);
        if (l > PW || (this.PDFheights.length && t > this.PDFheights[field.pageNo - 1].end)) {
          if(this.PDFheights.length && t > this.PDFheights[field.pageNo - 1].end)
           dh = $("#" + id + "-input").height()+(this.PDFheights[field.pageNo - 1].end-t)
           if(l > PW)
          dw =$("#" + id + "-input").width()+(PW-l)

          if (field.type == 'label' || field.type == 'signature' || field.type == 'initial' || field.type == 'Photo' || field.type == 'Stamp' || field.type == 'radiobutton' || field.type == 'dropdown' || field.type == 'checkbox') {
            $('#' + id + "-input").addClass('disableresize')   
            setTimeout(() => {
              if ($("#" + field.id + "-input").is('.ui-resizable')){
                $("#" + field.id + "-input").resizable('destroy');
              }
              this.ResetFieldFonts(field)
              if (field.type == 'checkbox')
                $("#" + field.id + "-input").children("input").width(dw).height(dh);
            }, 100);
            $('body').css('cursor', 'auto');
            $("#" + id + "-input").width(dw).height(dh);
            $("#" + id).width(dw).height(dh);
          }
          else if (field.type == 'text' || (field.type == 'name') || field.type == 'mobilenumber' || field.type == 'email' || field.type == 'company' || field.type == 'date') {
            console.log(dw,$("#" + id + "-input").width(),PW,l)
            setTimeout(() => {
              if ($("#" + field.id + "-input").is('.ui-resizable')){
                $("#" + field.id + "-input").resizable('destroy');
              }
              $('body').css('cursor', 'auto');
              $("#" + id + "-input").parents("div.field").width(dw);
              $("#" + id + "-input").parents("div.field").find("span.resizable-input").width(dw)
              $("#" + id + "-input").parent("span").width(dw).height(dh);
              $("#" + id + "-input").width(dw).height(dh);
              $("#" + id).width(dw).height(dh);
            }, 10);
            this.interval = setInterval(() => { $("#" + id + "-input").parent("span").width(dw); }, 1000)
          }
        } 
        else if(this.zoomVal === 1){
          var borderWidth = $("#" + field.id + "-input").css('border-right-width').replace('px','');
          var borderHeight = $("#" + field.id + "-input").css('border-left-width').replace('px','');
          if (parseInt($("#" + field.id + "-input").css('border-left-width'))) {
            field.height = $("#" + field.id ).height() + (2 *borderWidth) + parseInt($("#" + field.id + "-input").css('padding-top')) + parseInt($("#" + field.id + "-input").css('padding-bottom'));
            field.width = $("#" + field.id ).width() + (2 * borderWidth) + +parseInt($("#" + field.id + "-input").css('padding-left')) + parseInt($("#" + field.id + "-input").css('padding-right'));
          }
          else if (parseInt($("#" + field.id + "-input").css('border-left-width')) && (/Edge\/\d./i.test(navigator.userAgent) || (!!(window as any).MSInputMethodContext && !!(document as any).documentMode))) {
            field.height = $("#" + field.id + '-input').height()
            field.width = $("#" + field.id + '-input').width()
          }
          clearInterval(this.interval);
        }
        if (field.type == 'checkbox') $("#" + id + "-input").find("input").width(w).height(h)
      }
      else {
        $('#' + id + "-input").removeClass('disableresize')
      }
      this.callGlobalMouseMove = true;
      this.callGloablMouseDown = true
      this.ResetFieldFonts(field);
    }

  // Preview of signature from signature pad
  showImage(data) {
    if (this.signatureValidation && this.signatureValidation.length > 0) this.signatureImage = data;
    this.type = "signaturepad"
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
    }, 10);
    this.signature()
    this.signature()
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
  * Function name : onFileSelected
  * Input : event,title,signtype
  * Output :{String} 
  * Desc :Based on signtype change signtype variable value
  */
  async onFileSelected(fileInput: any, title: any, signtype) {
    console.log(fileInput, title)
    this.modelshow = true
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
    else if (title == "watermark") {
      this.type = "stampupload"
      this.filesToUpload = <Array<File>>this.imageFile.target.files;
      if(this.filesToUpload)
       this.waterMark.photo = await this.getBase64(this.filesToUpload[0]);
       console.log(this.waterMark.photo)
       this.waterMark.content = ' '
      if( this.waterMark.photo) this.loadWaterMark()

    }
  }

   getBase64= function async(file) {
    return new Promise(async (resolve, reject) => {
    var reader = new FileReader();
    reader.readAsDataURL(file);
     reader.onload = function () {
      console.log("reader.result");
      resolve(reader.result) ;
    };
    reader.onerror = function (error) {
      console.log('Error: ', error);
      resolve(error);
    };
  })
 }
  // cropping of image
  imageCropped(event: ImageCroppedEvent) {
    console.log(event)
    this.modelshow = true
    this.cropimageData = event
    this.croppedImage = event.base64;
  }
  // based on tab selection change type variable value for photo
  onPhotoSelected(fileInput: any, title: any) {
    this.imageFile = fileInput
    this.type = "photoupload"
  }
  // based on tab selection change type variable value for stamp
  onStampSelected(fileInput: any, title: any) {
    this.imageFile = fileInput
    this.type = "stampupload"
  }
  // To select font in signature modal
  selectFont(font, preview) {
    this.fonttype = preview;
    this.fontstyle = font;
    this.type = "font"
  }
  // set preview to fontvalue
  save(preview) {
    this.fontvalue = preview;
  }
  /**
  * Function name : signatureSubmit
  * Input : field,title
  * Output :{json} created signature
  * Desc : save signature in signature collection
  */
  signatureSubmit = function (title) {
    if (this.editF) $("#" + this.editF.id + "-input").attr("contenteditable1", false)
    if (this.type == "signaturepad" && this.cropimageData && this.croppedImage) {
      var n = this.cropimageData.file.size
      var v = (n + 2 - ((n + 2) % 3)) / 3 * 4
      if (title == 'signature') document.getElementById("signatureModalBtn").click();
      else if (title == 'initial') document.getElementById("initialModalBtn").click();
      this.isloading = true
      var signatureData = { signdata: this.cropimageData, type: "signaturepad", signtype: title, uid: this.profiledata._id ? this.profiledata._id : null, email: this.profiledata.email ? this.profiledata.email : null }
      this.documentService.saveSignatureimages(signatureData).subscribe(data => {
        this.signData = data
        if (data) {
          this.editF.signatureId = data._id;
          this.editF.signaturebaseData = data.signaturebaseData
          this.editF.signatureType = data.type
          this.signatureImage = {}
          if (this.signtype == 'signature') $("#uploadCaptureInputFileSignature").val('');
          if (this.signtype == 'initial') $("#uploadCaptureInputFileInitial").val('');
          this.isloading = false
          this.type = null;
          this.signatureImage = null;
          this.cropimageData = null;
          this.signatureValidation = null;
        }
      })
    }
    else if (this.type == "fileupload" && this.imageFile) {
      this.cropimageData.file.name = this.filesToUpload[0].name
      this.cropimageData.uid = this.selectedDoc.uid
      this.filesToUpload = this.cropimageData;
      const formData: any = new FormData();
      const files = this.filesToUpload;
      this.cropimageData.file.name = 'signature.png'
      formData.append("uploads", this.filesToUpload.file, this.cropimageData.file.name);
      formData.append("type", "fileupload")
      formData.append("signtype", this.signtype)
      if (this.profiledata) formData.append("email", this.profiledata.email)
      if (this.profiledata) formData.append("uid", this.profiledata._id)
      if (title == 'signature') document.getElementById("signatureModalBtn").click();
      else if (title == 'initial') document.getElementById("initialModalBtn").click();
      this.isloading = true
      this.documentService.saveSignatureimages(formData).subscribe(data => {
        this.imageFile = null
        this.croppedImage = null
        if (data) {
          this.editF.signatureId = data._id
          this.editF.path = data.path
          this.editF.size = data.size
          this.editF.signatureType = data.type
          this.editF.name = data.name
          this.editF.link = data.link
          this.editF.encryptedid = data.encryptedid
          $("#uploadCaptureInputFile").val('');
          this.isloading = false
          this.type = null;
          this.imagedata = null
        }
        this.ResetFieldFonts(this.editF)
      });
    }
    else if (this.type == "font" && this.fonttype && this.fontstyle) {
      var fontSignatureData = { fonttype: this.fonttype, fontstyle: this.fontstyle, type: "font", signtype: title, uid: this.profiledata._id ? this.profiledata._id : null, email: this.profiledata.email ? this.profiledata.email : null }
      if (title == 'signature')
        document.getElementById("signatureModalBtn").click();
      else if (title == 'initial')
        document.getElementById("initialModalBtn").click();
      this.isloading = true
      this.documentService.saveSignatureimages(fontSignatureData).subscribe(data => {
        if (data) {
          this.editF.signatureId = data._id
          this.editF.fontStyle = data.fontStyle
          this.editF.fontText = data.fontText
          this.editF.signatureType = data.type
          $("#uploadCaptureInputFile").val('');
          this.isloading = false
          this.type = null;
          this.preview = this.fonttype = this.fontstyle = null;
        }
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
        document.getElementById("photoModalCloseBtn").click();
        files.push(this.filesToUpload[0]);
      }
      else {
        var blob = this.dataURItoBlob(this.webcamImage.imageAsDataUrl);
        files.push(blob);
        this.isloading = true
        document.getElementById("photoModalCloseBtn").click();
      }
      files.push(this.cropimageData.file)
      const formData: any = new FormData();
      files.forEach(element => {
        formData.append("uploads", element, element.name ? element.name : 'photo.png');
      })
      formData.append("type", this.type ? this.type : "captured")
      formData.append("authentication", this.editF.authentication == true ? true : false)
      if (this.profiledata) formData.append("email", this.profiledata.email)
      if (this.profiledata) formData.append("uid", this.profiledata._id)
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
            else{
              data.setDelete = true
              this.setPhotoDefaultSettings(data)
            }
          })
        }
        else if (data._id && !data.authentication) {
          this.savedPhoto = data
          this.setPhoto()
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
    if (this.editF) $("#" + this.editF.id + "-input").attr("contenteditable1", false)
    if (this.type == "stampupload") {
      this.isloading = true
      document.getElementById("stampModalBtn").click();
      this.cropimageData.file.name = this.filesToUpload[0].name
      this.cropimageData.uid = this.selectedDoc.uid
      this.filesToUpload = this.cropimageData;
      const formData: any = new FormData();
      const files = this.filesToUpload;
      this.cropimageData.file.name = 'stamp.png'
      formData.append("uploads", this.filesToUpload.file, this.cropimageData.file.name);
      formData.append("type", "stampupload")
      if (this.profiledata) formData.append("email", this.profiledata.email)
      if (this.profiledata) formData.append("uid", this.profiledata._id)
      this.documentService.saveStampimages(formData).subscribe(data => {
        // this.saveDocLogs(data, "Stamp")
        this.imageFile = null
        this.croppedImage = null
        this.imagedata = data
        if (data) {
          this.editF.stampId = data._id
          this.editF.path = data.path
          this.editF.size = data.size
          this.editF.name = data.name
          this.editF.link = data.link
          this.editF.encryptedid = data.encryptedid
          this.editF.stampType = data.type
          $("#uploadCaptureInputFileStamp").val('');
          this.isloading = false
        }
      });

    }
    else this.documentService.openSnackBar("Select/Choose Stamp", 'X')
    this.type = null;
    this.imagedata = null
  }

  // Resize event script
  public style: object = {};
  validate(event: ResizeEvent): boolean {
    const MIN_DIMENSIONS_PX: number = 50;
    if (
      event.rectangle.width &&
      event.rectangle.height &&
      (event.rectangle.width < MIN_DIMENSIONS_PX ||
        event.rectangle.height < MIN_DIMENSIONS_PX)
    ) {
      return false;
    }
    return true;
  }

  /**
    * Function name : openModel
    * Input : field,id
    * Output :open modal
    * Desc : open modal based on id
    */
  openModel = function (id, field) {
    this.signmodalopen = true
    this.req = false
    this.selectimg = null
    this.added = null
    this.countrylist = []
    this.showlist = false
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
    if (!field.people || field.people == this.profiledata.email) {
      this.editF = field
      document.getElementById(id).click();
      if ((this.SignatureList.length == 0 && id == 'signatureModalBtn') || (this.initialList.length == 0 && id == 'initialModalBtn')) {
        setTimeout(() => {
          this.signature()
        }, 1000);
      }
    }
  }


  loadOutline() {
    this.pdf.getOutline().then((outline: any[]) => {
      this.outline = outline;
    });
  }
  /**
    * Function name : loadWaterMarks
    * Input : title
    * Output :show watermark style selection
    * Desc : To show watermark style selection 
    */
  loadWaterMarks(title) {
    if (title == "Boldv") this.waterMark.weight = true
    if (title == "Italicv") this.waterMark.style = true
    if (title == "underlinev") this.waterMark.decoration = true
    this.loadWaterMark()
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
    if (!text.location || text.location == '') return false;
    $(".remove_watermark").remove();
    var css = 'font-size:' + text.fontsize + '; font-family:"' + text.fontfamily + '";position: absolute;';
    $("body").append("<div class='remove_watermark' style='" + css + "'>" + text.content + "</div>");
    // $("body").append("<div class='remove_watermark' style='" + css + "background-image: url('"+text.photo+"')'> </div>");
    if(text.content != ' ') text.photo = null
    var css = '';
    var mark_width = $(".remove_watermark:last").width();
    $(".remove_watermark").hide();
    //watermark calculation
    var m = Math.sin(text.rotate * Math.PI / 180) / 2;
    var val = Math.abs(mark_width * m);
    var val_left = 0;
    if (text.rotate) val_left = (Math.abs(val * Math.sin(text.rotate * Math.PI / 180)) + fontSize) / 2;
    else val_left = 0;
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
     * Function name : saveWatermark
     * Input : {String}
     * Output :updated watermark
     * Desc : save watermark in document collection
     */
  saveWatermark(message) {
    if (message == 'save') {
      this.selectedDoc.waterMark = this.waterMark
      this.documentService.updatefolder(this.selectedDoc).subscribe(res => {
        this.documentService.openSnackBar("Water Mark Saved Successfully", "X")
      })
    }
    else if (message == 'delete') {
      let dialogRef = this.dialog.open(CommonDialogComponent, { data: { name: 'DeleteTemplate', content: "Are you sure you want to delete the Watermark?" }, width: '500px', panelClass: "deletemod", disableClose: false });
      dialogRef.afterClosed().subscribe(res => {
        if (res) {
          this.waterMark = { fontsize: '14px', content: '', fontfamily: 'Arial', color: '#201d1d', location: 'middle',watermarkTitle:"text" };
          this.selectedDoc.waterMark = null
          this.documentService.updatefolder(this.selectedDoc).subscribe(res => {
            this.loadWaterMark()
            this.documentService.openSnackBar("Water Mark Deleted Successfully", "X")
          })
        }
      });
    }
  }
  /**
  * Function name : handleClick
  * Input : {json} event
  * Output:selct text
  * Desc : select text in pdf
  */
  handleClick(e) {
    this.clearselect = false
    var selection = window.getSelection();
    var oRange = selection.getRangeAt(0); //get the text range
    var oRect = oRange.getBoundingClientRect();
    this.getpdfSizes();
    //return false;
    this.commentedlines = selection.toString()
    console.log(selection.toString())
    var docwidth = document.getElementById('blog-post').offsetWidth;
    var top = oRect.top - this.PdfTop + this.PdfTopScroll;
    var left = oRect.left - this.PdfLeft
    if (this.PdfLeft < 0 && this.PdfLeftNosideBar < 0)
      left = oRect.left - this.PdfLeft;
    else if (this.PdfLeft > 0 && this.PdfLeftNosideBar < 0)
      left = oRect.left - this.PdfLeft + this.PdfLeftNosideBar
    else if (this.PdfLeftNosideBar > 0)
      left = oRect.left - this.PdfLeft;
    else
      left = oRect.left - this.PdfLeft + this.PdfLeftNosideBar;
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
    if (selection.toString().length > 0) {
      var mousedata = {
        coordinatex: top,
        coordinatey: left,
        width: oRect.width,
        height: oRect.height,
        text: selection.toString(),
        message: 'selected',
        documentid: this._id,
        isFile: true,
        latitude: this.latitude,
        longitude: this.longitude,
        Address: this.Address,
        uid: this.profiledata._id,
        email: this.profiledata.email,
        IpAddress: (this.IpAddress) ? this.IpAddress.ip : 'not avilable'
      }
    }
    // alert(top)
    this.coordinatex = top;
    this.coordinatey = left;
    this.coordinatewidth = oRect.width;
    this.coordinatehight = oRect.height;
    this.activeComment = [];
    console.log(oRect.height + "||||||||" + oRect.width)
    if (selection.toString().length > 0) {
      console.log(($('#staticbar-top').outerHeight(true) - $('#blog-post').outerHeight(true)))
      if (oRect.height <= 50)
        this.activeComment.push({ top: top - 2 + (document.getElementById('progress_bar').offsetHeight + ($('#staticbar-top').outerHeight(true) - $('#blog-post').outerHeight(true))), docwidth: docwidth, left: left, selectText: selection.toString(), comment: '', active: true, height: oRect.height, width: oRect.width, commentbtn: false })
      else
        this.documentService.openSnackBar("comments are not allowed for this text", "X");
    }
//to remove heatmap tootip
// var heat = this.heatmaps.filter(x => x.message == 'selected');
if(this.heatmaps && this.heatmaps.length)this.heatmaps.map((x)=> { if(x.message == 'selected')x.tooltip = false;  return x});

  }
  //clear text selection on doubleclick
  clearSelection() {
    if (document.selection && document.selection.empty) {
      document.selection.empty();
    } else if (window.getSelection) {
      var sel = window.getSelection();
      sel.removeAllRanges();
    }
  }
  // To show comment
  commentfield(data) {
    data.commentbtn = !data.commentbtn
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
    this.editCommsentSection = true
    this.formSubmitted = true
    val.value.documentid = this._id,
      val.value.commentedlines = this.commentedlines,
      val.value.coordinatex = this.coordinatex,
      val.value.height = this.coordinatehight,
      val.value.width = this.coordinatewidth,
      val.value.coordinatey = this.coordinatey
    val.value.showComment = true
    val.value.uid = this.profiledata._id
    val.value.email = this.profiledata.email
    val.value.name = this.username
    if (val.value.comment && val.value.comment.length) {
      this.formSubmitted = false
      this.documentService.postcomments(val.value).subscribe((data: any) => {
        commentdata.commentbtn = false
        this.activeComment = []
      })
    }
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
      this.replyData = {
        documentid: val.documentid,
        commentedlines: val.commentedlines,
        coordinatex: val.coordinatex,
        coordinatey: val.coordinatey,
        parentcommentid: val._id,
        comment: commentForm.value.replyField,
        uid: this.profiledata._id,
        email: this.profiledata.email,
        name: this.username
      }
      this.documentService.replycomments(this.replyData).subscribe(data => {
        this.formSubmitted = false
        commentForm.resetForm()
      })
    }
  }
  // to close comment modal
  commetClose(data) {
    data.commentbtn = false
  }
  // To assign comment data to comment variable
  comment1(val) {
    this.editCommsentSection = true
    this.comment = val.comment
    this.documentid = val._id
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
        this.editCommsentSection = false
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
    this.editCommsentSection = false
  }
  //To open Chat 
  chatOpen() {
    this.editF = null
    this.commentshownotifitab = false
    this.notificationshow = false
    if (!this.newChat && this.openChat) {  //when notification is already opened  to show share form
      this.shareform = true;
      this.newChat = false;
      this.openChat = false
    }
    else if (this.newChat && !this.openChat) { //when chat is already opened   show share form
      this.shareform = true;
      this.newChat = false;
      this.openChat = false
    }
    else if (sessionStorage.getItem("chatid")) {
      this.newChat = true;
      this.shareform = false;
      this.openChat = false
      this._id = sessionStorage.getItem("chatid")
      sessionStorage.removeItem("chatid")
    }
    else if ( (this.chatnotificationlogs.length )) {
      this.newChat = false;
      this.shareform = false
      this.openChat = true

    }
    else {
      this.newChat = true;
      this.openChat = false;
    }
    
  }
  // assign chatdata
  sendchatdata = function () {
    this.chatdata.from = this.viewRecord.uid._id;
    this.chatdata.to = this.viewRecord.bankNo._id;
    this.chatdata.loanDocID = this.viewRecord._id;
    this.chatdata.type = "loan";
  }
  // update online user updatetime 
  ngOnDestroy() {
    if(!this.editTemplateid){
      this.isCalledngOnDestroy = true
      if (this.onlinedata)
        this.generalservice.offline(this.onlinedata).subscribe(data => { })
      if (this.auditlogs)
        this.generalservice.updatetime(this.auditlogs, this.endtime).subscribe(data => {
          this.auditlogsResult = data
        });
      if (this.IframePrint !== '') this.IframePrint.parentNode.removeChild(this.IframePrint);
      this.socketDisconnect()
      this.globalMouseMove();
      this.globalMouseUp();
      clearInterval(this.clearintervaldata);
    }
    else{
      this.socketDisconnect()
    }
    $('body').addClass('noselect'); // disable user selection text / drag in entire application 
  }
  /**
    * Function name : getonlineusers
    * Input : {String} fileid
    * Output: {array} 
    * Desc : To get online users
    */
  getonlineusers() {
    this.generalservice.GetonlineUsers(this._id).subscribe((data: any) => {
      this.onlineusers = data
    })
  }
  //socket dissconnection
  socketDisconnect() {
    let type = { type: "disconnect" }
    this.dataservice.Connectsocket(type).subscribe(quote => { });
  }
  // to show edit button for version
  showeditbtn() {
    this.editversion = true
  }
  // assign selected version to selectedVersion
  selectversion(version) {
    this.selectedVersion = version;
  }
  // To show edit button in template 
  editTemplatename(t) {
    this.copdocument = Object.assign({}, t)
    this.templateid = t._id;
    this.TemplateName = t.templatename;
    if (this.templateid == t._id) {
      this.templateedit = true;
      this.selectedTemplateId = t._id;
      this.buttonhide = t._id;
      this.lastSelect = t._id;
    }
  }
  Selected(t) {
    if (this.lastSelect != t._id) this.templateedit = false;
  }
  //cancel the template editing
  cancelButton(data) {
    this.templateid = data._id;
    data.templatename = this.TemplateName;
    this.templateedit = false;
  }
  // To show edit button in versions 
  editVersionName(field) {
    this.copdocument = Object.assign({}, field)
    this.canedit = true;
    this.selectedVersion = field._id;
    this.hidesave = true;
    this.hideedit = false;
  }
  /**
     * Function name : saveversionfield
     * Input : {json} field
     * Output: {json} updated version
     * Desc : Edit the version name
     */
  saveversionfield(field) {
    this.versionNameRequired = false;
    if (field.versionname != '') {
      this.documentService.editVersionName(field).subscribe(currentVersionDocFields => {
        this.getAllDocVersions()
        this.editversion = false
      });
      this.canedit = false;
      this.hideedit = true;
      this.hidesave = false;
    }
    else this.versionNameRequired = true;
  }
  /**
   * Function name : saveversionfield
   * Input : {json} field
   * Output: {json} document with selected version fields
   * Desc : Restore the version 
   */
  async restoreVesrion(versionid) {
    if (await this.canSave()) {
      var newDoc = JSON.parse(JSON.stringify(this.selectedDoc))
      newDoc.versionid = versionid;
      this.documentService.updatefolder(newDoc).subscribe(data => {
        this.back()
      });
    }
    else this.documentService.openSnackBar("You can't save the changes on this file because, some one already submited their details", "X");
  }
  // Get current version fields on click back button in versions
  async back() {
    this.restorebtn = false
    this.selectedversionid = null
    this.restoreVersionId = null;
    this.canedit = false;
    this.hideedit = true;
    this.hidesave = false;
    this.versionNameRequired = false;
    this.buttonActive('review');
    this.shareform = true
    this.isloading = true;
    this.copdocument = null
    await this.documentFieldDataGetting();
    this.isloading = false;
    this.editF = null
  }
  /**
   * Function name : auditlog
   * Input : {json} 
   * Output: {json} get created auditlog
   * Desc : To save logs 
   */
  auditlog(uid) {
    var locationdata = JSON.parse(localStorage.getItem('currentLocation'));
    this.latitude = this.latitude ? this.latitude : (locationdata) ? locationdata.latitude : undefined;
    this.longitude = this.longitude ? this.longitude : (locationdata) ? locationdata.longitude : undefined;
    var mousedata = {
      message: 'Viewed',
      documentid: this._id,
      isFile: true,
      latitude: this.latitude,
      longitude: this.longitude,
      Address: this.Address,
      uid: this.profiledata._id,
      email: this.profiledata.email,
      IpAddress: (this.IpAddress) ? this.IpAddress.ip : 'not avilable'
    }
    this.documentService.savemousemovement(mousedata).subscribe(data => {
      this.auditlogs = data
    });
  }
  /**
  * Function name : currentVersionDoc
  * Input : {json} 
  * Output: {array} fields with values
  * Desc : To get current version fields with values
  */
  currentVersionDoc = function (version) {
    this.restorebtn = true;
    this.restoreVersionId = version._id;
    this.documentService.getCurrentVersionDocFieldWithValues({ documentid: this._id, versionid: version._id }).subscribe(currentVersionDocFieldOptions => {
      this.fields = currentVersionDocFieldOptions;
      for (let field of this.fields) {
        if (this.PdfWidth) {
          field.width = (field.width / field.pageWidth) * this.PdfWidth
          field.height = (field.height / field.pageHeight) * this.PdfHeight
          field.left = (field.left / field.pageWidth) * this.PdfWidth
          field.top = (field.top / field.pageHeight) * this.PdfHeight
        }
        if (field.type == 'date' && field.value) field.value = new Date(field.value);
        setTimeout(() => { this.updateFieldCss(field); }) //After Div insert in html then only it needs to be call
        setTimeout(() => {
          if (this.header_button == 'insertField' || this.header_button == 'saveFile') $("#" + field.id + "-input").resizable();
          if (((field.type == 'signature' || field.type == 'initial' || field.type == 'Photo' || field.type == 'Stamp') && (field.insertedemail || field.signatureId || field.photoId || field.stampId)))
            $("#" + field.id + "-input").attr("contenteditable1", false)
        }, 10)
      }
    });
  }

  // highlight the selected version
  choosedversion(id) {
    if (this.selectedversionid != id) {
      this.canedit = false;
      this.hideedit = true;
      this.hidesave = false;
    }
    this.selectedversionid = id;
  }
  /**
  * Function name : removefavorite
  * Input : {json} 
  * Output: {json} favorite
  * Desc : Remove from favorite
  */
  removefavorite() {
    console.log(this.favoritedoc)
    this.favoritedoc.forEach(element => {
      var data = { _id: element._id }
      this.removefav = false
      this.documentService.removefavorite(data).subscribe(data => {
        this.documentService.openSnackBar("Removed from favorite Successfully", "X")
      });
    })
  }
  /**
  * Function name : favorite
  * Input : {json} 
  * Output: {json} favorite file
  * Desc : Add file to  favorite
  */
  favorite() {
    var data = { name: this.selectedDoc.name, fileid: this._id, isFile: this.selectedDoc.isFile }
    this.removefav = true
    console.log('making fav',data)
    this.documentService.createfavorite(data).subscribe(data => {
      this.documentService.openSnackBar("Added to favorite Successfully", "X")
    })
  }

  getPosition(el) {
    let x = 0;
    let y = 0;
    while (el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
      x += el.offsetLeft - el.scrollLeft;
      y += el.offsetTop - el.scrollTop;
      el = el.offsetParent;
    }
    return { top: y, left: x };
  }

  ShowCfield(Cfield, fType) {
    if (this.editF.type = Cfield.fType && Cfield.type == fType) return true;
    else return false;
  }
  // highlight align selction in editfields
  selectOption(f) {
    if (f.assingto) {
      if (this.editF[f.assingto] != f.value) this.editF[f.assingto] = f.value;
      else this.editF[f.assingto] = false;
    }
    this.updateFieldCss(this.editF)
  }

  /// Lable Field Settings 
  lableKeyUp(event, field) {

    console.log( $("#" + field.id + "-input").css('letter-spacing'),field['css-font-size'],field.value.length,field.width)
    var v =  field['css-font-size']
    if (field.type == 'label') {

      $('#' + field.id + '-input').css('font-size', field['css-font-size']);
    }
    else {
      var fontsize = $('#' + field.id + '-input').css('font-size');
      field.value = event.target.value;
    }
  }
  
  // To get rotate filed angle value
  formatLabel(value: number | null) {
    if (!value) {
      return 0;
    }
    return value
  }

  // Shows the newly submited data in the document through mobile submission
  updateFromMobile(newContent) {
    if (this.selectedDoc._id == newContent.documentid) {
      if ((newContent.type == 'signature' || newContent.type == 'initial') && newContent.signatureId && newContent.signaturebaseData && newContent.signatureType) {

        if (newContent.type == 'signature') document.getElementById("signatureModalCloseBtn").click();
        else if (newContent.type == 'initial') document.getElementById("initialModalCloseBtn").click();
        this.fields.forEach(field => {
          if (field.id != newContent.fieldid) return;
          field.signatureId = newContent.signatureId;
          field.signaturebaseData = newContent.signaturebaseData;
          field.signatureType = newContent.signatureType;
          field.path = newContent.path
          field.size = newContent.size
          field.name = newContent.name
          field.link = newContent.link
          field.encryptedid = newContent.encryptedid
          field.created_at = newContent.created_at
          if (field && field.signatureId) $("#" + field.id + "-input").attr("contenteditable1", false)

        })
      }
      else if (newContent.type == 'photo' && newContent.photoId && newContent.photoType) {
        document.getElementById("photoModalCloseBtn").click();
        this.fields.forEach(field => {
          if (field.id != newContent.fieldid) return;
          field.photoId = newContent.photoId;
          field.photoType = newContent.photoType;
          field.photobaseData = newContent.photobaseData
          field.path = newContent.path
          field.size = newContent.size
          field.name = newContent.name
          field.link = newContent.link
          field.encryptedid = newContent.encryptedid
          field.created_at = newContent.created_at
          if (field && field.photoId) $("#" + field.id + "-input").attr("contenteditable1", false)
        })
      }
      else if (newContent.type == 'stamp' && newContent.stampId && newContent.stampType) {
        document.getElementById("stampModalCloseBtn").click();
        this.fields.forEach(field => {
          if (field.id != newContent.fieldid) return;
          field.stampId = newContent.stampId;
          field.stampType = newContent.stampType;
          field.path = newContent.path
          field.size = newContent.size
          field.name = newContent.name
          field.link = newContent.link
          field.encryptedid = newContent.encryptedid
          field.created_at = newContent.created_at
          if (field && field.stampId) $("#" + field.id + "-input").attr("contenteditable1", false)
        })
      }
    }
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
        // this.req = !isValid
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
    this.req = false
    if (this.added != null && uploadlinkForm.value.enteredvalue) {
      var val = this.mobileNumberValidation(uploadlinkForm, true)
      this.req = val ? false : true
      if (valid == true && val) {
        uploadlinkForm.value.added = this.added
        uploadlinkForm.value.phNumber = val
        uploadlinkForm.value.type = type;
        uploadlinkForm.value.documentid = this.selectedDoc._id;
        uploadlinkForm.value.fieldid = this.editF.id;
        uploadlinkForm.value.uid = this.profiledata._id;
        uploadlinkForm.value.email = this.profiledata.email;
        uploadlinkForm.value.fromIP = (this.IpAddress) ? this.IpAddress.ip : 'not avilable'
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
  css(a) {
    var sheets: any = document.styleSheets, o = {};
    for (var i in sheets) {
      var rules = sheets[i].rules || sheets[i].cssRules;
      for (var r in rules) {
        if (a.is(rules[r].selectorText)) {
          o = $.extend(o, this.css2json(rules[r].style), this.css2json(a.attr('style')));
        }
      }
    }
    return o;
  }
  css2json(css) {
    var s = {};
    if (!css) return s;
    if (css instanceof CSSStyleDeclaration) {
      for (var i in css) {
        if ((css[i]).toLowerCase) {
          s[(css[i]).toLowerCase()] = (css[css[i]]);
        }
      }
    } else if (typeof css == "string") {
      css = css.split("; ");
      for (var i in css) {
        var l = css[i].split(": ");
        s[l[0].toLowerCase()] = (l[1]);
      }
    }
    return s;
  }
  // To check whether two objects are same or not
  isEqual(value, other) {
    var type = Object.prototype.toString.call(value);
    // If the two objects are not the same type, return false
    if (type !== Object.prototype.toString.call(other)) return false;
    // If items are not an object or array, return false
    if (['[object Array]', '[object Object]'].indexOf(type) < 0) return false;
    // Compare the length of the length of the two items
    var valueLen = type === '[object Array]' ? value.length : Object.keys(value).length;
    var otherLen = type === '[object Array]' ? other.length : Object.keys(other).length;
    if (valueLen !== otherLen) return false;
    // Compare properties
    if (type === '[object Array]') {
      for (var i = 0; i < valueLen; i++) {
        if (this.compare(value[i], other[i]) === false) return false;
      }
    } else {
      for (var key in value) {
        if (value.hasOwnProperty(key) && other.hasOwnProperty(key)) {
          if (this.compare(value[key], other[key]) === false) return false;
        }
      }
    }
    // If nothing failed, return true
    return true;
  };
  // Compare two json objects
  compare(item1, item2) {
    // Get the object type
    var itemType = Object.prototype.toString.call(item1);
    // If an object or array, compare recursively
    if (['[object Array]', '[object Object]'].indexOf(itemType) >= 0) {
      if (!this.isEqual(item1, item2)) return false;
    }
    // Otherwise, do a simple comparison
    else {
      // If the two items are not the same type, return false
      if (itemType !== Object.prototype.toString.call(item2)) return false;
      // Else if it's a function, convert to a string and compare
      // Otherwise, just compare
      if (itemType === '[object Function]') {
        if (item1.toString() !== item2.toString()) return false;
      } else {
        if (item1 !== item2) return false;
      }
    }
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
  // Assign image capture data to webcamImage variable
  public handleImage(webcamImage: WebcamImage): void {
    this.webcamImage = webcamImage;
  }
  // Convert base64 to blob
  dataURItoBlob(dataURI) {
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
  /**
    * Function name : savePhoto
    * Input : {json}  webcamdata
    * Output: {json}photo data
    * Desc : save photo in photo collection
    */
  savePhoto() {
    if (this.webcamImage) {
      var blob = this.dataURItoBlob(this.webcamImage.imageAsDataUrl);
      var fd = new FormData(document.forms[0]);
      fd.append("canvasImage", blob, 'photo.png');
      fd.append("type", "captured");
      var data = { photobaseData: this.webcamImage.imageAsDataUrl, type: "captured" }
      this.documentService.savePhotoimages(fd).subscribe((data: any) => {
        if (data && this.editF) {
          this.editF.photoId = data._id
          this.editF.photobaseData = data.photobaseData
          this.editF.photoType = data.type
          this.webcamImage = null;
          this.showWebcam = false;
          this.errors = null;
          $("#uploadCaptureInputFile").val('');
          this.isloading = false
        }
      });
    }
    else {
      this.documentService.openSnackBar("First Capture the photo", "X");
    }
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
    console.log(err, error)
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
  savedPhoto
  // shows photo from mobile link data submission
  setPhoto() {
    var data = this.savedPhoto
    if (data && this.editF) {
      if (data._id) this.editF.photoId = data._id
      if (data.type) this.editF.photoType = data.type
      if (data.path) this.editF.path = data.path
      if (data.size) this.editF.size = data.size
      if (data.name) this.editF.name = data.name
      if (data.link) this.editF.link = data.link
      if (data.encryptedid) this.editF.encryptedid = data.encryptedid
      if (data.photobaseData) this.editF.photobaseData = data.photobaseData
      if (this.editF && this.editF.photoId) $("#" + this.editF.id + "-input").attr("contenteditable1", false)
      this.imageFile = null
      this.croppedImage = null
      this.type = null;
      this.imagedata = null
      $("#uploadCaptureInputFile").val('');
      document.getElementById("photoModalCloseBtn").click();
    }
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
    this.getAllDocVersions();
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

  inc(field) {
    this.editF[field]++
  }

  dec(field) {
    this.editF[field]--

  }
  // To open specific comment
  openSpecificComment(data) {
    this.comment = null
    this.commentid = data._id
    data.showComment = !data.showComment
  }
  //Check page number while pdf scrolling
  onPdfScroll(e) {
    var scroll = $("#doc-view").scrollTop();
    var h = 0;
    var PDFheights = [];
    var i = 0;
    $("div.pdfViewer").find("div.page").each(function () {
      PDFheights.push({ start: h, end: h + $(this).height()-2 })
      h = h + ((this.pageNo - 1) > 0 ? (10) : 0) + $(this).height();
    })
    PDFheights.forEach(page => {
      i++;
      if (page.start <= scroll && page.end+10 >= scroll) this.pageNo = i++;
    });
  }
  /**
   * Function name : heatMaps
   * Input : {String} fileid 
   * Output: {array} documentlogs
   * Desc : Get heatmaps of specific file
   */
  heatMaps() {
    this.header_button = 'heatmaps';
    var heatmap = !this.heatmapss;
    if(heatmap)
    {
      var doc = { _id: this._id }
      this.selectedcount = 0; this.viewedcount = 0;
      this.documentService.getDocumentLogs(doc).subscribe(data => {
        this.heatmaps = data;
        if (this._id) {
          for (var i = 0; i < this.heatmaps.length; i++) {
            if (this.heatmaps[i].message == 'Viewed') {
              this.viewedcount += 1;
            }
            else if (this.heatmaps[i].message == 'selected') {
              if (this.PdfWidth) {
                this.heatmaps[i].width = (this.heatmaps[i].width / this.heatmaps[i].pageWidth) * this.PdfWidth
                this.heatmaps[i].height = (this.heatmaps[i].height / this.heatmaps[i].pageHeight) * this.PdfHeight
                this.heatmaps[i].coordinatey = (this.heatmaps[i].coordinatey / this.heatmaps[i].pageWidth) * this.PdfWidth
                this.heatmaps[i].coordinatex = (this.heatmaps[i].coordinatex / this.heatmaps[i].pageHeight) * this.PdfHeight
              }
              this.heatmaps[i].top = this.heatmaps[i].coordinatex - 17;
              if (this.PdfLeft < 0 && this.PdfLeftNosideBar < 0)
                this.heatmaps[i].left = this.heatmaps[i].coordinatey - 2;
              else if (this.PdfLeft > 0 && this.PdfLeftNosideBar < 0)
                this.heatmaps[i].left = this.heatmaps[i].coordinatey - 2 + this.PdfLeftNosideBar
              else if (this.PdfLeftNosideBar > 0)
                this.heatmaps[i].left = this.heatmaps[i].coordinatey - 2;
              else
                this.heatmaps[i].left = this.heatmaps[i].coordinatey - 2 + this.PdfLeftNosideBar;
              this.heatmaps[i].left = this.heatmaps[i].coordinatey - 5;
              this.heatmaps[i].tooltipleft = (this.heatmaps[i].width / 2) - 75;
              this.heatmaps[i].diff = this.getDataDiff(new Date(this.heatmaps[i].createdAt), new Date(this.heatmaps[i].updatedAt));
              this.selectedcount = 1;
            }
          }
        }
      });
    }
  else{
    this.heatmaps = [];  }
  }
  // select text when selecting text for heatmaps
  mouseentered(data) {

    if(data && data.coordinatey){
      if(data.coordinatey<=100){
       this.heatmap_tooltip=true;
      }
      else{
       this.heatmap_tooltip=false;
      }
    }
    if((data && data.coordinatex)){
     if(data.coordinatex<=150){
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
  // Set Download options before download  / opening the popup
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
      id: this.selectedDoc._id,
      name: this.selectedDoc.name,
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
      document.getElementById('downloadtmp').click()
      this.isloading = true;
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
          document.getElementById('downloadtmp').click()
          this.isloading = true;
          this.documentService.pdfDownload(downloaddata).subscribe((data: any) => {
            if (downloaddata.email && downloaddata.downloadType == "attachment") {
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

  //Header Button Make Active, We will assign value ti header_button field
  buttonActive(value) {
    this.header_button = value;
    for (let field of this.fields) {
      if (field.type == 'email' || field.type == 'mobilenumber') { this.validateemail(field); }
      if (this.header_button == 'insertField' || this.header_button == 'saveFile') {
        $(".ui-resizable-se").addClass("ui-icon")
        if (this.header_button == 'insertField' || this.header_button == 'saveFile') {
          $("#" + field.id + "-input").resizable();
        }
      }
      else {
        $(".ui-resizable-se").removeClass("ui-icon")
      }
    }
    this.ref.detectChanges();
  }

  /**
    * Function name : printpdfDoc
    * Input : {json} file 
    * Output: {String} file path
    * Desc :  Pdf print 
    */
  printpdfDoc() {
    this.isloading = true;
    this.documentService.pdfPrint(this.selectedDoc).subscribe((data: any) => {
      if (navigator.userAgent.indexOf('Edge') >= 0) { 
        this.documentService.openSnackBar("Document Can't print on EDGE browser", "X");
        return;
       }
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
        iframe.contentWindow.print();
        this.IframePrint = iframe;
      }
      xhr.send()
    })
  }
  // To check validation of email
  validateemail(field) {
      var pattern = field.pattern
    if (field.type == 'email') pattern = /([A-Za-z]|[0-9])[A-Za-z0-9.]+[A-Za-z0-9]@((?:[-a-z0-9]+\.)+[a-z]{2,})$/
    if (field.type == 'mobilenumber' && field.value && field.value.length >= 25) field.fieldvalidationCheck = false;
    else if (field.value && field.value != '') {
      var regexp = new RegExp(pattern)
      field.fieldvalidationCheck = false;
      if (regexp.test(field.value))
        field.fieldvalidationCheck = true;
    }
    else {
      field.fieldvalidationCheck = true;
    }
  }
  /**
   * @param event keyboard event
   */
  // to allow only numbers
  numberOnly(event): boolean {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode == 32 || charCode == 45 || charCode == 43) return true;
    else if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }
  /**
   * Function name : getOfflineNotification
   * Input : {String} loginuserid 
   * Output: {array} All notifications
   * Desc :  gets all the notifcation of the user 
   */
  getOfflineNotification() {
    this.generalservice.getOfflinenotification().subscribe((data: any) => {
      console.log(data)
      this.notificationlogs = data.filter(element =>element.type != 'chat' && element.active)
      this.chatnotificationlogs = data.filter(element =>element.type == 'chat' )
      // console.log(data.some(element =>element.type == 'chat'  && element.documentid._id != this._id))
      this.chatnotificationlogs.sort((a, b) => {
        if (a.documentid && a.documentid._id == this._id) { return -1; }
        else  { return 1; }
      })
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
  // clears selected notification
  clearnotification(id) {
    id.active = false
    this.generalservice.markedread(id).subscribe(data => {
      this.getOfflineNotification()
      this.getNotificationCount()
    })
  }
  // To show notifications
  shownofication() {
    this.notificationshow = true
    // this.openChat = false
    // this.newChat = false;
    this.commentshownotifitab = false
  }
  // To hide notifications
  hide() {
    this.notificationshow = false
    this.hideshareform = false
    this.mobiletogglebutton = false
    this.chatshownotifitab = false
    this.commentshownotifitab = false
  }
  // scroll in notifications
  @HostListener('scroll')
  public asd(): void {
    this.notificationshow = false
  }
  // clearing all the notification
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
   * Function name : getNotificationCount
   * Input : null
   * Output : Notification count
   * Desc : to get count of notification
   */
  getNotificationCount() {
    this.generalservice.countNotifications().subscribe((data: any) => {
      this.Notificationscount = data
    })
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
  // To check whether save dialog is opened or not on click broser back button
  async confirmationdialog() {
    return new Promise(async (resolve, reject) => {
      if (!this.isloading) {
        this.isAlreadyOpened = true
        let dialogRef = this.dialog.open(CommonDialogComponent, { data: { name: 'exitdialog' }, disableClose: false, width: '500px', panelClass: "deletemod" });
        console.log("dialog called")
        dialogRef.afterClosed().subscribe(async res => {
          console.log(res)
          if (res && !this.editTemplateid) {
            await this.saveFile('fromsave')
            resolve()
          }
          else if (res && this.editTemplateid) {
            await this.edittemplateDocFields()
            resolve()
          }
          else if (res == false)
            resolve()
        });
      }
      else {
        resolve()
      }
    })
  }
  // Navigate to previous webpage when click on back button
  navigationBackButton() {
    this.Locations.back()
  }
  // Shows countries dropdown
  showdropdown(event, title) {
    this.showlist = true
    this.listshow = false
    this.mobiledemo = !this.mobiledemo
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
  /**
     * Function name : sharethisdocument
     * Input : {json} 
     * Output: {json} get new document
     * Desc :  create a new document with current document fieldvalues
     */
  sharethisdocument() {
    let dialogRef = this.dialog.open(CommonDialogComponent, { data: { name: 'sharetonew' }, width: '500px', panelClass: "deletemod", disableClose: false });
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        let dialogRef = this.dialog.open(CommonDialogComponent, { data: { name: 'newfilename' }, width: '500px', panelClass: "deletemod", disableClose: false });
        dialogRef.afterClosed().subscribe(res => {
          if (res) {
            var nameArray = [{ name: res }]
            var filedata = {
              files: nameArray,
              folderid: this.selectedDoc.folderid ? this.selectedDoc.folderid : false
            }
            this.documentService.isFilenameExits(filedata).subscribe(filePresent => {
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
                    this.isloading = true
                    this.documentService.pdfDownload({ id: this.selectedDoc._id, sharethisdocument: true, filename: nameArray[0].name }).subscribe((data: any) => {
                      if (data.encryptedid) {
                        this.isloading = false
                        var filedata = {
                          fileid: data._id
                        }
                        this.documentService.encryptedvalues(filedata).subscribe((newdata: any) => {
                          if (this.profiledata.type == 'individual') this.router.navigateByUrl('/individual/filecont/' + newdata.encryptdata);
                          else if (this.profiledata.type == 'organisation' || this.profiledata.type == 'employee') this.router.navigateByUrl('organization/filecont/' + newdata.encryptdata);
                        })
                      }
                      else {
                        this.isloading = false
                      }
                    }, error => {
                      this.isloading = false
                      console.log(error)
                    })
                  }
                })
              }
              else {
                this.isloading = true
                this.documentService.pdfDownload({ id: this.selectedDoc._id, sharethisdocument: true, filename: res }).subscribe((data: any) => {
                  if (data.encryptedid) {
                    this.isloading = false
                    var filedata = {
                      fileid: data._id
                    }
                    this.documentService.encryptedvalues(filedata).subscribe((newdata: any) => {
                      if (this.profiledata.type == 'individual') this.router.navigateByUrl('/individual/filecont/' + newdata.encryptdata);
                      else if (this.profiledata.type == 'organisation' || this.profiledata.type == 'employee') this.router.navigateByUrl('organization/filecont/' + newdata.encryptdata);
                    })
                  }
                  else {
                    this.isloading = false
                  }
                }, error => {
                  this.isloading = false
                  console.log(error)
                })
              }
            })

          }
          else console.log("No File Name")
        });
      }
      else console.log("No sharing")
    }
    );
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
      this.userService.checkpassword(oldPassword).subscribe(data => {
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
  validate1(password) {
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
    this.validate1(oldPassword)
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
    this.errorres = ""
    this.displayerror = false
    this.formSubmitted = true
    if (user.valid && user.value.oldpass != user.value.newpass && user.value.newpass == user.value.pwd3 && !this.isOldPassword) {
      user.value.IpAddress = (this.IpAddress) ? this.IpAddress.ip : 'not avilable'
      this.userService.changePass(user.value).subscribe(data => {
        var res = data;
        user.resetForm();
        this.formSubmitted = false
        document.getElementById("changePassCloseBtn").click();
        if (res.result == "success") {
          // this.logout();
          this.documentService.openSnackBar("Password Changed Successfully", "X");
        }
      })
    }
  }
  //field focusing on selecting properties
  fieldfocusing(field) {
    if (field.type) {
      $("#" + field.id + "-input").attr("tabindex", 1).focus();
      $("#" + field.id + "-input").addClass("focuscolor");
    }
  }
  // Restrictspacekey in change password
  Restrictspacekey(event) {
    if (event.keyCode == 32) {
      return false;
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
  // To Hide templates
  hidetemplatemodel() {
    document.getElementById("savetempclose").click();
    this.existingtemplate = true
  }
  // shows Insert field menu in mobile
  showmobiletoggle(data) {
    if (data == 'show') {
      this.mobiletogglebutton = true

    }
    else if (data == 'hide') {
      this.mobiletogglebutton = false
    }
  }
  //show templates
  showtemplate() {
    if (this.youCanSave && this.fields.length) {
      document.getElementById('saveastemplate').click()
    }
    else if (this.fields.length == 0)
      this.documentService.openSnackBar("Must insert the fields to save template", "X")
    else {
      this.documentService.openSnackBar("Sorry document has been submitted already", "X")
    }
  }
  // to show selected template
  showselecttemplate() {
    if (this.youCanSave) {
      document.getElementById('selecttemplate').click()
    }
    else {
      this.documentService.openSnackBar("Sorry document has been submitted already", "X")
    }
  }
  // To validate template name
  validatetemplate(data) {
    this.templatenamelengtherror = false
    this.templatepatternerror = false
    if (data && data.errors && data.errors.minlength) {
      this.templatenamelengtherror = true
    }
    if (data && data.errors && data.errors.pattern) {
      this.templatepatternerror = true
    }
    if (data && data.value.length == 0) {
      this.templatenamelengtherror = true
    }
  }
   // Opening URL mismatch popup
   urlMismatch()
   {
     this.notAuthorized = false 
     this.isloading = false
     this.router.navigate(["/unauthorized"], {skipLocationChange: true})


   }
 /**
 * Function name : otpfun
 * Input : {boolean}   
 * Output: {boolean} 
 * Desc :  to hide error message on focused
 */
   dependencyEmailValidate(focus)
   {
    if(focus){
      this.dependencyEmailerror=false
    }
    else{
      this.dependencyEmailerror=true
    }
   }
    /**
 * Function name : editTemplateDoc
 * Input : {json}   
 * Output: {json}
 * Desc :  to create new document with emptypages
 */
   async editTemplateDoc(template)
   {
     if (!await this.isEqual(this.fields, this.oldFieldData) && !this.isAlreadyOpened) {
      if (this.youCanSave) {
        var tosave=await this.confirmationdialog()
        this.isFirstClick = true
        if (!tosave) {
         this.saveTemplateFields(template)
        }
      }

    }
    else{
      this.isFirstClick = true
      this.saveTemplateFields(template)
    }
   }
     /**
 * Function name : saveTemplateFields
 * Input : {json}   
 * Output: {json}
 * Desc :  To save template edited fields
 */
   async saveTemplateFields(template)
   {
    var templateFieldPageNo = template.fields.some(field => field.pageNo)
    if(templateFieldPageNo){
    document.getElementById('templatemodelclose').click();
    this.isloading = true
    var maxPageno=await Math.max.apply(Math, template.fields.map(function(o) { return o.pageNo; }))
    this.documentService.editTemplateDoc(maxPageno,template.templatename).subscribe((data: any) => {
      if(data)
      {
       this.isloading = true
        var filedata = {
         fileid: data._id,
         sharedid:template._id
       }
       this.documentService.encryptedvalues(filedata).subscribe((newdata: any) => {
         if (this.profiledata.type == 'individual') this.router.navigateByUrl('/individual/filecont/' + newdata.fileid+"."+newdata.sharedid);
         else if (this.profiledata.type == 'organisation' || this.profiledata.type == 'employee') this.router.navigateByUrl('organization/filecont/' + newdata.fileid+"."+newdata.sharedid);
       })
      }
    })
   }
   else{
     this.documentService.openSnackBar("Sorry you can't edit template",'x')
   }
   }
/**
 * Function name : edittemplateDocFields
 * Input : {json}   
 * Output: {json}
 * Desc :  To edit template fields
 */
   async edittemplateDocFields()
   {
     this.buttonActive('editTemplate')
    await this.LoadFieldConfig()
    var data ={fields:this.Updatedfields,_id:this.editTemplateid}
    console.log(this.fields,this.oldFieldData)
    if(await !this.isEqual(this.fields, this.oldFieldData)){
      this.documentService.overridetemplate(data).subscribe((data: any) => {
        if(data){
          // this.Locations.back()
          this.documentService.openSnackBar('Template updated ','x')
        }
      })
    }
    else
    {
      this.documentService.openSnackBar('No changes found  ','x')
    }
    
   }
       /**
   * Function name : NotificationNavigate
   * Input{object}: notification record
   * Output : navigate to respective file or folder when click on respective notification
   */
  NotificationNavigate(data){
    this.hide()
    console.log(this.newChat,data , this._id)
    if(data.documentid && data.documentid._id == this._id && data.type == 'chat') {
      this.newChat = !this.newChat
      this.openChat = !this.openChat
    }
    else if( data.documentid && data.documentid._id == this._id){
    this.hide()
    }
    else{
      this.openChat = false
      this.newChat = false
      this.generalservice.NotificationNavigate(data,this._id);
    }
  
    }
     /**
   * Function name : sessionsClear
   * Output : to clear all other session of particular user
   */
  sessionsClear()
  {
    this.userService.clearAll().subscribe(data => {
      this.documentService.openActionSnackBar(data,'x')
    })
  }
  /**
   * Function name : getHighlight
   * Input{object}: (data) data*- selected field
   * Output : to high light the selected row
   */
  getHighlight(data) {
    if (this.fieldsForDelete.some(element => element.id === data.id)) {
      return true;
    } else { 
      // $('#' + data.id + "-input").removeClass('focuscolor')
      return false; }
 
}
  /**
 * Function name : commentBlockSelect
 * input(object):selected comment object
 * Output : to hightlight selected comment section
 */
  commentBlockSelect(com) {
    this.SelectedCom = com;
  }
pdfQuery = ''
searchpdf(newQuery: string) {
  if (newQuery !== this.pdfQuery) {
    this.pdfQuery = newQuery;
    this.pdfViewer.pdfFindController.executeCommand('find', {
      query: this.pdfQuery,
      highlightAll: true
    });
  } else {
    this.pdfViewer.pdfFindController.executeCommand('findagain', {
      query: this.pdfQuery,
      highlightAll: true
    });
  }
 
}
showOnceInfo:boolean=false;
calculateheignt(event,id){
  var ta= document.getElementById(id+'-input')
  var taHeight = this.calculateContentHeight(ta, 25,id)
  var revisedheight=Math.round(taHeight)-5
  var lineheight=revisedheight/20
if(lineheight>=2 &&!this.showOnceInfo){
  this.documentService.openSnackBar("While Download text getting inline,avoid this Please press Enter key for New Line ", "X");
  this.showOnceInfo=true
}

  }
  calculateContentHeight(ta,scanAmount,id){
   var origHeight = ta.style.height;
  var  height = ta.offsetHeight;
   var scrollHeight = ta.scrollHeight;
  var  overflow = ta.style.overflow;       
 if (height >= scrollHeight) {
   /// check that our browser supports changing dimension
   /// calculations mid-way through a function call...
   ta.style.height = (height + scanAmount) + 'px';
   /// because the scrollbar can cause calculation problems
   ta.style.overflow = 'hidden';
   var textatea= document.getElementById(id+'-input')
   /// by checking that scrollHeight has updated
   if (scrollHeight < ta.scrollHeight) {
     /// now try and scan the ta's height downwards
     /// until scrollHeight becomes larger than height
     while (textatea.offsetHeight >= textatea.scrollHeight) {
       ta.style.height = (height -= scanAmount) + 'px';
     }
     /// be more specific to get the exact height
     while (textatea.offsetHeight < textatea.scrollHeight) {
       ta.style.height = (height++) + 'px';
     }
     ta.style.height = origHeight;
     ta.style.overflow = overflow;
     
     return height;
   }else{
     return 20;
   }
 } else {
   return scrollHeight;
 }
  }
 
}
export interface User { email: string; }
