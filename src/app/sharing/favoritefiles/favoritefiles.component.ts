import { Component, ViewChild, OnInit, Input, HostListener, NgZone } from '@angular/core';
import { MatDialog } from '@angular/material';
import { CommonDialogComponent } from '../../public/common-dialog/common-dialog.component';
import { MovetoComponent } from '../moveto/moveto.component';
import { DocumentService } from '../../document.service';
import { FrontEndConfig } from '../../frontendConfig';
import { Router } from "@angular/router";
import { MatMenuTrigger } from '@angular/material/menu';
import { UserService } from '../../user.service';
import { OrganizationFileSharingComponent } from '../../organization/organization-file-sharing/organization-file-sharing.component'
import { SharepopupComponent } from '../sharepopup/sharepopup.component';
import { FileSystemFileEntry } from 'ngx-file-drop';

declare var $: any;
declare var gapi: any;
@Component({
  selector: 'app-favoritefiles',
  templateUrl: './favoritefiles.component.html',
  styleUrls: ['./favoritefiles.component.css']
})
export class FavoritefilesComponent implements OnInit {
  constructor(private _ngZone: NgZone, private router: Router,
    private userservice: UserService, public dialog: MatDialog, private documentService: DocumentService,
    private frontendconfig: FrontEndConfig) { }



  serverurl = this.frontendconfig.getserverurl();
  @ViewChild(MatMenuTrigger) contextMenu: MatMenuTrigger;
  @ViewChild(MatMenuTrigger) contextMenu1: MatMenuTrigger; //context menu
  latitude: any;
  longitude: any;
  IpAddress: any;
  folderElements = [];
  fileData = [];
  folderName: string;
  folders: any;
  folderid: any;
  filehightlight: any; //hightlighing file/folder
  name: any;
  allfolders: any; // all folders data
  filedata: any
  favorites
  document = true;
  folder = false;
  selectedName: any;
  showactionimg1 = false;//showing folder/doc action images
  element: any;
  gridicon: boolean = true; //grid icon show 
  matmenu: any;
  isloading: boolean = true; //for loaders
  currentRoot = null;
  currentPath = null;
  profileData: any;  // to store profile data
  gridview: boolean = true //to show grid view 
  FileMenu = false; // for context menu
  listicon: any;
  listview: any;
  downloadType: any;
  downloadFile: any;
  withlog: any;
  pdfPinSet: any;
  pdfPin: any;
  emaillabel: any;
  EnableDelete: Boolean = false;
  triggervalue: boolean = true
  sample2 = false
  email: any;
  currentelement: any
  browserpath: any
  foldervalue
  navigationelement: any;
  checkid: any
  id: any
  pathvalue: any;
  modalopened: boolean = false
  iebrowser: any;
  matttoltip: any;
  matdialogopen: boolean = false
  allFiles: any;
  allFolders: any;
  @Input() fileElements: FileElement[];  //file data
  chechBoxenable:boolean=false // show checkbox  while touch hold in touch enable devices

// for export files to google Drive Api Key 
  clientid = "778273248008-3rlo8d96pebk6oci737ijtbhmla253gr.apps.googleusercontent.com"
  scopes = [
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/drive.appdata',
    'https://www.googleapis.com/auth/drive.file'
  ].join(' ');
  ngOnInit() {
    if (!!(window as any).MSInputMethodContext && !!(document as any).documentMode) {
      this.iebrowser = true
      $(".ietop1").css("margin-top", "100px");
    } else{
      this.iebrowser = false;
    } 
    this.id = this.router.url.substring(this.router.url.lastIndexOf('/') + 1)
    this.profileData = JSON.parse(localStorage.getItem('currentUser'))
    this.profileData.type = this.userservice.decryptData(this.profileData.type)
    if (this.id != 'favorites') {
      var path = JSON.parse(localStorage.getItem('currentpath'));
      if(path)
      {
        for (var j = 0; j < path.length; j++) {
          if (path[j]) {
            for (var i in path[j]) {
              if (path[j][i] && i != 'encryptedId') path[j][i] = this.userservice.decryptData(path[j][i]);
            }
          }
  
        }
      }
    var filedata = {
        fileid: this.id
      }
      this.documentService.decryptedvalues(filedata).subscribe((decrypt: any) => {
        this.documentService.getfolder().subscribe(data => {
          this.checkid = data;
          this.checkid.forEach(element => {
            if (element._id == decrypt.decryptdata) {
              this.navigationelement = element
              this.currentRoot = this.navigationelement;
              this.currentPath = path ?path :null
              this.currentelement = this.navigationelement
              this.userservice.setcurrentelement(this.currentelement);
              this.popFromPath(this.currentPath, this.currentRoot)
              this.navigate(this.navigationelement)
            }
          });
          if (!this.currentelement) {
            console.log('URL not found (404)')
            if (this.profileData.type == 'individual') this.router.navigate(['individual/home/favorites'])
            else if (this.profileData.type == 'organisation' || this.profileData.type == 'employee') this.router.navigate(['organization/home/favorites'])
          }
        })
        this.isloading = false;

      }, error => {
        console.log(error)
        if (this.profileData.type == 'individual') this.router.navigate(['individual/home/favorites'])
        else if (this.profileData.type == 'organisation' || this.profileData.type == 'employee') this.router.navigate(['organization/home/favorites'])
      })


    }
    else {
      this.getfavorites();
      this.getAllFolders();
    }

  }
   /**
   * Function name : HostListener window Keydown  event
   * Desc : Handle CTRL+A to seletect all files and DELETE event to delete Selected Files 
   */
  @HostListener('document:keydown', ['$event']) onKeydownHandler(event: KeyboardEvent) {
    if (event.ctrlKey && event.keyCode == 65) { 
      this.filearr = this.fileData.slice(0); // add all files when user Press CTRL+A
      this.folderarr = this.folderElements.slice(0);// add all Folders when  user Press CTRL+A
      event.preventDefault();
    }
    if (event.keyCode == 46) {
      if ((this.filearr.length > 1 || this.folderarr.length > 1) || (this.filearr.length == 1 && this.folderarr.length == 1)) {
        if (!this.matdialogopen) {
          this.deleteSlectedElement() // Delete selected File or Folder When user Press DELETE key in Keyboard(select one file or folder)

        }
      } else if ((this.filearr.length || this.folderarr.length)) {
        if (!this.matdialogopen) {
          this.deleteElement(this.filearr[0] || this.folderarr[0]) // Delete selected Files or Folders When user Press DELETE key in Keyboard(more than one file or folder)
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
   * Function name : HostListener window click  event
   * Desc : Deselect the selected Files 
   */
  @HostListener('document:click', ['$event']) onClickHandler(event: MouseEvent) {

    var value: any = event.srcElement;
    if (value.id != "foldersList" && value.id != "filesList" && value.id != "contextmenu" && value.classList[0]!=='mat-checkbox-inner-container' && (!(this.contextMenu && this.contextMenu.menuOpened.closed) || !(this.contextMenu1 && this.contextMenu1.menuOpened.closed))) {
      this.filearr = []
      this.folderarr = []
      this.sample2 = false
      this.EnableDelete = false;
      this.chechBoxenable=false;
    }
    if(this.contextMenu &&this.contextMenu.menuOpen) {
      this.contextMenu.closeMenu();
    }
  }
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
    /**
   * Function name : HostListener window scroll  event
   * Desc : hide Context Menu When Scroll(Right click Menu)
   */
  @HostListener('window:scroll', ['$event'])
  onWindowScroll($event) {
    if (this.contextMenu) this.contextMenu.closeMenu() // if Context menu is open then close menu
    this.matttoltip = true
    setTimeout(() => {
      this.matttoltip = false
    }, 1);
  }
  /**
   * Function name : deleteSlectedElement
   * Input : null
   * Api:  /folders/multiFolderDelete/  , /documents/multiFileDelete/
   * Output : {String} success
   * Desc : Delete seleted files and folders 
   */ 
  deleteSlectedElement() {
    this.matdialogopen = true
    var folders = JSON.parse(JSON.stringify(this.folderarr))
    var files = JSON.parse(JSON.stringify(this.filearr))
    if (folders.length && files.length) { // for selected files and folders 
       this.hideBodyScroll(); // hide body scroll when confirm popup is open 
      let dialogRef = this.dialog.open(CommonDialogComponent, { data: { name: 'deleteMultiFilesandFolders' }, width: '500px', panelClass: "deletemod" }); // open confirm popup 
      dialogRef.afterClosed().subscribe(res => {
        this.chechBoxenable=false
      this.showBodyScroll(); // Show  body scroll when confirm popup is close  
        this.matdialogopen = false
        if (res) {
          this.documentService.multiFolderDelete(folders).subscribe(data => {
          this.documentService.multiFileDelete(files).subscribe(data => {
              this.getfavorites();
            if (data){
              this.documentService.openSnackBar("Items deleted Successfully!", "X"); // show snap bar when success 
            } 

          });
        })
      }
      })
    } else if (files.length && !folders.length) { // for only selected file
      this.hideBodyScroll(); // hide body scroll when confirm popup is open 
      let dialogRef = this.dialog.open(CommonDialogComponent, { data: { name: 'deleteMultiFiles' }, width: '500px', panelClass: "deletemod" });
      dialogRef.afterClosed().subscribe(res => {
        this.showBodyScroll(); // Show  body scroll when confirm popup is close  
        this.matdialogopen = false
        if (res){
          this.documentService.multiFileDelete(files).subscribe(data => {
              this.getfavorites();
            if (data){
              this.documentService.openSnackBar("File(s) deleted Successfully", "X"); // show snap bar when success 
            } 
          });
        }
   
      })
    }  else if (folders.length && !files.length) {
      this.hideBodyScroll(); // hide body scroll when confirm popup is open 
      let dialogRef = this.dialog.open(CommonDialogComponent, { data: { name: 'deleteMultiFolders' }, width: '500px', panelClass: "deletemod" });
      dialogRef.afterClosed().subscribe(res => {
        this.showBodyScroll(); // Show  body scroll when confirm popup is close  
        this.matdialogopen = false
        if (res) this.documentService.multiFolderDelete(folders).subscribe(data => {
            this.getfavorites();
          if (data) this.documentService.openSnackBar("Folder(s) deleted successfully", "X");
        });
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
   * Function name : deleteSlectedElement
   * Input : null
   * Api:  /folders/getFoldersAndFiles/
   * Output : {Array}  Result of folder and files .
   * ApiError: 500-InternalServerError SERVER error.
   * Desc : Get All Folders (for Rename file validations)
   */ 
  getFilesAndFolders() {
    this.documentService.getFoldersAndFiles(this.userservice.decryptData(this.profileData.id)).subscribe((data: any) => {
      this.allFiles = data.files;
      this.allFolders = data.folders;
    })
  }

  /**
   * Function name : HostListener window popstate event
   * Desc : Handle Browser backward and forward buttons to navigate folder files 
   */
  @HostListener('window:popstate', ['$event'])
  onPopState(event) {
    if (this.currentelement.parentid && this.currentPath[this.currentPath.length-2]) {
      this.browserpath  = this.currentPath[this.currentPath.length-2]
      this.navigateUp(this.currentPath[this.currentPath.length-2]);
    }
    else if (this.currentelement) {
      this.browserpath = 'root'
      this.navigateUp(this.browserpath)
      setTimeout(() => {
        if (this.profileData.type == 'individual') this.router.navigate(['individual/home/favorites'])
        else if (this.profileData.type == 'organisation' || this.profileData.type == 'employee') this.router.navigate(['organization/home/favorites'])
      }, 1000);
    }


  }

  /**
   * Function name : getfavorites
   * Input : null
   * Api: favorites/
   * Output : {array}  Get list of favorites
   * ApiError: 500-InternalServerError SERVER error.
   * Desc : Get All Favourite files and Folders
   */ 
  getfavorites() {
    this.isloading = true;
    this.folderElements = []
    this.fileData = []
    this.documentService.getfavorites().subscribe(data => {
      this.favorites = data
      this.favorites.forEach((element,index) => {
        if (element.isFolder && element.folderid) {
          element.folderid.favoriteid = element._id;
          element.folderid.isfavorite =true;
          this.folderElements.push(element.folderid)
        }
        else {
          if (element.fileid) {
            element.fileid.favoriteid = element._id;
            element.fileid.isfavorite =true;
            this.fileData.push(element.fileid)
          }
        }
         if(index==this.favorites.length-1)
         {
          if (this.userservice.searchElementReturn()) {
            var searchelement = this.userservice.searchElementReturn();
            var foundelement
            if (searchelement && searchelement.isFile) {
              foundelement = this.fileData.find(x => x.favoriteid == searchelement.favouriteid);
              if(foundelement!=undefined){
                this.filearr.push(foundelement);
                this.highlightRow(foundelement)
              }
            }
            else if(searchelement && searchelement.isFolder){
               foundelement = this.folderElements.find(x => x.favoriteid == searchelement.favouriteid);
               if(foundelement!=undefined){
                this.highlightRow(foundelement)
                this.folderarr.push(foundelement);
               }
            }
             this.userservice.searchElementSet(null)
          }
         }
      })

    })
    this.isloading = false;
  }

  /**
   * Function name : sortDataAsc
   * Input : null
   * Desc : Sorting files and folders Name Ascending order
   */ 
  sortDataAsc() {
    this.folderElements.sort(function (a, b) { //Folders sorting
      var nameA = a.name.toLowerCase()
      var nameB = b.name.toLowerCase()
      if (nameA > nameB) { return 1; }
      if (nameA < nameB) { return -1; }
      return 0;

    })
    this.fileData.sort(function (a, b) { // Files Sorting
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
    this.folderElements.sort(function (a, b) { // Folders Sorting
      var nameA = a.name.toLowerCase()
      var nameB = b.name.toLowerCase()
      if (nameA < nameB) { return 1; }
      if (nameA > nameB) { return -1; }
      return 0;
    })
    this.fileData.sort(function (a, b) { // Files Sorting
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
    this.folderElements.sort(function (a, b) { // Folders Sorting
      var nameA = a.updatedAt;
      var nameB = b.updatedAt;
      if (nameA > nameB) { return 1; }
      if (nameA < nameB) { return -1; }
      return 0;
    })
    this.fileData.sort(function (a, b) { // Files Sorting
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
    this.folderElements.sort(function (a, b) { // Folders Sorting
      var nameA = a.updatedAt;
      var nameB = b.updatedAt;
      if (nameA < nameB) { return 1; }
      if (nameA > nameB) { return -1; }
      return 0;
    })
    this.fileData.sort(function (a, b) { // Files Sorting
      var nameA = a.updatedAt;
      var nameB = b.updatedAt;
      if (nameA < nameB) { return 1; }
      if (nameA > nameB) { return -1; }
      return 0;
    })
  }
   /**
   * Function name : highlightRow
   * Input : file / folder
   * Desc : Hignlight Seleted File Or Folder when Click 
   */ 
  highlightRow(element) {
    this.sample2 = true
    this.filehightlight = element._id;
    this.showactionimg1 = true
    this.element = element;
  }

   /**
   * Function name : openMenufolder
   * Input : event , file / folder  
   * Desc : open menu when user Right Click on file or folder works in Web enviromment (not touch enabled Devices) 
   */
  contextMenuPosition = { x: '0px', y: '0px' }; // set initial postion of menu to (0,0)
  openMenufolder(event: MouseEvent, element) {
    this.element = element
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
    this.matmenu = element
    this.FileMenu = true;
    event.preventDefault();
    this.contextMenuPosition.x = event.clientX + 'px'; // set position (x) of contextmenu
    this.contextMenuPosition.y = event.clientY + 'px'; // set position (y) of contextmenus
  }
   /**
   * Function name : openMenufolder1
   * Input : event , file / folder  
   * Desc : open menu when user Right Click on file or folder works in touch enabled Devices 
   */
  openMenufolder1(event: TouchEvent, element,data) {
    this.endTime = new Date();
    if(data=='grid'){      
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
          this.matmenu = element
          this.FileMenu = true;
          event.preventDefault();
          this.contextMenuPosition.x = event.changedTouches[0].clientX + 'px'; // set position (x) of contextmenu
          this.contextMenuPosition.y = event.changedTouches[0].clientY + 'px'; // set position (y) of contextmenu
          if (((this.filearr.length > 1 || this.folderarr.length > 1) || (this.filearr.length == 1 && this.folderarr.length == 1))) this.contextMenu1.openMenu();
          else this.contextMenu.openMenu()
        }
      }
    }
  }else{
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
    this.matmenu = element
    this.FileMenu = true;
    event.preventDefault();
    this.contextMenuPosition.x = event.changedTouches[0].clientX + 'px'; // set position (x) of contextmenu
    this.contextMenuPosition.y = event.changedTouches[0].clientY + 'px'; // set position (y) of contextmenu
    if (((this.filearr.length > 1 || this.folderarr.length > 1) || (this.filearr.length == 1 && this.folderarr.length == 1))) this.contextMenu1.openMenu();
    else this.contextMenu.openMenu()
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
    this.profileData.type = this.userservice.decryptData(this.profileData.type)
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
      });
    }
    if (element) {
      if ((title == 'share' || title == 'Review' || title == 'Signature') && document.getElementById('modelclose')) document.getElementById('modelclose').click()
      if (title == 'Signature') this.getFileContent(element) // if no filelds when file share for signature its navigate to agreement copy 
    }
  }
  /**
   * Function name : Removefavorite
   * Input : File / Folder
   * Api: /favorites
   * Output :  {json}  Deletes a favorite by changing status as false
   * ApiError: 500-InternalServerError SERVER error. or  404-NoDataFound Not Found.
   * Desc : File / folder Remove From favourite
   */ 
  Removefavorite(element: FileElement) {
    var data1 = { _id: element.favoriteid }
    this.documentService.removefavorite(data1).subscribe(data => {
      this.getfavorites()
      this.documentService.openSnackBar("Removed from Favourites", "X") // display message when success 
    });
  }
  /**
   * Function name : Favorite
   * Input(object): (element) element*-selected file or folder
   * Output : make the selected element Favorite
   */
  Favorite = function(element: FileElement) {
    const locationdata = JSON.parse(localStorage.getItem('currentLocation'));
    this.latitude = this.latitude ? this.latitude : (locationdata) ? locationdata.latitude : undefined;
    this.longitude = this.longitude ? this.longitude : (locationdata) ? locationdata.longitude : undefined;
    if (element.isFile) {
      const Favorite = { name: element.name, fileid: element._id, isFile: element.isFile };
      this.documentService.createfavorite(Favorite).subscribe(data => {
        element.favoriteid = data._id;
        element.isfavorite=true
      });

    }
    if (element.isFolder) {
      const data1 = { name: element.name, folderid: element._id, isFolder: element.isFolder };
      this.documentService.createfavorite(data1).subscribe(data => {
        element.favoriteid = data._id;
        element.isfavorite = true;
        const mousedata = {
          uid: data.uid,
          documentid: data.fileid,
          latitude: this.latitude,
          longitude: this.longitude,
          message: 'Favorate',
          isFile: true,
          IpAddress: (this.IpAddress) ? this.IpAddress.ip : 'Not Avilable'
        };
        this.documentService.savemousemovement(mousedata).subscribe(result => {
        });
      });
    }
  };
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
    this.documentService.encryptedvalues(data).subscribe((data: any) => {
      if (this.profileData.type == 'individual') this.router.navigate(['individual/filecont/' + data.encryptdata]);
      else if (this.profileData.type == 'organisation' || this.profileData.type == 'employee') this.router.navigate(['organization/filecont/' + data.encryptdata]);

    })
  }
  /**
   * Function name : getAllFolders
   * Input : null
   * Api: /folders/getallfolders/
   * Output : {Array}  Result of folders.
   * ApiError: 500-InternalServerError SERVER error
   * Desc : get all folders to check rename validations 
   */
  getAllFolders() {
    this.isloading = true
    this.documentService.getallfolders().subscribe(data => {
      this.allfolders = data
      this.allfolders.forEach(element => {
      });
      this.isloading = false
    })
  }


  /**
   * Function name : openRenameDialog
   * Input : file / folder 
   * Desc : open rename dialog to edit name 
   */

async  openRenameDialog(element: FileElement) {
   await  this.getFilesAndFolders()
    var Rename = element.name.split('.')
    this.hideBodyScroll(); // hide body scroll when confirm popup is open 
    let dialogRef = this.dialog.open(CommonDialogComponent, { data: { name: 'Rename', folder: element }, width: '500px', panelClass: "rename", disableClose: false });
    dialogRef.afterClosed().subscribe(res => {
      this.showBodyScroll(); // Show  body scroll when confirm popup is close  
      if (res) {
        var changed = res.split('.')
        if (changed[1] && changed[1] != 'pdf') { this.documentService.openActionSnackBar('. ' + changed[1] + ' Extensions is not Allowed', 'x') }
        else {
          if (element.isFile) {
            var name = changed[0] + '.' + Rename[1]
            if (element.folderid) {
              this.documentService.getFolderFiles(element.folderid).subscribe((data: any) => {
                this.Rename(name, element, data, 'FileRename'); // call rename (if validation sucess)
              })
            } else {
              this.Rename(name, element, this.allFiles, 'FileRename'); // call rename  (if validation sucess)
            }
          }
          if (element.isFolder) {
            var name1 = changed[0]
            if (element.parentid) {
              this.documentService.getfolderdetails(element.parentid).subscribe((data: any) => {
                this.Rename(name1, element, data, 'FolderRename'); // call rename (if validation sucess)
              })
            }
            else {
              this.Rename(name1, element, this.allFolders, 'FolderRename'); // call rename (if validation sucess)
            }
          }
        }
      }
    });
  }
 /**
   * Function name : Rename
   * Input : modifiled file name  , file , dialog data, file / folder rename 
   * Desc : add validations if file name already exists 
   */
  Rename(name, element, allFiles, type) {
    let cond;
    if (type === 'FileRename') {
      cond = allFiles.some(x => x.name.substring(0, x.name.lastIndexOf('.')).trim().length === name.substring(0, name.lastIndexOf('.')).trim().length
        && x.name.substring(0, x.name.lastIndexOf('.')).trim().toLowerCase() === name.substring(0, name.lastIndexOf('.')).trim().toLowerCase()
        && x._id != element._id)
    } else {
      cond = allFiles.some(x => x.name.trim().toLowerCase() === name.trim().toLowerCase() && x._id != element._id)
    }
    if (cond) {
      let count = 0
      let resultFileName
      do {
        count++;
        if (type === 'FolderRename') {
          resultFileName = name + ' (' + count + ')'
        } else {
          let fileNameRes = this.fileNameSplit({ name: name });
          if (fileNameRes && fileNameRes.name && fileNameRes.extention)
            resultFileName = fileNameRes.name.trim() + " (" + count + ")" + ".pdf"
        }
        let isMatch = false
        for (let j = 0; j < allFiles.length; j++) {
          if ((allFiles[j] && (allFiles[j].name.trim().toLowerCase() === resultFileName.toLowerCase()))) {
            isMatch = true;
            break;
          }
        }
        if (!isMatch)
          break;
      } while (allFiles.length + 1 >= count)
      let dialogRef = this.dialog.open(CommonDialogComponent, { data: { name: type, newName: resultFileName, oldName: element.name }, disableClose: false, width: '500px', panelClass: "deletemod" });
      dialogRef.afterClosed().subscribe(res => {
        if (res) {
          element.name = resultFileName
          this.documentService.openSnackBar(" Renamed  Successfully", "X")
          this.updateFilesAndFolders(element); // rename file or folder 
        } else {
        }
      })
    }
    else if (allFiles.some(x => x.name == name && x._id == element._id)) { }//same name without changes
    else {
    element.name = name
      this.documentService.openSnackBar(" Renamed  Successfully", "X")
      this.updateFilesAndFolders(element); // rename file or folder 
    }
  }
  /**
   * Function name : updateFilesAndFolders
   * Input : file / folder 
   * Api: /folders or /documents
   * Output : {Json} file or folder 
   * ApiError: 500-InternalServerError SERVER error or 404-NoDataFound Not Found.
   * Desc : rename selected file or folders
   */
  updateFilesAndFolders(element) {
    var locationdata = JSON.parse(localStorage.getItem('currentLocation'));
    this.latitude = this.latitude ? this.latitude : (locationdata) ? locationdata.latitude : undefined;
    this.longitude = this.longitude ? this.longitude : (locationdata) ? locationdata.longitude : undefined;
    this.IpAddress = JSON.parse(localStorage.getItem('mylocation'));
    this.documentService.updatefolder(element).subscribe((data: any) => {
      var mousedata = {
        documentid: data._id,
        message: "Renamed",
        fromName: element.previousname,
        toName: data.name,
        latitude: this.latitude,
        longitude: this.longitude,
        isFile: true,
        IpAddress: (this.IpAddress) ? this.IpAddress.ip : 'not avilable'
      }
      this.documentService.savemousemovement(mousedata).subscribe(data => { // log generated when file or folder renamed 
      });
    })
  }


  /**
   * Function name : updateFilesAndFolders
   * Input : file  
   * Desc : File name splictting with extention
   */
  fileNameSplit(inputFile) { // Need to pass formal argument as JSON object
    let result, extention;
    if (inputFile.fileEntry) inputFile = inputFile.fileEntry as FileSystemFileEntry;
    if (inputFile.type == 'application/pdf')
      extention = 'pdf'
    else if (inputFile.type == 'application/msword')
      extention = 'doc'
    else if (inputFile.type == 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
      extention = 'docx'
    else if (!(inputFile.type) && ((inputFile.name.lastIndexOf(".") + 1 == (inputFile.name.length - 3)) || (inputFile.name.lastIndexOf(".") + 1 == (inputFile.name.length - 4)))) {
      extention = inputFile.name.substring(inputFile.name.lastIndexOf(".") + 1, inputFile.name.length);
      if (!(extention == 'pdf' || extention == 'doc' || extention == 'docx'))
        return result;
    }
    else return result;
    if (inputFile.name.length - (inputFile.name.lastIndexOf(".") + 1) == extention.length) {
      let newName = inputFile.name.substring(0, inputFile.name.length - (extention.length + 1));
      result = { name: newName, extention: extention }
    }
    return result
  }
  /**
   * Function name : deleteElement
   * Input : file / folder 
   * Api: documents/deletefile/  or /folders/deletefolder/ 
   * Output : {Json} file or folder 
   * ApiError: 500-InternalServerError SERVER error or 404- Not Found.
   * Desc : Delete selected File or folder 
   */
  deleteElement(element) {
    this.matdialogopen = true
    if (element.isFolder) { // delete selected  Folder 
      this.hideBodyScroll(); // hide body scroll when confirm popup is open 
      let dialogRef = this.dialog.open(CommonDialogComponent,
        { data: { name: 'deletefolder' }, width: '500px', panelClass: "deletemod", disableClose: false });
      dialogRef.afterClosed().subscribe(res => {
        this.showBodyScroll(); // Show  body scroll when confirm popup is close  
        this.matdialogopen = false
        if (res) {
          element.active = false
          this.documentService.deletefolder(element).subscribe(data => {
            this.getfavorites()

            this.documentService.openSnackBar("Folder(s) deleted successfully", "X"); // show snapbar message when deletion success
          })
        }

      })
    }  else { // detele selected file 
      this.hideBodyScroll(); // hide body scroll when confirm popup is open 
      let dialogRef = this.dialog.open(CommonDialogComponent,
        { data: { name: 'delete' }, width: '500px', panelClass: "deletemod", disableClose: false });
      dialogRef.afterClosed().subscribe(res => {
        this.showBodyScroll(); // Show  body scroll when confirm popup is close  
        this.matdialogopen = false
        if (res) {
          element.active = false;
          this.Removefavorite(element)
          this.documentService.deletefolder(element).subscribe(data => {
            this.documentService.openSnackBar("File(s) deleted successfully", "X"); // show snapbar message when deletion success
          })
        }

      });
    }
  }
  /**
   * Function name : navigate
   * Input :  folder 
   * Desc : double click on folder to  navigate to files under that  folder  
   */
  navigate(element) {
    this.filearr = [];
    this.folderarr = []
    this.currentRoot = element;
    this.currentelement = element
    this.userservice.setcurrentelement(this.currentelement)
    if (element.isFolder) {
      var data = {
        fileid: element._id
      }
      this.documentService.encryptedvalues(data).subscribe((data: any) => { // ecnrypt folder id while navigate 
        if (this.profileData.type == 'individual') this.router.navigate(['individual/home/favorites/' + data.encryptdata]);
        else if (this.profileData.type == 'organisation' || this.profileData.type == 'employee') this.router.navigate(['organization/home/favorites/' + data.encryptdata]);
        this.getsubfolders(this.currentRoot) // get sub folders in seleted folder if have 
        this.currentPath = this.pushToPath(this.currentPath, element); // push folder navigation path to handles browser back button
        localStorage.removeItem('currentpath');
        var currentpath =JSON.parse(JSON.stringify(this.currentPath));
        this.userservice.setpath(currentpath);
      })


    }

  }
  /**
   * Function name : navigateUp
   * Input :  event 
   * Desc : set path of folders when double click 
   */
  navigateUp(event) { //navigate pop
    if (event != 'root') {
      this.currentRoot = event
      this.getsubfolders(this.currentRoot)
    } else {
      this.currentRoot = null
      this.getfavorites()
    }
    this.currentPath = this.popFromPath(this.currentPath, this.currentRoot);
  }
    /**
   * Function name : pushToPath
   * Input :  path, folder  
   * Desc : Add path to queue 
   */
  pushToPath(path: any, folderName) { //Adding path
    console.log(path)
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
        this.router.navigate(['individual/home/favorites']);
      } 
      else if (this.profileData.type == 'organisation' || this.profileData.type == 'employee'){
        this.router.navigate(['organization/home/favorites']);
      } 
      } else {
      var data = {
        fileid: current._id
      }
      this.documentService.encryptedvalues(data).subscribe((data: any) => {
        if (this.profileData.type == 'individual'){
          this.router.navigate(['individual/home/favorites/' + data.encryptdata]);
        }   else if (this.profileData.type == 'organisation' || this.profileData.type == 'employee'){
          this.router.navigate(['organization/home/favorites/' + data.encryptdata]);
        } 
      })
      if(path)
      {
       var i = path.findIndex(x => x._id == current._id);
       path.splice(i + 1, path.length)
      } 
      else path = [];
      localStorage.removeItem('currentpath');
      var currentpath =JSON.parse(JSON.stringify(path));
      this.userservice.setpath(currentpath);
    }

    return path;
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
    var subfolders
    this.folderElements = []
    this.fileData = []
    this.documentService.getparentfolders(element._id).subscribe(data => {
      subfolders = data;
      this.documentService.getfavorites().subscribe(data => {
        this.favorites = data
      subfolders.folders.forEach(element => {
        element.isfavorite=this.favorites.some(x=>x.folderid && x.folderid._id==element._id)
        this.folderElements.push(element)
      });
      subfolders.files.forEach(element => {
        element.isfavorite= this.favorites.some(x=>x.fileid && x.fileid._id==element._id);
        this.fileData.push(element)
      });
    });
    })
  }
  // Set Download  default options before download  / opening the popup
  setDownload(data) {
    this.element = data //file element 
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
      this.documentService.pdfDownload(downloaddata).subscribe((data: any) => { // get file url 
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
            this.documentService.openSnackBar("File Export To Drive", "X");
          });

        }
        else this.isloading = false
      });
    } else if (this.downloadType == 'attachment') {
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
            this.documentService.openSnackBar("File Sent To Email", "X");
            } else{
              this.isloading = false;
            } 
          });
        } else {
          this.documentService.openSnackBar("Please Enter Valid Email", "X");
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
    //Success callback
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
     if (this.filearr.some(element => element._id == data._id)){
        return true
      } else{
        return false
      } 
    } else if (data.isFolder) {
      if (this.folderarr.some(element => element._id == data._id)){
        return true
      } else{
        return false
      } 
    } else{
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
          if (this.filearr.length > 1) this.EnableDelete = true;
        } else {
          var indexNum = this.filearr.findIndex((element) => {
            return (element._id == element1._id);
          });
          this.filearr.splice(indexNum, 1);
        }
      } else if (element1.isFolder) {
        if (!this.folderarr.some(element => element._id == element1._id)) {
          this.folderarr.push(element1)
          if (this.folderarr.length > 1){
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
      } else if (element1.isFolder) {
        this.folderarr = [element1]
        this.filearr = []
      }
    }
   if ((this.filearr.length > 1 || this.folderarr.length > 1) || (this.filearr.length == 1 && this.folderarr.length == 1)){
      this.triggervalue = false
    } 
  }
  dialogopen = false
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
      });
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
        this.chechBoxenable=false
        this.showBodyScroll(); // Show  body scroll when confirm popup is close  
      })
    }
  }
    /**
   * Function name : multiFavorite
   * Input : folders or files  
   * Api: favorites/multifavorite
   * Output : {Json }message: 'success'
   * ApiError: 500-InternalServerError SERVER  
   * Desc : Add Favourites of Multiple Files And Folders 
   */
  multiFavorite(favorite) {
    var folders = JSON.parse(JSON.stringify(this.folderarr))
    var files = JSON.parse(JSON.stringify(this.filearr))
    var selecteddata = {
      folders: folders,
      files: files,
      make_favorite: favorite
    }
    this.documentService.multiFavorite(selecteddata).subscribe(data => {
      if (data) {
        this.getfavorites()
        this.documentService.openSnackBar("Removed from favourites!", "X");
        this.filearr=[];
        this.folderarr=[];
        this.chechBoxenable=false
      }
    })
  }
  /**
   * Function name : getFileContent
   * input{object}:(element)  element*-selected file or folder
   * Output : open's the aduitlog of selected file
   */
  viewDetails  (element) {
    const filedata = {
      fileid: element._id,
      test: element.isFile
    };

    this.documentService.encryptedvalues(filedata).subscribe((data: any) => {
      if (element.isFile) {
        if (this.profileData.type === 'individual') {
          this.router.navigate(['individual/home/auditlog/' + data.encryptdata + '/File']);
        } else if (this.profileData.type === 'organisation' || this.profileData.type === 'employee') {
          this.router.navigate(['organization/home/auditlog/' + data.encryptdata + '/File']);
        }
      } else {
        if (this.profileData.type === 'individual') {
          this.router.navigate(['individual/home/auditlog/' + data.encryptdata + '/Folder']);
        } else if (this.profileData.type === 'organisation' || this.profileData.type === 'employee') {
          this.router.navigate(['organization/home/auditlog/' + data.encryptdata + '/Folder']);
        }
      }
    });

  };
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

  /**
     * Function name : selectWithLeft
     * Output :select the left side element on keying left arrow 
     */
  selectWithLeft() {

    if (this.element.isFile) {
      if (this.fileData[0]._id != this.element._id) {
        var index = this.fileData.findIndex(x => x._id == this.element._id);
        this.multiselectpdf(this.fileData[index - 1], null);
        this.highlightRow(this.fileData[index - 1]);
      }
      else if (this.fileData[0]._id == this.element._id) {
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
      if (this.fileData[this.fileData.length - 1]._id != this.element._id) {
        var index = this.fileData.findIndex(x => x._id == this.element._id);
        this.multiselectpdf(this.fileData[index + 1], null);
        this.highlightRow(this.fileData[index + 1]);
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
        this.multiselectpdf(this.fileData[0], null);
        this.highlightRow(this.fileData[0]);
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
   * Function name : is_touch_device
   * Input{string}: 
   * Output : check touch enabled devices
   */
  is_touch_device() {
    return 'ontouchstart' in window;
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
      this.folderarr = this.folderElements.slice(0);
    }else{
      this.filearr = [];
      this.folderarr = [];
    }
  }
}
// File Interface elements
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