import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { AdminService } from '../../admin.service';
import { DocumentService } from '../../document.service';

@Component({
  selector: 'app-publicfolders',
  templateUrl: './publicfolders.component.html',
  styleUrls: ['./publicfolders.component.css']
})
export class PublicfoldersComponent implements OnInit {
  _id: any;
  loggedIn: any;
  profiledata: any;
  sharedocument: any;
  isloading:boolean=true;
  constructor(public activatedroute: ActivatedRoute,
    public adminService: AdminService,
    private documentService: DocumentService,
    private router: Router) { }
  search: any
  fileElements = []
  folderElements = []
  path = []
  ngOnInit() {
    this._id = this.activatedroute.snapshot.paramMap.get("id"); // get ID from  url 
    var file_id = {
      fileid: this._id
    }
    this.documentService.decryptedvalues(file_id).subscribe((data: any) => {
      this.documentService.getpass(this._id).subscribe((data1: any) => { // get the Sharing Records 
        this.sharedocument = data1;
        this.documentService.getnavigationfolder(this.sharedocument.folderid).subscribe((files_folders: any) => {
          this.getChildFilesFolders(files_folders._id)
        })
      })
    });
    this.loggedIn = localStorage.getItem('loggedIn') // get loggedin status From Local Storage 

  }
  navigatetoFile(element) {
    var data = {
      sharedid: this.sharedocument._id,
      fileid: element._id
    }
    this.documentService.encryptedvalues(data).subscribe((data: any) => {
      this.router.navigate(['/user/sharereview/' + data.sharedid + '/' + data.fileid]);

    })
  }
  getChildFilesFolders(id) {
    var folderdata;
    this.documentService.getparentfolders(id).subscribe(data => {
      folderdata = data
      this.isloading=false;
      folderdata.folders.forEach(folder => {
        folder.sharedid = this.sharedocument.sharedid;
        folder.share = this.sharedocument.share;
        folder.Download = this.sharedocument.Download;
        folder.agreetoSign = this.sharedocument.agreetoSign;
        folder.agreetoReview = this.sharedocument.agreetoReview;
        folder.view = this.sharedocument.view;
        folder.members = this.sharedocument.members;
        this.folderElements.push(folder);
      })
      folderdata.files.forEach(file => {
        file.sharedid = this.sharedocument.sharedid;
        file.share = this.sharedocument.share;
        file.Download = this.sharedocument.Download;
        file.agreetoSign = this.sharedocument.agreetoSign;
        file.agreetoReview = this.sharedocument.agreetoReview;
        file.view = this.sharedocument.view;
        file.message = this.sharedocument.message;
        file.fromid = this.sharedocument.fromid;
        file.members = this.sharedocument.members;
        this.fileElements.push(file);
      })
    })
  }

  NavigateToFolder(element) {
    this.fileElements = []
    this.folderElements = []
    this.getChildFilesFolders(element._id)
    this.isloading=true
    this.Pushtopath(element)
  }
  Pushtopath(element) {
    this.path.push(element)
  }
  navigateback(data) {
    if (data == 'root') {
      this.path = [];
      this.fileElements = []
      this.folderElements = []
      this.isloading=true
      this.getChildFilesFolders(this.sharedocument.folderid)
    } else {
      var i = this.path.findIndex(x => x._id == data._id);
      this.path.splice(i + 1, this.path.length)
      this.fileElements = []
      this.folderElements = []
      this.isloading=true
      this.getChildFilesFolders(this.path[this.path.length - 1]._id)
    }
  }

SignUp(){
  let navigationExtras: NavigationExtras = {
    queryParams: {
      "type": "individualsignup"
    },
  };
  this.router.navigate(["/"], navigationExtras); // its navigate to home page and show signup popup
 }

BackToHome(){

  if (this.loggedIn == 'true') { // if already user is logged in 
    this.adminService.getProfile().subscribe(data => { // get The Profile Date of that LoggedIn user 
      this.profiledata = data
      if(this.profiledata && this.sharedocument && this.sharedocument.toid && this.profiledata.email==this.sharedocument.toid.email){
        if (this.profiledata.type == 'individual') this.router.navigate(['/individual/home/myfiles'])
        else if (this.profiledata.type == 'organisation' || this.profiledata.type == 'employee') this.router.navigate(['/organization/home/myfiles'])
      }else {
        this.router.navigate(['/'])
      }
    })
  }else{
    this.router.navigate(['/'])
  }
}
}
