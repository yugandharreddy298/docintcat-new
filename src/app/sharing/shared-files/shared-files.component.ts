import { Component, OnInit, ViewChild, HostListener, NgZone } from '@angular/core';
import { FrontEndConfig } from '../../frontendConfig';
import { MatDialog, MatMenuTrigger } from '@angular/material';
import { ActivatedRoute } from '@angular/router';
import { Router } from "@angular/router";
import * as moment from 'moment';
import { DataService } from '../../core/data.service';
import { DocumentService } from '../../document.service';
import { AdminService } from '../../admin.service';
import { OrganizationService } from '../../organization.service';
import { SignupdialogboxComponent } from '../../public/signupdialogbox/signupdialogbox.component';
import { CommonDialogComponent } from '../../public/common-dialog/common-dialog.component';
import { UserService } from '../../user.service';
import { Location } from '@angular/common';

declare var $: any;
declare var gapi: any;
@Component({
  selector: 'app-shared-files',
  templateUrl: './shared-files.component.html',
  styleUrls: ['./shared-files.component.css']
})

export class SharedFilesComponent implements OnInit {

  serverurl = this.frontendconfig.getserverurl();
  sharedfiles: any   ///consists of list of shared documents
  currentRoot: any;  //current root (folder name)
  currentPath: any;  // current path
  doc: any; //consist of values of selected folder
  folderElements = []; //folder list
  fileElements = []; //files list
  isloading: boolean = true; //loading 
  gridView: boolean = true; // to display grid view
  listView: boolean = false // to display table view
  selectedName: any; // stores the selected file or folder id
  documentSelect: boolean = false; // to check whether any document is selected
  matmenu: any;  // to verify the selected has access or not (download)
  contextMenuPosition = { x: '0px', y: '0px' };
  FileMenu: Boolean = false
  groupdata = []
  groups = [];
  hleveldata = [];
  viewDetailsvalue = false;
  documentLogs
  sharedfilesdata: any;
  profiledata: any
  userName
  userEmail
  docCount = 0;
  sharedPeople = []
  documentres
  agreetoSign
  downloadType
  downloadFile
  withlog
  pdfPinSet
  pdfPin
  element
  parent
  dialogopen = false
  sample2 = false
  triggervalue: boolean = true
  view: boolean = false;
  EnableDelete: boolean = false;
  email
  message: any;
  currentelement: any
  browserpath: any
  checkid
  navigationelement
  modalopened: boolean = false
  modalid
  pathvalue
  sharedid // for encrypt shared id
  fileid //for encrypt  fileid 
  iebrowser
  matttoltip
  foldersharedid
  decryptid
  useremail
  matdialogopen: boolean = false
  filearr = new Array();
  folderarr = new Array();
  isctrlkey: boolean;
  sideviewshow = false
  today = moment().format("YYYY-MM-DDTHH:mm:ss");
  clientid = "778273248008-3rlo8d96pebk6oci737ijtbhmla253gr.apps.googleusercontent.com"
  scopes = [
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/drive.appdata',
    'https://www.googleapis.com/auth/drive.file'
  ].join(' ');

  @ViewChild(MatMenuTrigger) contextMenu: MatMenuTrigger; //opens matmenu for access viewing
  @ViewChild(MatMenuTrigger) contextMenu1: MatMenuTrigger; //context menu
  chechBoxenable:boolean=false // show checkbox  while touch hold in touch enable devices

  @HostListener('document:keydown', ['$event']) onKeydownHandler(event: KeyboardEvent) {
    if (event.ctrlKey && event.keyCode == 65) {
      this.filearr = this.fileElements.slice(0);
      this.folderarr = this.folderElements.slice(0);
      event.preventDefault();
    }
    if (event.keyCode == 46) {
      if ((this.filearr.length > 1 || this.folderarr.length > 1) || (this.filearr.length == 1 && this.folderarr.length == 1)) {
        if (!this.matdialogopen) {
          this.deleteSlectedElement();
        }
      }
      else if ((this.filearr.length || this.folderarr.length)) {
        if (!this.matdialogopen) {
          this.deleteSlectedElement();
        }
      }
    }
    if(event.keyCode==37 && this.element) {
      this.selectWithLeft()
    }
    if(event.keyCode==39 && this.element) {     
       this.selectWithRight();
    }
  }

  @HostListener('document:click', ['$event'])
  onClickHandler(event: MouseEvent) {
    var value: any = event.srcElement;
    if (value.id != "foldersList" && value.id != "filesList" && value.id!='contextmenu' &&  value.classList[0]!=='mat-checkbox-inner-container' && (!(this.contextMenu && this.contextMenu.menuOpened.closed) || !(this.contextMenu1 && this.contextMenu1.menuOpened.closed))) {
      this.filearr = []
      this.folderarr = []
      this.sample2 = false
      this.EnableDelete = false
      this.chechBoxenable=false;

    }
    if( this.contextMenu && this.contextMenu.menuOpen) {
      this.contextMenu.closeMenu();
    }
  }

  @HostListener('window:scroll', ['$event'])
  onWindowScroll($event) {
    if (this.contextMenu) this.contextMenu.closeMenu()
    this.matttoltip = true
    setTimeout(() => {
      this.matttoltip = false
    }, 1);
  }
  @HostListener('document:contextmenu', ['$event']) menuContext(ev: MouseEvent) {
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
  constructor(private Locations: Location,
    private _ngZone: NgZone,
    private dataservice: DataService,
    public adminService: AdminService,
    public activatedroute: ActivatedRoute,
    public organizationService: OrganizationService,
    public userService: UserService,
    private documentService: DocumentService,
    private frontendconfig: FrontEndConfig,
    public dialog: MatDialog,
    private router: Router) {
    this.dataservice.newMessageReceived().subscribe(data => {
      if (data.toemail == this.userEmail)
        this.getSharedDocuments();
    });
    this.SharedDocumentDeleted(); //Emits when shared document is deleted

  }

  ngOnInit() {
    if (!!(window as any).MSInputMethodContext && !!(document as any).documentMode) {
      $(".ietop").css("margin-top", "100px");
      this.iebrowser = true
    }
    else this.iebrowser = false
    this.profiledata = JSON.parse(localStorage.getItem('currentUser'));
    this.userName = this.userService.decryptData(this.profiledata.name);
    this.userEmail = this.userService.decryptData(this.profiledata.email);
    this.profiledata.type = this.userService.decryptData(this.profiledata.type);
    var id = this.router.url.substring(this.router.url.lastIndexOf('/') + 1)
    if (id != 'shareddocument') {
      this.isloading = false;
      var path = JSON.parse(localStorage.getItem('currentpath'));
      if(path)
      {
        for (var j = 0; j < path.length; j++) {
          if (path[j]) {
            for (var i in path[j]) {
              if (path[j][i] && i != 'encryptedId') path[j][i] = this.userService.decryptData(path[j][i]);
            }
          }
        }
      }
        var data = {
        fileid: id
      }
      this.documentService.decryptedvalues(data).subscribe((encryp: any) => {
        var routingid = encryp.decryptdata
        this.documentService.getnavigationfolder(routingid).subscribe(data => {
          this.checkid = data;
          this.navigationelement = this.checkid
          this.currentRoot = this.navigationelement
          this.currentPath = path ?path :null
          this.currentelement = this.navigationelement
          this.navigateToFolder(this.navigationelement)
          this.popFromPath(this.currentPath, this.currentRoot)
        })
      }, error => {
        if (this.profiledata.type == 'individual') this.router.navigate(['individual/home/shareddocument'])
        else if (this.profiledata.type == 'organisation' || this.profiledata.type == 'employee') this.router.navigate(['organization/home/shareddocument'])
      })
    }
    else {
      if (!!(window as any).MSInputMethodContext && !!(document as any).documentMode) {
        $(".ietop").css("margin-top", "100px");
      }
      this.getSharedDocuments();
       this.loadData()

    }
  }
  

  @HostListener('window:popstate', ['$event'])
  onPopState(event) {
    if (this.currentelement && this.currentelement.parentid && this.currentPath[this.currentPath.length-2]) {
      this.browserpath  = this.currentPath[this.currentPath.length-2]
      this.navigateUp(this.currentPath[this.currentPath.length-2]);
    }
    else if (this.currentelement) {
      this.browserpath = 'root'
      this.navigateUp(this.browserpath)
      setTimeout(() => {
        if (this.profiledata.type == 'individual') this.router.navigate(['individual/home/shareddocument']);
        else if (this.profiledata.type == 'organisation' || this.profiledata.type == 'employee') this.router.navigate(['organization/home/shareddocument']);
      }, 1000);
    }
  }

  /**
   * Function name : getSharedDocuments
   * Input : null
   * Output : Shated scuments for selected user.
   * Desc : get shared document for particular user .
   */
  getSharedDocuments() {
    this.fileElements = [];
    this.folderElements = [];
    this.isloading = true
    this.documentService.getSearch('sharingpeoples/shared/sharedDocuments').subscribe(data => {
      this.sharedfiles = data
      this.isloading = false
      // getting files groupid
      this.sharedfiles.forEach(element => {
        if (element.groupid) { this.groupdata.push(element) }
      });
      if (this.groupdata.length > 0) {
        this.groupdata.forEach(async element => {
          await this.organizationgroup(element)
          if (this.groupdata.indexOf(element) == this.groupdata.length - 1) {
            this.userlevecheck(this.groups)
          }
        });
      }

      if (this.sharedfiles.length > 0) {
        this.sharedfiles.forEach((shareFile,index) => {
          this.singleSharedFile(shareFile);
          if (this.sharedfiles.indexOf(shareFile) == this.sharedfiles.length - 1) {
            this.isloading = false;
          }
          if (index == this.sharedfiles.length - 1) {
            if (this.userService.searchElementReturn()) {
              var searchelement = this.userService.searchElementReturn();
              if (searchelement && searchelement.isFile) {
                var element = this.fileElements.find(x => x.sharedid == searchelement.sharedid);
                if(element!=undefined){
                  this.filearr.push(element);
                  this.highlightRow(element)
                }
              }
              else if(searchelement && searchelement.isFolder){
                var element = this.folderElements.find(x => x.sharedid == searchelement.sharedid);
                if(element!=undefined){
                  this.highlightRow(element)
                  this.folderarr.push(element);
                }
              }
               this.userService.searchElementSet(null)
            }
          }
        });
      }
    });    
  }

  /**
   * Function name : singleSharedFile
   * Input : element
   * Output : Expired state.
   * Desc : checking each shared document Expired or not.
   */
  singleSharedFile(element) {
    // to check with expirydate if present
    if (element.access_expirydate) {
      var access_expirydate = element.access_expirydate;
      if (moment(access_expirydate).format("YYYY-MM-DDTHH:mm:ss") <= (moment(this.today).format("YYYY-MM-DDTHH:mm:ss"))) {
        var x = moment(access_expirydate).format("YYYY-MM-DDTHH:mm:ss") <= (moment(this.today).format("YYYY-MM-DDTHH:mm:ss"));
      }
      if (!x) this.pushFilesFolderToArray(element);
    }
    // expirydate is not present
    if (!element.access_expirydate) this.pushFilesFolderToArray(element);
  }

  /**
   * Function name : pushFilesFolderToArray
   * Input : element
   * Output :files and Folders array.
   * Desc : pushing each files and folders in an array 
   */
  pushFilesFolderToArray(element) {
    if (element.folderid) {
      element.folderid.sharedid = element._id;
      element.folderid.filepassword = element.filepassword;
      element.folderid.Download = element.Download;
      element.folderid.share = element.share;
      element.folderid.delete = true;
      element.folderid.agreetoSign = element.agreetoSign;
      element.folderid.agreetoReview = element.agreetoReview;
      element.folderid.view = element.view;
      element.folderid.members = element.members;
      this.folderElements.push(element.folderid)
    }
    else if (element.fileid) {
      element.fileid.sharedid = element._id;
      element.fileid.Download = element.Download;
      element.fileid.share = element.share;
      element.fileid.delete = true;
      element.fileid.agreetoSign = element.agreetoSign;
      element.fileid.agreetoReview = element.agreetoReview;
      element.fileid.view = element.view;
      element.fileid.message = element.message;
      element.fileid.fromid = element.fromid;
      element.fileid.members = element.members;
      this.fileElements.push(element.fileid);
    }
  }

  /**
   * Function name : sortDataAsc
   * Input : null
   * Output :sorted name.
   * Desc : sorting "NAME" in ascending order
   */
  sortDataAsc() {
    this.fileElements.sort(function (a, b) {
      var nameA = a.name.toLowerCase();
      var nameB = b.name.toLowerCase();
      if (nameA > nameB) { return 1; }
      if (nameA < nameB) { return -1; }
      return 0;
    })
    this.folderElements.sort(function (a, b) {
      var nameA = a.name.toLowerCase();
      var nameB = b.name.toLowerCase();
      if (nameA > nameB) { return 1; }
      if (nameA < nameB) { return -1; }
      return 0;
    })
  }

  /**
   * Function name : sortDataDsc
   * Input : null
   * Output :sorted name.
   * Desc : sorting "NAME" in descending order 
   */
  sortDataDsc() {
    this.fileElements.sort(function (a, b) {
      var nameA = a.name.toLowerCase()
      var nameB = b.name.toLowerCase()
      if (nameA < nameB) { return 1; }
      if (nameA > nameB) { return -1; }
      return 0;
    })
    this.folderElements.sort(function (a, b) {
      var nameA = a.name.toLowerCase()
      var nameB = b.name.toLowerCase()
      if (nameA < nameB) { return 1; }
      if (nameA > nameB) { return -1; }
      return 0;
    })
  }

  /**
   * Function name : sortByModifiedAsc
   * Input : null
   * Output :sorted updatedAt.
   * Desc : sort ascending "MODIFIED BY" 
   */
  sortByModifiedAsc() {
    this.fileElements.sort(function (a, b) {
      var nameA = a.updatedAt;
      var nameB = b.updatedAt;
      if (nameA > nameB) { return 1; }
      if (nameA < nameB) { return -1; }
      return 0;
    })
    this.folderElements.sort(function (a, b) {
      var nameA = a.updatedAt;
      var nameB = b.updatedAt;
      if (nameA > nameB) { return 1; }
      if (nameA < nameB) { return -1; }
      return 0;
    })
  }

  /**
   * Function name : sortByModifiedDsc
   * Input : null
   * Output :sorted updatedAt.
   * Desc : Sort Descending "MODIFIED BY" 
   */
  sortByModifiedDsc() {
    this.fileElements.sort(function (a, b) {
      var nameA = a.updatedAt;
      var nameB = b.updatedAt;
      if (nameA < nameB) { return 1; }
      if (nameA > nameB) { return -1; }
      return 0;
    })
    this.folderElements.sort(function (a, b) {
      var nameA = a.updatedAt;
      var nameB = b.updatedAt;
      if (nameA < nameB) { return 1; }
      if (nameA > nameB) { return -1; }
      return 0;
    })
  }

  /**
   * Function name : openMenufolder
   * Input : event, element
   * Output : Conytext menu or Right click menu
   * Desc : open the matmenu when right clicking on selected document 
   */
  openMenufolder(event: MouseEvent, element: any) {
    console.log(element);
    
    if (!this.filearr.some(element1 => element1._id == element._id) && !this.folderarr.some(element1 => element1._id == element._id)) {
      if (element.isFile) {
        this.filearr = [element]
        this.folderarr = []
      }
      else if (element.isFolder) {
        this.folderarr = [element]
        this.filearr = []
      }
    }
    this.matmenu = element;
    this.FileMenu = true;  // used for checking whether element has access or not.
    event.preventDefault();
    this.contextMenuPosition.x = event.clientX + 'px';
    this.contextMenuPosition.y = event.clientY + 'px';
  
    
  }

  /**
    * Function name : openMenufolder1
    * Input : event, element
    * Output : contextmenu for IPAD
    * Desc : open the matmenu when right clicking on selected document in IPAD
    */
  openMenufolder1(event: TouchEvent, element: any,data) {
    if(data=='grid'){
    this.element=element;
    this.endTime = new Date();
    if (event.type === 'touchend'){
      var longpress = (this.endTime - this.startTime < 500) ? false : true
      if(longpress){
        this.chechBoxenable=true;
        if (!this.filearr.some(element1 => element1._id == element._id) && !this.folderarr.some(element1 => element1._id == element._id)) {
          if (element.isFile) {
            this.filearr = [element]
            this.folderarr = []
          }
          else if (element.isFolder) {
            this.folderarr = [element]
            this.filearr = []
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
   * Function name : navigateToFolder
   * Input : element
   * Output :Folder navigation
   * Desc : navigating inside the respective folder 
   */
  navigateToFolder(element) {
    if (element && element.sharedid && element.isFolder) {
      var data = {
        fileid: element.sharedid
      }
      this.documentService.encryptedvalues(data).subscribe((data: any) => {
        this.foldersharedid = data.encryptdata
        localStorage.setItem('folder', this.foldersharedid)
      })
    }
    this.currentelement = element
    // if folder consists of password
    if (element.pin && element.filepassword) {
      setTimeout(() => {
        $('body').css("overflow", "hidden");
      }, 10);
      const ConfirmationDiaBox = this.dialog.open(SignupdialogboxComponent, {
        width: '500px',
        disableClose: false,
        autoFocus: true,
        panelClass: 'passwordbottom',
        data: { title: "Please enter password to view the document", otpflag: true, id: element.sharedid,type:'Password' }
      });
      ConfirmationDiaBox.afterClosed().subscribe(result => {
        setTimeout(() => {
          $('body').css("overflow", "auto");
        }, 10);
        if (result) {
          this.documentSelect = false;
          this.doc = null;
          this.currentRoot = element;
          this.currentPath = this.pushToPath(this.currentPath, element);
          localStorage.removeItem('currentpath')
          var currentpath =JSON.parse(JSON.stringify(this.currentPath));
        this.userService.setpath(currentpath);
          this.folderelements(element)
          this.filearr = [];
          this.folderarr = []
        }
      });
    }
    else {    //folder doesn't consist of password.  
      this.documentSelect = false;
      this.doc = null;
      this.currentRoot = element
      this.currentPath = this.pushToPath(this.currentPath, element);
      localStorage.removeItem('currentpath')
      var currentpath =JSON.parse(JSON.stringify(this.currentPath));
        this.userService.setpath(currentpath);
      this.folderelements(element)
      this.filearr = [];
      this.folderarr = []
    }
  }

  /**
   * Function name : folderelements
   * Input : element
   * Output :Folder content 
   * Desc : getting the contents of inside folder
   */
  folderelements(element) {
    this.folderElements = [], this.fileElements = [];
    this.isloading = true;
    if (element == 'root') this.getSharedDocuments();
    else {
      var folderdata;
      this.documentService.getparentfolders(element._id).subscribe(data => {
        folderdata = data
        this.isloading = false;
        folderdata.folders.forEach(folder => {
          folder.sharedid = element.sharedid;
          folder.share = element.share;
          folder.Download = element.Download;
          folder.delete = false;
          folder.agreetoSign = element.agreetoSign;
          folder.agreetoReview = element.agreetoReview;
          folder.view = element.view;
          folder.members = element.members;
          this.folderElements.push(folder);
        })
        folderdata.files.forEach(file => {
          file.sharedid = element.sharedid;
          file.share = element.share;
          file.Download = element.Download;
          file.delete = false;
          file.agreetoSign = element.agreetoSign;
          file.agreetoReview = element.agreetoReview;
          file.view = element.view;
          file.message = element.message;
          file.fromid = element.fromid;
          file.members = element.members;
          this.fileElements.push(file);
        })
      })
    }
  }

  /**
   * Function name : navigateUp
   * Input : event
   * Output : Navigation
   * Desc : navigates to specific path 
   */
  navigateUp(event) {
    if (event != 'root') this.currentRoot = event
    else this.currentRoot = null
    this.folderelements(event)
    this.currentPath = this.popFromPath(this.currentPath, this.currentRoot);
  }

  /**
   * Function name : pushToPath
   * Input : path, folderName
   * Output : path data
   * Desc : pushing the path 
   */
  pushToPath(path: any, folderName) {
    var p1 = [];
    if (path) {
      path.forEach(element => {
        if (element) p1.push(element);
      });
    }
    if(!p1.some(x=>x._id==folderName._id))
    { p1.push(folderName);}
      var data = {
      fileid: folderName._id
    }
    this.documentService.encryptedvalues(data).subscribe((data: any) => {
      if (this.profiledata.type == 'individual') this.router.navigate(['individual/home/shareddocument/' + data.encryptdata]);
      else if (this.profiledata.type == 'organisation' || this.profiledata.type == 'employee') this.router.navigate(['organization/home/shareddocument/' + data.encryptdata]);
    }, error => {
      if (this.profiledata.type == 'individual') this.router.navigate(['individual/home/shareddocument']);
      else if (this.profiledata.type == 'organisation' || this.profiledata.type == 'employee') this.router.navigate(['organization/home/shareddocument']);
    })
    return p1;
  }

  /**
   * Function name : popFromPath
   * Input : path, current
   * Output : pop the path 
   * Desc : pop the path 
   */
  popFromPath(path: any, current: any) {
    if (current == null) {
      path = [];
      if (this.profiledata.type == 'individual') this.router.navigate(['individual/home/shareddocument']);
      else if (this.profiledata.type == 'organisation' || this.profiledata.type == 'employee') this.router.navigate(['organization/home/shareddocument']);
    }
    else {
      var data = {
        fileid: current._id
      }
      this.documentService.encryptedvalues(data).subscribe((data: any) => {
        if (this.profiledata.type == 'individual') this.router.navigate(['individual/home/shareddocument/' + data.encryptdata]);
        else if (this.profiledata.type == 'organisation' || this.profiledata.type == 'employee') this.router.navigate(['organization/home/shareddocument/' + data.encryptdata]);
      }, error => {
        if (this.profiledata.type == 'individual') this.router.navigate(['individual/home/shareddocument']);
        else if (this.profiledata.type == 'organisation' || this.profiledata.type == 'employee') this.router.navigate(['organization/home/shareddocument']);
      })
      var i = path.findIndex(x => x._id == current._id);
      path.splice(i + 1, path.length);
      localStorage.removeItem('currentpath');
      var currentpath =JSON.parse(JSON.stringify(path));
      this.userService.setpath(currentpath);
    }
    return path;
    
  }

  /**
   * Function name : deleteDocument
   * Input : element
   * Output : Particular document  deletion
   * Desc : Deletes the particular document 
   */
  deleteDocument = function (element: any) {
    this.matdialogopen = true
    if (element.isFolder) {
      setTimeout(() => {
        $('body').css("overflow", "hidden");
      }, 10);
      let dialogRef = this.dialog.open(CommonDialogComponent, { data: { name: 'deletefolder' }, width: '500px', panelClass: "deletemod", disableClose: false });
      dialogRef.afterClosed().subscribe(res => {
        setTimeout(() => {
          $('body').css("overflow", "auto");
        }, 10);
        this.matdialogopen = false
        if ((res)) {
          this.delete(element)
        }
      });
    }
    else {
      setTimeout(() => {
        $('body').css("overflow", "hidden");
      }, 10);
      let dialogRef = this.dialog.open(CommonDialogComponent, { data: { name: 'delete' }, width: '500px', panelClass: "deletemod", disableClose: false });
      dialogRef.afterClosed().subscribe(res => {
        setTimeout(() => {
          $('body').css("overflow", "auto");
        }, 10);
        this.matdialogopen = false
        if (res) {
          this.delete(element)
        }
      });
    }
  }

  /**
   * Function name : delete
   * Input : element
   * Output : Deletion
   * Desc : delete function call if accepted
   */
  delete(element) {
    var data;
    this.doc = null;
    this.documentSelect = false;
    this.sample2 = false;
    element.active = false
    this.documentService.deleteshared(element.sharedid).subscribe(res => {
      data = res
      if (data.data == "success") {
        this.documentService.openSnackBar("Deleted Successfully", "X")

        this.folderElements = []
        this.fileElements = []
      }
    });
  }

  /**
   * Function name : viewDetails
   * Input : element
   * Output : Shared people data
   * Desc : To show sharing people data
   */
  viewDetails(element) {
    this.sharedfilesdata=''
    $(".fade12").show();
    setTimeout(() => {
      $("html").css("overflow", "hidden");
    }, 10);
    if(element.isFile){
    this.viewDetailsvalue = true
    this.documentService.getsharingpeople(element).subscribe((data: any) => {
      this.sharedfilesdata = data
      this.message = this.sharedfilesdata.some(x => x.toemail == this.userEmail) ? this.sharedfilesdata.find(x => x.toemail == this.userEmail).message : null;
      if (element.status && element.status == "Completed") this.docCount = data.length
      else if (element.status && element.status == "Partially completed") this.docCount = Math.round(data.length / 2)
      else if (element.status && element.status == "Waiting for Sign") this.docCount = 0
    });
  }else if (element.isFolder && element.sharedid){
    this.viewDetailsvalue = true

    this.documentService.getfoldersharingRecord(element.sharedid).subscribe(response=>{
      this.sharedfilesdata = response
console.log(response);

      
    })
  }
  }

  /**
   * Function name : fadeclose
   * Input : element
   * Output : Fade out
   * Desc : To Fade out
   */
  fadeclose() {
    $(".fade12").hide();
    setTimeout(() => {
      $("html").css("overflow", "auto");
    }, 10);
  }

  /**
   * Function name : getFileContent
   * Input : content
   * Output : Share view page show
   * Desc : navigating to single share view page 
   */
  getFileContent = function (content) {
    if (content.sharedid == undefined) var sharedfolderid = localStorage.getItem('folder')
    if (sharedfolderid) {
      var filedata = {
        fileid: sharedfolderid
      }
      this.documentres = content
      this.documentService.decryptedvalues(filedata).subscribe((data: any) => { this.decryptid = data.decryptdata })
      var fileid = {
        fileid: content._id
      }
      this.documentService.encryptedvalues(fileid).subscribe((sharedata: any) => {
        if (this.profiledata.type == 'individual') this.router.navigate(['/individual/sharereview/' + sharedfolderid + '/' + sharedata.encryptdata]);
        else if (this.profiledata.type == 'organisation' || this.profiledata.type == 'employee') this.router.navigate(['/organization/sharereview/' + sharedfolderid + '/' + sharedata.encryptdata]);
      })
    } else {
      if (content.sharedid) localStorage.removeItem('folder')
      if (sharedfolderid) localStorage.removeItem('folder')
      this.documentres = content
      if (content) {
        var data = {
          sharedid: content.sharedid,
          fileid: content._id
        }
        this.documentService.encryptedvalues(data).subscribe((data: any) => {
          if (data.sharedid && data.fileid) {
            if (this.profiledata.type == 'individual') this.router.navigate(['/individual/sharereview/' + data.sharedid + '/' + data.fileid]);
            else if (this.profiledata.type == 'organisation' || this.profiledata.type == 'employee') this.router.navigate(['/organization/sharereview/' + data.sharedid + '/' + data.fileid]);
          }
          else if (!data.sharedid && data.fileid) {
            if (this.profiledata.type == 'individual') this.router.navigate(['/individual/sharereview/' + data.fileid]);
            else if (this.profiledata.type == 'organisation' || this.profiledata.type == 'employee') this.router.navigate(['/organization/sharereview/' + data.fileid]);
          }

        })
      }
    }
  }

  /**
   * Function name : agreeToSign
   * Input : shareDoc, agreetoSign
   * Output : agreetoSign updates as true
   * Desc : To check and update agreetosign status
   */
  agreeToSign(shareDoc, agreetoSign) {
    var sharedfolderid = localStorage.getItem('folder')
    if (shareDoc && shareDoc.sharedid) var data = { _id: shareDoc.sharedid, agreetoSign: agreetoSign };
    if (sharedfolderid) {
      var data = { _id: this.decryptid, agreetoSign: agreetoSign };
    }
    if (agreetoSign) {
      if (!sharedfolderid) {
        this.documentService.put('sharingpeoples/sharedoc/update/' + data._id, data).subscribe(data => {
          if (agreetoSign) {
            var filedata = {
              fileid: shareDoc.sharedid
            }
            this.documentService.encryptedvalues(filedata).subscribe((sharedata: any) => {
              document.getElementById('basicExampleModalclose').click()
              if (this.profiledata.type == 'individual') this.router.navigate(['/individual/sharereview/' + sharedata.encryptdata]);
              else if (this.profiledata.type == 'organisation' || this.profiledata.type == 'employee') this.router.navigate(['/organization/sharereview/' + sharedata.encryptdata]);
            })
          }
        });
      } else {
        if (sharedfolderid) {
          var sharedata = {
            fileid: shareDoc._id
          }
          this.documentService.encryptedvalues(sharedata).subscribe((sharedata: any) => {
            document.getElementById('basicExampleModalclose').click()
            if (this.profiledata.type == 'individual') this.router.navigate(['/individual/sharereview/' + sharedfolderid + '/' + sharedata.encryptdata]);
            else if (this.profiledata.type == 'organisation' || this.profiledata.type == 'employee') this.router.navigate(['/organization/sharereview/' + sharedfolderid + '/' + sharedata.encryptdata]);
          })
        }
      }
    }
    else this.documentService.openSnackBar("Agree to our Terms and Conditions and Privacy Policy", "X")
  }

  /**
   * Function name : agreetoreview
   * Input : doc, agreereview
   * Output : agreetoreview updates as true
   * Desc : To check agreetoreview status
   */
  agreetoreview(doc, agreereview) {
    var sharedfolderid = localStorage.getItem('folder')
    if (doc && doc.sharedid) var data = { _id: doc.sharedid, agreetoReview: agreereview };
    if (sharedfolderid) {
      var data = { _id: this.decryptid, agreetoReview: agreereview };
    }
    if (agreereview) {
      if (!sharedfolderid) {
        this.documentService.put('sharingpeoples/sharedoc/update/' + data._id, data).subscribe(data => {
          if (agreereview) {
            var filedata = {
              fileid: doc.sharedid
            }
            this.documentService.encryptedvalues(filedata).subscribe((sharedata: any) => {
              document.getElementById('basicExampleModalclose').click()
              if (this.profiledata.type == 'individual') this.router.navigate(['/individual/sharereview/' + sharedata.encryptdata]);
              else if (this.profiledata.type == 'organisation' || this.profiledata.type == 'employee') this.router.navigate(['/organization/sharereview/' + sharedata.encryptdata]);
            })
          }
        });
      } else {
        if (sharedfolderid) {
          var sharedata = {
            fileid: doc._id
          }
          this.documentService.encryptedvalues(sharedata).subscribe((sharedata: any) => {
            document.getElementById('basicExampleModalclose').click()
            if (this.profiledata.type == 'individual') this.router.navigate(['/individual/sharereview/' + sharedfolderid + '/' + sharedata.encryptdata]);
            else if (this.profiledata.type == 'organisation' || this.profiledata.type == 'employee') this.router.navigate(['/organization/sharereview/' + sharedfolderid + '/' + sharedata.encryptdata]);
          })
        }
      }
    }
    else this.documentService.openSnackBar("Agree to our Terms and Conditions and Privacy Policy", "X")
  }

  /**
   * Function name : downloadfile
   * Input : data
   * Output : Downloaded document
   * Desc : To download the document 
   */
  downloadfile(data) {
    this.documentService.pdfDownload(data)
  }

  /**
   * Function name : organizationgroup
   * Input : element
   * Output : sharing people data
   * Desc : To get sharing people data
   */
  organizationgroup(element) {
    return new Promise(async (resolve, reject) => {
      this.organizationService.getshareDocbasedemp(element.groupid).subscribe((data: any) => {
        if (data.length) data.forEach(item => this.groups.push(item));
        resolve(this.groups)
      });
    })
  }

  /**
  * Function name : userlevecheck
  * Input : groups
  * Output : Expiry date check
  * Desc : Expiry date check
  */
  userlevecheck(groups) {
    this.groupdata.forEach(elements => {
      this.groups.forEach(emps => {
        if (elements.groupid == emps.groupid) {
          if (emps.departmentlevels && ((elements.departmentlevels && (elements.departmentlevels.hlevel > emps.departmentlevels.hlevel)) || emps.departmentlevels.hlevel == 1)) {
            if (!emps.orgfileviewstatus) {
              if (elements.toid._id == emps.toid._id) {
                this.hleveldata.push(emps);
              }
            }
          }
        }
      })
    })
    if (this.hleveldata.length > 0) {
      this.hleveldata.forEach(elemnt => {
        if (elemnt.access_expirydate) {
          var access_expirydate = elemnt.access_expirydate
          if (moment(access_expirydate).format("YYYY-MM-DDTHH:mm:ss") <= (moment(this.today).format("YYYY-MM-DDTHH:mm:ss"))) {
            var x = moment(access_expirydate).format("YYYY-MM-DDTHH:mm:ss") <= (moment(this.today).format("YYYY-MM-DDTHH:mm:ss"))
          }
          if (!x) this.pushFilesFolderToArray(elemnt);
        }
        if (!elemnt.access_expirydate) this.pushFilesFolderToArray(elemnt)
      });
    }
  }

  /**
  * Function name : setDownload
  * Input : data
  * Output : Download data set
  * Desc : To set download set
  */
  setDownload(data) {
    this.element = data
    this.downloadType = 'computer'
    this.downloadFile = 'current'
    this.withlog = false;
    this.pdfPinSet = false;
    this.pdfPin = '';
    this.email = '';
  }

  /**
   * Function name : pdfDownload
   * Input : token
   * Output :  Pdf Download 
   * Desc :  Pdf Download 
   */
  pdfDownload(token) {
    if (this.downloadFile == 'withoutchanges') this.withlog = undefined;
    var downloaddata = {
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
          this.documentService.openSnackBar("File Downloaded Successfully", "X");
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
          this.documentService.openSnackBar("Please Enter Valid Email", "X");
        }
      }
    }
  }

  /**
   * Function name : exporttodrive
   * Input : null
   * Output :  File export to drive
   * Desc : To export file to drive 
   */
  exporttodrive() {
    gapi.load('auth', { 'callback': this.onAuthApi.bind(this) });
  }

  /**
   * Function name : onAuthApi
   * Input : null
   * Output :  Auth check
   * Desc : Auth check, while exporting to drive
   */
  onAuthApi() {
    gapi.auth.authorize(
      {
        'client_id': this.clientid,
        'scope': this.scopes,
        'immediate': false
      },
      this.handleAuthResults);
  }

  /**
   * Function name : handleAuthResults
   * Input : authResult
   * Output :  Checking access token
   * Desc : Checking access token
   */
  handleAuthResults = (authResult) => {
    if (authResult && authResult.access_token) this.pdfDownload(authResult)
  }

  test1() {
  }

  /**
   * Function name : getHighlight
   * Input : data
   * Output : Highlighted row
   * Desc : To check file/folder presence status to return boolean value to apply class to it
   */
  getHighlight(data) {
    if (data.isFile) {
      if (this.filearr.some(element => element._id == data._id)) return true
      else return false
    }
    else if (data.isFolder) {
      if (this.folderarr.some(element => element._id == data._id)) return true
      else return false
    }
    else return false
  }

  /**
   * Function name : multiselectpdf
   * Input : element1, event
   * Output : Multi selcted files or folders
   * Desc : To select multiple files and folders
   */
  multiselectpdf(element1, event) {
    this.triggervalue = true;
    if (event && event.ctrlKey) {
      if (element1.isFile) {
        if (!this.filearr.some(element => element._id == element1._id)) {
          this.filearr.push(element1);
          if (this.filearr.length > 1) this.EnableDelete = true;
        }
        else {
          var indexNum = this.filearr.findIndex((element) => {
            return (element._id == element1._id);
          });
          this.filearr.splice(indexNum, 1);
        }
      }
      else if (element1.isFolder) {
        if (!this.folderarr.some(element => element._id == element1._id)) {
          this.folderarr.push(element1)
          if (this.folderarr.length > 1) this.EnableDelete = true;
        }
        else {
          var indexNum = this.folderarr.findIndex((element) => {
            return (element._id == element1._id);
          });
          this.folderarr.splice(indexNum, 1);
        }
      }
    }
    else {
      if (element1.isFile) {
        this.filearr = [element1]
        this.folderarr = []
      }
      else if (element1.isFolder) {
        this.folderarr = [element1]
        this.filearr = []
      }
    }
    if ((this.filearr.length > 1 || this.folderarr.length > 1) || (this.filearr.length == 1 && this.folderarr.length == 1)) this.triggervalue = false
  }

  /**
   * Function name : deleteSlectedElement
   * Input : null
   * Output : Selected document deletion
   * Desc : To delete selected item
   */
  deleteSlectedElement() {
    this.matdialogopen = true
    var folders = JSON.parse(JSON.stringify(this.folderarr))
    var files = JSON.parse(JSON.stringify(this.filearr))
    var selecteddata = {
      folders: folders,
      files: files
    }
    if (files.length && folders.length) {
      files.forEach((element,index) => {
        if(element.status == 'Partially completed' || element.status == 'Completed') {
          this.documentService.openSnackBar("can't delete",'X')
          files.splice(index,1)
          this.filearr.splice(index,1)
        }
      });
      setTimeout(() => {
        $('body').css("overflow", "hidden");
      }, 10);
      let dialogRef = this.dialog.open(CommonDialogComponent, { data: { name: 'deleteMultiFilesandFolders' }, width: '500px', panelClass: "deletemod" });
      dialogRef.afterClosed().subscribe(res => {
        this.chechBoxenable=false
        setTimeout(() => {
          $('body').css("overflow", "auto");
        }, 10);
        this.matdialogopen = false
        if (res) this.documentService.multiShareFolderDelete(selecteddata).subscribe(data => {
          if (data) this.getSharedDocuments();
          this.documentService.openSnackBar("Items deleted Successfully!", "X");
        })
      })
    }
    else if (files.length && !folders.length) {
      setTimeout(() => {
        $('body').css("overflow", "hidden");
      }, 10);
      let dialogRef = this.dialog.open(CommonDialogComponent, { data: { name: 'deleteMultiFiles' }, width: '500px', panelClass: "deletemod" });
      dialogRef.afterClosed().subscribe(res => {
        setTimeout(() => {
          $('body').css("overflow", "auto");
        }, 10);
        this.matdialogopen = false
        if (res) this.documentService.multiShareFolderDelete(selecteddata).subscribe(data => {
          if (data) this.getSharedDocuments();
          this.documentService.openSnackBar("File(s) deleted successfully!", "X");
        });
      })
    }
    else if (folders.length && !files.length) {
      setTimeout(() => {
        $('body').css("overflow", "hidden");
      }, 10);
      let dialogRef = this.dialog.open(CommonDialogComponent, { data: { name: 'deleteMultiFolders' }, width: '500px', panelClass: "deletemod" });
      dialogRef.afterClosed().subscribe(res => {
        setTimeout(() => {
          $('body').css("overflow", "auto");
        }, 10);
        this.matdialogopen = false
        if (res) this.documentService.multiShareFolderDelete(selecteddata).subscribe(data => {
          if (data) this.getSharedDocuments();
          this.documentService.openSnackBar("Folder(s) deleted successfully!", "X");
        });
      })
    }


  }

  /**
   * Function name : highlightRow
   * Input : element
   * Output : highlighted selected file or folder.
   * Desc : to highlight the selected file or folder.
   */
  highlightRow(element) {
    this.view = false
    this.selectedName = element._id;
    this.sample2 = true
    this.element = element;
  }

  // Making modal close
  uploadFileBrowser(name) {
    this.modalopened = false
  }

  // to get model id, while browser upload
  browserupload(id) {
    this.modalid = id
  }

  // Making modal close
  uploadFile(name) {
    this.modalopened = false
  }

  /**
   * Function name : SharedDocumentDeleted
   * Input : null
   * Output : Remove the deleted Document
   * Desc : update the current data.
   */
  SharedDocumentDeleted() {
    this.dataservice.sharedDocumentDelete().subscribe(data => {
      console.log(data)
      console.log(this.fileElements)
      if (this.fileElements.some(x => x._id == data._id)) {
        var index = this.fileElements.findIndex(x => x._id == data._id);
        console.log(index)
        if (index != undefined) { this.fileElements.splice(index, 1); }
      }

    })
  }
loadData()
{
  this.dataservice.documentUpdate().subscribe(data => {
    console.log(data)
    if(this.sharedfiles && data._id == this.sharedfiles[0].fileid._id)
    this.getSharedDocuments()
  })
}
is_touch_device() {
  return 'ontouchstart' in window;
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
     * Function name : selectWithLeft
     * Output :select the left side element on keying left arrow 
     */
    selectWithLeft() {

      if (this.element.isFile) {
        if (this.fileElements[0]._id != this.element._id) {
          var index = this.fileElements.findIndex(x => x._id == this.element._id);
          this.multiselectpdf(this.fileElements[index - 1], null);
          this.highlightRow(this.fileElements[index - 1]);
        }
        else if (this.fileElements[0]._id == this.element._id) {
          this.multiselectpdf(this.folderElements[this.folderElements.length - 1], null);
          this.highlightRow(this.folderElements[this.folderElements.length - 1]);
        }
      }
      else if (this.element.isFolder) {
        if (this.folderElements[0]._id != this.element._id) {
          var index = this.folderElements.findIndex(x => x._id == this.element._id);
          this.multiselectpdf(this.folderElements[index - 1], null);
          this.highlightRow(this.folderElements[index - 1]);
        }
        else {
  
        }
      }
      setTimeout(() => {
        var $element = $('.highlight');
        if (!this.checkInViewLeft($element)) {
          var $window = $(window)
          var viewport_top = $window.scrollTop()
          var height = $element.height()
          var heightofElememt = this.element.isFile ? 2.5 : 4
          $('html, body').animate({ scrollTop: viewport_top - (heightofElememt * height) });
        }
      }, 100)
  
    }
    /**
       * Function name : selectWithRight
       * Output :select the Right side element on keying Right arrow 
       */
    selectWithRight() {
      if (this.element.isFile) {
        if (this.fileElements[this.fileElements.length - 1]._id != this.element._id) {
          var index = this.fileElements.findIndex(x => x._id == this.element._id);
          this.multiselectpdf(this.fileElements[index + 1], null);
          this.highlightRow(this.fileElements[index + 1]);
        }
        else { }
      }
      else if (this.element.isFolder) {
        if (this.folderElements[this.folderElements.length - 1]._id != this.element._id) {
          var index = this.folderElements.findIndex(x => x._id == this.element._id);
          this.multiselectpdf(this.folderElements[index + 1], null);
          this.highlightRow(this.folderElements[index + 1]);
        }
        else if (this.folderElements[this.folderElements.length - 1]._id == this.element._id) {
          this.multiselectpdf(this.fileElements[0], null);
          this.highlightRow(this.fileElements[0]);
        }
      }
      setTimeout(() => {
        var $element = $('.highlight');
        if (!this.checkInViewRight($element)) {
          var $window = $(window)
          var viewport_top = $window.scrollTop()
          var height = $element.height()
          var heightofElememt = this.element.isFile ? 2. : 4
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
      var bottom = top + height - 150 //subract header height
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
      this.filearr = this.fileElements.slice(0);
      this.folderarr = this.folderElements.slice(0);
    }else{
      this.filearr = [];
      this.folderarr = [];
    }
  }
}