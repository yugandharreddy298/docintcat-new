import { Component, OnInit } from '@angular/core';
import {ActivatedRoute,Router} from '@angular/router'
import {DocumentService}from '../../document.service'

import {UserService}from '../../user.service'

@Component({
  selector: 'app-videoplayer',
  templateUrl: './videoplayer.component.html',
  styleUrls: ['./videoplayer.component.css']
})
export class VideoplayerComponent implements OnInit {
id:any
userid:any
videourl:any
  constructor(
    public activatedroute: ActivatedRoute,
    public documentservice:DocumentService,
    public router: Router,
    public userservice:UserService

  ) { }

  ngOnInit() {
    var user: any = JSON.parse(localStorage.getItem('currentUser'));
    if (user &&user!=null) {
      this.id = this.activatedroute.snapshot.paramMap.get("id");
      this.userid=this.userservice.decryptData(user.id)
      this.documentservice.getVideoLog(this.id).subscribe((data:any) => {  
        this.documentservice.getSharedDoc(data.sharedid).subscribe((response:any)=>{
          if(response.fromid._id==this.userid){
          this.videourl=data
        
          } else {
     this.router.navigate(['/'])
          }
          
        })     
      },error=>{
     this.router.navigate(['/'])
      })

    }else{
     this.router.navigate(['/'])
    }


  }

}
