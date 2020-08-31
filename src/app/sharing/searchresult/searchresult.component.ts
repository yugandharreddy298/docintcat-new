import { Component,ViewChild, Input, SimpleChanges, OnInit,OnDestroy,HostListener } from '@angular/core';
import { MatDialog } from '@angular/material';
import { DocumentService } from '../../document.service';
import { FrontEndConfig } from '../../frontendConfig';
import { Router, NavigationEnd, ActivatedRoute } from "@angular/router";
import { HttpClient } from '@angular/common/http';
import { AdminService } from '../../admin.service';
import { Overlay } from '@angular/cdk/overlay';
import { BehaviorSubject, Subscription } from 'rxjs';
import { ViewContainerRef } from '@angular/core';
import { UserService } from '../../user.service';
import { MatMenuTrigger } from '@angular/material/menu';
import { OrganizationFileSharingComponent } from '../../organization/organization-file-sharing/organization-file-sharing.component';
import { SharepopupComponent } from '../sharepopup/sharepopup.component';
declare var $: any; // jquery variable+
@Component({
  selector: 'app-searchresult',
  templateUrl: './searchresult.component.html',
  styleUrls: ['./searchresult.component.css']
})
export class SearchresultComponent implements OnInit, OnDestroy {

  @Input() fileElements: FileElement[];  //file data
  @Input() fileData: FileData[];  //folder data
  type: any
  changeText: boolean;
  sub: Subscription;
  serverurl = this.frontendconfig.getserverurl();
  search: any;
  show = false;
  searchdata: any; //store search data
  profiledata: any;
  uid: any;  // store user id
  foldervalue: any;
  selectedName: any;
  sample2: any;
  element: any
  file = [];  // store file data
  folder = []; // store folder data
  currentRoot = null;
  currentPath = null;
  Sharedata
  querySubject
  searchfiles = [];
  searchfolders = [];
  listOfMenus=['Myfiles','Favourites','Sent Files','Shared With Me'];
  menuList="Myfiles";
  contextMenuPosition = { x: '0px', y: '0px' };
  matmenu:any;
  routerSubscription:Subscription
  @ViewChild(MatMenuTrigger) contextMenu: MatMenuTrigger; // context menu
  constructor(public userService: UserService,
    public overlay: Overlay,
    public adminservice: AdminService,
    public viewContainerRef: ViewContainerRef,
    private documentservice: DocumentService,
    public http: HttpClient,
    private router: Router,
    public dialog: MatDialog,
    private frontendconfig: FrontEndConfig,
    private routes: ActivatedRoute) {
    this.routerSubscription =this.router.events.subscribe(event => {
      if (!(event instanceof NavigationEnd)) { return; }
       this.menuListFilter();
      console.log(event)
    });
  }
  @HostListener('document:click', ['$event']) onClickHandler(event: MouseEvent) {
    const value: any = event.srcElement;    
    if (value.id !== 'fileList'){
      this.selectedName=''
    }

  }
  ngOnInit() {
    this.search = this.routes.snapshot.queryParams.searchvalue;
    this.adminservice.getProfile().subscribe(data => {
      this.profiledata = data;
      this.uid = this.profiledata._id;
      this.menuListFilter();

    });

  }

  /**
   * Function name : getFileContent
   * Input : content
   * Output : Navigation to searched file page.
   * Desc : To navigate the searched file, when user double clicks on it.
   */
  getFileContent = function (content) {
    if(this.menuList!='Shared With Me')
    {
      if (content.type == 'application/zip') {
      } 
      else {
        var filedata = {
          fileid: content._id
        }
        this.documentservice.encryptedvalues(filedata).subscribe((data: any) => {
          if (this.profiledata.type == 'individual') this.router.navigate(['individual/filecont/' + data.encryptdata]);
          else if (this.profiledata.type == 'organisation' || this.profiledata.type == 'employee') this.router.navigate(['organization/filecont/' + data.encryptdata]);
  
        })
      }
    }

    else{
       
        var fileid = {
          fileid: content._id,
          sharedid:content.sharedid
        }
        this.documentservice.encryptedvalues(fileid).subscribe((sharedata: any) => {
          if (this.profiledata.type == 'individual') this.router.navigate(['/individual/sharereview/' + sharedata.sharedid + '/' + sharedata.fileid]);
          else if (this.profiledata.type == 'organisation' || this.profiledata.type == 'employee') this.router.navigate(['/organization/sharereview/' + sharedata.sharedid + '/' +  sharedata.fileid]);
        })
      
    }
   
  }

  ngOnChanges(changes: SimpleChanges): void { }

  /**
   * Function name : navigateFolder
   * Input : element
   * Output : Navigation to searched folder page.
   * Desc : To navigate the searched folder, when user double clicks on it.
   */
  navigateFolder(element: FileElement) {
    localStorage.removeItem('currentpath')
    if (element.isFolder == true) {
      var data = {
        fileid: this.element._id
      }
      this.documentservice.encryptedvalues(data).subscribe((data: any) => {
        if (this.menuList == 'Myfiles') {
          if (this.profiledata.type == 'individual') this.router.navigate(['/individual/home/myfiles/' + data.encryptdata]);
          else if (this.profiledata.type == 'organisation' || this.profiledata.type == 'employee') this.router.navigate(['/organization/home/myfiles/' + data.encryptdata]);
        }
        else if (this.menuList == 'Shared With Me') {
        if (this.profiledata.type == 'individual') this.router.navigate(['/individual/home/shareddocument/' + data.encryptdata]);
          else if (this.profiledata.type == 'organisation' || this.profiledata.type == "employee") this.router.navigate(['/organization/home/shareddocument/' + data.encryptdata]);
        }

        else  if(this.menuList=='Sent Files')
        {
          if (this.profiledata.type == 'individual') this.router.navigate(['/individual/home/sentfiles/' + data.encryptdata]);
          else if (this.profiledata.type == 'organisation' || this.profiledata.type == 'employee') this.router.navigate(['/organization/home/sentfiles/' + data.encryptdata]);
          
        }
        else  if(this.menuList=='Favourites')
        {
          if (this.profiledata.type == 'individual') this.router.navigate(['/individual/home/favorites/' + data.encryptdata]);
          else if (this.profiledata.type == 'organisation' || this.profiledata.type == 'employee') this.router.navigate(['/organization/home/favorites/' + data.encryptdata]);
          
        }



      })

    }
  }

  /**
     * Function name : highlightRow
     * Input : element
     * Output : highlighted row.
     * Desc : To highlight row.
     */
  highlightRow(element) {
    this.selectedName = element._id;
    this.sample2 = true
    this.element = element;
  }

  menuListFilter()
  {
    this.search = this.routes.snapshot.queryParams.searchvalue;
    this.search=this.search.trim();
    var search = {
      search: this.search,
      uid: this.uid,
      menu:this.menuList
    }
    this.documentservice.searchdocuments(search).subscribe(data => {
      this.folder = []
      this.file = []
      this.searchdata = data;
    this.userService.searchElementSet('')
      if(this.menuList=='Shared With Me')
      {
       this.searchdata.forEach(element => {
        if(element.files.length){
          element.files[0].sharedid=element._id
          this.file.push(element.files[0]);
        }
        if(element.folders.length){
          element.folders[0].sharedid=element._id
          this.folder.push(element.folders[0]);
        }

       });
      }
      else if(this.menuList=='Favourites')
      {
        this.searchdata.forEach(element => {
          if(element.files.length){
            element.files[0].favouriteid=element._id
            this.file.push(element.files[0]);
          }
          if(element.folders.length){
            element.folders[0].favouriteid=element._id
            this.folder.push(element.folders[0]);
          }
  
         });
      }
      else{
        this.searchdata.forEach(element => {
          if (element.isFile) {
            this.file.push(element);
          }
          else {
            this.folder.push(element)
          }
        });
       
      }
      if (this.file.length == 0 && this.folder.length == 0) {
        this.show = true;
      }
      else {
        this.show = false
      }
    })  }


  /**
   * Function name : openMenufolder
   * Input{string}: (event,element) event*-MouseEvent
   *                                element*- selected folder or file
   * Output : to open the context menu on right click
   */

  openMenufolder(event: MouseEvent, element: FileElement) {
    console.log('menu')
    this.element = element;
    this.matmenu = element;
    event.preventDefault();
    this.contextMenu.openMenu();
    this.contextMenuPosition.x = event.clientX + 'px';
    this.contextMenuPosition.y = event.clientY + 'px';
  }

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
/**
   * Function name : shareElement
   * Input : File / Folder 
   * Desc : Open Share popup (Share for Review or Share for Signature )
   */
  shareElement(element) {
    var title = 'share'
    this.profiledata = JSON.parse(localStorage.getItem('currentUser'))
    this.profiledata.type = this.userService.decryptData(this.profiledata.type)
    if (this.profiledata.type == 'individual') {
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
  ngOnDestroy() {
    this.routerSubscription.unsubscribe()
  }
  goTolocation(element) {
    this.userService.searchElementSet(element)
    if(this.menuList=='Shared With Me')
    {
      if (this.profiledata.type == 'individual') this.router.navigate(['/individual/home/shareddocument']);
      else if (this.profiledata.type == 'organisation' || this.profiledata.type == 'employee') this.router.navigate(['/organization/home/shareddocument/']);
      
    }
    else  if(this.menuList=='Sent Files')
      {
        if (this.profiledata.type == 'individual') this.router.navigate(['/individual/home/sentfiles']);
        else if (this.profiledata.type == 'organisation' || this.profiledata.type == 'employee') this.router.navigate(['/organization/home/sentfiles/']);
        
      }
      else  if(this.menuList=='Favourites')
      {
        if (this.profiledata.type == 'individual') this.router.navigate(['/individual/home/favorites']);
        else if (this.profiledata.type == 'organisation' || this.profiledata.type == 'employee') this.router.navigate(['/organization/home/favorites/']);
        
      }
    else { 
     if (element.isFolder && element.parentid) {
      var data = {
        fileid: element.parentid
      }
      this.documentservice.encryptedvalues(data).subscribe((data: any) => {
        if (this.profiledata.type == 'individual') this.router.navigate(['/individual/home/myfiles/' + data.encryptdata]);
        else if (this.profiledata.type == 'organisation' || this.profiledata.type == 'employee') this.router.navigate(['/organization/home/myfiles/' + data.encryptdata]);

      })
    }
    else if(element.isFile && element.folderid){
      var data = {
        fileid: element.folderid
      }
      this.documentservice.encryptedvalues(data).subscribe((data: any) => {
        if (this.profiledata.type == 'individual') this.router.navigate(['/individual/home/myfiles/' + data.encryptdata]);
        else if (this.profiledata.type == 'organisation' || this.profiledata.type == 'employee') this.router.navigate(['/organization/home/myfiles/' + data.encryptdata]);

      })
      }
     else{
        if (this.profiledata.type == 'individual') this.router.navigate(['/individual/home/myfiles/']);
        else if (this.profiledata.type == 'organisation' || this.profiledata.type == 'employee') this.router.navigate(['/organization/home/myfiles/']);
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
  updatedAt: string
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
  updatedAt: string
}