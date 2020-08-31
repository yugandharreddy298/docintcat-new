import { Component, AfterViewInit, HostListener } from '@angular/core';
import { Router, NavigationEnd, NavigationStart, NavigationCancel, NavigationError } from "@angular/router";
import { DocumentService } from './document.service';
import { MatDialog } from '@angular/material';
declare var $: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {
  title = 'DocIntact';
  snackBarMeassage: any
  action = 'x';
  starturl: any
  isloading: boolean = false

  constructor(private router: Router,
    public dialog: MatDialog,
    private documentService: DocumentService) {
  }

  @HostListener('document:keydown', ['$event'])

  handleKeyboardEvent(event: KeyboardEvent) {
    if ((event.ctrlKey && event.keyCode == 80) || (event.keyCode == 45)) {
      if (event.keyCode == 45) {
        this.snackBarMeassage = 'PrintScreen is not allowed'
        this.documentService.openSnackBar(this.snackBarMeassage, this.action);
      }
      if (event.ctrlKey && event.keyCode == 80) {
        event.returnValue = false;
        event.preventDefault();
        this.snackBarMeassage = 'Print is not allowed'
        this.documentService.openSnackBar(this.snackBarMeassage, this.action);
      }
    }
    if (event.keyCode == 123) {
      event.returnValue = false;
      event.preventDefault();
    }
    if ((event.ctrlKey && event.shiftKey && event.keyCode == 73)) {
      event.returnValue = false;
      event.preventDefault();
    }
    if ((event.ctrlKey && event.keyCode == 83)) {
      event.returnValue = false;
      event.preventDefault();
    }
    if ((event.ctrlKey && event.keyCode == 67)) {
      event.returnValue = false;
      event.preventDefault();
      this.snackBarMeassage = 'Copy not allowed'
      this.documentService.openSnackBar(this.snackBarMeassage, this.action);
    }
  }

  ngAfterViewInit() {
    this.router.events
      .subscribe((event) => {
        if (event instanceof NavigationStart) {
          this.isloading = true;
          this.starturl = this.router.url;
          this.dialog.closeAll()
          this.documentService.sendStartUrl(this.starturl);
        }
        if (event instanceof NavigationEnd) {
          this.isloading = false;
        }
        if (event instanceof NavigationCancel) {
          this.isloading = false;
        }
        if (event instanceof NavigationError) {
          this.isloading = false;
        }
      });
  }

  rightclickDisable(event: MouseEvent) {
    event.preventDefault()
  }

  ngOnInit() {  
    this.PreventUserselect();
  this.getPublicipsecond();

  this.getPublicIpfirst();
  
    
  }
PreventUserselect(){
  $('body').addClass('noselect'); // disable user text selection in entire application expect comments (fileview pages )

}
getPublicIpfirst(){
  var checkanotherip=localStorage.getItem('myip')
  //get public ip
  if( (!checkanotherip || checkanotherip!=null)){
  var path = 'https://api.ipify.org?format=json'
  var xhrr = new XMLHttpRequest()
  xhrr.open("GET", path)
  xhrr.responseType = 'json'
  xhrr.onload = function () {
    if (typeof (xhrr.response) != 'object')
      localStorage.setItem('myip', JSON.stringify(JSON.parse(xhrr.response)))
    else
      localStorage.setItem('myip', JSON.stringify(xhrr.response))
  }
  xhrr.send()
}
}
getPublicipsecond(){
   //get public ip and location
   var checkip:any=localStorage.getItem('mylocation')
   if((!checkip || checkip!=null)){
   var path1 = 'https://ipapi.co/json'
   
   var xhr = new XMLHttpRequest()
   xhr.open("GET", path1)
   xhr.responseType = 'json'
   xhr.onload = function () {

    var data:any={
       ip:xhr.response.ip,
       latitude:xhr.response.latitude,
       longitude:xhr.response.longitude
     }      
       localStorage.setItem('mylocation',JSON.stringify(data))
   }
   xhr.send()
   xhr.onerror = function () {

   }
  }
}
}
