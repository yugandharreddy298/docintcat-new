import { Component, OnInit } from '@angular/core';
import { DocumentService } from '../../document.service';
import { Subject } from 'rxjs/Subject';
import { FrontEndConfig } from '../../frontendConfig';
import { UserService } from '../../user.service';
import { SharepopupComponent } from '../sharepopup/sharepopup.component';
import { MatDialog } from '@angular/material';
import { Observable } from 'rxjs';
import { FileElement } from '../myfiles/myfiles.component';
import { FileData } from '../myfiles/myfiles.component';
import { BehaviorSubject } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { DataService } from '../../core/data.service';
import { OrganizationFileSharingComponent } from '../../organization/organization-file-sharing/organization-file-sharing.component';
import { SignupdialogboxComponent } from '../../public/signupdialogbox/signupdialogbox.component';

declare var $: any; // jquery variable+

@Component({
  selector: 'app-filedocument',
  templateUrl: './filedocument.component.html',
  styleUrls: ['./filedocument.component.css']
})

export class FiledocumentComponent implements OnInit {

  filesToUpload: Array<File> = [];
  profileData: any;
  filedata: any;
  public fileElements: Observable<FileElement[]>;
  public myElements = [];
  public Myfiles = [];
  modalPath = [];
  folderdataid: any;
  public files: Observable<FileData[]>;
  private querySubject: BehaviorSubject<FileElement[]>;
  private FileSubject: BehaviorSubject<FileData[]>;
  LoadingTrue: Subject<boolean> = new Subject();
  folders: any;
  particularfolderdata: any;
  currentRoot: FileElement;
  currentid: any;
  currentPath: any;
  canNavigateUp = false;
  favoritedata: any;
  favfolders = [];
  childparent: any = [];
  favfiles = [];
  userType: any;
  navigationelement;
  latitude: any;
  longitude: any;
  checkid: any;
  IpAddress;
  constructor(
    public routes: ActivatedRoute, public userService: UserService,
    public dataservice: DataService,
    private router: Router, private documentService: DocumentService,
    private frontendconfig: FrontEndConfig, private userservice: UserService,
    public dialog: MatDialog) {
  }
  serverurl = this.frontendconfig.getserverurl();
  ngOnInit() {
    const routerid = this.router.url.substring(this.router.url.lastIndexOf('/') + 1);
    if (routerid !== 'myfiles') {
      var id = routerid;
    } else { id = undefined; }
    if (id !== undefined) {
      var path = JSON.parse(localStorage.getItem('currentpath'));
      if (path) {
        for (var j = 0; j < path.length; j++) {
          if (path[j]) {
            for (var i in path[j]) {
              if (path[j][i] && i !== 'encryptedId') { path[j][i] = this.userService.decryptData(path[j][i]); }
            }
          }
        }
      }
      this.documentService.getfolder().subscribe(data => {
        this.checkid = data;
        const filedata = { fileid: id };
        this.documentService.decryptedvalues(filedata).subscribe((data: any) => {
          const routervalue = data.decryptdata;
          this.checkid.forEach(element => {
            if (element._id === routervalue) {
              this.navigationelement = element;
              this.currentRoot = this.navigationelement;
              this.currentPath=path;
              this.getProfiles();
              this.folderfilerefresh();
            }
          });


        });

      });
    }
    if (id === undefined) {
      this.getProfiles();
      if (this.router.url === '/home/myfiles') { this.currentPath = null; this.currentRoot = null; }
      this.getFiles_folders();
      this.modalupdateFileElementQuery();
      this.IpAddress = JSON.parse(localStorage.getItem('mylocation'));
    }

  }
  /**
   * Function name : modalnavigate
   * Input(object): (event) event*-data emitted from child component
   * Output : to navigate through folders
   */
  modalnavigate(event) {
    const currentRoot = event;
    this.modalPath.push(event);
    this.queryFolder(currentRoot ? currentRoot._id : 'root');
    this.queryFile(currentRoot ? currentRoot._id : 'root');
  }
  /**
   * Function name : modalnavigatepop
   * Input:null
   * Output : navigate back
   */
  modalnavigatepop() {
    this.modalPath.pop();
    const currentRoot = this.modalPath[this.modalPath.length - 1];
    this.queryFolder(currentRoot ? currentRoot._id : 'root');
    this.queryFile(currentRoot ? currentRoot._id : 'root');
  }
  /**
   * Function name : getProfiles
   * Input: null
   * Output : decrypt the profile data
   */
  getProfiles() {
    this.profileData = JSON.parse(localStorage.getItem('currentUser'));
    const checknewVariable = this.userservice.decryptData(this.profileData.type);
    this.profileData.type = checknewVariable;
  }
  /**
   * Function name : getFavorateFileAndFolders
   * Input:null
   * Output : get favorate files and folders
   */
  getFavorateFileAndFolders() {
    this.documentService.getfavorites().subscribe(data => {
      this.favoritedata = data;
      if (this.folders && this.filedata) {
        this.favoritedata.forEach(element => {
          if (element.isFolder) {
            var foundfolder = this.folders.find(element1 => element.folderid && element1._id === element.folderid._id);
          }
          if (element.isFile) {
            var foundfile = this.filedata.find(element1 => element.fileid && element1._id === element.fileid._id);
          }

          if (foundfile) { foundfile.favoriteid = element._id; }
          if (foundfolder) { foundfolder.favoriteid = element._id; }
        });
      }
    });
  }

  /**
   * Function name : getFiles_folders
   * Input:null
   * Output : get all files and folders
   */
  getFiles_folders() {
    this.documentService.getfolder().subscribe(data => {
      this.folders = data;
      this.query();
      this.documentService.getuserfiles().subscribe(data => {
        this.filedata = data;
        this.updateFileElementQuery();
        this.getFavorateFileAndFolders();
        this.modalupdateFileElementQuery();

      });
    });
  }

  /**
   * Function name : query
   * Input:null
   * Output : to check the query params and navigate
   */
  query() {
    this.routes.queryParams.subscribe(params => {
      if (params && params.folderid !== undefined) {
        const folderid = this.userService.decryptData(params.folderid);
        const id = folderid.split('"');
        const folderdta = this.folders.find(element1 => element1._id === id[1]);
        this.folderdataid = folderdta;
        this.clicknewcondition(this.folderdataid);
      }
    });
  }
  /**
   * Function name : query
   * Input{object}:(sfolderdata) sfolderdata*-search reslut folder details
   * Output :  navigate through resulted folder
   */
  clicknewcondition(sfolderdata) {
    if (sfolderdata != null) {
      this.childparent = [];
      this.currentRoot = sfolderdata;
      if (sfolderdata.parentid) {
        this.parrentcheck(sfolderdata);
        this.currentPath = this.childparent.reverse();

      } else {
         this.currentPath = this.pushToPath(this.currentPath, sfolderdata);
      }
      this.queryInFolder(this.currentRoot ? this.currentRoot._id : 'root');
    }
  }
  /**
   * Function name : parrentcheck
   * Input{object}:(element) element*-selected folder
   * Output :  to check Whether selected folder has childern
   */
  parrentcheck(element) {
    this.childparent.push(element);
    const parent = this.folders.find(element1 => element1._id === element.parentid);
    if (parent && parent.parentid) {
      this.parrentcheck(parent);
    } else if (parent) {
      this.childparent.push(parent);
      return;
    }
  }


  /**
   * Function name : ShareElement
   * Input(object): (event) event*-data emitted from child component
   * Output : open share popup to share file or folder
   */
  ShareElement(event) {
    setTimeout(() => {
      $('body').css('overflow', 'hidden');

    }, 10);
    if (!(event.title === 'Signature')) { event.title = null; }
    if (this.profileData && this.profileData.type === 'individual') {
      const filedialog = this.dialog.open(SharepopupComponent, {
        width: '848px',
        height: '630px',
        disableClose: false,
        autoFocus: false,
        panelClass: 'test',
        data: { content: event.element, text: 'owner', title: event.title, multi: false }

      });
      filedialog.afterClosed().subscribe(res => {
        setTimeout(() => {
          $('body').css('overflow', 'auto');

        }, 10);


      });

    } else {
      const filedialog = this.dialog.open(OrganizationFileSharingComponent, {
        width: '900px',
        disableClose: false,
        panelClass: 'orgn',
        autoFocus: false,
        data: { content: event.element, title: event.title, multi: false },
      });
      filedialog.afterClosed().subscribe(res => {
        if (res === 'true') {
          setTimeout(() => {
            $('body').css('overflow', 'hidden');

          }, 10);
        } else {
          setTimeout(() => {
            $('body').css('overflow', 'auto');

          }, 10);
        }



      });
    }
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
      });

    }
    if (element.isFolder) {
      const data1 = { name: element.name, folderid: element._id, isFolder: element.isFolder };
      this.documentService.createfavorite(data1).subscribe(data => {
        element.favoriteid = data._id;
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
   * Function name : Favorite
   * Input(object): (element) element*-selected file or folder
   * Output : remove the selected element from Favorites
   */
  Removefavorite(element: FileElement) {
    const data1 = { _id: element.favoriteid };
    this.documentService.removefavorite(data1).subscribe(data => {
      delete element.favoriteid;
    });
  }


  /**
   * Function name : addFolder
   * Input(object): (folder) folder*-folder name
   * Output : to create a new folder
   */
  addFolder(folder: { name: string }) {
    var folderNameArray = [{ name: folder.name}];
    var filedata = { folders: folderNameArray,folderid: this.currentRoot ? this.currentRoot._id : false  };
    this.documentService.isFilenameExits(filedata).subscribe(filePresent => {
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
            if (folder.name !== 'folderupload789456123') {
              const folderdata = { name: folder.name, parentid: this.currentRoot ? this.currentRoot._id : false };
              this.documentService.createfolder(folderdata).subscribe(data => {
                this.getFiles_folders();
                this.documentService.openSnackBar('Folder created successfully', 'X');
              });
            } else {
              this.getFiles_folders();
            }
          }
        })
      }
      else {
        if (folder.name !== 'folderupload789456123') {
          const folderdata = { name: folder.name, parentid: this.currentRoot ? this.currentRoot._id : false };
          this.documentService.createfolder(folderdata).subscribe(data => {
            this.getFiles_folders();
            this.documentService.openSnackBar('Folder created successfully', 'X');
          });
        } else {
          this.getFiles_folders();
        }
      }
    })

  }

  addFile(event) { // to update recent files and folders
    this.getFiles_folders();
  }

  /**
   * Function name : removeElement
   * Input(object): (element) element*-selected file or folder
   * Output : remove the selected element
   */
  removeElement = function (element: FileElement) {
    const locationdata = JSON.parse(localStorage.getItem('currentLocation'));
    this.latitude = this.latitude ? this.latitude : (locationdata) ? locationdata.latitude : undefined;
    this.longitude = this.longitude ? this.longitude : (locationdata) ? locationdata.longitude : undefined;
    element.active = false;
    this.documentService.deletefolder(element).subscribe(data => {
      const mousedata = {
        documentid: data._id,
        message: ' Deleted ',
        isFile: true,
        latitude: this.latitude,
        longitude: this.longitude,
        IpAddress: (this.locationdata) ? this.locationdata.ip : 'not avilable'
      };
      this.documentService.savemousemovement(mousedata).subscribe(result => {
      });
      this.getFiles_folders();
    });
  };

  refreshPage() { // to navigate back to root page
    this.currentRoot = null;
    this.updateFileElementQuery();
  }
  /**
   * Function name : navigateToFolder
   * Input(object): (element) element*-selected file or folder
   * Output : to navigate through folders
   */
  navigateToFolder(element: FileElement) {
    this.currentRoot = element;
    this.updateFileElementQuery();
    this.currentPath = this.pushToPath(this.currentPath, element);
    localStorage.removeItem('currentpath');
    var currentpath =JSON.parse(JSON.stringify(this.currentPath));
    this.userservice.setpath(currentpath);
    this.canNavigateUp = true;
    this.queryFolder(this.currentRoot ? this.currentRoot._id : 'root');
    this.queryFile(this.currentRoot ? this.currentRoot._id : 'root');
    this.modalPath = JSON.parse(JSON.stringify(this.currentPath));
  }
  /**
   * Function name : navigateUp
   * Input:null
   * Output : navigate back
   */
  navigateUp(event) {
    let current;
    if (event !== 'root') {
      if (this.currentRoot._id === event._id) { current = true; } else { this.currentRoot = event; }
    } else { this.currentRoot = null; }


    if (!current) {
      this.updateFileElementQuery();

    }
    this.queryFolder(this.currentRoot ? this.currentRoot._id : 'root');
    this.queryFile(this.currentRoot ? this.currentRoot._id : 'root');
    this.currentPath = this.popFromPath(this.currentPath, this.currentRoot);
  }

  /**
   * Function name : moveElement
   * Input(object): (event) event*-data emitted from child component
   * Output : to move file or folder
   */
  moveElement = function(event: { element: FileElement; moveTo: any }) {
    const locationdata = JSON.parse(localStorage.getItem('currentLocation'));
    this.latitude = this.latitude ? this.latitude : (locationdata) ? locationdata.latitude : undefined;
    this.longitude = this.longitude ? this.longitude : (locationdata) ? locationdata.longitude : undefined;
    if (event.element.isFolder) {
      event.element.parentid = event.moveTo._id;
    } else {
      if (event.moveTo) { event.element.folderid = event.moveTo._id; }
    }
    if (event.element) {
      const moveTodata = {
        element: event.element,
        MoveTo: event.moveTo,
      };
      this.documentService.updatefolderOnMove(moveTodata).subscribe(data => {
        this.getFiles_folders();
        const mousedata = {
          uid: data.uid,
          documentid: data._id,
          message: 'Moved ',
          latitude: this.latitude,
          longitude: this.longitude,
          IpAddress: (this.locationdata) ? this.locationdata.ip : 'not avilable'
        };
        if (data) { this.documentService.savemousemovement(mousedata).subscribe(result => { }); }


      });
    } else { this.getFiles_folders(); }

    this.updateFileElementQuery();
  };

  /**
   * Function name : renameElement
   * Input(object): (element) element*-selected file or folder
   * Output : to rename selected file or folder
   */
  renameElement = function (element) {
    const locationdata = JSON.parse(localStorage.getItem('currentLocation'));
    this.latitude = this.latitude ? this.latitude : (locationdata) ? locationdata.latitude : undefined;
    this.longitude = this.longitude ? this.longitude : (locationdata) ? locationdata.longitude : undefined;
    this.documentService.updatefolder(element).subscribe(data => {
      const mousedata = {
        documentid: data._id,
        message: 'Renamed',
        fromName: element.previousname,
        toName: data.name,
        latitude: this.latitude,
        longitude: this.longitude,
        isFile: true,
        IpAddress: (this.IpAddress) ? this.IpAddress.ip : 'not avilable'
      };
      this.documentService.savemousemovement(mousedata).subscribe(result => {
      });
      this.getFiles_folders();
    });
  };

  /**
   * Function name : modalupdateFileElementQuery
   * Input:null
   * Output : update recent files and folders in modal
   */
  modalupdateFileElementQuery() {
    setTimeout(() => {
      this.queryFolder(this.currentRoot ? this.currentRoot._id : 'root');
      this.queryFile(this.currentRoot ? this.currentRoot._id : 'root');
    }, 1000);

  }
  /**
   * Function name : modalupdateFileElement
   * Input:null
   * Output : update recent files and folders
   */

  updateFileElementQuery() {
    this.fileElements = this.queryInFolder(this.currentRoot ? this.currentRoot._id : 'root');
    this.LoadingTrue.next(true);
    this.files = this.queryInFile(this.currentRoot ? this.currentRoot._id : 'root');

  }

  // to push the current root directory name in path
  pushToPath(path: any, folderName) {
    let p1 = [];
    if (path) {
      path.forEach(element => {
        if (element) { p1.push(element); }
      });
    }
    if(!p1.some(x=>x._id==folderName._id))
    { p1.push(folderName);}
    return p1;
  }

  // to pop the current root directory name from path
  popFromPath(path, current) {
    if (current == null) {
      path = [];
      if (this.profileData.type === 'individual') {
        this.router.navigate(['/individual/home/myfiles']);
      } else if (this.profileData.type === 'organisation' || this.profileData.type === 'employee') {
        this.router.navigate(['/organization/home/myfiles']);
      }
    } else {
      const filedata = {
        fileid: current._id
      };

      this.documentService.encryptedvalues(filedata).subscribe((data: any) => {
        if (this.profileData.type === 'individual') {
          this.router.navigate(['/individual/home/myfiles/' + data.encryptdata]);
        } else if (this.profileData.type === 'organisation' || this.profileData.type === 'employee') {
          this.router.navigate(['/organization/home/myfiles/' + data.encryptdata]);
        }

        const i = path.findIndex(x => x._id === current._id);
        path.splice(i + 1, path.length);
        localStorage.removeItem('currentpath');
        var currentpath =JSON.parse(JSON.stringify(path));
        this.userservice.setpath(currentpath);
      });


    }
    return path;
  }

  /**
   * Function name : queryInFolder
   * Input:null
   * Output : to navigate through the selected navigationelement
   */
  folderfilerefresh() {
    this.documentService.getfolder().subscribe(data => {
      this.folders = data;
      this.documentService.getuserfiles().subscribe(filedata => {
        this.filedata = filedata;
        this.navigateToFolder(this.navigationelement);
        this.navigateUp(this.navigationelement);
      });
    });

  }

  /**
   * Function name : queryInFolder
   * Input{string}:(folderId) folderId*-current path id
   * Output : getting the folders based on routing
   */
  queryInFolder = function(folderId: string) {
    const result: FileElement[] = [];
    if (this.folders) {
      this.folders.forEach(element => {
        element.isFolder = true;
        if (!element.parentid && folderId === 'root') {
          result.push(element);
        } else if (element.parentid === folderId) {
          result.push(element);
        }
      });
    }
    if (!this.querySubject) {
      this.querySubject = new BehaviorSubject(result);
    } else {
      this.querySubject.next(result);
    }
    return this.querySubject.asObservable();
  };

  /**
   * Function name : queryInFile
   * Input{string}:(folderId) folderId*-current path id
   * Output : getting the files based on routing
   */
  queryInFile(folderId: string) {
    const result: FileData[] = [];
    if (this.filedata && this.filedata.length) {
      this.filedata.forEach(element => {
        if (!element.folderid && folderId === 'root') {
          result.push(element);
        } else if (element.folderid === folderId) { result.push(element); }
      });
    }
    if (!this.FileSubject) {
      this.FileSubject = new BehaviorSubject(result);
    } else {
      this.FileSubject.next(result);
    }
    return this.FileSubject.asObservable();

  }

  // to get current root folder id
  get(id: string) {
    let returnvalue;
    this.folders.forEach(element => {
      if (element._id === id) {
        returnvalue = element;
      }
    });
    return (returnvalue);
  }

  /**
   * Function name : queryFolder
   * Input{string}:(folderId) folderId*-current path id
   * Output : getting the folders based on routing
   */
  queryFolder = function(folderId: string) {
    this.myElements = [];
    if (this.folders) {
      this.folders.forEach(element => {
        if (!element.parentid && folderId === 'root') {
          this.myElements.push(element);
        } else if (element.parentid === folderId) { this.myElements.push(element); }
      });
    }

  };

  /**
   * Function name : queryFile
   * Input{string}:(folderId) folderId*-current path id
   * Output : getting the files based on routing
   */  queryFile(folderId: string) {
    this.Myfiles = [];
    if (this.filedata) {
      this.filedata.forEach(element => {
        if (!element.folderid && folderId === 'root') {
          this.Myfiles.push(element);
        } else if (element.folderid === folderId) { this.Myfiles.push(element); }
      });
      this.getFavorateFileAndFolders()
    }


  }
}


