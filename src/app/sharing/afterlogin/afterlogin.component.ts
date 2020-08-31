import { Component, OnInit } from '@angular/core';
import { DocumentService } from '../../document.service';
import { FrontEndConfig } from '../../frontendConfig';
import { UserService } from '../../user.service';
import { SharepopupComponent } from '../sharepopup/sharepopup.component';
import { MatDialog, MatMenuTrigger } from '@angular/material';
import { Observable } from 'rxjs';
import { FileElement } from '../after-confirmation/after-confirmation.component';
import { FileData } from '../after-confirmation/after-confirmation.component';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { DataService } from '../../core/data.service';
import { OrganizationFileSharingComponent } from '../../organization/organization-file-sharing/organization-file-sharing.component';
import { SignupdialogboxComponent } from '../../public/signupdialogbox/signupdialogbox.component';

declare var $: any; // jquery variable+
@Component({
  selector: 'app-afterlogin',
  templateUrl: './afterlogin.component.html',
  styleUrls: ['./afterlogin.component.css']
})

export class AfterloginComponent implements OnInit {
  filesToUpload: Array<File> = [];
  profileData: any;
  filedata: any;
  public fileElements: Observable<FileElement[]>;
  public files: Observable<FileData[]>;
  private querySubject: BehaviorSubject<FileElement[]>;
  private FileSubject: BehaviorSubject<FileData[]>;
  folders: any;
  currentRoot: FileElement;
  currentid: any;
  currentPath: string;
  canNavigateUp = false;
  foldervalues;
  folderpath;
  favoritedata: any;
  favoriteadd = true;
  favfolders = [];
  favfiles = [];
  public myElements = [];
  public Myfiles = [];
  modalPath = [];
  role: any;
  userName: any;
  userEmail: any;
  userType: any;
  IpAddress;
  serverurl = this.frontendconfig.getserverurl();

  constructor(
    public dataservice: DataService,
    private router: Router, private documentService: DocumentService, private frontendconfig: FrontEndConfig,
    private userService: UserService, public dialog: MatDialog) {
  }

  /**
   * Function name : getProfileData
   * Input: null
   * Output : decrypt the profile data
   */
  getProfileData() {
    const profiledata = JSON.parse(localStorage.getItem('currentUser'));
    this.role = this.userService.decryptData(profiledata.role);
    this.userName = this.userService.decryptData(profiledata.name);
    this.userEmail = this.userService.decryptData(profiledata.email);
    this.userType = this.userService.decryptData(profiledata.type);
  }

  ngOnInit() {
    this.getFiles_folders();
    this.modalupdateFileElement();
    this.getProfileData();
    this.IpAddress = JSON.parse(localStorage.getItem('mylocation'));
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
   * Function name : getFavorateFileAndFolders
   * Input:null
   * Output : get favorate files and folders
   */
  getFavorateFileAndFolders() {
    this.documentService.getfavorites().subscribe(data => {
      this.favoritedata = data;
      this.favoritedata.forEach(element => {
        const foundfolder = this.folders.find(element1 => element1.name === element.name);
        const foundfile = this.filedata.find(element1 => element1.name === element.name);
        if (foundfile) { foundfile.favoriteid = element._id; }
        if (foundfolder) { foundfolder.favoriteid = element._id; }
      });
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
      this.documentService.getuserfiles().subscribe(filedata => {
        this.filedata = filedata;
        if (this.filedata && this.folders) {
          this.updateFileElementQuery();
          this.getFavorateFileAndFolders();
          this.modalupdateFileElement();
        }

      });
    });
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
    if (this.userType === 'individual') {
      const filedialog = this.dialog.open(SharepopupComponent, {
        width: '848px',
        disableClose: false,
        autoFocus: false,
        panelClass: 'orgn',
        data: { content: event.element, text: 'owner', title: event.title }
      });
      filedialog.afterClosed().subscribe(res => {
        setTimeout(() => {
          $('body').css('overflow', 'auto');

        }, 10);


      });
    } else if (this.userType === 'organisation') {
      const filedialog = this.dialog.open(OrganizationFileSharingComponent, {
        width: '900px',
        disableClose: false,
        panelClass: 'orgn',
        autoFocus: false,
        data: { content: event.element, title: event.title },
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
    if (element.isFile && this.favoriteadd) {
      this.favoriteadd = false;
      const filedata = { name: element.name, fileid: element._id, isFile: element.isFile };
      this.documentService.createfavorite(filedata).subscribe(data => {
        if (data) {
          setTimeout(() => {
            this.favoriteadd = true;
          }, 2000);
        }
        this.getFavorateFileAndFolders();
      });
    }
    if (element.isFolder && this.favoriteadd) {
      this.favoriteadd = false;
      const data1 = { name: element.name, folderid: element._id, isFolder: element.isFolder };
      this.documentService.createfavorite(data1).subscribe(data => {
        if (data) {
          setTimeout(() => {
            this.favoriteadd = true;
          }, 2000);
        }
        const mousedata = {
          uid: data.uid,
          documentid: data.fileid,
          message: 'Favorate',
          isFile: true,
          IpAddress: (this.IpAddress) ? this.IpAddress.ip : 'not avilable'

        };
        this.documentService.savemousemovement(mousedata).subscribe(data1 => {
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
      this.favfiles = [];
      this.favfolders = [];
      this.getFavorateFileAndFolders();
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
              const data = { name: folder.name, parentid: this.currentRoot ? this.currentRoot._id : false };
              this.documentService.createfolder(data).subscribe(data => {
                this.getFiles_folders();
                if (this.folders) { this.updateFileElementQuery(); }
                this.documentService.openSnackBar('Folder(s) created successfully', 'X');
                if (this.userType === 'individual') {
                  this.router.navigate(['/individual/home/myfiles/']);
                } else if (this.userType === 'organisation' || this.userType === 'employee') {
                  this.router.navigate(['/organization/home/myfiles/']);
                }
              });
            } else {
              this.getFiles_folders();
            }
          }
        })
      }
      else{
        if (folder.name !== 'folderupload789456123') {
          const data = { name: folder.name, parentid: this.currentRoot ? this.currentRoot._id : false };
          this.documentService.createfolder(data).subscribe(data => {
            this.getFiles_folders();
            if (this.folders) { this.updateFileElementQuery(); }
            this.documentService.openSnackBar('Folder(s) created successfully', 'X');
            if (this.userType === 'individual') {
              this.router.navigate(['/individual/home/myfiles/']);
            } else if (this.userType === 'organisation' || this.userType === 'employee') {
              this.router.navigate(['/organization/home/myfiles/']);
            }
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
  removeElement = function(element: FileElement) {
    element.active = false;
    this.documentService.deletefolder(element).subscribe(data => {
      const mousedata = {
        documentid: data._id,
        message: ' Deleted ',
        isFile: true,
        IpAddress: (this.IpAddress) ? this.IpAddress.ip : 'not avilable'
      };
      this.documentService.savemousemovement(mousedata).subscribe(data => {
      });
      this.getFiles_folders();
    });
  };
  /**
   * Function name : navigateToFolder
   * Input(object): (element) element*-selected file or folder
   * Output : to navigate through folders
   */
  navigateToFolder(element: FileElement) {
    this.currentRoot = element;
    this.updateFileElementQuery();
    this.currentPath = this.pushToPath(this.currentPath, element.name);
    this.canNavigateUp = true;
  }
  /**
   * Function name : navigateUp
   * Input:null
   * Output : navigate back
   */
  navigateUp() {
    if (this.currentRoot && !this.currentRoot.parentid) {
      this.currentRoot = null;
      this.canNavigateUp = false;
      this.updateFileElementQuery();
      this.currentid = 'id';
    } else {
      this.foldervalues = this.currentRoot;
      this.currentRoot = this.get(this.currentRoot.parentid);
      this.currentid = this.currentRoot.name + this.foldervalues.parentencryptedId;
      this.updateFileElementQuery();
    }
    this.currentPath = this.popFromPath(this.currentPath);
  }

  /**
   * Function name : moveElement
   * Input(object): (event) event*-data emitted from child component
   * Output : to move file or folder
   */
  moveElement = function(event: { element: FileElement; moveTo: FileElement }) {
    if (event.element.isFolder) {
      event.element.parentid = event.moveTo._id;
    } else { event.element.folderid = event.moveTo._id; }
    this.documentService.updatefolder(event.element).subscribe(data => {
      this.ngOnInit();
      const mousedata = {
        uid: data.uid,
        documentid: data._id,
        message: 'file moved ',
        IpAddress: (this.IpAddress) ? this.IpAddress.ip : 'not avilable'
      };
      this.documentService.savemousemovement(mousedata).subscribe(data => {
      });
    });
    this.updateFileElementQuery();
  };

  /**
   * Function name : renameElement
   * Input(object): (element) element*-selected file or folder
   * Output : to rename selected file or folder
   */
  renameElement = function(element) {
    this.documentService.updatefolder(element.element).subscribe(data => {
      const mousedata = {
        documentid: data._id,
        message: 'Renamed',
        fromName: element.previousname,
        toName: data.name,
        isFile: true,
        IpAddress: (this.IpAddress) ? this.IpAddress : 'not avilable'
      };
      this.documentService.savemousemovement(mousedata).subscribe(data => {
      });
      this.getFiles_folders();
    });

  };

  /**
   * Function name : modalupdateFileElement
   * Input:null
   * Output : update recent files and folders in modal
   */
  modalupdateFileElement() {
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
    this.files = this.queryInFile(this.currentRoot ? this.currentRoot._id : 'root');
  }

  // to push the current root directory name in path
  pushToPath(path: string, folderName: string) {
    let p = path ? path : '';
    p += `${folderName}>>`;
    this.folderpath = p;
    return p;
  }

  // to pop the current root directory name from path
  popFromPath(path: string) {
    if (this.userType === 'individual') {
      this.router.navigate(['/individual/home/myfiles/:' + this.currentid]);
    } else if (this.userType === 'organisation' || this.userType === 'employee') {
      this.router.navigate(['/organization/home/myfiles/:' + this.currentid]);
    }

    let p = path ? path : '';
    const split = p.split('>>');
    split.splice(split.length - 2, 1);
    p = split.join('->');
    return p;
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
        } else if (element.parentid === folderId) { result.push(element); }
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
    this.filedata.forEach(element => {
      if (!element.folderid && folderId === 'root') {
        result.push(element);
      } else if (element.folderid === folderId) { result.push(element); }
    });
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
   */
  queryFile(folderId: string) {
    this.Myfiles = [];
    if (this.filedata) {
      this.filedata.forEach(element => {
        if (!element.folderid && folderId === 'root') {
          this.Myfiles.push(element);
        } else if (element.folderid === folderId) { this.Myfiles.push(element); }
      });
    }
  }
}
