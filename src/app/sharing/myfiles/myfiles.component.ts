import {
  Component, Input, ViewChild, Output, EventEmitter, OnInit,
  HostListener, NgZone, OnDestroy
} from '@angular/core';
import { MatDialog, MatSnackBar } from '@angular/material';
import { CommonDialogComponent } from '../../public/common-dialog/common-dialog.component';
import { UploadEvent, FileSystemFileEntry } from 'ngx-file-drop';
import { Subject } from 'rxjs/Subject';
import { MovetoComponent } from '../moveto/moveto.component';
import { DocumentService } from '../../document.service';
import { MatMenuTrigger } from '@angular/material/menu';
import { FrontEndConfig } from '../../frontendConfig';
import { Router } from '@angular/router';
import { ActivatedRoute, Params } from '@angular/router';
import { FileQueueObject, FileuploadService } from '../../fileupload.service';
import { Observable } from 'rxjs/Observable';
import { AdminService } from '../../admin.service';
import { UserService } from '../../user.service';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { Subscription } from 'rxjs';
import { TemplateRef } from '@angular/core';
import { saveAs } from 'file-saver';
import { DataService } from '../../core/data.service';
import { SharepopupComponent } from '../sharepopup/sharepopup.component';
import { OrganizationFileSharingComponent } from '../../organization/organization-file-sharing/organization-file-sharing.component';
import { SignupdialogboxComponent } from '../../public/signupdialogbox/signupdialogbox.component';
import * as _ from 'lodash'

declare var gapi: any; // google-drive
declare var google: any; // google-drive
declare var Dropbox: any; // drop box
declare var OneDrive: any; // onedrive
declare var $: any; // jquery variable+

@Component({
  selector: 'app-myfiles',
  templateUrl: './myfiles.component.html',
  styleUrls: ['./myfiles.component.css'],
})

export class MyfilesComponent implements OnInit, OnDestroy {
  totalfilelength = 0;
  sub: Subscription;
  message: any;
  subscription: Subscription;
  windowWidth: any;
  verificationdata: any;
  passwordVerifications: any = false;
  testuingnew;
  count = 0;
  folderdataid: any;
  sclickdata: any = [];
  Excecuted = false;
  isSocialLoading = true;
  isloading;
  getUploadSuccess: any;
  oncomplete_Singlefile: Subscription;
  frontendurl = this.frontendconfig.frontendurl;
  matdialogopen = false;
  serverurl = this.frontendconfig.getserverurl();
  @ViewChild('userMenu') userMenu: TemplateRef<any>; // usermenu
  @ViewChild(MatMenuTrigger) contextMenu: MatMenuTrigger; // context menu
  @ViewChild(MatMenuTrigger) contextMenu1: MatMenuTrigger; // context menu
  @ViewChild('userMenu1') userMenu1: TemplateRef<any>; // usermenu
  overlayRef: OverlayRef | null;
  @Input() fileElements: FileElement[];  // file data
  @Input() fileData: FileData[];  // folder data
  @Input() canNavigateUp: string; // navigate
  @Input() path:[]; // path
  @Input() currentRoot: any;  // current path
  @Output() removefavorite = new EventEmitter<FileElement>(); // remove favorite
  @Output() elementRemoved = new EventEmitter<FileElement>(); // remove element
  @Output() elementRenamed = new EventEmitter<FileElement>(); // rename element
  @Output() elementShared = new EventEmitter<{ element: FileElement, title: any }>(); // share element
  @Output() elementfavorite = new EventEmitter<FileElement>(); // make favorite
  @Output() navigatedDown = new EventEmitter<FileElement>(); // navigate back
  @Output() elementMoved = new EventEmitter<{ element: FileElement; moveTo: FileElement }>(); // element moved
  @Output() fileMoved = new EventEmitter<{ element: FileData; moveTo: FileElement }>(); // file move
  @Output() navigatedUp = new EventEmitter(); // navigate up
  @Output() folderAdded = new EventEmitter<{ name: string }>(); // folder adding
  @Output() fileAdded = new EventEmitter<{ data: string }>(); // file adding
  @Output() refreshPage = new EventEmitter(); // send to File.Document
  @ViewChild('fileInput') fileInput;
  @ViewChild('fileInput1') fileInput1;
  @Output() modalnavigate = new EventEmitter<FileElement>(); // modal data navigation
  @Input() modalElement = [];
  @Input() Myfiles;
  @Output() modalPath = new EventEmitter();
  @Input() LoadingUpdate: Subject<boolean>;
  queue: Observable<FileQueueObject[]>;
  dragfiles: Observable<FileQueueObject[]>;
  foldervalue;
  folderid;
  copyfile: any;
  documentLogs: any;
  parent;
  sampledata: any;
  sampledata1: any;
  shows = false;
  shows1 = true;
  document = true;
  folder = false;
  file = true;
  url = false;
  access: any;
  sample2 = false;
  element: any;
  selectedName: any;
  uploadCompleted = false;
  shw = true;
  shw1 = false;
  btn1 = false;
  view = false;
  view2 = true;
  view3 = false;
  view4 = false;
  foldershow1 = false;
  selectedName1: any;
  selectedName2: any;
  recentfiles: any;
  aboutdetails: any;
  backbuttonenable = false;
  matmenu: any;
  btn2;
  dialogopen = false;
  profiledata: any;
  urlshow: any;
  firstuser = false;
  checkuploadlength;
  btn4;
  btn3;
  btn5;
  title;
  uploading = true;
  downloadType;
  downloadFile;
  withlog;
  pdfPinSet;
  pdfPin;
  BackButton = false;
  EnableDelete = false;
  triggervalue = true;
  email;
  currentelement: any;
  browserpath: any;
  checkid: any;
  IpAddress;
  isSharePopUpOpened = false;
  matttoltip;
  scrollheight; // for ie to calculate scroll height
  newelement: any;
  value: any;
  iebrowser;
  logid;
  userDoc: any;
  FileMenu = false;
  downloadpath;
  filearr = new Array();
  folderarr = new Array();
  isctrlkey: boolean;
  contextMenuPosition = { x: '0px', y: '0px' };
  RecentlyUploadedFilesList = [];
  RecentlyUploadedFoldersList = [];
  clientid = '778273248008-3rlo8d96pebk6oci737ijtbhmla253gr.apps.googleusercontent.com';
  scopes = [
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/drive.appdata',
    'https://www.googleapis.com/auth/drive.file'
  ].join(' ');
  developerKey = 'AIzaSyB4L-PhNuvZHw4wbVOjS93VV0uCAgXHUc0';
  clientId = '778273248008-3rlo8d96pebk6oci737ijtbhmla253gr.apps.googleusercontent.com';
  scope = [
    'profile',
    'email',
    'https://www.googleapis.com/auth/drive'// insert scope here
  ].join(' ');
  pickerApiLoaded = false;
  oauthToken?: any;
  dropdevkey = 'hfds0x416l38hgr';
  dropscret = 'k2f83puyfke1z1t';
  options = {

    success: (files) => {
      document.getElementById('fileselect123').click();

      this.isSocialLoading = true;
      files.forEach(element => {
        this.dropurlcontent(element);
      });
    },

    cancel: () => {

    },
    linkType: 'direct', // or "preview"
    multiselect: false, // or false
    extensions: ['.pdf', '.doc', '.docx'],
    folderselect: false, // or true
  };
  oneDriveApplicationId = 'd091f200-527a-4572-aab8-678d6f3ac972';
  uploadedFolder: any;
  selectAll = true
  clickselectedElement :any
  selectindex
  chechBoxenable:boolean=false // show checkbox  while touch hold in touch enable devices
  startFile:any;
  startIndex:any={
    num:0,
    direction:''
  };
  endFile:any;
  filesFolders=[]
  @HostListener('window:resize', ['$event'])
  @HostListener('document:keydown', ['$event']) onKeydownHandler(event: KeyboardEvent) {  
    
    if( event.shiftKey && (event.keyCode ==39 ||event.keyCode ==38 ||event.keyCode ==40 ||event.keyCode ==37))
    {
     if(event.keyCode ==39) { this.selectWithShiftRight()};
     if(event.keyCode ==37) { this.selectWithShiftLeft()};

    }
   else if(event.keyCode==37 && this.element) {
      this.selectWithLeft()
    }
   else if(event.keyCode==39 && this.element) {     
       this.selectWithRight();
    }
     if(event.ctrlKey && event.keyCode==65) {
      this.filearr = this.fileData.slice(0);
      this.folderarr = this.fileElements.slice(0);
      event.preventDefault();
    }

    // delete selected files
    if(event.keyCode==46){
      if((this.filearr.length>1 || this.folderarr.length>1)||(this.filearr.length==1 && this.folderarr.length==1)){
        if(!this.matdialogopen){
          this.deleteSlectedElement()
        }
     
      }
      else if((this.filearr.length || this.folderarr.length)){
        if(!this.matdialogopen){
        this.deleteElement(this.filearr[0] || this.folderarr[0])          
        }
      }

    }
    
  }
  @HostListener('document:click', ['$event']) onClickHandler(event: MouseEvent) {
    const value: any = event.srcElement;    
    if( this.contextMenu && this.contextMenu.menuOpen) {
      this.contextMenu.closeMenu();
    }
    if (value.id !== 'foldersList' && value.id !== 'filesList' && value.id!=='contextmenu' && value.classList[0]!=='mat-checkbox-inner-container' && (!(this.contextMenu && this.contextMenu.menuOpened.closed)
      || !(this.contextMenu1 && this.contextMenu1.menuOpened.closed))) {
      this.filearr = [];
      this.folderarr = [];
      this.sample2 = false;
      this.EnableDelete = false;
      this.chechBoxenable=false;

    }
  }
  @HostListener('window:popstate', ['$event'])
  onPopState(event) {
    document.getElementById('modelclose').click();
    document.getElementById('modelclosesign').click();
    document.getElementById('fileselect123').click();


    if (this.currentelement && this.currentelement.parentid) {
      this.documentservice.getnavigationfolder(this.currentelement.parentid).subscribe(data => {
        this.browserpath = data;
        this.currentelement = data;
        this.navigateUp(this.browserpath);
      });
    } else {
      this.browserpath = 'root';
    }

  }
  @HostListener('window:scroll', ['$event'])
  onWindowScroll($event) {
    if (this.contextMenu) { this.contextMenu.closeMenu(); }
    this.matttoltip = true;
    setTimeout(() => {
      this.matttoltip = false;
    }, 1);
  }
  @HostListener('document:contextmenu', ['$event']) menuContext(ev: MouseEvent,srcElement:any) {
    const value: any = ev.srcElement;
        if(value.id=='filesList' || value.id=='foldersList'){
          this.contextMenu.closeMenu();
          setTimeout(() => {
            this.contextMenuPosition.x = ev.clientX + 'px';
            this.contextMenuPosition.y = ev.clientY + 'px';
          if(!this.is_touch_device())  this.contextMenu.openMenu();
            $('div.cdk-overlay-container').addClass('checking');
          }, 300);
        }else{          
          this.contextMenu.closeMenu();
          if(value.id!='filesList' || value.id!='foldersList')
          {
            this.filearr = [];
            this.folderarr = [];
          }
        }
}
  constructor(
    public overlay: Overlay,
    private adminService: AdminService, private documentservice: DocumentService,
    public userService: UserService, private router: Router,
    public dialog: MatDialog, public snackBar: MatSnackBar,
    private frontendconfig: FrontEndConfig, public routes: ActivatedRoute, private dataservice: DataService,
    public uploader: FileuploadService, private _ngZone: NgZone) {
    this.adminService.getProfile().subscribe(data => {
      this.profiledata = data;
    });
    this.dataservice.documentUpdate().subscribe(data => {
      if (data && this.profiledata && data.uid === this.profiledata._id) {
        this.filesFolders=[]
        let isNewFile = true;
        if (this.fileData && this.fileData.length) {
          this.fileData.forEach((element, index) => {
            if (element._id === data._id) {
              this.fileData[index] = data;
              isNewFile = false;
            }
          });
        }
        if (isNewFile && ((this.currentRoot && this.currentRoot._id === data.folderid) || (!data.folderid && !this.currentRoot))) {
         if(this.fileData) this.fileData.push(data);
         if(this.fileData) {
           this.fileData.sort((a, b) => {
            const nameA = a.created_at;
            const nameB = b.created_at;
            if (nameA < nameB) { return 1; }
            if (nameA > nameB) { return -1; }
            return 0;
          });
        }
        }
      }
    });
    this.dataservice.folderUpdate().subscribe(data => {
      if (data && this.profiledata && data.userid === this.profiledata._id) {
        this.filesFolders=[]
        let isNewFolder = true;
        if (this.fileElements && this.fileElements.length) {
          this.fileElements.forEach((element, index) => {
            if (element._id === data._id) {
              this.fileElements[index] = data;
              isNewFolder = false;
            }
          });
        }
        if (isNewFolder && ((this.currentRoot && this.currentRoot._id === data.parentid) || (!data.parentid && !this.currentRoot))) {
          this.fileElements.push(data);
          this.fileElements.sort((a, b) => {
            const nameA = a.createdAt;
            const nameB = b.createdAt;
            if (nameA < nameB) { return 1; }
            if (nameA > nameB) { return -1; }
            return 0;
          });
        }
      }
    });
    this.subscription = this.documentservice.getFileData().subscribe(message => {
      this.message = message;
      this.fileAdded.emit(this.message);
      if (!NgZone.isInAngularZone()) {
        this._ngZone.run(() => {
          this.documentservice.openSnackBar('File added from google drive ', 'X');
        });
      }
    });

    this.getUploadSuccess = this.uploader.getUploadSuccess().subscribe((message: any) => {
      this.count = 0;
      this.message = message;
      this.totalfilelength = 0;
      this.fileAdded.emit(this.message);
    //  this.uploadCompleted = true;
     // this.uploader.clearQueue();

    });
    this.oncomplete_Singlefile = this.uploader.oncomplete_Singlefile().subscribe((data: any) => {
    });
    this.getScreenSize();
  }

  getScreenSize() { // to get current window size
    this.windowWidth = window.innerWidth;

  }

  /**
   * Function name : recentFiles
   * Input: null
   * Output : to get recently uploaded file
   */
  recentFiles() {
    this.documentservice.recentfiles().subscribe(data => {
      this.recentfiles = data;
      this.isSocialLoading = false;
    });
  }

  /**
   * Function name : getAllFolders
   * Input: null
   * Output : to get all folders
   */
  getAllFolders() {
    this.documentservice.getallfolders().subscribe(data => {
      this.parent = data;
    });
  }
  /**
   * Function name : getAllFolders
   * Input: null
   * Output :current user profile
   */
  getProfiles() {
    this.newelement = JSON.parse(localStorage.getItem('currentUser'));
    const checknewVariable = this.userService.decryptData(this.newelement.new);
    const checknewVariable1 = this.userService.decryptData(this.newelement.type);
    this.newelement.type = checknewVariable1;
    const boolValue = JSON.parse(checknewVariable);
    this.firstuser = checknewVariable;
    if (boolValue) {
      document.getElementById('welcome').click();
    }
  }

  is_touch_device() {
    return 'ontouchstart' in window;
  }
  ngOnInit() {
    this.getProfiles();
    this.filesFolders=[]
    if (!!(window as any).MSInputMethodContext && !!(document as any).documentMode) {
      this.iebrowser = true;
    } else { this.iebrowser = false; }
    const routerid = {
      fileid: this.router.url.substring(this.router.url.lastIndexOf('/') + 1)
    };
    if (routerid.fileid !== 'myfiles' && routerid.fileid != ':id') {
      this.documentservice.decryptedvalues(routerid).subscribe((data: any) => {
        const id = data.decryptdata;
        if (id !== undefined) {
          this.documentservice.getfolder().subscribe(checkid => {
            this.checkid = checkid;
            this.checkid.forEach(element => {
              if (element._id === id) {
                this.currentelement = element;
                this.LoadingUpdate.subscribe(v => {
                  this.isSocialLoading = false;
                });
              }
            });
            if (!this.currentelement) {
              if (this.profiledata.type === 'individual') {
                this.router.navigate(['individual/home/myfiles']);
              } else if (this.profiledata.type === 'organisation' || this.profiledata.type === 'employee') {
                this.router.navigate(['organization/home/myfiles']);
              }
            }
          });
          setTimeout(()=>{            
            if (this.userService.searchElementReturn()) {
              var searchelement = this.userService.searchElementReturn();
              if (searchelement && searchelement.isFile) {              
                var foundelement = this.fileData.find(x => x._id == searchelement._id);
                if (foundelement != undefined) {
                  this.filearr.push(foundelement);
                  this.highlightRow(foundelement)
                }
        
              }
              else if(searchelement && searchelement.isFolder){
                var element = this.fileElements.find(x => x._id == searchelement._id);
                if (element != undefined) {
                this.highlightRow(element)
                this.folderarr.push(element);
                }
        
              }
               this.userService.searchElementSet(null)
            }
          },1000)
        }
      }, error => {
        if (this.profiledata.type === 'individual') {
          this.router.navigate(['individual/home/myfiles']);
        } else if (this.profiledata.type === 'organisation' || this.profiledata.type === 'employee') {
          this.router.navigate(['organization/home/myfiles']);
        }
      });
    } else {
      if (!!(window as any).MSInputMethodContext && !!(document as any).documentMode) {
        $('.main-nav-position').css('margin-top', '0px');

      }
      this.dialogopen = true;
      this.LoadingUpdate.subscribe(v => {
        this.isSocialLoading = false;
        setTimeout(()=>{
          console.log('gggggggggggggggggggg');
          
          if (this.userService.searchElementReturn()) {
            var searchelement = this.userService.searchElementReturn();
            if (searchelement && searchelement.isFile) {              
              var foundelement = this.fileData.find(x => x._id == searchelement._id);
              if (foundelement != undefined) {
                this.filearr.push(foundelement);
                this.highlightRow(foundelement)
              }
      
            }
            else if(searchelement && searchelement.isFolder){
              var element = this.fileElements.find(x => x._id == searchelement._id);
              if (element != undefined) {
              this.highlightRow(element)
              this.folderarr.push(element);
              }
      
            }
             this.userService.searchElementSet(null)
          }
        },1000)
      });
      this.selectedName1 = 'about';
    }
    this.getAllFolders();  
    this.IpAddress = JSON.parse(localStorage.getItem('mylocation'));
    const folderdata = localStorage.getItem('folder');
    if (folderdata) { localStorage.removeItem('folder'); }
    
    $('.bd-example-modal-xl').on('hidden.bs.modal',(e)=> { //to enable crtl+A when modal is close
      this.selectAll = true
    })
    $('.bd-example-modal-xl').on('shown.bs.modal	',(e)=> { //to disable crtl+A when modal is open
      this.selectAll = false;
    })
 
  }


  ngOnDestroy() {
    this.getUploadSuccess.unsubscribe();
    this.oncomplete_Singlefile.unsubscribe();
    document.getElementById('closewelcome').click();
    if (this.firstuser) {
      let newelement;
      newelement = JSON.parse(localStorage.getItem('currentUser'));
      newelement.new = this.userService.encryptData(false);
      localStorage.setItem('currentUser', JSON.stringify(newelement));
      this.adminService.updatenewuser().subscribe(data => { });
    }
  }

  /**
   * Function name : navigatemodal
   * Input{object}: (element) element*-selected file or folder
   * Output : navigate through folder (emits the selected data parent component)
   */
  navigatemodal(element) {
    this.backbuttonenable = true;
    this.modalnavigate.emit(element);
    this.folderarr = [];
    this.filearr = [];
  }

  // to navigate back
  modalback() {
    this.modalPath.emit();
  }


  /**
   * Output : sort data in ascending order based on name
   */
  sortDataAsc() {
    this.fileElements.sort((a, b) => {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();
      if (nameA > nameB) { return 1; }
      if (nameA < nameB) { return -1; }
      return 0;
    });
    this.fileData.sort((a, b) => {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();
      if (nameA > nameB) { return 1; }
      if (nameA < nameB) { return -1; }
      return 0;
    });
  }
  /**
   * Output : sort data in ascending order based on name
   */
  sortDatamodalAsc() {
    this.modalElement.sort((a, b) => {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();
      if (nameA > nameB) { return 1; }
      if (nameA < nameB) { return -1; }
      return 0;
    });
    this.Myfiles.sort((a, b) => {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();
      if (nameA > nameB) { return 1; }
      if (nameA < nameB) { return -1; }
      return 0;
    });
  }
  /**
   * Output : sort data in descending order based on name
   */
  sortDatamodalDsc() {
    this.modalElement.sort((a, b) => {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();
      if (nameA > nameB) { return -1; }
      if (nameA < nameB) { return 1; }
      return 0;
    });
    this.Myfiles.sort((a, b) => {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();
      if (nameA > nameB) { return -1; }
      if (nameA < nameB) { return 1; }
      return 0;
    });
  }
  /**
   * Output : sort data in ascending order based on name
   */
  sortByModifiedmodalAsc() {
    this.modalElement.sort((a, b) => {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();
      if (nameA > nameB) { return 1; }
      if (nameA < nameB) { return -1; }
      return 0;
    });
    this.Myfiles.sort((a, b) => {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();
      if (nameA > nameB) { return 1; }
      if (nameA < nameB) { return -1; }
      return 0;
    });
  }
  /**
   * Output : sort data in descending order based on name
   */
  sortByModifiedmodalDsc() {
    this.modalElement.sort((a, b) => {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();
      if (nameA > nameB) { return -1; }
      if (nameA < nameB) { return 1; }
      return 0;
    });
    this.Myfiles.sort((a, b) => {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();
      if (nameA > nameB) { return -1; }
      if (nameA < nameB) { return 1; }
      return 0;
    });
  }

/**
 * Output : sort data in descending order based on name
 */  sortDataDsc() {
    this.fileElements.sort((a, b) => {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();
      if (nameA < nameB) { return 1; }
      if (nameA > nameB) { return -1; }
      return 0;
    });
    this.fileData.sort((a, b) => {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();
      if (nameA < nameB) { return 1; }
      if (nameA > nameB) { return -1; }
      return 0;
    });
  }
  /**
   * Output : sort data in ascending order by updatedat
   */
  sortByModifiedAsc() {
    this.fileElements.sort((a, b) => {
      const nameA = a.updatedAt;
      const nameB = b.updatedAt;
      if (nameA > nameB) { return 1; }
      if (nameA < nameB) { return -1; }
      return 0;

    });
    this.fileData.sort((a, b) => {
      const nameA = a.updatedAt;
      const nameB = b.updatedAt;
      if (nameA > nameB) { return 1; }
      if (nameA < nameB) { return -1; }
      return 0;

    });
  }
  /**
   * Output : sort data in descending order by updatedat
   */
  sortByModifiedDsc() {

    this.fileElements.sort((a, b) => {
      const nameA = a.updatedAt;
      const nameB = b.updatedAt;
      if (nameA < nameB) { return 1; }
      if (nameA > nameB) { return -1; }
      return 0;

    });
    this.fileData.sort((a, b) => {
      const nameA = a.updatedAt;
      const nameB = b.updatedAt;
      if (nameA < nameB) { return 1; }
      if (nameA > nameB) { return -1; }
      return 0;

    });
  }
  /**
   * Output : sort recent data ascending order
   */
  sortRecentDataAsc() {
    this.recentfiles.sort((a, b) => {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();
      if (nameA > nameB) { return 1; }
      if (nameA < nameB) { return -1; }
      return 0;
    });
  }
  /**
   * Output : sort recent data descending order
   */
  sortRecentDataDsc() {
    this.recentfiles.sort((a, b) => {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();
      if (nameA < nameB) { return 1; }
      if (nameA > nameB) { return -1; }
      return 0;
    });
  }
  /**
   * Output : sort recent data in ascending order by updatedat
   */
  sortRecentByModifiedAsc() {
    this.recentfiles.sort((a, b) => {
      const nameA = a.updatedAt;
      const nameB = b.updatedAt;
      if (nameA > nameB) { return 1; }
      if (nameA < nameB) { return -1; }
      return 0;
    });
  }
  /**
   * Output : sort recent data in descending order by updatedat
   */
  sortRecentByModifiedDsc() {
    this.recentfiles.sort((a, b) => {
      const nameA = a.updatedAt;
      const nameB = b.updatedAt;
      if (nameA < nameB) { return 1; }
      if (nameA > nameB) { return -1; }
      return 0;
    });
  }

  /**
   * Function name : highlightRow
   * Input{object}: (element) element*- selected file or folder
   * Output : to high light the selected row
   */
  highlightRow(element) {
    this.view = false;
    this.selectedName = element._id;
    this.sample2 = true;
    this.element = element;
    this.contextMenu.closeMenu();
  }
  /**
   * Function name : highlightRow
   * Input{object}: (element) element*- selected file or folder
   * Output : to high light the selected row
   */
  highlightRow1(element) {
    this.selectedName2 = element._id;
    this.element = element;
  }


  show4() { // to switch between upload new modal headers
    this.selectedName = null;
    this.sample2 = false;
  }
  /**
   * Function name : sample
   * Input:null
   * Output : to show items in list view
   */
  sample() {
    this.shows = true;
    this.shows1 = false;
    this.shw = false;
    this.shw1 = true;
    this.sample2 = false;
    this.selectedName = null;
  }
  /**
   * Function name : sample
   * Input:null
   * Output : to show items in grid view
   */
  sample1() {
    this.shows = false;
    this.shows1 = true;
    this.shw = true;
    this.shw1 = false;
    this.sample2 = false;
    this.selectedName = null;
  }

  smp() { // to trigger upload button
    document.getElementById('url123').click();
  }

  /**
   * Function name : uploadFile
   * Input{string}: (name) name*- 'document' or 'folder
   * Output : based on name determines whether file or folder
   */
  uploadFile(name) {
    this.url = false;
    this.file = true;
    if (name === 'document') {
      this.document = true;
      this.folder = false;
    } else {
      this.document = false;
      this.folder = true;
    }
    // const myModal = $('#myModal').on('shown', () => {
    //   clearTimeout(myModal.data('hideInteval'));
    //   const id = setTimeout(() => {
    //     myModal.modal('hide');
    //   });
    //   myModal.data('hideInteval', id);
    // });
  }

  /**
   * Function name : uploadUrl
   * Input{string}: (parentid) parentid*- current root directory
   * Output : Assign the root directory to a variable
   */
  uploadUrl(parentid) {
    this.file = false;
    this.url = true;
    this.document = false;
    this.folder = false;
    this.sampledata1 = parentid;
    this.recentFiles();
  }

  /**
   * Function name : urlcontent
   * Input{formdata}: (urldata) submitted formdata
   * Output :upload the file through url
   */
  urlcontent(urldata) {
    var nameArray = [];
    if (urldata.value.value === undefined || urldata.value.value === '') {
      this.urlshow = true;
    } else {
      let urlvalue=urldata.value
      var folderid=this.sampledata1?this.sampledata1:undefined;
      const url = new URL(urldata.value.value);
      var urlpath = url.pathname.split('/');
        nameArray.push({name:urlpath[urlpath.length - 1]})
  
      var filedata={
        files:nameArray,
        folderid:folderid
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
              this.isSocialLoading = true;
              urlvalue.parentid = this.sampledata1;
              this.uploader.urlcontent(urlvalue).subscribe(data => {
                this.isSocialLoading = false;
                urldata.resetForm();
                this.uploadFile('document');
                document.getElementById('fileselect123').click();
                this.documentservice.openSnackBar('File added from URL', 'X');
                this.fileAdded.emit();
              }, error => {
                urldata.resetForm();
                if (error === 'Invalid') {
                  this.documentservice.openSnackBar('Unable to find pdf ', 'X');
                }
                this.isSocialLoading = false;
              });
            }
          })
        }
        else {
         document.getElementById('fileselect123').click();
          this.isSocialLoading = true;
          urldata.value.parentid = this.sampledata1;
          this.uploader.urlcontent(urldata.value).subscribe(data => {
            this.isSocialLoading = false;
  
            urldata.resetForm();
            this.uploadFile('document');
            document.getElementById('fileselect123').click();
            this.documentservice.openSnackBar('File added from URL', 'X');
            this.fileAdded.emit();
  
  
          }, error => {
            urldata.resetForm();
            if (error === 'Invalid') {
              this.documentservice.openSnackBar('Unable to find pdf ', 'X');
            }
            this.isSocialLoading = false;
          });
        }
      })
     
    }

  }


  /**
   * Function name : openNewFolderDialog
   * Input: null
   * Output :open the dialog box for new folder creation
   */
  openNewFolderDialog() {
    setTimeout(() => {
      $('body').css('overflow', 'hidden');

    }, 10);
    this.selectAll=false
    const dialogRef = this.dialog.open(CommonDialogComponent, {
      data: { name: 'create' },
      width: '500px', height: '200px', panelClass: 'rename', disableClose: false
    });
    dialogRef.afterClosed().subscribe(res => {
      this.selectAll=true
      setTimeout(() => {
        $('body').css('overflow', 'auto');

      }, 10);
      this.btn2 = false;
      if (res) {
        if (this.firstuser) {
          let newelement;
          newelement = JSON.parse(localStorage.getItem('currentUser'));
          newelement.new = this.userService.encryptData(false);
          localStorage.setItem('currentUser', JSON.stringify(newelement));
          this.adminService.updatenewuser().subscribe(data => { });
        }
        this.folderAdded.emit({ name: res });
      }
    });

  }
  /**
   * Function name : FolderUploadDialog
   * Input{string}: (parentid) parentid*- current root directory
   * Output : open modal for Folders from your computer
   */
  FolderUploadDialog(parentid) {
    this.sampledata = parentid;
    this.uploadCompleted = false;
    document.getElementById('openModalButton2').click();
    this.btn1 = true;
  }

  /**
   * Function name : deleteElement
   * Input{object}: (element) element*- selected file or folder
   * Output : delete the selected file or folder
   */
  deleteElement(element: FileElement) {
    this.matdialogopen = true;
    setTimeout(() => {
      $('body').css('overflow', 'hidden');

    }, 10);
    if (element.isFolder) {
      const dialogRef = this.dialog.open(CommonDialogComponent, {
        data: { name: 'deletefolder' },
        width: '500px', panelClass: 'deletemod', disableClose: false
      });
      dialogRef.afterClosed().subscribe(res => {
        setTimeout(() => {
          $('body').css('overflow', 'auto');

        }, 10);
        this.matdialogopen = false;
        if (res) {
          const index = this.fileElements.findIndex(x => x._id === element._id);
          if (index >= 0) {
            this.fileElements.splice(index, 1);
          }
          if (res === true) {
            this.sample2 = false;
          }
          if (element.favoriteid) {
            this.Removefavorite(element);

          }
          this.elementRemoved.emit(element);
          this.sample2 = false;
          this.documentservice.openSnackBar('Folder(s) deleted successfully', 'X');
        }
      });
    } else {
      const dialogRef = this.dialog.open(CommonDialogComponent, {
        data: { name: 'delete' },
        width: '500px', panelClass: 'deletemod', disableClose: false
      });
      dialogRef.afterClosed().subscribe(res => {
        setTimeout(() => {
          $('body').css('overflow', 'auto');

        }, 10);
        this.matdialogopen = false;
        if (res) {
          const index = this.fileData.findIndex(x => x._id === element._id);
          if (index >= 0) {
            this.fileData.splice(index, 1);
          }
          if (element.favoriteid) {
            this.Removefavorite(element);

          }
          this.elementRemoved.emit(element);
          this.sample2 = false;
          this.documentservice.openSnackBar('File(s) deleted successfully', 'X');
        }
      });
    }
  }

  /**
   * Function name : Favorite
   * Input{object}: (element) element*- selected file or folder
   * Output : make the selected file or folder as Favorite
   */
  Favorite(element: FileElement) {
    this.elementfavorite.emit(element);
    this.documentservice.openSnackBar('Added to Favourites', 'X');
  }
  /**
   * Function name : navigate
   * Input{object}: (element) element*- selected folder
   * Output : to navigate through selected folder
   */
  navigate(element: FileElement) {
    this.filearr = [];
    this.folderarr = [];
    this.sample2 = false;
    this.RecentlyUploadedFilesList = [];
    this.currentelement = element;
    this.currentelement = element;
    if (element.isFolder) {
      this.foldervalue = element;
      const filedata = {
        fileid: this.foldervalue._id
      };
      this.documentservice.encryptedvalues(filedata).subscribe((data: any) => {
        if (this.profiledata.type === 'individual') {
          this.router.navigate(['/individual/home/myfiles/' + data.encryptdata]);
        } else if (this.profiledata.type === 'organisation' || this.profiledata.type === 'employee') {
          this.router.navigate(['/organization/home/myfiles/' + data.encryptdata]);
        }
        this.navigatedDown.emit(element);
      });

    }
  }

  // to navigate back from folders
  navigateUp(path) {
    this.navigatedUp.emit(path);
  }

  /**
   * Function name : moveElement
   * Input{object}: (element) element*- dropped folder or file
   * Output : move the dropped element
   */
  moveElement(element, moveTo) {
    this.elementMoved.emit({ element: element, moveTo: moveTo });
    this.documentservice.openSnackBar('Moved Successfully!', 'X');

  }

  /**
   * Function name : moveElement
   * Input{object}: (element) element*- selected folder or file
   * Output : move the selected element
   */
  move = async function (element) {
    this.dialogopen = false;
    this.sample2 = false;
    setTimeout(() => {
      $('body').css('overflow', 'hidden');

    }, 10);
    const dialogRef = this.dialog.open(MovetoComponent,
      {
        width: '500px',
        panelClass: 'withoutpadding',
        data: { move: element, Allfolder: this.parent, multi: false },
        disableClose: false,
      });
    dialogRef.afterClosed().subscribe(res => {
      setTimeout(() => {
        $('body').css('overflow', 'auto');

      }, 10);

      if (res !== 'CloseButton' && res!=undefined) {
        this.elementMoved.emit({ element: element, moveTo: res });
        this.documentservice.openSnackBar('Moved Successfully!', 'X');
      }
    });
  };
  /**
   * Function name : shareElementWithMultiple
   * Input{string}: (title) title*- 'Review' or 'Signature'
   * Output : share the multiple files and folders
   */
  shareElementWithMultiple(title: any) {
    if (this.filearr.length || this.folderarr.length) {
      if (title === 'Signature' && this.folderarr.length) {
        return this.documentservice.openActionSnackBar(' Folders are not shared for signature', 'x');
      }
      if (title === 'Signature' && this.folderarr.length === 0 && this.filearr.length === 1) {
        return this.getUserDocList(this.filearr[0]);
      }
      if (title === 'Signature' && this.filearr.length > 1) {
        this.documentservice.openActionSnackBar('Multiple files are shared in Review mode only.', 'x');
      }
      this.multishareElement();
      this.isSharePopUpOpened = false;
      document.getElementById('modelclose').click();
      document.getElementById('modelclosesign').click();
      

    } else {
      this.documentservice.openActionSnackBar(' Please Select File', 'x');
    }
  }
  /**
   * Function name : shareElement
   * Input{string}: (element,title) element*- selected folder or file
   *                                title*- 'Review' or 'Signature'
   * Output : share the multiple files and folders
   */
  shareElement(element: FileElement, title: any) {
    if (element) {
      if (title === 'Signature' && element.isFolder) {
        this.documentservice.openActionSnackBar(' Folders are not shared for signature', 'x');
      } else {
        if (element) {
          if (title === 'share' || title === 'Review') { document.getElementById('modelclose').click(); }
          if (title === 'Signature') {
            this.getUserDocList(element);
          } else { this.elementShared.emit({ element: element, title: title }); }
        }
      }
    } else if (element === undefined || element == null) {
      this.documentservice.openActionSnackBar(' Please Select File', 'x');
    }


  }
  /**
   * Function name : getUserDocList
   * input{object}:(element) element*-selected file
   * Output : to get the userlist from the doc based upon the feilds for (SIGNATURE)
   */
  getUserDocList(element) {
    if (element.isFile) {
      this.documentservice.getCurrentVersionDocFieldOptions({
        documentid: element._id,
        versionid: element.versionid
      }).subscribe(response => {
        this.userDoc = response;
        if ((this.userDoc && !this.userDoc.fields.length) || !this.userDoc) {
          this.addFeildsPopUp(element);
        } else {
          this.isSharePopUpOpened = false;
          document.getElementById('modelclose').click();
          document.getElementById('modelclosesign').click(); 
          this.elementShared.emit({ element: element, title: 'Signature' });
        }
      });
    }
    if (element.isFolder) { document.getElementById('modelclose').click(); this.elementShared.emit({ element: element, title: 'Review' }); }
  }
  /**
   * Function name : addFeildsPopUp
   * input{object}:(element) element*-selected file
   * Output : open popup the dailog to add fields
   */
  addFeildsPopUp(element) {
    const dialogRef22 = this.dialog.open(CommonDialogComponent,
      {
        data: { name: 'fields', cancel: true, content: 'Add the Fields to Share documents' },
        width: '500px', panelClass: 'deletemod', disableClose: false
      });
    dialogRef22.afterClosed().subscribe(res1 => {
      if (res1) {
        dialogRef22.close();
        this.getFileContent(element);
        document.getElementById('modelclosesign').click();
      } else { dialogRef22.close(); }
    });

  }
  /**
   * Function name : Favorite
   * Input{object}: (element) element*- selected file or folder
   * Output : Remove the selected file or folder from Favorite
   */
  Removefavorite(element: FileElement) {
    this.removefavorite.emit(element);
    this.documentservice.openSnackBar('Removed from Favourites', 'X');
  }
  /**
   * Function name : Favorite
   * Input{object}: (element) element*- selected file or folder
   * Output : open up the dialog and rename the file
   */
  openRenameDialog(element: FileElement) {
    setTimeout(() => {
      $('body').css('overflow', 'hidden');

    }, 10);
    const Rename = element.name.split('.');
    const dialogRef = this.dialog.open(CommonDialogComponent, {
      data: { name: 'Rename', folder: element },
      width: '500px', panelClass: 'rename', disableClose: false
    });
    dialogRef.afterClosed().subscribe(res => {
      setTimeout(() => {
        $('body').css('overflow', 'auto');

      }, 10);

      if (res) {
        const changed = res.split('.');
        if (changed[1] && changed[1] !== 'pdf') {
          this.documentservice.openActionSnackBar('. ' + changed[1] + ' Extensions is not Allowed', 'x');
        } else {
          if (element.isFile) {
            const name = changed[0] + '.' + Rename[1];
            if (this.fileData.some(x => x.name.substring(0, x.name.lastIndexOf('.')).trim().length ===
              name.substring(0, name.lastIndexOf('.')).trim().length
              && x.name.substring(0, x.name.lastIndexOf('.')).trim().toLowerCase() ===
              name.substring(0, name.lastIndexOf('.')).trim().toLowerCase()
              && x._id !== element._id)) {
              let count = 0;
              let resultFileName;
              do {
                count++;
                let fileNameRes = this.fileNameSplit({ name: name });
                if (fileNameRes && fileNameRes.name && fileNameRes.extention) {
                  resultFileName = fileNameRes.name.trim() + ' (' + count + ')' + '.pdf';
                }
                let isMatch = false;
                for (let j = 0; j < this.fileData.length; j++) {
                  if ((this.fileData[j] && (this.fileData[j].name.trim().toLowerCase() === resultFileName.toLowerCase()))) {
                    isMatch = true;
                    break;
                  }
                }
                if (!isMatch) {
                  break;
                }
              } while (this.fileData.length + 1 >= count);
              const dialogRef = this.dialog.open(CommonDialogComponent,
                {
                  data: { name: 'FileRename', newName: resultFileName, oldName: element.name },
                  disableClose: false, width: '500px', panelClass: 'deletemod'
                });
              dialogRef.afterClosed().subscribe(res => {
                if (res) {
                  element.name = resultFileName.trim();
                  this.documentservice.openSnackBar(' Renamed  Successfully', 'X');
                  this.elementRenamed.emit(element);
                } else {
                }
              });
            } else if (this.fileData.some(x => x.name === name && x._id === element._id)) { // same namw without changes

            } else {
              element.name = name;
              this.documentservice.openSnackBar(' Renamed  Successfully', 'X');
              this.elementRenamed.emit(element);
            }
          }
          if (element.isFolder) {
            const name1 = changed[0];
            if (this.fileElements.some(x => x.name.trim().toLowerCase() == name1.trim().toLowerCase() && x._id != element._id)) {
              let resultFolderName;
              let count = 0;
              do {
                count++;
                resultFolderName = name1.trim() + ' (' + count + ')';
                let isMatch = false;
                for (let i = 0; i < this.fileElements.length; i++) {
                  if (this.fileElements[i].name.trim().toLowerCase() == resultFolderName.trim().toLowerCase()) {
                    isMatch = true;
                    break;
                  }
                }
                if (!isMatch) {
                  break;
                }
              } while (this.fileElements.length >= count);
              const dialogRef = this.dialog.open(CommonDialogComponent,
                {
                  data: { name: 'FolderRename', newName: resultFolderName, oldName: element.name },
                  disableClose: false, width: '500px', panelClass: 'deletemod'
                });
              dialogRef.afterClosed().subscribe(res => {
                if (res) {
                  element.name = resultFolderName;
                  this.documentservice.openSnackBar(' Renamed  Successfully', 'X');
                  this.elementRenamed.emit(element);
                } else {
                }
              });
            } else if (this.fileElements.some(x => x.name === name1 && x._id === element._id)) { // same namw without changes

            } else {
              element.name = name1;
              this.documentservice.openSnackBar(' Renamed Successfully', 'X');
              this.elementRenamed.emit(element);
            }
          }

        }
      }

    });

  }

  /**
   * Function name : openMenufolder
   * Input{string}: (event,element) event*-MouseEvent
   *                                element*- selected folder or file
   * Output : to open the context menu on right click
   */

  openMenufolder(event: MouseEvent, element: FileElement,srcElement: any) {
  
    this.element = element;
    if (!this.filearr.some(element1 => element1._id === element._id) && !this.folderarr.some(element1 => element1._id === element._id)) {
      if (element.isFile) {
        this.filearr = [element];
        this.folderarr = [];
      } else if (element.isFolder) {
        this.folderarr = [element];
        this.filearr = [];
      }
    }
    this.matmenu = element;
    this.FileMenu = true;
    event.preventDefault();
    this.contextMenuPosition.x = event.clientX + 'px';
    this.contextMenuPosition.y = event.clientY + 'px';
  }

  /**
   * Function name : openMenufolder1
   * Input{string}: (event,element) event*-TouchEvent
   *                                element*- selected folder or file
   * Output : to open the context menu on touch enabled devices
   */
  openMenufolder1(event: TouchEvent, element: FileElement,data) {
    if(data=='grid'){
    this.endTime = new Date();
    if (event.type === 'touchend'){
      var longpress = (this.endTime - this.startTime < 500) ? false : true
      if(longpress){
        this.chechBoxenable=true;
        if (!this.filearr.some(element1 => element1._id === element._id) && !this.folderarr.some(element1 => element1._id === element._id)) {
          if (element.isFile) {
            this.filearr = [element];
            this.folderarr = [];
          } else if (element.isFolder) {
            this.folderarr = [element];
            this.filearr = [];
          }
        }
      }else {
        if(!this.chechBoxenable){
        if (!this.filearr.some(element1 => element1._id === element._id) && !this.folderarr.some(element1 => element1._id === element._id)) {
          if (element.isFile) {
            this.filearr = [element];
            this.folderarr = [];
          } else if (element.isFolder) {
            this.folderarr = [element];
            this.filearr = [];
          }
        }
        this.matmenu = element;
        this.FileMenu = true;
        // event.preventDefault();
        this.contextMenuPosition.x = event.changedTouches[0].clientX + 'px';
        this.contextMenuPosition.y = event.changedTouches[0].clientY + 'px';
        if (((this.filearr.length > 1 || this.folderarr.length > 1)
          || (this.filearr.length === 1 && this.folderarr.length === 1))) {
           this.contextMenu1.openMenu();
        } else { 
           this.contextMenu.openMenu();
         }
        }
      }
    }
  }else{
    if (!this.filearr.some(element1 => element1._id === element._id) && !this.folderarr.some(element1 => element1._id === element._id)) {
      if (element.isFile) {
        this.filearr = [element];
        this.folderarr = [];
      } else if (element.isFolder) {
        this.folderarr = [element];
        this.filearr = [];
      }
    }
    this.matmenu = element;
    this.FileMenu = true;
    // event.preventDefault();
    this.contextMenuPosition.x = event.changedTouches[0].clientX + 'px';
    this.contextMenuPosition.y = event.changedTouches[0].clientY + 'px';
    if (((this.filearr.length > 1 || this.folderarr.length > 1)
      || (this.filearr.length === 1 && this.folderarr.length === 1))) {
       this.contextMenu1.openMenu();
    } else { 
       this.contextMenu.openMenu();
     }
  }

  }

  /**
   * Function name : selectTouchDevices
   * Input{string}: (event,element) event*-checked 
   *                                element*- selected folder or file
   * Output : add or remove files and folders in touchenabled devices 
   */
  selectTouchDevices(element,event){
    if(event.checked){
      if (!this.filearr.some(element1 => element1._id === element._id) && !this.folderarr.some(element1 => element1._id === element._id)) {
        if (element.isFile) {
          this.filearr.push(element)
        } else if (element.isFolder) {
          this.folderarr.push(element)
        }
      }
    }else if(!event.checked){
      if (this.filearr.some(element1 => element1._id === element._id) || this.folderarr.some(element1 => element1._id === element._id)) {
        if (element.isFile) {
          for (var i = 0; i < this.filearr.length; i++) {
            if (this.filearr[i]._id === element._id) {
              this.filearr.splice(i, 1);  // Remove  files from after deselect
            }
          }
        }else if (element.isFolder){
          for (var i = 0; i < this.folderarr.length; i++) {
            if (this.folderarr[i]._id === element._id) {
              this.folderarr.splice(i, 1);  // Remove folders from after deselect
            }
          }
        }
      }
    }
    
  }
  startTime;
  endTime;
    /**
   * Function name : contextMenuStart
   * Input{string}: event
   * Output : Calculate Time for touch hold
   */
  contextMenuStart(event){
  this.startTime = new Date();
}
  /**
   * Function name : onDrop
   * Input{string}: (event,element) event*-drag event
   *                                element*- selected folder or file
   * Output : drag and drop of folders and files
   */
  onDrop(event, element) {
    if (element._id !== event.data._id) {
      this.moveElement(event.data, element);
    }
  }

  /**
   * Function name : dropped
   * input{UploadEvent}:(event) event*-dropped  event
   * Output : upload dropped files
   */
    public dropped = async function (event: UploadEvent) {
    var nameArray=[];
    var folderNameArray=[];
    var folderid=this.currentRoot ?this.currentRoot._id :undefined;
      for (const file of event.files) {
        var filelist=file.relativePath.split('/')
        if (file.fileEntry.isFile) {
          nameArray.push({name: filelist[filelist.length-1]});
          filelist.splice(-1,1)

          if(filelist.length!=0) {
           folderNameArray.push({name: filelist[0]});
            }
       
         }
        else if (file.fileEntry.isDirectory) {
          folderNameArray.push({name: filelist[0]})

        }
      }
      var filedata={
        files:nameArray,
        folderid:folderid,
        folders:folderNameArray
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
            if(folderNameArray && folderNameArray.length)
            {
              var folderDetails ={name:folderNameArray[0].name,parentid:folderid};
              this.documentservice.createfolder(folderDetails).subscribe((data: any) => {
                this.uploadedFolder=data
              this.droppedFileupload(event)
            })
            }
            else{
              this.uploadedFolder = null;
              this.droppedFileupload(event)

            }
           
        }
        })
      }
    else{
      this.droppedFileupload(event)
    }
  })
  };

 /**
   * Function name : droppedFileupload
   * input{UploadEvent}:(event) event*-dropped  event
   * Output : upload dropped files
   */
   droppedFileupload = async function(event: UploadEvent)
  { 
    this.uploadCompleted = false;
    let parentResult = 0;
    let fileindex = 0;
    let files;
    files = event.files;
    document.getElementById('fileselect123').click();
    document.getElementById('modelclose').click();  
    document.getElementById('modelclosesign').click();
      if (event && event.files[0].fileEntry.isDirectory && event.files.length == 1) {
        setTimeout(() => {
          this.documentservice.openSnackBar('Folder Upload Successfully', 'X');
        }, 1000);
      } else {
        this.uploader.openModal('openmodal');
      }
   
    // ------------------- Duplicate folder code
    this.checkuploadlength = event.files.length;
    this.totalfilelength = this.totalfilelength + this.checkuploadlength;
    this.uploader.array1 = this.totalfilelength;

    // ------------------------------------------------ end
    for (const file of files) {
      fileindex++;
      if (!parentResult) {
        if (this.currentRoot) {
          parentResult = this.currentRoot._id;
        } else { parentResult = 0; }
      }
      const filePathArray = file.relativePath.split('/');
      filePathArray[0] = this.uploadedFolder ? this.uploadedFolder.name : filePathArray[0];
      let index = 0;
      for (const filePathArrayData of filePathArray) {
        if (index === filePathArray.length - 1 && file.fileEntry.isFile) {
         // <---Code for the Duplicate file Names-->
          await this.uploadDragedFile(file, parentResult, filePathArray.length);
        }

        if (index !== filePathArray.length - 1) {
          const folderDetails = { name: filePathArrayData, parentid: parentResult };
          parentResult = await this.backendres(folderDetails);
        }
        index++;
      }
      parentResult = 0;
      if (fileindex === files.length) { 
        this.uploader.uploadAll();
       }
    }
    this.fileAdded.emit(); 
  }

  /**
   * Function name : uploadDragedFile
   * input{object,string,number}:(file, parentResult, filePathArrayLength) file*-file data
   *                                                                       parentResult*-parent folder details
   *                                                                       filePathArrayLength*-length of the file path array
   * Output : upload dropped files
   */
  uploadDragedFile(file, parentResult, filePathArrayLength) {
    this.queue = this.uploader.queue;
    return new Promise(async (resolve, reject) => {
      const fileEntry = file.fileEntry as FileSystemFileEntry;
      await fileEntry.file((resfile: any) => {
        if (!(filePathArrayLength === 1 && parentResult === 0)) {
          if (parentResult) { resfile.folderid = parentResult; }
        }
        if (file.fileEntry && file.fileEntry.resultFileName) { resfile.resultFileName = file.fileEntry.resultFileName; }
        this.uploader._addToQueue(resfile);
        this.RecentlyUploadedFilesList.push(resfile);
        resolve(resfile);
      });
    });
  }
  /**
   * Function name : filesPicked
   * input{object}:(files) files*-file data picked from local device
   * Output : upload the files picked from local device
   */
  filesPicked  (files) {
     let filePresent
     var filelist=[];
     var folderNameArray=[];
     var folderid=this.sampledata ?this.sampledata :undefined;
     filelist = Array.from(files)
     for (let file of filelist) {
      {
        folderNameArray.push({name: file.webkitRelativePath.split('/')[0]})
       }
      if (filePresent){break;}
     }  
     var filedata={
      folders:folderNameArray,
      folderid:folderid
    }
    this.documentservice.isFilenameExits(filedata).subscribe(data=>{
      if (data) {
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

            var folderDetails ={name:folderNameArray[0].name,parentid:folderid};
            this.documentservice.createfolder(folderDetails).subscribe((data: any) => {
              this.uploadedFolder=data
            this.folderUpload(files)
        this.uploader.openModal('openmodal');
            
            })
          }
        })
      }
    else{
    this.folderUpload(files)
    }
   
  })
   };


 /**
   * Function name : onFileSelected1
   * input{object,string}:(files,parentid) files*-file data picked from local device
   *                                       parentid*-current parent directory
   * Output : add the files in queue to upload
   */
  folderUpload =async function (files) {
    this.foldweshow1 = false;
    document.getElementById('fileselect123').click();
    document.getElementById('modelclose').click();
    document.getElementById('modelclosesign').click();
    let fileindex = 0;
    // ------------------- Duplicate folder code

    this.uploader.array1 = files.length;
    this.checkuploadlength = files.length;
    this.totalfilelength = this.totalfilelength + this.checkuploadlength;

    // ------------------------------------------------ end
    for (const file of files) {
      fileindex++;
      const filePathArray = file.webkitRelativePath.split('/');
      filePathArray[0] = this.uploadedFolder ? this.uploadedFolder.name : filePathArray[0];
      this.folderdata = file.webkitRelativePath;
      let parentResult = 0;
      if (this.sampledata) {
        parentResult = this.sampledata;
      }
      let index = 0;
      for (const filePathArrayData of filePathArray) {
        if (index === filePathArray.length - 1) { await this.onFileSelected1(file, parentResult); }
        if (index !== filePathArray.length - 1) {
          const folderDetails = { name: filePathArrayData, parentid: parentResult };
          parentResult = await this.backendres(folderDetails);
        }
        index++;
      }
      this.fileAdded.emit();
      if (fileindex === files.length) { this.uploader.uploadAll(); }
    }
  };

  /**
   * Function name : onFileSelected1
   * input{object,string}:(files,parentid) files*-file data picked from local device
   *                                       parentid*-current parent directory
   * Output : add the files in queue to upload
   */
  onFileSelected1 = function (files: any, parentid: any) {
    this.queue = this.uploader.queue;
    if (parentid) { files.parentid = parentid; }
    this.uploader._addToQueue(files);
    return true;
  };

  /**
   * Function name : fileInputclick1
   * Input{object}: (element) element*- selected file or folder
   * Output : Excutes When You click on 'Add document from your computer'
   */
  fileInputclick(element) {
    this.uploadCompleted = false;
    if (element) { this.folderid = element; }
    this.fileInput1.nativeElement.value = '';
    document.getElementById('fileselect121').click();
  }

  welcomeclose() { // to close the welcome modal
    document.getElementById('closewelcome').click();
  }
  /**
   * Function name : multiFileCopy
   * Input :null
   * Output : Makes copy of multiple files
   */
  multiFileCopy() {
    const filedata = JSON.parse(JSON.stringify(this.filearr));
    setTimeout(() => {
      $('body').css('overflow', 'hidden');
    }, 10);
    const dialogRef = this.dialog.open(CommonDialogComponent, {
      data: { name: 'makecopy' },
      width: '500px', panelClass: 'deletemod', disableClose: false
    });
    dialogRef.afterClosed().subscribe(res => {
      this.chechBoxenable=false;
      setTimeout(() => {
        $('body').css('overflow', 'auto');
      }, 10);
      if (res) {
        this.sample2 = false;
        this.uploader.multimakecopy(filedata).subscribe(data => {
          this.fileAdded.emit();
          if(filedata && filedata.length>1){
            this.documentservice.openSnackBar(`${filedata.length} Files Copied Successfully`, 'X');
          }else{
            this.documentservice.openSnackBar('Copied Successfully', 'X');
          }
        });
      }

    });
  }
  /**
   * Function name : makecopyElement
   * Input{object}: (element) element*- selected file
   * Output : Make copy of slected file
   */
  makecopyElement = function (element) {
    const locationdata = JSON.parse(localStorage.getItem('currentLocation'));
    if (locationdata) { var latitude = locationdata.latitude; }
    if (locationdata) { var longitude = locationdata.longitude; }
    setTimeout(() => {
      $('body').css('overflow', 'hidden');


    }, 10);
    const dialogRef = this.dialog.open(CommonDialogComponent, {
      data: { name: 'makecopy' },
      width: '500px', panelClass: 'deletemod', disableClose: false
    });
    dialogRef.afterClosed().subscribe(res => {
      setTimeout(() => {
        $('body').css('overflow', 'auto');


      }, 10);
      if (res) {
        this.sample2 = false;
        this.uploader.makecopy(element).subscribe(data => {
          this.copyfile = data;
          const mousedata = {
            uid: this.copyfile.uid,
            documentid: this.copyfile._id,
            message: 'Made copy',
            latitude: latitude,
            longitude: longitude,
            isFile: true,
            IpAddress: (this.IpAddress) ? this.IpAddress.ip : 'Not Avilable'

          };
          setTimeout(() => {
            this.documentservice.savemousemovement(mousedata).subscribe(data => {
            });
          }, 1000);

          this.fileAdded.emit();
          this.documentservice.openSnackBar('Copied Successfully', 'X');

        });
      }

    });
  };

  private filesData = new Subject<any>();
  /**
   * Function name : addToQueue
   * input{object,event}:(folder)  folder*-current root directory
   *                                event*-file select event
   * Output : upload the files
   */  
  addToQueue(folder, event) {
    let nameArray=[];
    let fileBrowserelement = this.fileInput1.nativeElement;
  
    console.log("fff", this.fileInput1.nativeElement.files);

    var filelist = Array.from(fileBrowserelement.files);
    if (this.folderid) {folder = this.folderid; }
    filelist.forEach((file:any)=>{
      nameArray.push({name:file.name})
    })
    var filedata={
      files:nameArray,
      folderid:folder
    }
    this.documentservice.isFilenameExits(filedata).subscribe(data=>{
      if (data) {
        document.getElementById('fileselect123').click();
        document.getElementById('modelclose').click();
        document.getElementById('modelclosesign').click();

        const nameConfirmationDiaBox = this.dialog.open(SignupdialogboxComponent, {
          width: '500px',
          disableClose: false,
          autoFocus: true,
          panelClass: 'passwordbottom',
          data: { type: 'fileName' }
        });
        nameConfirmationDiaBox.afterClosed().subscribe(res => {
          if (res) {
            this.fileupload(folder, event,fileBrowserelement)
          }
        })
      }
      else {
         this.fileupload(folder, event,fileBrowserelement)
      }  
      })
  }
  /**
   * Function name : fileupload
   * input{object,event}:(folder)  folder*-current root directory
   *                                event*-file select event
   * Output : upload the files
   */
  fileupload(folder, event,files)
  {     
    let fileBrowserelement = files
    this.uploader.openModal('openmodal');
    if (event && event.target.value) {
      document.getElementById('modelclose').click();
      document.getElementById('modelclosesign').click();
      document.getElementById('fileselect123').click();
      if (this.iebrowser) {
        if (this.scrollheight > 0) {
          $('html', 'body').animate({
            // while upload file in ie scroll position changes issue fixed
            scrollTop: this.scrollheight,
          });
        } else if (this.scrollheight === 0) {
          $('html', 'body').animate({
            // while upload file in ie scroll position changes issue fixed
            scrollTop: 2
          });
        }
      }
      if (this.folderid) { folder = this.folderid; }
      let totalSize = 0;
      this.queue = this.uploader.queue;
      this.uploader.sendFilesUpload(this.uploader.queue)
      let pdfFiles1 = [];
      console.log(fileBrowserelement.files)

      for (var i = 0; i < fileBrowserelement.files.length; i++) {
        if (fileBrowserelement.files[i]) {
          if (folder) { fileBrowserelement.files[i].folderid = folder; }
          totalSize = totalSize + fileBrowserelement.files[i].size;
          pdfFiles1.push(fileBrowserelement.files[i]);
          this.RecentlyUploadedFilesList.push(fileBrowserelement.files[i]);
        }
      }

      if (!this.totalfilelength) {
        if (this.iebrowser) {
          if (this.scrollheight > 0) {
            $('html, body').animate({
              // while upload file in ie scroll position changes issue fixed
              scrollTop: this.scrollheight
            });

          } else if (this.scrollheight === 0) {
            $('html, body').animate({
              // while upload file in ie scroll position changes issue fixed
              scrollTop: 2
            });

          }


        }


      }
      this.checkuploadlength = pdfFiles1.length;
      this.totalfilelength = this.totalfilelength + pdfFiles1.length;
      this.uploader.array1 = this.totalfilelength;

      this.uploader.addToQueue(pdfFiles1);
      this.uploader.totalfilesize = totalSize;
      this.uploader.uploadAll();

      if (this.firstuser) {
        let newelement;
        newelement = JSON.parse(localStorage.getItem('currentUser'));
        newelement.new = this.userService.encryptData(false);
        localStorage.setItem('currentUser', JSON.stringify(newelement));
        this.adminService.updatenewuser().subscribe(data => { });
      }
      this.folderid = false;
      if (this.uploader.queue) {
      }
    }
  }

  /**
   * Function name : fileNameSplit
   * input{JSON object}:(inputFile) inputFile*-file data
   * Output : File name splictting with extention
   */
    fileNameSplit(inputFile) { // Need to pass formal argument as JSON object
    let result;
    let extention;
    if (inputFile.fileEntry) { inputFile = inputFile.fileEntry as FileSystemFileEntry; }
    if (inputFile.type === 'application/pdf') {
      extention = 'pdf';
    } else if (inputFile.type === 'application/msword') {
      extention = 'doc';
    } else if (inputFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      extention = 'docx';
    } else if (!(inputFile.type) && ((inputFile.name.lastIndexOf('.') + 1 === (inputFile.name.length - 3)) ||
      (inputFile.name.lastIndexOf('.') + 1 === (inputFile.name.length - 4)))) {
      extention = inputFile.name.substring(inputFile.name.lastIndexOf('.') + 1, inputFile.name.length);
      if (!(extention === 'pdf' || extention === 'doc' || extention === 'docx')) {
        return result;
      }
    } else { return result; }
    if (inputFile.name.length - (inputFile.name.lastIndexOf('.') + 1) === extention.length) {
      const newName = inputFile.name.substring(0, inputFile.name.length - (extention.length + 1));
      result = { name: newName, extention: extention };
    }
    return result;
  }

  /**
   * Function name : backendres
   * input{object}:(folderDetails)  folderDetails*-new folderDetails
   * Output : check Whether already folder exits and create new folder
   */
  backendres(folderDetails) {
    return new Promise(async (resolve, reject) => {
      this.uploadedFolder=null
      await this.documentservice.isFolderIsExist(folderDetails).subscribe(async (folderdata: any) => {
        if (folderdata) {
          resolve(folderdata._id);
        } 
        else {
          await this.documentservice.createfolder(folderDetails).subscribe((data: any) => {
            this.RecentlyUploadedFoldersList.push(data);
            resolve(data._id);
          });
        }
      });
    });
  }


  /**
   * Function name : getFileContent
   * input{object}:(content)  content*-selected file
   * Output : open's the selected file
   */
  getFileContent = function (content) {
    this.filearr = [];
    this.folderarr = [];
    if (content.type === 'application/zip') {
    } else {
      const filedata = {
        fileid: content._id
      };
      this.documentservice.encryptedvalues(filedata).subscribe((data: any) => {
        if (this.profiledata.type === 'individual') {
          this.router.navigate(['individual/filecont/' + data.encryptdata]);
        } else if (this.profiledata.type === 'organisation' || this.profiledata.type === 'employee') {
          this.router.navigate(['organization/filecont/' + data.encryptdata]);
        }
      });
    }
  };


  /**
   * Function name : getFileContent
   * input{object}:(element)  element*-selected file or folder
   * Output : open's the aduitlog of selected file
   */
  viewDetails = function (element) {
    const filedata = {
      fileid: element._id,
      test: element.isFile
    };

    this.documentservice.encryptedvalues(filedata).subscribe((data: any) => {
      if (element.isFile) {
        if (this.profiledata.type === 'individual') {
          this.router.navigate(['individual/home/auditlog/' + data.encryptdata + '/File']);
        } else if (this.profiledata.type === 'organisation' || this.profiledata.type === 'employee') {
          this.router.navigate(['organization/home/auditlog/' + data.encryptdata + '/File']);
        }
      } else {
        if (this.profiledata.type === 'individual') {
          this.router.navigate(['individual/home/auditlog/' + data.encryptdata + '/Folder']);
        } else if (this.profiledata.type === 'organisation' || this.profiledata.type === 'employee') {
          this.router.navigate(['organization/home/auditlog/' + data.encryptdata + '/Folder']);
        }
      }
    });

  };

  // *********************************************Upload file from google drive***********************************************************/

  loadGoogleDrive() {
    gapi.load('auth', { callback: this.onAuthApiLoad.bind(this) });
    gapi.load('picker', { callback: this.onPickerApiLoad.bind(this) });
  }

  onAuthApiLoad() {
    gapi.auth.authorize(
      {
        client_id: this.clientId,
        scope: this.scope,
        immediate: false
      },
      this.handleAuthResult);
  }

  onPickerApiLoad() {
    this.pickerApiLoaded = true;
  }

  handleAuthResult = (authResult) => {
    if (authResult && !authResult.error) {
      if (authResult.access_token) {
        this.access = authResult.access_token;
        document.getElementById('fileselect123').click();
        const pickerBuilder = new google.picker.PickerBuilder();
        const picker = pickerBuilder.
          setOAuthToken(authResult.access_token).
          addView(new google.picker.DocsView()
            .setIncludeFolders(true).setOwnedByMe(true).
            setMimeTypes('application/pdf,application/vnd.google-apps.document,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document'))
          .addView(new google.picker.DocsView()
            .setIncludeFolders(true).setOwnedByMe(false)
            .setMimeTypes('application/pdf,application/vnd.google-apps.document,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document'))
          .setCallback((e) => { this.pickerCallback(e); }).
          build();
        picker.setVisible(true);
      }
    }
  }

  // google picker callback
  pickerCallback(data) {
    const self = this;
    if (data[google.picker.Response.ACTION] === google.picker.Action.PICKED) {
      const doc = data[google.picker.Response.DOCUMENTS][0];
      self.uploadtoDB(doc);
    }
  }

  // uplaod file to db
  uploadtoDB(doc) {
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
            this.isSocialLoading = true;
            this.documentservice.googleupload(doc).subscribe(data => {
              const newfile = data;
              if (newfile) {
                if (!NgZone.isInAngularZone()) {
                  this._ngZone.run(() => {
                    this.openSnackBar('File added from Google Drive', 'X');
                  });
                }
                this.uploadFile('document');
                this.fileAdded.emit();
                this.isSocialLoading = false;
              }
            });
          }
          

        })
      }
      else {
        this.isSocialLoading = true;
        this.documentservice.googleupload(doc).subscribe(data => {
          const newfile = data;
          if (newfile) {
            if (!NgZone.isInAngularZone()) {
              this._ngZone.run(() => {
                this.openSnackBar('File added from Google Drive', 'X');
              });
            }
            this.uploadFile('document');
            this.fileAdded.emit();
            this.isSocialLoading = false;
          }
        });
      }
    })

  }
  // ***********************************************************************************************************************************/

  // ************************************************Upload file from drop box ***********************************************************/

  loaddropbox = function () {
    Dropbox.choose(this.options);
  };
  dropurlcontent(urldata) {
    var nameArray=[];
    const dropboxurl =
    {
      value: urldata
    };
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
              this.documentservice.openSnackBar('File added from Dropbox', 'X');
              this.uploadFile('document');
              this.fileAdded.emit();
              this.isSocialLoading = false;
            }, error => {
              if (error === 'Invalid') {
                this.documentservice.openSnackBar('not pdf ', 'X');
              }
              this.isSocialLoading = false;
            });
          }
        })
      }
      else {
        this.uploader.urlcontent(dropboxurl).subscribe(data => {
          this.documentservice.openSnackBar('File added from Dropbox', 'X');
          this.uploadFile('document');
          this.fileAdded.emit();
          this.isSocialLoading = false;
        }, error => {
          if (error === 'Invalid') {
            this.documentservice.openSnackBar('not pdf ', 'X');
          }
          this.isSocialLoading = false;
        });
      }
    })
  }
}
    
  

  // ***********************************************************************************************************************************/

  // ************************************************Upload file from one drive ***********************************************************/

  loadoneDrive() {
    this.launchOneDrivePicker();
  }

  launchOneDrivePicker = () => {
    var redirecturi;
    if (this.profiledata.type === 'individual') {
      redirecturi=this.frontendurl + '/individual/home/myfiles/';
    } else if (this.profiledata.type === 'organisation' || this.profiledata.type === 'employee') {
      redirecturi=this.frontendurl + '/organization/home/myfiles/';
    }
    const odOptions = {
      clientId: this.oneDriveApplicationId,
      action: 'download',
      multiSelect: true,
      openInNewWindow: true,
      advanced: {
        filter: '.pdf,.doc,.docx', // Show only folders and png files
        redirectUri: redirecturi
      },
      success: (files) => {
        this.isSocialLoading = true;

        document.getElementById('fileselect123').click();
        this.onedriveurlcontent(files.value);

      },
      cancel: () => { },
      error: (e) => { }
    };
    OneDrive.open(odOptions);
  }

  onedriveurlcontent = (files) => {
    files.forEach(element => {
      const dropboxurl = {
        name: element.name,
        url: element['@microsoft.graph.downloadUrl']
      };
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
           this.isSocialLoading = true;
           this.uploader.onedriveurlcontent(dropboxurl).subscribe(data => {
          this.isSocialLoading = false;
          if (!NgZone.isInAngularZone()) {
            this._ngZone.run(() => {
              this.documentservice.openSnackBar('File added from Onedrive', 'X');
            });
          }
          this.uploadFile('document');
          this.fileAdded.emit();
        }, error => {
          if (error === 'Invalid') {
            this.documentservice.openSnackBar('not pdf ', 'X');
          }
          this.isSocialLoading = false;
        });
      }
           }
         })
       }
       else {
           if (dropboxurl) {
        this.uploader.onedriveurlcontent(dropboxurl).subscribe(data => {
          this.isSocialLoading = false;
          if (!NgZone.isInAngularZone()) {
            this._ngZone.run(() => {
              this.documentservice.openSnackBar('File added from Onedrive', 'X');
            });
          }
          this.uploadFile('document');
          this.fileAdded.emit();
        }, error => {
          if (error === 'Invalid') {
            this.documentservice.openSnackBar('not pdf ', 'X');
          }
          this.isSocialLoading = false;
        });
      }
       }
     })
    
    });

  }

  // ***********************************************************************************************************************************/
  // ************************************************export to drive***********************************************************/

  exporttodrive() {
    gapi.load('auth', { callback: this.onAuthApi.bind(this) });
  }
  onAuthApi() {
    gapi.auth.authorize(
      {
        client_id: this.clientid,
        scope: this.scopes,
        immediate: false
      },
      this.handleAuthResults);
  }
  handleAuthResults = (authResult) => {
    if (authResult && authResult.access_token) { this.pdfDownload(authResult); }
  }
  // ***********************************************************************************************************************************/

  /**
   * Function name : samp
   * input{object}:(element)  element*-selected file or folder
   * Output : Assign the selected file to about details
   */
  samp(element) {
    this.aboutdetails = element;
    $(document).ready(() => {
      $('.newclass').css('width', '500px');
    });
  }


  close1(event) { // context menu event
    event.preventDefault();
  }

  /**
   * Function name : samp
   * input{object}:(element)  element*-selected file
   * Output : SEt Download options berore download  / opening the popup
   */
  setDownload(element) {
    this.element = element;
    this.downloadType = 'computer';
    this.downloadFile = 'current';
    this.withlog = false;
    this.pdfPinSet = false;
    this.pdfPin = '';
    this.email = '';
  }
  /**
   * Function name : samp
   * input{object}:(token)  token*-google auth token
   * Output : PdfGEt Pdf Download URL
   */
  pdfDownload(token) {
    if (this.downloadFile === 'withoutchanges') { this.withlog = undefined; }
    const downloaddata = {
      id: this.element._id,
      name: this.element.name,
      downloadType: this.downloadType,
      downloadFile: this.downloadFile,
      withlog: this.withlog,
      pdfPinSet: this.pdfPinSet,
      pdfPin: this.pdfPin,
      access_token: '',
      scope: this.scopes,
      token_type: '',
      expiry_date: '',
      email: this.email
    };
    if (token) {
      downloaddata.access_token = token.access_token;
      downloaddata.token_type = token.token_type;
      downloaddata.expiry_date = token.expires_at;
    }
    if (this.downloadType !== 'attachment') {
      document.getElementById('savetempclose').click();
      this.isSocialLoading = true;
      this.documentservice.pdfDownload(downloaddata).subscribe((data: any) => {
        if (data.path && downloaddata.downloadType === 'computer') {
          this.isSocialLoading = false;
          this.documentservice.openSnackBar('File(s) Downloaded Successfully', 'X');
          const xhr = new XMLHttpRequest();
          xhr.open('GET', data.path);
          xhr.responseType = 'blob';
          xhr.onload = () => {
            saveAs(xhr.response, downloaddata.name);
          };
          xhr.send();

        } else if (downloaddata.downloadType === 'drive') {
          this.isSocialLoading = false;
          if (!NgZone.isInAngularZone()) {
            this._ngZone.run(() => {
              this.documentservice.openSnackBar('File Export To Drive', 'X');
            });
          }

        } else { this.isSocialLoading = false; }

      });
    } else if (this.downloadType === 'attachment') {
      if (this.email == null || this.email === '') {
        this.documentservice.openSnackBar('Please Enter Email', 'X');
      } else {
        const regexp = new RegExp('([A-Za-z]|[0-9])[A-Za-z0-9.]+[A-Za-z0-9]@((?:[-a-z0-9]+\.)+[a-z]{2,})');
        if (regexp.test(this.email)) {
          document.getElementById('savetempclose').click();
          this.isSocialLoading = true;
          this.documentservice.pdfDownload(downloaddata).subscribe((data: any) => {
            if (downloaddata.email && downloaddata.downloadType === 'attachment') {
              this.isSocialLoading = false;
              this.documentservice.openSnackBar('File sent To email', 'X');
            } else { this.isSocialLoading = false; }
          });
        } else {
          this.documentservice.openSnackBar('Please enter valid email', 'X');
        }

      }
    }
  }

  closemodal() { // to close the modal
    document.getElementById('modelclosesign').click();
    document.getElementById('modelclose').click();

  }
  /**
   * Function name : getHighlight
   * Input{object}: (data) data*- selected file or folder
   * Output : to high light the selected row
   */
  getHighlight(data) {
    if (data.isFile) {
      if (this.filearr.some(element => element._id === data._id)) {
        return true;
      } else { return false; }
    } else if (data.isFolder) {
      if (this.folderarr.some(element => element._id === data._id)) {
        return true;
      } else { return false; }
    } else { return false; }
  }
  /**
   * Function name : singleselectpdf
   * Input{object,event}: (element1) element1*- selected file 
   * Output : select files to share for signature
   */
  singleselectpdf(element1){
    this.filearr=[]
    this.folderarr=[]
    if (element1.isFile) {
      if (!this.filearr.some(element => element._id === element1._id)) {
        this.filearr.push(element1);
      }
    } else if(element1.isFolder){
      if (!this.folderarr.some(element => element._id === element1._id)) {
        this.folderarr.push(element1);
      }
    }
  }



  /**
   * Function name : multiselectpdf
   * Input{object,event}: (element1) element1*- selected file or folder
   *                       (event) event*-mouse event
   * Output : to multi select the file and folders
   */
  multiselectpdf(element1, event) {    
    this.clickselectedElement=element1
    if(element1.isFile){ this.selectindex=this.fileData.findIndex((element) => element._id == this.clickselectedElement._id);}
    if(element1.isFolder){ this.selectindex=this.fileElements.findIndex((element) => element._id == this.clickselectedElement._id);}
    this.triggervalue = true;
    let indexNum;
    if (event && event.ctrlKey) {
      if (element1.isFile) {
        if (!this.filearr.some(element => element._id === element1._id)) {
          this.filearr.push(element1);
          if (this.filearr.length > 1) { this.EnableDelete = true; }
        } else {
          indexNum = this.filearr.findIndex((element) => {
            return (element._id === element1._id);
          });
          this.filearr.splice(indexNum, 1);
        }
      } else if (element1.isFolder) {
        if (!this.folderarr.some(element => element._id === element1._id)) {
          this.folderarr.push(element1);
          if (this.folderarr.length > 1) { this.EnableDelete = false; }
        } else {
          indexNum = this.folderarr.findIndex((element) => {
            return (element._id === element1._id);
          });
          this.folderarr.splice(indexNum, 1);
        }
      } else {
      }
    } else {
      if (element1.isFile) {
        this.filearr = [element1];
        this.folderarr = [];
      } else if (element1.isFolder) {
        this.folderarr = [element1];
        this.filearr = [];
      }
    }

    if ((this.filearr.length > 1 || this.folderarr.length > 1) || (this.filearr.length === 1 && this.folderarr.length === 1)) {
      this.triggervalue = false;
      this.sample2 = false;
      this.EnableDelete = true;
    }
    this.startFile = element1
    this.startIndex = {
      num:0,
      direction:''
    }
  }

  /**
   * Function name : deleteSlectedElement
   * Input:null
   * Output :  deletes select the file and folders
   */
  deleteSlectedElement() {
    this.matdialogopen = true;
    const folders = JSON.parse(JSON.stringify(this.folderarr));
    const files = JSON.parse(JSON.stringify(this.filearr));
    if (folders.length && files.length) {
      setTimeout(() => {
        $('body').css('overflow', 'hidden');
      }, 10);
      const dialogRef = this.dialog.open(CommonDialogComponent, {
        data: { name: 'deleteMultiFilesandFolders' },
        width: '500px', panelClass: 'deletemod', disableClose: false
      });
      dialogRef.afterClosed().subscribe(res => {
        setTimeout(() => {
          $('body').css('overflow', 'auto');
        }, 10);
        this.matdialogopen = false;
         this.chechBoxenable=false
        if (res) {
          this.documentservice.multiFolderDelete(folders).subscribe(data => {
            this.documentservice.multiFileDelete(files).subscribe(data => {
              if (data) { this.documentservice.openSnackBar('Items deleted Successfully!', 'X'); }
              this.fileAdded.emit();
            });
          });
        }
      });
    } else if (files.length && !folders.length) {
      setTimeout(() => {
        $('body').css('overflow', 'hidden');
      }, 10);
      const dialogRef = this.dialog.open(CommonDialogComponent, {
        data: { name: 'deleteMultiFiles' },
        width: '500px', panelClass: 'deletemod', disableClose: false
      });
      dialogRef.afterClosed().subscribe(res => {
        setTimeout(() => {
          $('body').css('overflow', 'auto');


        }, 10);
        this.matdialogopen = false;
        if (res) {
          this.documentservice.multiFileDelete(files).subscribe(data => {
            if (data) { this.documentservice.openSnackBar('File(s) deleted Successfully!', 'X'); }
            this.fileAdded.emit();
          });
        }
      });
    } else if (folders.length && !files.length) {
      setTimeout(() => {
        $('body').css('overflow', 'hidden');


      }, 10);
      const dialogRef = this.dialog.open(CommonDialogComponent, {
        data: { name: 'deleteMultiFolders' },
        width: '500px', panelClass: 'deletemod', disableClose: false
      });
      dialogRef.afterClosed().subscribe(res => {
        setTimeout(() => {
          $('body').css('overflow', 'auto');


        }, 10);
        this.matdialogopen = false;
        if (res) {
          this.documentservice.multiFolderDelete(folders).subscribe((data: any) => {
            if (data.message === 'success') {
              this.documentservice.openSnackBar('Folder(s) deleted successfully', 'X');
            }
            this.fileAdded.emit();
          });
        }
      });
    }
  }
  /**
   * Function name : multiSelectMove
   * Input:null
   * Output :  move multiple files and folders
   */
  multiSelectMove() {
    this.dialogopen = false;
    this.sample2 = false;
    const folders = JSON.parse(JSON.stringify(this.folderarr));
    const files = JSON.parse(JSON.stringify(this.filearr));
    setTimeout(() => {
      $('body').css('overflow', 'hidden');
    }, 10);
    const dialogRef = this.dialog.open(MovetoComponent,
      {
        width: '500px',
        panelClass: 'withoutpadding',
        data: { folders: this.folderarr, documents: this.filearr, Allfolder: this.parent, multi: true },
        disableClose: false,
      });
    dialogRef.afterClosed().subscribe(res => {
      setTimeout(() => {
        $('body').css('overflow', 'auto');
      }, 10);
      const selecteddata = {
        folders: folders,
        files: files,
        moveto: res
      };
      if (res !== 'CloseButton') {
        this.documentservice.multiselectmove(selecteddata).subscribe(data => {
          if (data) {
            this.fileAdded.emit();
            this.documentservice.openSnackBar('Moved Successfully!', 'X');
          }
        });

      }

    });
  }

  /**
   * Function name : getMultiCopy
   * Input:null
   * Output :  to enable copy option on multiple select
   */
  getMultiCopy() {
    if (!this.folderarr.some(element => element.isFolder) && this.filearr.some(element => element.isFile)) {
      return false;
    } else { return true; }
  }
  /**
   * Function name : getMultiFav
   * Input:null
   * Output :  to enable Favorite option on multiple select
   */
  getMultiFav() {
    const folders = JSON.parse(JSON.stringify(this.folderarr));
    const files = JSON.parse(JSON.stringify(this.filearr));
    if (folders.some(element => !element.favoriteid) || files.some(element => !element.favoriteid)) {
      return true;
    } else { return false; }
  }

  /**
   * Function name : multiFavorite
   * Input(boolean):(favorite) favorite*-true or false
   * Output :  to make multiple files favorite and unfavorite
   */
  multiFavorite(favorite) {
    this.chechBoxenable=false;
    const folders = JSON.parse(JSON.stringify(this.folderarr));
    const files = JSON.parse(JSON.stringify(this.filearr));
    const selecteddata = {
      folders: folders,
      files: files,
      make_favorite: favorite
    };
    this.documentservice.multiFavorite(selecteddata).subscribe(data => {
      if (data) {
        this.fileAdded.emit();
        if (favorite) {
          this.filearr=[]
          this.folderarr=[]
          this.documentservice.openSnackBar('Added to favourites!', 'X');
        } else { this.documentservice.openSnackBar('Removed from favourites!', 'X'); }
      }
    });


  }

  /**
   * Function name : multishareElement
   * Input:null
   * Output :  share multiple files ons folders
   */
  multishareElement() {
    const folders = JSON.parse(JSON.stringify(this.folderarr));
    const files = JSON.parse(JSON.stringify(this.filearr));
    var selecteddata ;
    var multi;
    if(files.length == 0 && folders.length == 1){
      selecteddata = folders[0]
      multi = false
    }
    else if(files.length == 1 && folders.length == 0){
      selecteddata = files[0] ;
      multi = false;
    }
    else{
      selecteddata = {
        folders: folders,
        files: files,
      };
      multi = true
    }
    if (this.newelement && this.newelement.type == 'individual') {
      setTimeout(() => {
        $('body').css('overflow', 'hidden');
      }, 10);
     
      const filedialog = this.dialog.open(SharepopupComponent, {
        width: '848px',
        height: '600px',
        disableClose: false,
        autoFocus: false,
        panelClass: 'test',
        data: { content: selecteddata, text: 'owner', title: null, multi:  multi  }
      });
      filedialog.afterClosed().subscribe(res => {
    this.chechBoxenable=false
        setTimeout(() => {
          $('body').css('overflow', 'auto');
        }, 10);
      });
    } else {
      setTimeout(() => {
        $('body').css('overflow', 'hidden');
      }, 10);
      const filedialog = this.dialog.open(OrganizationFileSharingComponent, {
        width: '900px',
        disableClose: false,
        panelClass: 'orgn',
        autoFocus: false,
        data: { content: selecteddata, title: null, multi: multi },
      });
      filedialog.afterClosed().subscribe(res => {
        if (res !== 'true') {
    this.chechBoxenable=false
          setTimeout(() => {
            $('body').css('overflow', 'auto');
          }, 10);
        }
      });
    }
  }

  /**
   * Function name : openSnackBar
   * input{string,string}:(message,action)  message*-message to be displayed
   *                                        action*-action to be performed
   * Output : open's the openSnackBar
   */
  openSnackBar(message, action: string) {
    this.snackBar.open(message, action, {
      duration: 2000,
      panelClass: ['bar-color'],
      horizontalPosition: 'right',
      verticalPosition: 'bottom',

    });
  }

  /**
   * Function name : navigatewhiletouch
   * input{event,object}:(e,element)  e*-touch event
   *                                  element*-selected element
   * Output :  navigate to file or folder while touch enabled devices
   */
  navigatewhiletouch(e, element) {
    const time2 = e.timeStamp;
    const time1 = e.currentTarget.dataset.lastTouch || time2;
    const dt = time2 - time1;
    const fingers = e.touches.length;
    e.currentTarget.dataset.lastTouch = time2;
    if (!dt || dt > 500 || fingers > 1) {
      return; // not double-tap
    } else {
      this.navigatemodal(element);
    }
    e.preventDefault();
    e.target.click();
  }
  calscrollheignt() {
    if (this.iebrowser) { this.scrollheight = document.documentElement.scrollTop; }
  }
  // selectWithShiftRight() {  //Shift+Right Arrow
  //   if(this.startIndex.num==0) {
  //     this.startIndex.direction='right'
  //   }
  //   let prevVal = JSON.parse(JSON.stringify(this.startIndex.num))
  //   for(var i=0;i<this.filesFolders.length;i++) {
  //     for(var j=0;j<this.filesFolders[i].length;j++) {
  //       if(this.filesFolders[i][j] && (this.element._id==this.filesFolders[i][j]._id)) {
  //         if(this.filesFolders[i][j+1]) {
  //           if(this.startIndex.direction=='right') this.startIndex.num++
  //           else this.startIndex.num--
  //           this.element = this.filesFolders[i][j+1]
  //           if(prevVal<this.startIndex.num)
  //             this.filesFolders[i][j+1].isFile ? this.filearr.push(this.filesFolders[i][j+1]) : this.folderarr.push(this.filesFolders[i][j+1])
  //           else if(this.startFile._id!=this.filesFolders[i][j]._id){
  //             if(this.filesFolders[i][j].isFile) {
  //               this.filearr.forEach((ele,index)=>{
  //                 if(ele._id==this.filesFolders[i][j]._id) this.filearr.splice(index)
  //               })
  //             }
  //             else {
  //               this.folderarr.forEach((ele,index)=>{
  //                 if(ele._id==this.filesFolders[i][j]._id) this.folderarr.splice(index)
  //               })
  //             }
  //           }
              
  //           this.endFile = this.filesFolders[i][j+1]
  //           this.filearr = _.uniqBy(this.filearr, '_id');
  //           this.folderarr = _.uniqBy(this.folderarr, '_id');
  //           return
  //         }
  //         else if(this.filesFolders[i+1] && this.filesFolders[i+1][0]){
  //           if(this.startIndex.direction=='right') this.startIndex.num++
  //           else this.startIndex.num--
  //           this.element = this.filesFolders[i+1][0]
  //           if(prevVal<this.startIndex.num)
  //             this.filesFolders[i+1][0].isFile ? this.filearr.push(this.filesFolders[i+1][0]) : this.folderarr.push(this.filesFolders[i+1][0])
  //           else if(this.startFile._id!=this.filesFolders[i][j]._id){
  //             if(this.filesFolders[i][0].isFile) {
  //               this.filearr.forEach((ele,index)=>{
  //                 if(ele._id==this.filesFolders[i][j]._id) this.filearr.splice(index)
  //               })
  //             }
  //             else {
  //               this.folderarr.forEach((ele,index)=>{
  //                 if(ele._id==this.filesFolders[i][j]._id) this.folderarr.splice(index)
  //               })
  //             }
  //           }
  //           this.endFile = this.filesFolders[i+1][0]
  //           this.filearr = _.uniqBy(this.filearr, '_id');
  //           this.folderarr = _.uniqBy(this.folderarr, '_id');
  //           return
  //         }
  //       }
  //     }
  //   }
  // }
  // selectWithShiftLeft() {  //Shift+Right Arrow
  //   if(this.startIndex.num==0) {
  //     this.startIndex.direction='left'
  //   }
  //   let prevVal = JSON.parse(JSON.stringify(this.startIndex.num))
  //   for(var i=0;i<this.filesFolders.length;i++) {
  //     for(var j=0;j<this.filesFolders[i].length;j++) {
  //       if(this.filesFolders[i][j] && (this.element._id==this.filesFolders[i][j]._id)) {
  //         if(this.filesFolders[i][j-1]) {
  //           if(this.startIndex.direction=='left') this.startIndex.num++
  //           else this.startIndex.num--
  //           this.element = this.filesFolders[i][j-1]
  //           if(prevVal<this.startIndex.num)
  //             this.filesFolders[i][j-1].isFile ? this.filearr.push(this.filesFolders[i][j-1]) : this.folderarr.push(this.filesFolders[i][j-1])
  //           else if(this.startFile._id!=this.filesFolders[i][j]._id){
  //             if(this.filesFolders[i][j].isFile) {
  //               this.filearr.forEach((ele,index)=>{
  //                 if(ele._id==this.filesFolders[i][j]._id) this.filearr.splice(index)
  //               })
  //             }
  //             else {
  //               this.folderarr.forEach((ele,index)=>{
  //                 if(ele._id==this.filesFolders[i][j]._id) this.folderarr.splice(index)
  //               })
  //             }
  //           }
  //           this.endFile = this.filesFolders[i][j+1]
  //           this.filearr = _.uniqBy(this.filearr, '_id');
  //           this.folderarr = _.uniqBy(this.folderarr, '_id');
  //           return
  //         }
  //         else if(this.filesFolders[i-1] && this.filesFolders[i-1][this.filesFolders[i-1].length-1]){
  //           if(this.startIndex.direction=='left') this.startIndex.num++
  //           else this.startIndex.num--
  //           this.element = this.filesFolders[i-1][this.filesFolders[i-1].length-1]
  //           if(prevVal<this.startIndex.num)
  //             this.filesFolders[i-1][this.filesFolders[i-1].length-1].isFile ? this.filearr.push(this.filesFolders[i-1][this.filesFolders[i-1].length-1]) : this.folderarr.push(this.filesFolders[i-1][this.filesFolders[i-1].length-1])
  //           else if(this.startFile._id!=this.filesFolders[i][j]._id){
  //             if(this.filesFolders[i][this.filesFolders[i].length-1].isFile) {
  //               this.filearr.forEach((ele,index)=>{
  //                 if(ele._id==this.filesFolders[i][j]._id) this.filearr.splice(index)
  //               })
  //             }
  //             else{
  //               this.folderarr.forEach((ele,index)=>{
  //                 if(ele._id==this.filesFolders[i][j]._id) this.folderarr.splice(index)
  //               })
  //             }
  //           }
  //           this.endFile = this.filesFolders[i-1][this.filesFolders[i-1].length-1]
  //           this.filearr = _.uniqBy(this.filearr, '_id');
  //           this.folderarr = _.uniqBy(this.folderarr, '_id');
  //           return
  //         }
  //       }
  //     }
  //   }
  // }

pushOFTwoDimensional()
{
  var col = Math.floor($('.folder-s').width()/$('.colwdth').width())
  var j=0;
  this.fileElements.forEach((element:any) => {
    if (!this.filesFolders.length) {
      this.filesFolders.push([element])
    }
    else {
      if (!this.filesFolders[j]) { 
        this.filesFolders.push([element]) 
      }
      else if (this.filesFolders[j].length < col) {
        this.filesFolders[j].push(element);
      }
      if (this.filesFolders[j].length == col) { j++; }
    }
  })
  if ((this.fileElements.length % col) != 0) { j++; }
  this.fileData.forEach((element:any) => {
    if (!this.filesFolders.length) {
      this.filesFolders.push([element])
    }
    else {
      if (!this.filesFolders[j]) { 
        this.filesFolders.push([element]) 
      }
      else if (this.filesFolders[j].length < col) {
        this.filesFolders[j].push(element);
      }
      if (this.filesFolders[j].length == col) { j++; }
    }
  })
  let startRow;
  let startCol;
  for(var i=0;i<this.filesFolders.length;i++) {
    for(var j=0;j<this.filesFolders[i].length;j++) {
      if(this.startFile._id == this.filesFolders[i][j]._id) {
        startRow = i;
        startCol = j
      }
    }
  }
}
 /**
   * Function name : selectWithLeft
   * Output :select the left side element on keying left arrow 
   */
selectWithLeft()
{
  
  if(this.element.isFile)
  {
    if(this.fileData[0]._id!=this.element._id)
    {
      var index=this.fileData.findIndex(x=>x._id==this.element._id);
      this.multiselectpdf(this.fileData[index-1],null);
      this.highlightRow(this.fileData[index-1]);
    }
   else if(this.fileData[0]._id==this.element._id)
   {
    this.multiselectpdf(this.fileElements[this.fileElements.length-1],null);
    this.highlightRow(this.fileElements[this.fileElements.length-1]);
   }
  }
  else if(this.element.isFolder){
    if(this.fileElements[0]._id!=this.element._id)
    {
      var index=this.fileElements.findIndex(x=>x._id==this.element._id);
      this.multiselectpdf(this.fileElements[index-1],null);
      this.highlightRow(this.fileElements[index-1]);
    }
    else{

    }
  }
  setTimeout(() => {
    var $element = $('.highlight');
    if (!this.checkInViewLeft($element)) {
      var $window = $(window)
      var viewport_top = $window.scrollTop()
      var height = $element.height()
      var heightofElememt=this.element.isFile?2.5:4
      $('html, body').animate({ scrollTop: viewport_top - (heightofElememt * height) });
    }
  }, 100)

}
 /**
   * Function name : selectWithRight
   * Output :select the Right side element on keying Right arrow 
   */
selectWithRight()
{
  if(this.element.isFile)
  {
    if(this.fileData[this.fileData.length-1]._id!=this.element._id)
    {
      var index=this.fileData.findIndex(x=>x._id==this.element._id);
      this.multiselectpdf(this.fileData[index+1],null);
      this.highlightRow(this.fileData[index+1]);
    }
   else 
   {  }
  }
  else if(this.element.isFolder){
    if(this.fileElements[this.fileElements.length-1]._id!=this.element._id)
    {
      var index=this.fileElements.findIndex(x=>x._id==this.element._id);
      this.multiselectpdf(this.fileElements[index+1],null);
      this.highlightRow(this.fileElements[index+1]);
    }
    else if(this.fileElements[this.fileElements.length-1]._id==this.element._id){
      this.multiselectpdf(this.fileData[0],null);
      this.highlightRow(this.fileData[0]);
    }
  }
  setTimeout(() => {
    var $element = $('.highlight');
    if (!this.checkInViewRight($element)) {
      var $window = $(window)
      var viewport_top = $window.scrollTop()
      var height = $element.height()
      var heightofElememt=this.element.isFile?2.:4
      $('html, body').animate({ scrollTop: viewport_top + (heightofElememt * height) });

    }
  }, 100)
}

 /**
   * Function name : checkInViewRight
   * input(elem as html):highlighted html content
   * Output(boolean) :return true or false (Whether the selected element is in view port)
   */
  checkInViewRight(elem) {
    var $window = $(window)
    var viewport_top = $window.scrollTop()
    var viewport_height = $window.height()
    var viewport_bottom = viewport_top + viewport_height
    var $elem = $(elem)
    var top = $elem.offset().top
    var height = $elem.height()
    var bottom = top + height
    //  console.log(top >= viewport_top && top < viewport_bottom)
    //  console.log((bottom > viewport_top && bottom <= viewport_bottom))
    //  console.log((height > viewport_height && top <= viewport_top && bottom >= viewport_bottom))


    return (bottom > viewport_top && bottom <= viewport_bottom) || (height > viewport_height && top <= viewport_top && bottom >= viewport_bottom)
  }
   /**
   * Function name : checkInViewLeft
   * input(elem as html):highlighted html content
   * Output(boolean) :return true or false (Whether the selected element is in view port)
   */
  checkInViewLeft(elem) {
    var $window = $(window)
    var viewport_top = $window.scrollTop()
    var viewport_height = $window.height()
    var viewport_bottom = viewport_top + viewport_height
    var $elem = $(elem)
    var top = $elem.offset().top;
    var height = $elem.height()
    var bottom = top + height - $('.folder-latest-view').offset().top - 150 //subract header height
    return (bottom > viewport_top && bottom <= viewport_bottom) || (height > viewport_height && top <= viewport_top && bottom >= viewport_bottom)
  }
        /**
   * Function name : selectAllelements
   * Input{event}: 
   * Output : select and deselect files and folders
   */
  selectAllelements(event){
    if(event.checked){
      this.filearr = [];
      this.folderarr = [];
      this.filearr = this.fileData.slice(0);
      this.folderarr = this.fileElements.slice(0);
    }else{
      this.filearr = [];
      this.folderarr = [];
    }
  }
  selectWithShiftRight() {  //Shift+Right Arrow
    let indexNum;
    if (this.clickselectedElement.isFile) { //if first selected element is File
      if (this.filearr.length > 1) { this.EnableDelete = true; }
      //find index of next element in filedata
      indexNum = this.fileData.findIndex((element) => { return (element._id === this.filearr[this.filearr.length - 1]._id); });
      //first element of the array and selected element should be same
      if (this.filearr[0]._id == this.clickselectedElement._id) {
        // index should be less than filedata length and greater than selected index
        if (indexNum < this.fileData.length - 1 && indexNum >= this.selectindex) {
          //if not of filearr push the element
          if (!this.filearr.some(element => element._id === this.fileData[indexNum + 1]._id)) {
            this.filearr.push(this.fileData[indexNum + 1])
          }
        }
      }
      else {
        //first element of the array and selected element not equal same
        if (this.folderarr.length) {
          //folders are present remove
            this.folderarr.shift();
         } 
        else if (this.filearr.length !== 1) {
           //files  are present remove
            this.filearr.shift();
        }
      }

     }

    if (this.clickselectedElement.isFolder) { //if first selected element is Folder
      if (this.folderarr.length > 1) { this.EnableDelete = true; }
            // if last element of the folder array and last element of file elements are same
      if (this.folderarr[this.folderarr.length - 1] == this.fileElements[this.fileElements.length - 1]) {
        if (!this.filearr.length) { //if filearr is empty
          this.filearr.push(this.fileData[0]);
        }
        else { //if filearr is not empty
          //find index of filedata last element
          indexNum = this.fileData.findIndex((element) => { return (element._id === this.filearr[this.filearr.length - 1]._id); });
          if (indexNum < this.fileData.length - 1) { //index is less than filedata length
            if (!this.filearr.some(element => element._id === this.fileData[indexNum + 1]._id)) {
              this.filearr.push(this.fileData[indexNum + 1]); //push filedata next element into file array
            }
          }
        }

      }
      if (this.folderarr[0]._id == this.clickselectedElement._id) { //folder array first element and selected item are same
        indexNum = this.fileElements.findIndex((element) => { return (element._id === this.folderarr[this.folderarr.length - 1]._id); });
          // file Element index should be less than fileElements length and greater than selected index
        if (indexNum < this.fileElements.length - 1 && indexNum >= this.selectindex) {
          if (!this.folderarr.some(element => element._id === this.fileElements[indexNum + 1]._id)) {
            this.folderarr.push(this.fileElements[indexNum + 1])
          }
        }
      }
      else {  //folder array first element and selected item When not same
        if (this.folderarr.length !== 1) {
          this.folderarr.shift(); //remove first element in folderarray
        }
      }
     }
  }
  selectWithShiftLeft() {  //Shift+Right Arrow
    let indexNum;
    if (this.clickselectedElement.isFile) { 
      if (this.filearr[0]._id == this.fileData[0]._id) {
        if (!this.folderarr.length) {
          this.folderarr.push(this.fileElements[this.fileElements.length - 1])
        }
        else {
          indexNum = this.fileElements.findIndex((element) => { return (element._id === this.folderarr[0]._id); });
          if (indexNum && indexNum <= this.fileElements.length - 1) {
            if (!this.folderarr.some(element => element._id === this.fileElements[indexNum - 1]._id)) {
              this.folderarr.unshift(this.fileElements[indexNum - 1]);
            }
          }
        }

      }
      if (this.filearr[this.filearr.length - 1]._id == this.clickselectedElement._id) {
        indexNum = this.fileData.findIndex((element) => { return (element._id === this.filearr[0]._id); });
        if (indexNum && indexNum <= this.fileData.length - 1) {
          if (!this.filearr.some(element => element._id === this.fileData[indexNum - 1]._id)) {
            this.filearr.unshift(this.fileData[indexNum - 1]);
          }
        }

      }
      else {
        if (this.filearr.length !== 1) {
          this.filearr.pop();
        }
      }
    }
    if (this.clickselectedElement.isFolder) {
      if (this.folderarr[this.folderarr.length - 1]._id == this.clickselectedElement._id) {
        indexNum = this.fileElements.findIndex((element) => { return (element._id === this.folderarr[0]._id); });
        if (indexNum && indexNum <= this.fileElements.length - 1) {
          if (!this.folderarr.some(element => element._id === this.fileElements[indexNum - 1]._id)) {
            this.folderarr.unshift(this.fileElements[indexNum - 1]);
          }
        }

      }
      else {
        if (this.filearr.length) {
          this.filearr.pop();

        }
        else if (this.folderarr.length !== 1) {
          this.folderarr.pop();
        }
      }
    }
  }
}

export interface FileElement {
  _id?: string;
  name: string;
  parentid: string;
  userid: string;
  folderid: string;
  isFolder: boolean;
  active: boolean;
  isFile: boolean;
  isfavorite: boolean;
  favoriteid: string;
  updatedAt: string;
  createdAt: string;
}

export interface FileData {
  _id?: string;
  name: string;
  parentid: string;
  userid: string;
  folderid: string;
  path: string;
  isFolder: boolean;
  uid: string;
  isfavorite: boolean;
  favoriteid: string;
  updatedAt: string;
  created_at: string;
}

