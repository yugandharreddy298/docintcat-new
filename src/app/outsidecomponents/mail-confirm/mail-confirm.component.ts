import { Component, OnInit,ViewChild ,HostListener} from '@angular/core';
import { AdminService } from '../../admin.service';
import { DocumentService } from '../../document.service';
import { CountdownComponent } from 'ngx-countdown';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../../user.service';

@Component({
  selector: 'app-mail-confirm',
  templateUrl: './mail-confirm.component.html',
  styleUrls: ['./mail-confirm.component.css']
})
export class MailConfirmComponent implements OnInit {

  @ViewChild('countdown') counter: CountdownComponent;
  emailconfirmation;
  show=false;
  linkdisable=false;
  email:any;
  status;

  constructor(private adminservice:AdminService,
    private documentservice:DocumentService,
    public activatedroute:ActivatedRoute,
    public userService:UserService) { }

  ngOnInit() {
    var email = this.activatedroute.snapshot.paramMap.get("id");
    this.email = this.userService.decryptData(email);
    var dynamicyear :any = document.getElementById("year");
    dynamicyear.innerHTML = new Date().getFullYear();
  }
    /**
   * Function name : HostListener window refresh event
   * Desc : show alert when user click on browser refresh  
   */

  @HostListener("window:beforeunload", ["$event"]) unloadHandler(event: Event) {
    if(this.linkdisable){
     console.log("Processing beforeunload...");
     // Do more processing...
     event.returnValue = true;
    }

}
  /**
   * Function name : resendEmailLink
   * Input : null
   * Output : Account verification link sent to the user
   * Desc : Will send mail data to the API and the API will resend confirmation link to the user.
   */
  resendEmailLink() {
    this.show=true;
    this.linkdisable=true;
    var data = { email: this.email };
    this.adminservice.resendConfirmationEmail(data).subscribe(data => {
      this.emailconfirmation=data     
      // this.counter.restart();
      if(this.emailconfirmation.res=="success"){
        this.documentservice.openSnackBar("Verification link sent to Email","X")
      }
    })
  }

   /**
   * Function name : finishTest
   * Input : null
   * Output : Count time will get stop
   * Desc : Once count down is done with the count, the method will get called and we are stopping that count down.
   */
  finishTest() {
    this.linkdisable=false;
    this.show=false;
    this.status = 'finished';
    this.counter.stop();
  }

}
