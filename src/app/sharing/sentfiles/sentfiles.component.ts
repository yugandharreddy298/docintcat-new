import { Component, ViewChild, Output, EventEmitter, TemplateRef, OnInit, ViewContainerRef, HostListener, NgZone } from '@angular/core';
import { MatDialog } from '@angular/material';
import { CommonDialogComponent } from '../../public/common-dialog/common-dialog.component';
import { DocumentService } from '../../document.service';
import { DataService } from '../../core/data.service';
import { UserService } from '../../user.service';
import { MatMenuTrigger } from '@angular/material/menu';
import { FrontEndConfig } from '../../frontendConfig';
import { Router ,ActivatedRoute} from "@angular/router";
import { OrganizationFileSharingComponent } from '../../organization/organization-file-sharing/organization-file-sharing.component'
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { Subject, BehaviorSubject, Subscription } from 'rxjs';
import { SharepopupComponent } from '../sharepopup/sharepopup.component';

declare var $: any;
declare var gapi: any;
@Component({
  selector: 'app-sentfiles',
  templateUrl: './sentfiles.component.html',
  styleUrls: ['./sentfiles.component.css']
})
export class SentfilesComponent implements OnInit {
  @ViewChild('userMenu') userMenu: TemplateRef<any>;
  @ViewChild(MatMenuTrigger) contextMenu: MatMenuTrigger;
  overlayRef: OverlayRef | null;
  type : any;
  sub : Subscription;
  id : any;
  filedata = [];
  profileData : any
  folders = [];
  currentRoot = null;
  currentPath = null;
  canNavigateUp = false;
  organization : Array<any> = []
  status : any;
  uid : any;
  sentdata : any;
  sentfiles = [];
  sentfolders = [];
  selectedName: any;
  sample2 = false;
  grid = true;
  selectedelement : any;
  sharedPeople = [];
  Sharedata : any ;
  querySubject : any;
  documentLogs : any;
  viewDetailsvalue = false;
  matmenu : any;
  element : any;
  isloading : boolean = true;
  FileMenu = false;
  contextMenuPosition = { x: '0px', y: '0px' };
  downloadType : any;
  downloadFile : any;
  withlog : any;
  pdfPinSet : any;
  pdfPin : any;
  triggervalue : Boolean = false;
  EnableDelete : Boolean = false;
  email : any;
  checkid : any;
  navigationelement : any;
  currentelement : any;
  foldervalue : any;
  browserpath : any;
  modalid : any;
  modalopened : any;
  pathvalue : any;
  iebrowser : any;
  matttoltip : any;
  matdialogopen: boolean = false;
  chechBoxenable:boolean=false // show checkbox  while touch hold in touch enable devices
  constructor(private _ngZone: NgZone, public overlay: Overlay, public viewContainerRef: ViewContainerRef,
    public dataservice: DataService, private router: Router, private documentService: DocumentService,
    private frontendconfig: FrontEndConfig, private userservice: UserService, public dialog: MatDialog) {

  }

  @Output() elementShared = new EventEmitter<{ element: FileElement, title: any }>();
  @Output() elementRemoved = new EventEmitter<FileElement>();
  @Output() folderAdded = new EventEmitter<{ name: string }>(); // folder adding
  @Output() fileAdded = new EventEmitter<{ data: string }>(); //file adding
  @ViewChild(MatMenuTrigger) contextMenu1: MatMenuTrigger; //context menu
  serverurl = this.frontendconfig.getserverurl(); // Get server URL 
   /**
   * Function name : HostListener window Keydown  event
   * Desc : Handle CTRL+A to seletect all files and DELETE event to delete Selected Files 
   */
  @HostListener('document:keydown', ['$event']) onKeydownHandler(event: KeyboardEvent) {
    if (event.ctrlKey && event.keyCode == 65) {
      this.filearr = this.filedata.slice(0); // add all files when user Press CTRL+A
      this.folderarr = this.folders.slice(0); // add all Folders when  user Press CTRL+A
      event.preventDefault();
    }
    if (event.keyCode == 46) {
      if ((this.filearr.length > 1 || this.folderarr.length > 1) || (this.filearr.length == 1 && this.folderarr.length == 1)) {
        if (!this.matdialogopen) {
          this.deleteSlectedElement() // Delete selected File or Folder When user Press DELETE key in Keyboard(select one file or folder)

        }
      }
      else if ((this.filearr.length || this.folderarr.length)) {
        if (!this.matdialogopen) {
          this.deleteSlectedElement() // Delete selected Files or Folders When user Press DELETE key in Keyboard(more than one file or folder)

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
  /**
   * Function name : HostListener window popstate event
   * Desc : Handle Browser backward and forward buttons to navigate folder files 
   */
  @HostListener('window:popstate', ['$event'])
  onPopState(event) {
    if (this.currentelement.parentid && this.currentPath[this.currentPath.length-2]) {
        this.navigateUp(this.currentPath[this.currentPath.length-2]);
      }
    else if (this.currentelement) {
      this.browserpath = 'root'
      this.navigateUp(this.browserpath)
      setTimeout(() => {

        if (this.profileData.type == 'individual') this.router.navigate(['individual/home/sentfiles']);
        else if (this.profileData.type == 'organisation' || this.profileData.type == 'employee') this.router.navigate(['organization/home/sentfiles']);
      }, 1000);
    }


  }
  /**
   * Function name : HostListener window click  event
   * Desc : Deselect the selected Files 
   */
  @HostListener('document:click', ['$event']) onClickHandler(event: MouseEvent) {
    var value: any = event.srcElement;
    if (value.id != "foldersList" && value.id != "filesList" && value.id!='contextmenu' && value.classList[0]!=='mat-checkbox-inner-container' && (!(this.contextMenu && this.contextMenu.menuOpened.closed) || !(this.contextMenu1 && this.contextMenu1.menuOpened.closed))) {
      this.filearr = []
      this.folderarr = []
      this.sample2 = false
      this.EnableDelete = false
      this.selectedName = null;
      this.chechBoxenable=false;
    }
    if( this.contextMenu &&this.contextMenu.menuOpen) {
      this.contextMenu.closeMenu();
      this.selectedName=null
    }
  }
 /**
   * Function name : HostListener window scroll  event
   * Desc : hide Context Menu When Scroll(Right click Menu)
   */
  @HostListener('window:scroll', ['$event'])
  onWindowScroll($event) {
    if (this.contextMenu) this.contextMenu.closeMenu()
    this.matttoltip = true
    setTimeout(() => {
      this.matttoltip = false
    }, 1);
  }
 /**
   * Function name : HostListener window context menu  event
   * Desc : show and  hide Context Menu Right click Menu
   */
  @HostListener('document:contextmenu', ['$event']) menuContext(ev: MouseEvent,srcElement:any) {
    const value: any = ev.srcElement;
        if(value.id=='filesList' || value.id=='foldersList'){
          this.contextMenu.closeMenu();
          setTimeout(() => {
            this.contextMenuPosition.x = ev.clientX + 'px';
            this.contextMenuPosition.y = ev.clientY + 'px';
            if(!this.is_touch_device()) this.contextMenu.openMenu();
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
  // for export files to google Drive Api Key 
  clientid = "778273248008-3rlo8d96pebk6oci737ijtbhmla253gr.apps.googleusercontent.com"
  scopes = [
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/drive.appdata',
    'https://www.googleapis.com/auth/drive.file'
  ].join(' ');
  ngOnInit() {
    this.profileData = JSON.parse(localStorage.getItem('currentUser'))
    this.profileData.type = this.userservice.decryptData(this.profileData.type)
    var id = this.router.url.substring(this.router.url.lastIndexOf('/') + 1)
    if (id != 'sentfiles') {
      this.isloading = false;
      var path = JSON.parse(localStorage.getItem('currentpath'));
      if(path)
      {
        for (var j = 0; j < path.length; j++) {
          if (path[j]) {
            for (var i in path[j]) {
             path[j][i] = this.userservice.decryptData(path[j][i]);
            }
          }
        }
      }
    
     var data = {
        fileid: id
      }
      this.documentService.decryptedvalues(data).subscribe((encryp: any) => {
        this.documentService.getfolder().subscribe(data => { // navigate to Folder 
          this.checkid = data;
          this.checkid.forEach(element => {
            if (element._id == encryp.decryptdata) {
              this.navigationelement = element
              this.currentRoot = this.navigationelement
              this.currentPath = path ?path :null
              this.currentelement = this.navigationelement
              this.navigateToFolder(this.navigationelement)
              this.popFromPath(this.currentPath,this.currentRoot)
            }
          });
          if (!this.currentelement) {
            if (this.profileData.type == 'individual') this.router.navigate(['individual/home/sentfiles']);
            else if (this.profileData.type == 'organisation' || this.profileData.type == 'employee') this.router.navigate(['organization/home/sentfiles']);
          }

        })
      }, error => {
        if (this.profileData.type == 'individual') this.router.navigate(['individual/home/sentfiles']);
        else if (this.profileData.type == 'organisation' || this.profileData.type == 'employee') this.router.navigate(['organization/home/sentfiles']);
      })
    }
    else {
      if (!!(window as any).MSInputMethodContext && !!(document as any).documentMode) {
        $(".ietop").css("margin-top", "100px");
      }
      this.GetsentDocuments(); // get All Sent Files 
    }
    if (!!(window as any).MSInputMethodContext && !!(document as any).documentMode) {
      $(".ietop").css("margin-top", "100px");
      this.iebrowser = true;
    } else{
      this.iebrowser = false;
    } 
  }

 /**
   * Function name : viewDetails
   * Inputs : file or Folder 
   * Desc : Show Audit logs of file or folder 
   */
  viewDetails = function (element) {
    var data = {
      fileid: element._id
    }
    this.documentService.encryptedvalues(data).subscribe((data: any) => { // encrypt fileid 

      if (element.isFile) {
        if (this.profileData.type == 'individual'){
          this.router.navigate(['individual/home/auditlog/' + data.encryptdata + '/File']);
        }  else if (this.profileData.type == 'organisation' || this.profileData.type == 'employee'){
          this.router.navigate(['organization/home/auditlog/' + data.encryptdata + '/File']);
        } 
      }  else {
        if (this.profileData.type == 'individual'){
          this.router.navigate(['individual/home/auditlog/' + data.encryptdata + '/Folder']);
        }  else if (this.profileData.type == 'organisation' || this.profileData.type == 'employee'){
          this.router.navigate(['organization/home/auditlog/' + data.encryptdata + '/Folder']);
        } 
      }
    })
  }

 /**
   * Function name : sortDataAsc
   * Input : null
   * Desc : Sorting files and folders Name Ascending order
   */ 
    sortDataAsc() {
    this.sentfiles.sort(function (a, b) {
      var nameA = a.name.toLowerCase()
      var nameB = b.name.toLowerCase()
      if (nameA > nameB) { return 1; }
      if (nameA < nameB) { return -1; }
      return 0;
    })
    this.sentfolders.sort(function (a, b) {
      var nameA = a.name.toLowerCase()
      var nameB = b.name.toLowerCase()
      if (nameA > nameB) { return 1; }
      if (nameA < nameB) { return -1; }
      return 0;
    })
  }

    /**
   * Function name : sortDataDsc
   * Input : null
   * Desc : Sorting files and folders Name descending order
   */ 
  sortDataDsc() {
    this.sentfiles.sort(function (a, b) {
      var nameA = a.name.toLowerCase()
      var nameB = b.name.toLowerCase()
      if (nameA < nameB) { return 1; }
      if (nameA > nameB) { return -1; }
      return 0;

    })
    this.sentfolders.sort(function (a, b) {
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
   * Desc : Sorting files and folders Updating time in  Ascending order
   */ 
  sortByModifiedAsc() {
    this.sentfiles.sort(function (a, b) {
      var nameA = a.updatedAt;
      var nameB = b.updatedAt;
      if (nameA > nameB) { return 1; }
      if (nameA < nameB) { return -1; }
      return 0;
    })
    this.sentfolders.sort(function (a, b) {
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
   * Desc : Sorting files and folders Updating time in  Descending order
   */ 
  sortByModifiedDsc() {
    this.sentfiles.sort(function (a, b) {
      var nameA = a.updatedAt;
      var nameB = b.updatedAt;
      if (nameA < nameB) { return 1; }
      if (nameA > nameB) { return -1; }
      return 0;
    })
    this.sentfolders.sort(function (a, b) {
      var nameA = a.updatedAt;
      var nameB = b.updatedAt;
      if (nameA < nameB) { return 1; }
      if (nameA > nameB) { return -1; }
      return 0;
    })
  }

  /**
   * Function name : openMenufolder
   * Input : event , file / folder  
   * Desc : open menu when user Right Click on file or folder works in Web enviromment (not touch enabled Devices) 
   */
  openMenufolder(event: MouseEvent, element: FileElement) {
    this.selectedName = element._id
    this.element = element
    this.matmenu = element
    this.FileMenu = true;
    event.preventDefault();
    this.contextMenuPosition.x = event.clientX + 'px'; // set position (x) of contextmenu
    this.contextMenuPosition.y = event.clientY + 'px'; // set position (y) of contextmenu
  }
  /**
   * Function name : openMenufolder1
   * Input : event , file / folder  
   * Desc : open menu when user Right Click on file or folder works in touch enabled Devices 
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
          this.element = element
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
    } else {
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
      this.element = element
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
   * Function name : shareElement
   * Input : File / Folder 
   * Desc : Open Share popup (Share for Review or Share for Signature )
   */
    shareElement(element) {
    var title = 'share'
    this.profileData = JSON.parse(localStorage.getItem('currentUser'))
    this.profileData.type = this.userservice.decryptData(this.profileData.type);
    if (this.profileData.type == 'individual') {
      this.hideBodyScroll(); // hide body scroll when confirm popup is open 
      const filedialog = this.dialog.open(SharepopupComponent, { // open individual share popup
        width: '848px',
        height: '630px',
        disableClose: false,
        autoFocus: false,
        panelClass: "test",
        data: { content: element, text: 'owner', multi: false }
      });
        filedialog.afterClosed().subscribe(res => {
          this.showBodyScroll(); // Show  body scroll when confirm popup is close  
      })
    } else {
      this.hideBodyScroll(); // hide body scroll when confirm popup is open 
      const filedialog = this.dialog.open(OrganizationFileSharingComponent, { // open organisation share popup
        width: '900px',
        disableClose: false,
        autoFocus: false,
        panelClass: 'orgn',
        data: { content: element, multi: false },
      });
      filedialog.afterClosed().subscribe(res => {
        if (res == 'true') {
          this.hideBodyScroll(); // hide body scroll when confirm popup is open 
        } else {
          this.showBodyScroll(); // Show  body scroll when confirm popup is close  
        }


      })
    }
    if (element) {
      if ((title == 'share' || title == 'Review' || title == 'Signature') && document.getElementById('modelclose')){
        document.getElementById('modelclose').click()
      } 
      if (title == 'Signature'){
        this.getFileContent(element) // if no filelds when file share for signature its navigate to agreement copy
      } else{
        this.elementShared.emit({ element: element, title: title });
      } 
    }
  }


  /**
   * Function name : getFileContent
   * Input : File
   * Api: documents/encrypt/
   * Output :  {json}  encrypted fileid 
   * Desc : encrypt fileid and navigate to file view   
   */ 
    getFileContent = function (content) {
    var data = {
      fileid: content._id
    }
    // var value= this.userservice.encryptData(content._id)
    this.documentService.encryptedvalues(data).subscribe((data: any) => { //encrypt file id
      if (this.profileData.type == 'individual') this.router.navigate(['individual/filecont/' + data.encryptdata]); 
      else if (this.profileData.type == 'organisation' || this.profileData.type == 'employee') this.router.navigate(['organization/filecont/' + data.encryptdata]);

    })
  }
  /**
   * Function name : deleteElement
   * Input : file / folder 
   * Api: documents/deletefile/  or /folders/deletefolder/ 
   * Output : {Json} file or folder 
   * ApiError: 500-InternalServerError SERVER error or 404- Not Found.
   * Desc : Delete selected File or folder 
   */
  deleteElement(element: FileElement) {
    this.matdialogopen = true;
    if (element.isFolder) {
      this.hideBodyScroll(); // hide body scroll when confirm popup is open 
      let dialogRef = this.dialog.open(CommonDialogComponent,
        { data: { name: 'deletefolder' }, width: '500px', panelClass: "deletemod", disableClose: false });
      dialogRef.afterClosed().subscribe(res => {
        this.showBodyScroll(); // Show  body scroll when confirm popup is close  
        this.matdialogopen = false;
        if (res) {
          this.close();
          this.documentService.updatesentfolder(element).subscribe(data => {
            this.GetsentDocuments();

            this.documentService.openSnackBar("Folder(s) deleted successfully", "X"); // show snapbar message when deletion success 
          })
        }

      });
    } else {
      this.hideBodyScroll(); // hide body scroll when confirm popup is open 
      let dialogRef = this.dialog.open(CommonDialogComponent,
        { data: { name: 'delete' }, width: '500px', panelClass: "deletemod", disableClose: false });
      dialogRef.afterClosed().subscribe(res => {
        this.showBodyScroll(); // Show  body scroll when confirm popup is close  
        this.matdialogopen = false
        if (res) {
          this.close();
          this.documentService.updatesentfolder(element).subscribe(data => {
            this.GetsentDocuments()
            this.documentService.openSnackBar("File(s) deleted successfully", "X") // show snapbar message when deletion success 
          })
        }

      });
    }
  }
    /**
   * Function name : close
   * Input :null
   * Desc : override mat overlayRef
   */
  close() {
    this.sub && this.sub.unsubscribe();
    if (this.overlayRef) {
      this.overlayRef.dispose();
      this.overlayRef = null;
    }
  }
    /**
   * Function name : GetsentDocuments
   * Input : null
   * Api: folders/getSentDocs/sent
   * Output : {Array} file or folder 
   * ApiError: 500-InternalServerError SERVER error or 404- Not Found.
   * Desc :Get all sent Doucuments and Folders 
   */
  GetsentDocuments() {
    this.isloading = true
    this.filedata = []
    this.folders = []
    this.documentService.getSentDocs().subscribe(data => {
      this.sentdata = data;
      if (this.sentdata.length > 0) {
        this.sentdata.forEach(element => {
          if (element.isFile) {
            this.filedata.push(element)
          } else if (element.isFolder) {
            this.folders.push(element)
          }
          if (this.sentdata.length - 1 == this.sentdata.indexOf(element)) {
             this.sentfiles = this.filedata; this.sentfolders = this.folders 
             if (this.userservice.searchElementReturn()) {
              var searchelement = this.userservice.searchElementReturn();
              if (searchelement && searchelement.isFile) {
                var element = this.sentfiles.find(x => x._id == searchelement._id);
                if(element!=undefined){
                  this.filearr.push(element);
                  this.highlightRow(element)
                }
              }
              else if(searchelement && searchelement.isFolder){
                var element = this.sentfolders.find(x => x._id == searchelement._id);
                if(element!=undefined){
                  this.highlightRow(element)
                  this.folderarr.push(element);
                }
              }
               this.userservice.searchElementSet(null)
            }
            }
        });
      } else {
        this.sentfiles = this.sentdata;
        this.sentfolders = this.sentdata;
        if (this.userservice.searchElementReturn()) {
          var searchelement = this.userservice.searchElementReturn();
          console.log(searchelement)
          if (searchelement && searchelement.isFile) {
            var element = this.sentfiles.find(x => x._id == searchelement._id);
            this.filearr.push(element);
            this.highlightRow(element)

          }
          else if(searchelement && searchelement.isFolder){
            var element = this.sentfolders.find(x => x._id == searchelement._id);
            this.highlightRow(element)
            this.folderarr.push(element);

          }
           this.userservice.searchElementSet(null)
        }
            }
      this.isloading = false
    });
  }
   /**
   * Function name : highlightRow
   * Input : file / folder
   * Desc : Hignlight Seleted File Or Folder when Click 
   */
  highlightRow(element) {
    this.element = element
    this.selectedName = element._id;
    this.sample2 = true
    this.selectedelement = element
  }
  /**
   * Function name : navigateToFolder
   * Input :  folder 
   * Desc : double click on folder to  navigate to files under that  folder  
   */

  navigateToFolder(element) {
    this.filearr = [];
    this.folderarr = []
    this.currentRoot = element;
    this.currentelement = element
    this.foldervalue = element
    var data = {
      fileid: this.foldervalue._id
    }
    this.documentService.encryptedvalues(data).subscribe((data: any) => { // ecnrypt folder id while navigate 
       if (data){
        var subfolder = this.getsubfolders(this.currentRoot);
        subfolder.subscribe(data => { // get sub folders in seleted folder if have 
          if (data) this.updateAlldocuments();
        });
        localStorage.removeItem('currentpath');
        this.currentPath = this.pushToPath(this.currentPath, element); // push folder navigation path to handles browser back button
        var currentpath =JSON.parse(JSON.stringify(this.currentPath));
        this.userservice.setpath(currentpath);
        if (this.profileData.type == 'individual'){
          this.router.navigate(['/individual/home/sentfiles/' + data.encryptdata]);
        } 
        else if (this.profileData.type == 'organisation' || this.profileData.type == 'employee'){
          this.router.navigate(['/organization/home/sentfiles/' + data.encryptdata]);
        } 
       }  
    })
   
  
  }



  /**
   * Function name : navigateUp
   * Input :  event 
   * Desc : set path of folders when double click 
   */
  navigateUp(event) {
    console.log(event)
    if (event != 'root') {
      this.currentRoot = event
      var subfolder = this.getsubfolders(this.currentRoot)
      subfolder.subscribe(data => {
        if (data) this.updateAlldocuments();
      })
    }
    else {
      this.currentRoot = null
      this.GetsentDocuments()
    }
    this.currentPath = this.popFromPath(this.currentPath, this.currentRoot);
    console.log(this.currentPath)
  }

    /**
   * Function name : pushToPath
   * Input :  path, folder  
   * Desc : Add path to queue 
   */

  pushToPath(path: any, folderName) { //Adding path
    var p1 = [];
    if (path) {
      path.forEach(element => {
        if (element) p1.push(element);
      });
    }
    if(!p1.some(x=>x._id==folderName._id))
   { p1.push(folderName);}
    return p1;
  }

   /**
   * Function name : popFromPath
   * Input :  path, folder  
   * Desc : Remove  path From  queue 
   */

  popFromPath(path, current) { //remove from path
    if (current == null) {
      path = [];
      if (this.profileData.type == 'individual'){
        this.router.navigate(['individual/home/sentfiles']);
      } 
      else if (this.profileData.type == 'organisation' || this.profileData.type == 'employee'){
        this.router.navigate(['organization/home/sentfiles']);
      } 
    } else {
      var data = {
        fileid: current._id
      }
      this.documentService.encryptedvalues(data).subscribe((data: any) => {
        if (this.profileData.type == 'individual'){
          this.router.navigate(['individual/home/sentfiles/' + data.encryptdata]);
        }
        else if (this.profileData.type == 'organisation' || this.profileData.type == 'employee'){
          this.router.navigate(['organization/home/sentfiles/' + data.encryptdata]);
        } 
       if(path)
       {
        var i = path.findIndex(x => x._id == current._id);
        path.splice(i + 1, path.length)
       } 
       else path = [];
        localStorage.removeItem('currentpath');
        var currentpath =JSON.parse(JSON.stringify(path));
        this.userservice.setpath(currentpath);
      })
    }
 
    return path;
  }


  // ===================== update all documents ========================
   /**
   * Function name : updateAlldocuments
   * Input :  null 
   * Desc : update all files when double click on folder 
   */
  updateAlldocuments() {
    var Alldocuments
    Alldocuments = []
    if (this.Sharedata) {
      this.Sharedata.forEach(element => {
        Alldocuments.push(element);
        if (this.Sharedata.length - 1 == this.Sharedata.indexOf(element)) {
          Alldocuments.sort(function (a, b) {
            if (a.updatedAt < b.updatedAt) { return 1; }
            return 0;
          });
        }
      });
      if (!this.querySubject) {
        this.querySubject = new BehaviorSubject(Alldocuments);
      } else {
        this.querySubject.next(Alldocuments);
      }
      return this.querySubject.asObservable();
    }
  }

    /**
   * Function name : getsubfolders
   * Input : folder 
   * Api: folders/getparentfolders/
   * Output : {Array} files and  folders 
   * ApiError: 500-InternalServerError SERVER error or 404- Not Found.
   * Desc : get sub folders and files when double click on folder
   */
  getsubfolders(element) {
    var returnobejct = new Subject
    var subfolders
    this.sentfolders = [];
    this.sentfiles = [];
    this.documentService.getparentfolders(element._id).subscribe(data => {
      subfolders = data
      subfolders.folders.forEach(element => {
        this.sentfolders.push(element)
      });
      subfolders.files.forEach(element => {
        this.sentfiles.push(element)
      });
      returnobejct.next(subfolders)
    })
    return (returnobejct.asObservable())
  }

 // Set Download  default options before download  / opening the popup
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
   * Input : {String} Authorized token ( Export to Google Drive)
   * Output: {String} file path (S3 path)
   * Desc :  Pdf Download or export to drive or send attachement to mail 
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
      this.documentService.pdfDownload(downloaddata).subscribe((data: any) => {  // get file url 
        if (data.path && downloaddata.downloadType == "computer") {
          this.isloading = false
          this.documentService.openSnackBar("File Downloaded Successfully", "X");
          var xhr = new XMLHttpRequest()
          xhr.open("GET", data.path)
          xhr.responseType = 'blob'
          xhr.onload = function () {
            saveAs(xhr.response, downloaddata.name); //  save file  to system
          }
          xhr.send()
        }
        else if (downloaddata.downloadType == 'drive') {
          this.isloading = false
          if (!NgZone.isInAngularZone()) this._ngZone.run(() => {
            this.documentService.openSnackBar("File Export To Drive", "X"); // file Export to Drive 
          });

        } else{
          this.isloading = false
        } 
      });
    }
    else if (this.downloadType == 'attachment') {
      if (this.email == null || this.email == '') {
        this.documentService.openSnackBar("Please Enter Email", "X");
      } else {
      var regexp = new RegExp('([A-Za-z]|[0-9])[A-Za-z0-9.]+[A-Za-z0-9]@((?:[-a-z0-9]+\.)+[a-z]{2,})')
        if (regexp.test(this.email)) {
          document.getElementById('savetempclose').click()
          this.isloading = true
          this.documentService.pdfDownload(downloaddata).subscribe((data: any) => {
            if (downloaddata.email && downloaddata.downloadType == "attachment" && data.path) {
              this.isloading = false
              this.documentService.openSnackBar("File Sent To Email", "X"); // sent attachment to mail Success
            }
            else this.isloading = false
          });
        } else {
          this.documentService.openSnackBar("Please Enter Valid Email", "X"); // invalid Email enter
        }
      }
    }

  }
  // To load Google Drive authentication picker
    exporttodrive() {
    gapi.load('auth', { 'callback': this.onAuthApi.bind(this) });
  }
//Gogole Drive Login
  onAuthApi() {
    gapi.auth.authorize(
      {
        'client_id': this.clientid,
        'scope': this.scopes,
        'immediate': false
      },
      this.handleAuthResults);
  }
    //Success callback google drive login
  handleAuthResults = (authResult) => {
    if (authResult && authResult.access_token) this.pdfDownload(authResult)
  }

   /**
   * Function name : getHighlight
   * Input : Files or Folders 
   * Desc :  Highlight seleted files and folders  
   */
  filearr = new Array();
  folderarr = new Array();
  isctrlkey: boolean;
  getHighlight(data) {
    if (data.isFile) {
      if (this.filearr.some(element => element._id == data._id)) {
        return true
      } else {
        return false
      }
    } else if (data.isFolder) {
      if (this.folderarr.some(element => element._id == data._id)) {
        return true
      } else {
        return false
      }
    } else {
      return false
    }
  }
    /**
   * Function name : multiselectpdf
   * Input : event , Files or Folders 
   * Desc :  push Muitiple files or folders into file or folder  arrays   
   */
  multiselectpdf(element1, event) {
    this.triggervalue = true;
    if (event && event.ctrlKey) {
      if (element1.isFile) {
        if (!this.filearr.some(element => element._id == element1._id)) {
          this.filearr.push(element1);
          if (this.filearr.length > 1) {
            this.EnableDelete = true;
          }
        } else {
          var indexNum = this.filearr.findIndex((element) => {
            return (element._id == element1._id);
          });
          this.filearr.splice(indexNum, 1);
        }
      } else if (element1.isFolder) {
        if (!this.folderarr.some(element => element._id == element1._id)) {
          this.folderarr.push(element1)
          if (this.folderarr.length > 1) {
            this.EnableDelete = true;
          }
        } else {
          var indexNum = this.folderarr.findIndex((element) => {
            return (element._id == element1._id);
          });
          this.folderarr.splice(indexNum, 1);
        }
      }
    } else {
      if (element1.isFile) {
        this.filearr = [element1]
        this.folderarr = []
      }
      else if (element1.isFolder) {
        this.folderarr = [element1]
        this.filearr = []
      }
    }
   if ((this.filearr.length > 1 || this.folderarr.length > 1) || (this.filearr.length == 1 && this.folderarr.length == 1)) { this.triggervalue = false; this.EnableDelete = true }
  }
  /**
   * Function name : deleteSlectedElement
   * Input : null
   * Api:  /multiple/remove/sentfiles
   * Output : {String} success
   * Desc : Delete seleted files and folders 
   */ 
  deleteSlectedElement() {
    console.log(this.filearr)
    this.matdialogopen = true
    var folders = JSON.parse(JSON.stringify(this.folderarr))
    var files = JSON.parse(JSON.stringify(this.filearr))
    var sentItems = {
      files: files,
      folders: folders
    }
    this.hideBodyScroll(); // hide body scroll when confirm popup is open 

    if (folders.length && files.length) {
      setTimeout(() => {
        $('body').css('overflow', 'hidden');
      }, 10);
      const dialogRef = this.dialog.open(CommonDialogComponent, {
        data: { name: 'deleteMultiFilesandFolders' },
        width: '500px', panelClass: 'deletemod', disableClose: false
      });
      dialogRef.afterClosed().subscribe(res => {
        this.chechBoxenable = false;
        this.showBodyScroll(); // Show  body scroll when confirm popup is close  

        setTimeout(() => {
          $('body').css('overflow', 'auto');
        }, 10);
        this.matdialogopen = false;
        if (res) {
          this.documentService.multiFolderDelete(folders).subscribe(data => {
            this.documentService.multiFileDelete(files).subscribe(data => {
              if (data) { this.documentService.openSnackBar('Items deleted Successfully!', 'X'); }
              this.isloading = true;
              if (files[0].folderid) {
                this.ngOnInit()
              }
              else this.GetsentDocuments() // get total sent Records
            });
          });
        }
      });
    }
    else if (files.length && !folders.length) {
      setTimeout(() => {
        $('body').css('overflow', 'hidden');
      }, 10);
      const dialogRef = this.dialog.open(CommonDialogComponent, {
        data: { name: 'deleteMultiFiles' },
        width: '500px', panelClass: 'deletemod', disableClose: false
      });
      dialogRef.afterClosed().subscribe(res => {
        this.showBodyScroll(); // Show  body scroll when confirm popup is close  
        setTimeout(() => {
          $('body').css('overflow', 'auto');
        }, 10);
        this.matdialogopen = false;
        if (res) {
          this.documentService.multiFileDelete(files).subscribe(data => {
            if (data) { this.documentService.openSnackBar('File(s) deleted Successfully!', 'X'); }
            this.isloading = true; 
            if(files[0].folderid)
            {
              this.ngOnInit()
                }
         else  this.GetsentDocuments() // get total sent Records
          });
        }
      });
    }
    else if (folders.length && !files.length) {
      setTimeout(() => {
        $('body').css('overflow', 'hidden');
      }, 10);
      const dialogRef = this.dialog.open(CommonDialogComponent, {
        data: { name: 'deleteMultiFolders' },
        width: '500px', panelClass: 'deletemod', disableClose: false
      });
      dialogRef.afterClosed().subscribe(res => {
        this.showBodyScroll(); // Show  body scroll when confirm popup is close  
        setTimeout(() => {
          $('body').css('overflow', 'auto');
        }, 10);
        this.matdialogopen = false;
        if (res) {
          this.documentService.multiFolderDelete(folders).subscribe((data: any) => {
            if (data.message === 'success') {
              this.documentService.openSnackBar('Folder(s) deleted successfully', 'X');
            }
            this.isloading = true;
            if (folders[0].parentid) {
              this.ngOnInit()
            }
            else this.GetsentDocuments() // get total sent Records
          });
        }
      });
    }
    
  }
 /**
   * Function name : multishareElement
   * Input : null 
   * Desc :  open individual share poup or organisation popup when user select muitiple files to share 
   */
  multishareElement() {
    this.profileData = JSON.parse(localStorage.getItem('currentUser'))
    this.profileData.type = this.userservice.decryptData(this.profileData.type)
    var folders = JSON.parse(JSON.stringify(this.folderarr))
    var files = JSON.parse(JSON.stringify(this.filearr))
    var selecteddata = {
      folders: folders,
      files: files,
    }
    this.chechBoxenable=false;
    if (this.profileData && this.profileData.type == 'individual') {
      this.hideBodyScroll(); // hide body scroll when confirm popup is open 
      const filedialog = this.dialog.open(SharepopupComponent, { // individual share popup 
        width: '848px',
        height: '600px',
        disableClose: false,
        autoFocus: false,
        panelClass: "test",

        data: { content: selecteddata, text: 'owner', title: null, multi: true }
      });
      filedialog.afterClosed().subscribe(res => {
        this.showBodyScroll(); // Show  body scroll when confirm popup is close  
      })
    }
    else {
      this.hideBodyScroll(); // hide body scroll when confirm popup is open 
      const filedialog = this.dialog.open(OrganizationFileSharingComponent, { // organisation share popup
        width: '900px',
        disableClose: false,
        panelClass: "orgn",
        autoFocus: false,
        data: { content: selecteddata, title: null, multi: true },
      });
      filedialog.afterClosed().subscribe(res => {
        this.showBodyScroll(); // Show  body scroll when confirm popup is close  
      })
    }
  }

    /**
   * Function name : hideBodyScroll
   * Input : null
   * Desc : disable Body Scroll 
   */
  hideBodyScroll(){
    setTimeout(() => {
      $('body').css("overflow", "hidden");
    }, 10);
  }
   /**
   * Function name : showBodyScroll
   * Input : null
   * Desc : enable Body Scroll 
   */
  showBodyScroll(){
    setTimeout(() => {
      $('body').css("overflow", "auto");
    }, 10);
  }
     /**
   * Function name : deletesingleFile
   * Input : file element
   * Desc : Delete selected Single file
   */
  deletesingleFile(fileelement) {
    if (fileelement.isFile) {
      if (!this.filearr.some(element => element._id == fileelement._id)) {
        this.filearr.push(fileelement);
        this.deleteSlectedElement(); // delete single File
      }
    } else if (fileelement.isFolder) {
      if (!this.folderarr.some(element => element._id == fileelement._id)) {
        this.folderarr.push(fileelement)
        this.deleteSlectedElement(); // delete single Folder

      }
    }
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
    console.log(element,event.checked)
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
        if (this.sentfiles[0]._id != this.element._id) {
          var index = this.sentfiles.findIndex(x => x._id == this.element._id);
          this.multiselectpdf(this.sentfiles[index - 1], null);
          this.highlightRow(this.sentfiles[index - 1]);
        }
        else if (this.sentfiles[0]._id == this.element._id) {
          this.multiselectpdf(this.sentfolders[this.sentfolders.length - 1], null);
          this.highlightRow(this.sentfolders[this.sentfolders.length - 1]);
        }
      }
      else if (this.element.isFolder) {
        if (this.sentfolders[0]._id != this.element._id) {
          var index = this.sentfolders.findIndex(x => x._id == this.element._id);
          this.multiselectpdf(this.sentfolders[index - 1], null);
          this.highlightRow(this.sentfolders[index - 1]);
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
        if (this.sentfiles[this.sentfiles.length - 1]._id != this.element._id) {
          var index = this.sentfiles.findIndex(x => x._id == this.element._id);
          this.multiselectpdf(this.sentfiles[index + 1], null);
          this.highlightRow(this.sentfiles[index + 1]);
        }
        else { }
      }
      else if (this.element.isFolder) {
        if (this.sentfolders[this.sentfolders.length - 1]._id != this.element._id) {
          var index = this.sentfolders.findIndex(x => x._id == this.element._id);
          this.multiselectpdf(this.sentfolders[index + 1], null);
          this.highlightRow(this.sentfolders[index + 1]);
        }
        else if (this.sentfolders[this.sentfolders.length - 1]._id == this.element._id) {
          this.multiselectpdf(this.sentfiles[0], null);
          this.highlightRow(this.sentfiles[0]);
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
      this.filearr = this.sentfiles.slice(0);
      this.folderarr = this.sentfolders.slice(0);
    }else{
      this.filearr = [];
      this.folderarr = [];
    }
  }
}

// Folder Interface elements

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
  updatedAt: string
}
// File Interface elements

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
  updatedAt: string
}

