import { Component, ElementRef, ViewChild, OnInit, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { UserService } from '../../user.service';
import { DataService } from '../../core/data.service';
import { GeneralService } from '../../general.service';
import { Router } from '@angular/router';
import { DocumentService } from '../../document.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})

export class ChatComponent implements OnInit {

  constructor(private generalservice: GeneralService,
    private userService: UserService,
    private dataservice: DataService,
    public router: Router,private documentService: DocumentService,) {
    // for registered user
    this.dataservice.newChatReceived().subscribe(data => {
      this.chathistory();
    });
    // for public user socket
    this.generalservice.newChatReceivedRefresh().subscribe(data => {
      this.chathistory();
    })
  }

  @ViewChild('scrollMe') private myScrollContainer: ElementRef;
  @Input('chatContent') chatData: any;
  @Input('emailContent') emailData: any;
  @Input('profile') profileData: any;
  @Output() closeModel = new EventEmitter<any>();
  message: String;
  chatHistory: any;
  messageDivHeight: any;
  chatDivHeight: any;
  onlineusers: any;
  @HostListener('window:resize', ['$event'])

  onResize(event) {
    if (this.router.url.includes('sharereview')) {
      this.messageDivHeight = window.innerHeight - 410;
      this.chatDivHeight = this.messageDivHeight - 610;
    }
    else {
      this.messageDivHeight = window.innerHeight - 374;
      this.chatDivHeight = this.messageDivHeight - 560;
    }
    this.chathistory();
    this.getOnlineUsers();
  }

  ngOnInit() {
    if (this.router.url.includes('sharereview')) {
      this.messageDivHeight = window.innerHeight - 410;
      this.chatDivHeight = this.messageDivHeight - 610;
    }
    else {
      this.messageDivHeight = window.innerHeight - 374;
      this.chatDivHeight = this.messageDivHeight - 560;
    }
    this.chathistory();
    this.getOnlineUsers();
  }

  /**
   * Function name : getOnlineUsers
   * Input : null
   * Output : List of users, who are available in online.
   * Desc : To get the list of online users.
   */
  getOnlineUsers() {
    this.generalservice.GetonlineUsers(this.chatData).subscribe(data => {
      this.onlineusers = data
    })
  }

  /**
   * Function name : scrollToBottom
   * Input : null
   * Output : Bottom scroll.
   * Desc : To scroll.
   */
  scrollToBottom(): void {
    try {
      this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
    } catch (err) { }
  }

/**
   * Function name : chathistory
   * Input : null
   * Output : chat history.
   * Desc : To get chat history depends on document id.
   */
  chathistory = function () {
    this.userService.getChatHistory(this.chatData).subscribe(data => {
      this.chatHistory = data
      setTimeout(() => {
        this.scrollToBottom();
      }, 1);
    })
  }

  /**
   * Function name : chat
   * Input : event, chatForm
   * Output : sendChat method will be called.
   * Desc : calling sendChat method when user click on enter.
   */
  chat(event, chatForm) {
    if (event.keyCode == 13) {
      this.sendChat(chatForm);
    }
  }

   /**
   * Function name : sendChat
   * Input : data
   * Output : chat will be sending to createChat API, which stores chat data in DB.
   * Desc : chat will be sending to createChat API, which stores chat data in DB.
   */
  sendChat(data) {
    if (/\S/.test(data.value.message)) {
      if (this.profileData) data.value.uid = this.profileData.id ? this.profileData.id : this.profileData._id;
      data.value.email = this.emailData;
      data.value.documentid = this.chatData;
      this.userService.createChat(data.value).subscribe(res => {
        if(res)
        {
          this.documentService.getsharingpeople(this.chatData).subscribe((sharerecords: any) => {
            // sharerecords.push(this.profileData)
            var data={
              sharerecords:sharerecords,
              chatdata:res
            }
            this.generalservice.createnotificationForChat(data).subscribe(response => {
            });
          })
        }
        data.resetForm()
        this.chathistory();
      })
    }
  }

}

