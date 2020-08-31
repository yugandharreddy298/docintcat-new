import { Component, OnInit, Injectable, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, NavigationExtras, RoutesRecognized } from '@angular/router';
import { DocumentService } from '../../document.service';
import { MatDialog } from '@angular/material';
import { AdminService } from '../../admin.service';
import { CommonDialogComponent } from '../common-dialog/common-dialog.component';
import { SignupdialogboxComponent } from '../../public/signupdialogbox/signupdialogbox.component';
import { UserService } from '../../user.service';
import { filter, pairwise } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { FrontEndConfig } from '../../frontendConfig';

@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'app-allowusers',
  templateUrl: './allowusers.component.html',
  styleUrls: ['./allowusers.component.css']
})

export class AllowusersComponent implements OnInit, OnDestroy {

  type: any
  routersub: Subscription;
  routermatch: any;
  _id
  loggedIn
  show: boolean = false
  sharedocument;
  errorres: any
  selectedDoc
  profiledata: any
  id: any
  locationchange: any
  expired: boolean = false
  userdata: any
  sharefromid
  agree

  constructor(public activatedroute: ActivatedRoute,
    private router: Router,
    private documentService: DocumentService,
    public dialog: MatDialog,
    public adminService: AdminService,
    public userService: UserService,
    private frontendconfig: FrontEndConfig) {
    this.routersub = this.router.events
      .pipe(filter((e: any) => e instanceof RoutesRecognized),
        pairwise()
      ).subscribe((e: any) => {
        if (this.loggedIn == 'true') {
          this.routermatch = e[1].urlAfterRedirects.split('/')[2]
          var sampledata = this.documentService.getStartUrl();
          if (this.routermatch == "Sharereview"){
            this.adminService.getProfile().subscribe(data => { // get The Profile Date of that LoggedIn user 
              this.profiledata = data;
              // if (this.profiledata.type == 'individual'){
              //   this.router.navigate(['individual/home/myfiles'])
              // }else if (this.userdata.user.type == 'organisation' || this.userdata.user.type == "employee"){
              //   this.router.navigate(['organization/home/myfiles'])
              // }
            });
          } 
        }
      });
      var sampledata = this.documentService.getStartUrl();
      console.log(sampledata.split('/')[2])
      if(sampledata && sampledata.split('/')[2] == 'home'&& this.loggedIn == 'true'){
        this.adminService.getProfile().subscribe(data => { // get The Profile Date of that LoggedIn user 
          this.profiledata = data;
          if (this.profiledata && this.profiledata.type == 'individual'){
            this.router.navigate(['individual/home/myfiles'])
          }else if (this.profiledata && this.profiledata.type == 'organisation' || this.profiledata.type == "employee"){
            this.router.navigate(['organization/home/myfiles'])
          }
        });
      }
  }

  ngOnInit() {
    this._id = this.activatedroute.snapshot.paramMap.get("id"); // get ID from  url 
    localStorage.removeItem('currentpath')
    var sampledata = this.documentService.getStartUrl();
    if(sampledata && sampledata.split('/')[2] != 'home'){
      this.loggedIn = localStorage.getItem('loggedIn') // get loggedin status From Local Storage 
      if (this.loggedIn == 'true') { // if already user is logged in 
        this.adminService.getProfile().subscribe(data => { // get The Profile Date of that LoggedIn user 
          this.profiledata = data
          this.documentService.getpass(this._id).subscribe((data: any) => { 
            console.log(data)
            // get the Sharing Records 
            this.sharedocument = data;            
            //encryption of ids
            var shareddata = {
              sharedid: this.sharedocument._id,
              fileid: this._id
            }
            this.documentService.encryptedvalues(shareddata).subscribe((sharedata: any) => { // encrypt fileid , shared id 
              var encryptedshareid = sharedata.sharedid 
              var encryptedid = this._id
              this.userService.getUserData(this.sharedocument.toemail).subscribe(data => { // get user data of that shared User 
                this.userdata = data
                if (this.sharedocument.validity == undefined && this.sharedocument._id) { // check there is no validity 
                  if ((this.profiledata.email).trim() == (this.sharedocument.toemail).trim()) {
                    if(this.sharedocument && this.sharedocument.folderid && !this.sharedocument.fileid){
                      var folder={
                        fileid:this.sharedocument.folderid
                      }
                      this.documentService.encryptedvalues(folder).subscribe((sharedata: any) => { 
                          if (this.sharedocument.accesstype == "Allowusers") { // check if view  access is login with access  
                              if (this.userdata.user.type == 'individual') this.router.navigate(['/individual/home/shareddocument/' +sharedata.encryptdata]);
                              else if (this.userdata.user.type == 'organisation' || this.userdata.user.type == "employee") this.router.navigate(['/organization/home/shareddocument/' +sharedata.encryptdata]);
                          }
                          else if (this.sharedocument.accesstype == "public") { // check if view  access is public  access 
                        this.router.navigate(['/user/publicfoldersComponent/' + this._id]);
                        }
                      })
                    
                    }else{
                    // check if profile email is same as shared record to email 
                    this.documentService.getSelectedDoc(this.sharedocument.fileid,'public').subscribe(data1 => {
                      this.selectedDoc = data1
                      this.userService.getuserid(this.selectedDoc.uid).subscribe(userdata => {
                        this.sharefromid = userdata
                        if (this.sharedocument.accesstype == "Allowusers") { // check if view  access is login with access 
                            if (this.userdata.user.type == 'individual') this.router.navigate(['/individual/Sharereview/' + encryptedshareid + '/' + encryptedid]);
                            else if (this.userdata.user.type == 'organisation' || this.userdata.user.type == "employee") this.router.navigate(['/organization/Sharereview/' + encryptedshareid + '/' + encryptedid]);
                        }
                        else if (this.sharedocument.accesstype == "public") { // check if view  access is public  access 
                          if (this.userdata.user.type == 'individual') this.router.navigate(['/individual/Sharereview/' + encryptedshareid + '/' + encryptedid]);
                          else if (this.userdata.user.type == 'organisation' || this.userdata.user.type == "employee") this.router.navigate(['/organization/Sharereview/' + encryptedshareid + '/' + encryptedid]);
                      }
                      })
                    });
                  }
                  }
                  else if (this.profiledata.email != this.sharedocument.toemail && this.userdata.data) { // check if profile email is not same as shared record to email
                    if (this.sharedocument.accesstype == "Allowusers") { // check if view  access is login with access 
                      let dialogRef = this.dialog.open(CommonDialogComponent, // show popup for un authorized access
                        { data: { title: 'dependency', name: 'dependency', content: 'You are not authorized to access the file. Login with your valid credentials to access the file' }, width: '500px', panelClass: 'deletemod' });
                      dialogRef.afterClosed().subscribe(res => {
                        if (res) {
                          let navigationExtras: NavigationExtras = {
                            queryParams: {
                              "type": "individuallogin",
                              "id": this._id
                            },
                            skipLocationChange: true
                          };
                          this.router.navigate(["/"], navigationExtras); // navigates to home page
                        } else {
                          this.router.navigate(["/"]); // navigates to home page
                        }
                      })
                    }
                    else if (this.sharedocument.accesstype == "public") { // check if view  access is public access 
                      if(this.sharedocument && this.sharedocument.folderid && !this.sharedocument.fileid){
                          this.router.navigate(['/user/publicfoldersComponent/' +this._id]);
                      }else{
                      this.userService.getuserid(this.sharedocument.fromid).subscribe(userdata => {
                        this.sharefromid = userdata
                      if (this.userdata.user.type == 'individual') this.router.navigate(['/individual/Sharereview/' + encryptedshareid + '/' + encryptedid]);
                      else if (this.userdata.user.type == 'organisation' || this.userdata.user.type == "employee") this.router.navigate(['/organization/Sharereview/' + encryptedshareid + '/' + encryptedid]);  
                  })
                }
                  }
                  }
                  else if (this.profiledata.email != this.sharedocument.toemail && !this.userdata.data) { // check if profile email is not same as shared record to email and not registered with Docintact
  
                    if (this.sharedocument.accesstype == "Allowusers") { // show popup for sign up 
                      let dialogRef = this.dialog.open(CommonDialogComponent,
                        { data: { title: 'dependency', name: 'dependency', content: 'You are not authorized to access the file. Signup  with your valid Details to access the file' }, width: '500px', panelClass: 'deletemod' });
                      dialogRef.afterClosed().subscribe(res => {
                        if (res) {
                          let navigationExtras: NavigationExtras = {
                            queryParams: {
                              "type": "individualsignup"
                            },
                            skipLocationChange: true
                          };
                          this.router.navigate(["/"], navigationExtras); // its navigate to home page and show signup popup
                        } else {
                          this.router.navigate(["/"]); // navigates to home page
                        }
                      })
                    }
                    else if (this.sharedocument.accesstype == "public") { // if its public access then open that file
                      if (this.sharedocument && this.sharedocument.folderid && !this.sharedocument.fileid) {
                          this.router.navigate(['/user/publicfoldersComponent/' +this._id]);
                      } else {

                        this.userService.getuserid(this.sharedocument.fromid).subscribe(userdata => {
                          this.sharefromid = userdata
                          this.router.navigate(['/user/Sharereview/' + encryptedshareid + '/' + encryptedid]);
                        })
                      }
                    }
                  }
                }
                if (this.sharedocument.validity == 'expired') { // if sharing Recored is expired then its shows document is expiry
                  this.expired = true
                }
              });
            })
          })
        })
      }
      else { // if  user is not Logged In          
        this.documentService.getpass(this._id).subscribe(data => { // get sharing record
          console.log(data)
          this.sharedocument = data;
          var shareddata = {
            sharedid: this.sharedocument._id,
            fileid: this._id
          }
          //encryption of ids
          this.documentService.encryptedvalues(shareddata).subscribe((sharedata: any) => { 
  
            var encryptedshareid = sharedata.sharedid
            var encryptedid = this._id
            this.userService.getUserData(this.sharedocument.toemail).subscribe(data => {  // get The Profile data of sharing record to email  
              this.userdata = data
              console.log(this.userdata)
              if (this.sharedocument.validity == undefined && this.sharedocument._id && this.userdata.data) { // if there is no validity 
                if (this.sharedocument.accesstype == "Allowusers") { // if sharing access is login with access 
                  let navigationExtras: NavigationExtras = {
                    queryParams: {
                      "type": "individuallogin",
                      "id": this._id
                    }
                    , skipLocationChange: true
                  };
                  this.router.navigate(["/"], navigationExtras); // its navigate to home page login popup
                }
                else if (this.sharedocument.accesstype == "public") { // if sharing record is public access its navigate to file view 
                  if (this.sharedocument && this.sharedocument.folderid && !this.sharedocument.fileid) {
                      this.router.navigate(['/user/publicfoldersComponent/' +this._id]);
                  } else {
                    this.userService.getuserid(this.sharedocument.fromid).subscribe(userdata => {
                      this.sharefromid = userdata
                      if (this.userdata && this.userdata.user.type == 'individual') this.router.navigate(['/individual/Sharereview/' + encryptedshareid + '/' + encryptedid]);
                      else if (this.userdata && this.userdata.user.type == 'organisation' || this.userdata.user.type == "employee") this.router.navigate(['/organization/Sharereview/' + encryptedshareid + '/' + encryptedid]);
                    })
                  }
               } 
              }
              if (this.sharedocument.validity == undefined && this.sharedocument._id && !this.userdata.data) { // if sharing record to email is not registerd with Docintact with given access as login with access or public access 
  
                if (this.sharedocument.accesstype == "Allowusers") { 
                  let dialogRef = this.dialog.open(CommonDialogComponent,
                    { data: { title: 'dependency', name: 'dependency', content: 'You are not authorized to access the file. Signup  with your valid Details to access the file' }, width: '500px', panelClass: 'deletemod' });
                  dialogRef.afterClosed().subscribe(res => {
                    if (res) {
                      let navigationExtras: NavigationExtras = {
                        queryParams: {
                          "type": "individualsignup",
                          "id": this._id
                        },
                        skipLocationChange: true
                      };
                      this.router.navigate(["/"], navigationExtras);
                    } else {
                      this.router.navigate(["/"]); // navigates to home page
                    }
                  })
                }
                else if (this.sharedocument.accesstype == "public") { // if sharing record is public access its navigate to 
                  if (this.sharedocument && this.sharedocument.folderid && !this.sharedocument.fileid) {
                      this.router.navigate(['/user/publicfoldersComponent/' +this._id]);
                  } else {
                    this.userService.getuserid(this.sharedocument.fromid).subscribe(userdata => {
                      this.sharefromid = userdata
                      this.router.navigate(['/user/Sharereview/' + encryptedshareid + '/' + encryptedid]);
                    })
                  }
              }
              }
              if (this.sharedocument.validity == 'expired') { 
                this.expired = true
              }
              if (this.sharedocument.length == 0) {
                const ConfirmationDiaBox = this.dialog.open(SignupdialogboxComponent, {
                  width: '500px',
                  disableClose: false,
                  autoFocus: true,
                  data: { title: "You don't Have an Access to View this file", content: 'Remove', Docflag: true, type:'Password' }
                });
              }
            });
          })
        })
      }
    }
  
  }

  ngOnDestroy() {
    if (this.routermatch == "Sharereview") this.routersub.unsubscribe
  }

 

}
