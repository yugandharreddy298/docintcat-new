import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import { DocumentService } from '../../document.service';
import { AdminService } from '../../admin.service';
import { CommonDialogComponent } from '../../public/common-dialog/common-dialog.component';
import { MatDialog } from '@angular/material';
@Component({
  selector: 'app-maillinks',
  templateUrl: './maillinks.component.html',
  styleUrls: ['./maillinks.component.css']
})

export class MaillinksComponent implements OnInit {

  constructor(public activatedroute: ActivatedRoute,
    private documentService: DocumentService,
    public dialog: MatDialog,
    public adminService: AdminService,
    private router: Router) { }

  id: any;
  _id: any;
  userrecord: any
  loggedIn: any
  profiledata: any

  ngOnInit() {
    this._id = this.router.url.substring(this.router.url.lastIndexOf('/') + 1) // get id from router url 
    if (this._id != "checkuser")
      this.loggedIn = localStorage.getItem('loggedIn') // get login user status 
    if (this.loggedIn == 'true') { // if  user is logged in same window 
      this.adminService.getProfile().subscribe(data => {  // get the profile of that user 
        this.profiledata = data
        var sharedata = {
          fileid: this._id
        }
        this.documentService.decryptedvalues(sharedata).subscribe((filedata: any) => { // decrypt the file id 
          this.documentService.getSharingPeoples(filedata.decryptdata).subscribe(data => { // get sharing records 
            this.userrecord = data
            if (this.userrecord.sharingpeoples[0].fromid.email == this.profiledata.email) { // if sharing record from email math to current user logged in its navigate to file view 
              if (this.profiledata.type == 'individual') this.router.navigate(['individual/filecont/' + this._id]);
              else if (this.profiledata.type == 'organisation' || this.profiledata.type == 'employee') this.router.navigate(['organization/filecont/' + this._id]);
            }
            else { // if sharing record from email not match to profile email its navigate to home page 
              let dialogRef = this.dialog.open(CommonDialogComponent,
                { data: { title: 'dependency', name: 'dependency', content: 'You are not authorized to access the file. Login with your valid credentials to access the file' }, width: '500px', panelClass: 'deletemod' });
              dialogRef.afterClosed().subscribe(res => {
                if (res) {
                  let navigationExtras: NavigationExtras = {
                    queryParams: {
                      "type": "individuallogin",
                      "fileid": this._id
                    },
                    skipLocationChange: true
                  };
                  this.router.navigate(["/"], navigationExtras); // show home page login popup 
                }else {
                  this.router.navigate(["/"]); // show home page 
                }
              })
            }
          });
        })
      });
    }
    else { // if user is not logged in it's navigate to  home page and show login in popup 
      let dialogRef = this.dialog.open(CommonDialogComponent,
        { data: { title: 'dependency', name: 'dependency', content: 'You are not authorized to access the file. Login with your valid credentials to access the file' }, width: '500px', panelClass: 'deletemod' });
      dialogRef.afterClosed().subscribe(res => {
        if (res) {
          let navigationExtras: NavigationExtras = {
            queryParams: {
              "type": "individuallogin",
              "fileid": this._id
            },
            skipLocationChange: true
          };
          this.router.navigate(["/"], navigationExtras); // show home page login popup 
        }else {
          this.router.navigate(["/"]); // show home page login popup 
        }
      })
    }
  }

}
