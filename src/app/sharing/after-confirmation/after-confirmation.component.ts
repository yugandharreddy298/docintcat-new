import { Component, Input, ViewChild, Output, EventEmitter, NgZone, HostListener, OnInit, OnDestroy } from '@angular/core';
import { MatDialog, MatSnackBar } from '@angular/material';
import { CommonDialogComponent } from '../../public/common-dialog/common-dialog.component';
import { UploadEvent, FileSystemFileEntry } from 'ngx-file-drop';
import { DocumentService } from '../../document.service';
import { MatMenuTrigger } from '@angular/material/menu';
import { FrontEndConfig } from '../../frontendConfig';
import { Router } from '@angular/router';
import { FileQueueObject, FileuploadService } from '../../fileupload.service';
import { Observable } from 'rxjs/Observable';
import { UserService } from '../../user.service';
import { Subscription } from 'rxjs';
import { SharepopupComponent } from '../sharepopup/sharepopup.component';
import { OrganizationFileSharingComponent } from '../../organization/organization-file-sharing/organization-file-sharing.component';
import { AdminService } from '../../admin.service';
import { SignupdialogboxComponent } from '../../public/signupdialogbox/signupdialogbox.component';

declare var gapi: any; // google-drive
declare var google: any; // google-drive
declare var Dropbox: any; // drop box
declare var OneDrive: any; // onedrive
declare var $: any; // jquery variable
@Component({
  selector: 'app-after-confirmation',
  templateUrl: './after-confirmation.component.html',
  styleUrls: ['./after-confirmation.component.css'],
})
export class AfterConfirmationComponent implements OnInit, OnDestroy {
  @Input() fileElements: FileElement[];  // file data
  @Input() fileData: FileData[];  // folder data
  @Input() canNavigateUp: string; // navigate
  @Input() path: string; // path
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
  @Output() modalnavigate = new EventEmitter<FileElement>(); // modal data navigation
  @Input() modalElement = [];
  @Input() Myfiles;
  @Output() modalPath = new EventEmitter();
  @ViewChild('fileInput') fileInput;
  @ViewChild('fileInput1') fileInput1;
  @ViewChild(MatMenuTrigger) contextMenu: MatMenuTrigger; // context menu
  @ViewChild(MatMenuTrigger) contextMenu1: MatMenuTrigger; // context menu
  getUploadSuccess: Subscription;
  testuingnew: Subscription;
  message: any;
  verificationdata: any;
  serverurl = this.frontendconfig.getserverurl();
  profileData: any;
  folderName: string;
  document = true;
  btn3: boolean;
  btn4: boolean;
  btn5: boolean;
  title: any;
  queue: Observable<FileQueueObject[]>;
  dragfiles: Observable<FileQueueObject[]>;
  foldershow = false;
  foldersdata: any;
  folders: any;
  folder = false;
  file = true;
  url = false;
  favoriteElements: any;
  Menuhide = false;
  folderhide = false;
  foldervalue;
  movefolder: any;
  filesToUpload: any;
  folderid;
  show = false;
  name: any;
  auditlogs: any;
  filedata: any;
  access: any;
  sampledata: any;
  favorites;
  favoritesfiles = [];
  recentfiles: any;
  btn1 = false;
  btn2;
  sampledata1: any;
  selectedName: any;
  sample2: any;
  element: any;
  foldweshow1 = false;
  urlshow = false;
  urlshow1 = false;
  uploadCompleted = false;
  isloading = true;
  isSocialLoading = false;
  totalfilelength = 0;
  checkuploadlength;
  iebrowser;
  frontendurl = this.frontendconfig.frontendurl;
  filearr = new Array();
  folderarr = new Array();
  isctrlkey: boolean;
  triggervalue = true;
  firstuser = false;
  newelement: any;
  matmenu: any;
  userDoc: any;
  FileMenu = false;
  contextMenuPosition = { x: '0px', y: '0px' };
  RecentlyUploadedFilesList = [];
  RecentlyUploadedFoldersList = [];
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
  oneDriveApplicationId = 'd091f200-527a-4572-aab8-678d6f3ac972';
  options = {
    success: (files) => {
      this.isSocialLoading = true;
      document.getElementById('fileselect123').click();
      files.forEach(element => {
        this.dropurlcontent(element);
      });
    },
    cancel: () => { },

    linkType: 'direct', // or "preview"
    multiselect: false, // or false
    extensions: ['.pdf', '.doc', '.docx'],
    folderselect: false, // or true
  };



  @HostListener('window:popstate', ['$event'])
  onPopState(event) {
    document.getElementById('closerecent').click();
    document.getElementById('closesigmodel').click();
    document.getElementById('fileselect123').click();

  }
  @HostListener('window:resize', ['$event'])
  @HostListener('document:click', ['$event']) onClickHandler(event: MouseEvent) {
    const value: any = event.srcElement;
    if (value.id !== 'foldersList' && value.id !== 'filesList'
      && (!(this.contextMenu && this.contextMenu.menuOpened.closed) || !(this.contextMenu1 && this.contextMenu1.menuOpened.closed))) {
      this.filearr = [];
      this.folderarr = [];
      this.sample2 = false;
    }
  }
  @HostListener('window:scroll', ['$event'])
  onWindowScroll($event) {
    if (this.contextMenu) { this.contextMenu.closeMenu(); }
  }

  constructor(
    private adminService: AdminService,
    private documentservice: DocumentService,
    public userService: UserService,
    private router: Router, public dialog: MatDialog,
    public documentService: DocumentService, private frontendconfig: FrontEndConfig,
    public snackBar: MatSnackBar, public uploader: FileuploadService, private _ngZone: NgZone) {
    this.getUploadSuccess = this.uploader.getUploadSuccess().subscribe((message: any) => {
      this.message = message;
      this.totalfilelength = 0;
      this.fileAdded.emit();
      if(message){
        this.documentservice.recentfiles().subscribe(data => {
          this.recentfiles = data;
        });
      }
    });
  }


  /**
   * Function name : recentfile
   * Input: null
   * Output : to get recently uploaded file
   */
  recentfile() {
    this.isloading = true;
    this.documentservice.recentfiles().subscribe(data => {
      this.recentfiles = data;
      this.isloading = false;
    });
  }

  /**
   * Function name : favoritefiles
   * Input: null
   * Output : get favorite files
   */
   favoritefiles() {
    this.isloading = true;
    this.documentservice.getfavorites().subscribe(data => {
      this.favorites = data;
      this.favorites.forEach(element => {
        if (element.isFile && element.fileid) {
          this.favoritesfiles.push(element);
        }
      });
      this.isloading = false;
    });
  }

  /**
   * Function name : passwordVerification
   * Input{object}: (message) message*-uploaded file response
   * Output : open up the dialog box to enter password for password protected file
   */
    passwordVerification(message) {
    let resultdata;
    const dialogRef = this.dialog.open(CommonDialogComponent, {
      data: { name: 'protection', content: message },
      disableClose: false, width: '570px', panelClass: 'deletemod'
    });
    dialogRef.afterClosed().subscribe(res => {
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

  ngOnInit() {
    if (!!(window as any).MSInputMethodContext && !!(document as any).documentMode) {
      $('.ietop').css('margin-top', '100px');
      this.iebrowser = true;
    } else { this.iebrowser = false; }
    this.recentfile();
    this.favoritefiles();
    this.getProfiles();
  }

  /**
   * Function name : getProfiles
   * Input: null
   * Output : decrypt the profile data
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


  /**
   * Function name : navigatemodal
   * Input{object}: (element) element*-selected file or folder
   * Output : navigate through folder (emits the selected data parent component)
   */
  navigatemodal(element) {
    this.modalnavigate.emit(element);
    this.folderarr = [];
    this.filearr = [];
  }

  // to navigate back
  modalback() {
    this.modalPath.emit();
  }

  // to click on upload button
  smp() {
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
  }
  /**
   * Function name : urlcontent
   * Input{formdata}: (urldata) submitted formdata
   * Output :upload the file through url
   */
  urlcontent(urldata) {
    var nameArray = [];
    if (urldata.value.value === undefined) {
      this.urlshow = true;
    } else {
      let filePresent;
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
    const dialogRef = this.dialog.open(CommonDialogComponent, {
      data: { name: 'create' }, width: '500px', height: '200px',
      panelClass: 'withoutpadding', disableClose: false
    });
    dialogRef.afterClosed().subscribe(res => {
      setTimeout(() => {
        $('body').css('overflow', 'auto');
      }, 10);
      this.btn2 = false;
      if (res) {
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
    document.getElementById('openModalButton2').click();
  }
  /**
   * Function name : navigate
   * Input{object}: (element) element*- selected folder
   * Output : to navigate through selected folder
   */
  navigate(element: FileElement) {
    if (element.isFolder) {
      this.foldervalue = element;
      this.navigatedDown.emit(element);
    }
  }

  /**
   * Output : sort data in ascending order based on name
   */
  sortDataAsc() {
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
  sortDataDsc() {
    this.modalElement.sort((a, b) => {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();
      if (nameA < nameB) { return 1; }
      if (nameA > nameB) { return -1; }
      return 0;
    });
    this.Myfiles.sort((a, b) => {
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
    this.modalElement.sort((a, b) => {
      const nameA = a.updatedAt;
      const nameB = b.updatedAt;
      if (nameA > nameB) { return 1; }
      if (nameA < nameB) { return -1; }
      return 0;
    });
    this.Myfiles.sort((a, b) => {
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

    this.modalElement.sort((a, b) => {
      const nameA = a.updatedAt;
      const nameB = b.updatedAt;
      if (nameA < nameB) { return 1; }
      if (nameA > nameB) { return -1; }
      return 0;

    });
    this.Myfiles.sort((a, b) => {
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
    this.selectedName = element._id;
    this.sample2 = true;
    this.element = element;
  }

  // to navigate back from folders
  navigateUp() {
    this.navigatedUp.emit();
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
   * Input{object,event}: (element1, event) object*- selected file or folder
   *                                        event*-Mouse event
   * Output :  multi select the file and folder
   */
  multiselectpdf(element1, event) {
    let indexNum;
    this.triggervalue = true;
    if (event.ctrlKey) {
      if (element1.isFile) {
        if (!this.filearr.some(element => element._id === element1._id)) {
          this.filearr.push(element1);
        } else {
          indexNum = this.filearr.findIndex((element) => {
            return (element._id === element1._id);
          });
          this.filearr.splice(indexNum, 1);
        }
      } else if (element1.isFolder) {
        if (!this.folderarr.some(element => element._id === element1._id)) {
          this.folderarr.push(element1);
        } else {
          indexNum = this.folderarr.findIndex((element) => {
            return (element._id === element1._id);
          });
          this.folderarr.splice(indexNum, 1);
        }
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
    }
  }

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
      document.getElementById('closerecent').click();
      document.getElementById('closesigmodel').click();


    } else {
      this.documentservice.openActionSnackBar(' Please Select File', 'x');
    }
  }

  /**
   * Function name : multishareElement
   * input:null
   * Output : share the multiple files and folders
   */
  multishareElement() {

    const folder = JSON.parse(JSON.stringify(this.folderarr));
    const file = JSON.parse(JSON.stringify(this.filearr));
    var selecteddata ;
    var multi;
    if(file.length == 0 && folder.length == 1){
      selecteddata = folder[0]
      multi = false
    }
    else if(file.length == 1 && folder.length == 0){
      selecteddata = file[0] ;
      multi = false;
    }
    else{
      selecteddata = {
        folders: folder,
        files: file,
      };
      multi = true
    }
    if (this.newelement && this.newelement.type === 'individual') {
      setTimeout(() => {
        $('body').css('overflow', 'hidden');


      }, 10);
      const filedialog = this.dialog.open(SharepopupComponent, {
        width: '848px',
        height: '600px',
        disableClose: false,
        autoFocus: false,
        panelClass: 'test',
        data: { content: selecteddata, text: 'owner', title: null, multi: multi }
      });
      filedialog.afterClosed().subscribe(res => {
        setTimeout(() => {
          $('body').css('overflow', 'auto');
        }, 10);
      });
    } else if (this.newelement && this.newelement.type === 'organisation') {
      setTimeout(() => {
        $('body').css('overflow', 'hidden');


      }, 10);
      const filedialog = this.dialog.open(OrganizationFileSharingComponent, {
        width: '900px',
        disableClose: false,
        panelClass: 'option',
        autoFocus: false,
        data: { content: selecteddata, title: null, multi: multi },
      });
      filedialog.afterClosed().subscribe(res => {
        if (res !== 'true') {
          setTimeout(() => {
            $('body').css('overflow', 'auto');
          }, 10);
        }
      });
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
          document.getElementById('closerecent').click();
          document.getElementById('closesigmodel').click();
          this.elementShared.emit({ element: element, title: 'Signature' });
        }
      });
    }
    if (element.isFolder) {
      document.getElementById('closerecent').click();
      this.elementShared.emit({ element: element, title: 'Review' });
    }
  }

  /**
   * Function name : addFeildsPopUp
   * input{object}:(element) element*-selected file
   * Output : open popup the dailog to add fields
   */
  addFeildsPopUp(element) {
    const dialogRef22 = this.dialog.open(CommonDialogComponent,
      { data: { name: 'fields', cancel: true, content: 'Add the Fields to Share documents' }, width: '500px', panelClass: 'deletemod' });
    dialogRef22.afterClosed().subscribe(res1 => {
      if (res1) {
        dialogRef22.close();
        this.getFileContent(element);
        document.getElementById('closesigmodel').click();
      } else { dialogRef22.close(); }
    });
  }

  /**
   * Function name : dropped
   * input{UploadEvent}:(event) event*-dropped  event
   * Output : upload dropped files
   */
  public dropped = async function(event: UploadEvent) {
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
    document.getElementById('fileselect123').click();
    document.getElementById('closerecent').click();
    document.getElementById('closesigmodel').click();
    let files;
    files = event.files;
    if(event && event.files[0].fileEntry.isDirectory && event.files.length==1){
      setTimeout(() => {
        this.documentservice.openSnackBar('Folder Upload Successfully', 'X');
        if (this.newelement.type === 'individual') {
          this.router.navigate(['individual/home/myfiles']);
        } else if (this.newelement.type === 'organisation' || this.newelement.type === 'employee') {
          this.router.navigate(['organization/home/myfiles']);
        }

      }, 1000);
      }else{
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
                   await this.uploadDragedFile(file, parentResult, filePathArray.length);
        }
        if (index !== filePathArray.length - 1) {
          const folderDetails = { name: filePathArrayData, parentid: parentResult };
          parentResult = await this.backendres(folderDetails);
        }
        index++;
      }
      parentResult = 0;
      if (fileindex === files.length) { this.uploader.uploadAll(); }
    }
    this.fileAdded.emit();
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
    } else if (!(inputFile.type) && ((inputFile.name.lastIndexOf('.') + 1 === (inputFile.name.length - 3))
      || (inputFile.name.lastIndexOf('.') + 1 === (inputFile.name.length - 4)))) {
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
  filesPicked = async function(files) {
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
    document.getElementById('closerecent').click();
    document.getElementById('closesigmodel').click();
    this.uploader.openModal('openmodal');
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
  }
  /**
   * Function name : onFileSelected1
   * input{object,string}:(files,parentid) files*-file data picked from local device
   *                                       parentid*-current parent directory
   * Output : add the files in queue to upload
   */
  onFileSelected1 = function(files: any, parentid: any) {
    this.queue = this.uploader.queue;
    if (parentid) { files.parentid = parentid; }
    this.uploader._addToQueue(files);
    return true;
  };
  /**
   * Function name : fileInputclick
   * input:null
   * Output : Excutes When You click on 'Add document from your computer'
   */
  fileInputclick() {
    this.fileInput1.nativeElement.value = '';
    document.getElementById('fileselect121').click();
  }
  /**
   * Function name : addToQueue
   * input{object}:(folder)  folder*-current root directory
   * Output : upload the files
   */
  addToQueue(folder) {
    let nameArray=[];
    let fileBrowserelement = this.fileInput1.nativeElement;
    var filelist = Array.from(fileBrowserelement.files)
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
        const nameConfirmationDiaBox = this.dialog.open(SignupdialogboxComponent, {
          width: '500px',
          disableClose: false,
          autoFocus: true,
          panelClass: 'passwordbottom',
          data: { type: 'fileName' }
        });
        nameConfirmationDiaBox.afterClosed().subscribe(res => {
          if (res) {
            this.fileupload(folder,fileBrowserelement)
          }
        })
      }
      else {
         this.fileupload(folder,fileBrowserelement)
      }  
      })
 
  }
  /**
   * Function name : fileupload
   * input{object,event}:(folder)  folder*-current root directory
   * Output : upload the files
   */
  fileupload(folder,files)
  { 
    this.uploader.openModal('openmodal');
    document.getElementById('fileselect123').click();
    document.getElementById('closerecent').click();
    document.getElementById('closesigmodel').click();
    if (this.folderid) { folder = this.folderid; }
    let totalSize = 0;
    const fileBrowserelement = files;
    this.queue = this.uploader.queue;
    let pdfFiles1 = [];

    for (var i = 0; i < fileBrowserelement.files.length; i++) {
      if (fileBrowserelement.files[i]) {
        if (folder) { fileBrowserelement.files[i].folderid = folder; }
        totalSize = totalSize + fileBrowserelement.files[i].size;
        pdfFiles1.push(fileBrowserelement.files[i]);
        this.RecentlyUploadedFilesList.push(fileBrowserelement.files[i]);
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
  /**
   * Function name : backendres
   * input{object}:(folderDetails)  folderDetails*-new folderDetails
   * Output : check Whether already folder exits and create new folder
   */
  backendres = function(folderDetails) {
    return new Promise(async (resolve, reject) => {
      await this.documentService.isFolderIsExist(folderDetails).subscribe(async folderdata => {
        if (folderdata) {
          resolve(folderdata._id);
        } else {
          await this.documentService.createfolder(folderDetails).subscribe(data => {
            this.RecentlyUploadedFoldersList.push(data);
            resolve(data._id);
          });
        }
      });
    });
  };

  /**
   * Function name : getFileContent
   * input{object}:(content)  content*-selected file
   * Output : open's the selected file
   */
   getFileContent = function(content) {
    if (content.fileid && content.fileid._id) {
      const filedata = {
        fileid: content.fileid._id
      };
      this.documentService.encryptedvalues(filedata).subscribe((data: any) => {
        if (data) {
          if (this.newelement.type === 'individual') {
            this.router.navigate(['individual/filecont/' + data.encryptdata]);
          } else if (this.newelement.type === 'organisation' || this.newelement.type === 'employee') {
            this.router.navigate(['organization/filecont/' + data.encryptdata]);
          }
        }
      });
    } else if (content && content._id) {
      const filedata = {
        fileid: content._id
      };
      this.documentService.encryptedvalues(filedata).subscribe((data: any) => {
        if (this.newelement.type === 'individual') {
          this.router.navigate(['individual/filecont/' + data.encryptdata]);
        } else if (this.newelement.type === 'organisation' || this.newelement.type === 'employee') {
          this.router.navigate(['organization/filecont/' + data.encryptdata]);
        }
      });
    }
  };

  closemodal() { // to close the modal
    document.getElementById('closerecent').click();
    document.getElementById('closesigmodel').click();

  }

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
          addView(new google.picker.DocsView().setIncludeFolders(true)
            .setOwnedByMe(true)
            .setMimeTypes('application/pdf,application/vnd.google-apps.document,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document'))
          .addView(new google.picker.DocsView()
            .setIncludeFolders(true)
            .setOwnedByMe(false).setMimeTypes('application/pdf,application/vnd.google-apps.document,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document'))
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
                this.recentfile();
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
            this.recentfile();
            this.isSocialLoading = false;
          }
        });
      }
    })

  }
  // ***********************************************************************************************************************************/

  // ************************************************Upload file from drop box ***********************************************************/
  loaddropbox = function() {
    Dropbox.choose(this.options);
  };

  dropurlcontent(urldata) {
    const dropboxurl = { value: urldata };
    var nameArray = [];
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
            this.recentfile();
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
        this.recentfile();
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

  // ************************************************************************************************************************************/

  // ************************************************Upload file from one drive ***********************************************************/

  loadoneDrive() {
    this.launchOneDrivePicker();
  }

  launchOneDrivePicker = () => {
     var redirecturi
    if (this.newelement.type === 'individual') {
      redirecturi=this.frontendurl + '/individual/home/myfiles/';
    } else if (this.newelement.type === 'organisation' || this.newelement.type === 'employee') {
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
          this.recentfile();
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
          this.recentfile();
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
    })

  }

 // ************************************************************************************************************************************/

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
    if (!dt || dt > 500 || fingers > 1) { // not double-tap
      return;
    } else {
      console.log(element);
      this.navigate(element);
    }
    e.preventDefault();
    e.target.click();
  }

  ngOnDestroy() {
    this.getUploadSuccess.unsubscribe();
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
}

