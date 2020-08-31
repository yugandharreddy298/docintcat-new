import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core'
import { FrontEndConfig } from '../../frontendConfig';
import { from } from 'rxjs';
import { DocumentService } from '../../document.service';
import { Router } from "@angular/router";
@Component({
  selector: 'app-mobileauthentication',
  templateUrl: './mobileauthentication.component.html',
  styleUrls: ['./mobileauthentication.component.css']
})
export class MobileauthenticationComponent implements OnInit {

  // @Input('authIputSend') authIputSend: any;
  //   @Output() closeModel = new EventEmitter<any>();
  //   @Input('authenticateData') authenticateData:any
  //   @Input('authenticateTitle') authenticateTitle:any
    authIputSend :any
    closeModel :any
    serverurl = this.frontendconfig.getpythonurl();
    video: any
    imageChanged: any
    Profiledata: any
    data = "trying to detect liveness"
    spoof = "mobile phone"
    pythonid: any
    constraints = {
        audio: false,
        video: {
            width: { min: 640, ideal: 1280, max: 1920 },
            height: { min: 480, ideal: 720, max: 1080 }
        }
    };
    uploadWidth = 640; //the width of the upload file
    mirror = false; //mirror the boundary boxes
    updateInterval = 2000 / 30; //the max rate to upload images
    scoreThreshold = 0.40;
    apiServer = 'http://127.0.0.1:5000' + '/image'; //the full TensorFlow Object Detection API server url
    imageChangeThreshold = 0.05; //how much the image can change before we trigger motion
    //Canvas setup
    //create a canvas to grab an image for upload
    imageCanvas = document.createElement('canvas');
    imageCtx = this.imageCanvas.getContext("2d");
    resp: any = true
    maxTime: any = 10;
    time: any = 0;
    timer;
    progresscount: any = 0;
    isclosed = false;
    //Used for motion detection
    lastFrameData = null;
    lastFrameTime = null;
    constructor( private frontendconfig: FrontEndConfig ,private documentService: DocumentService ,private router:Router) { }

    ngOnInit() {
        console.log(this.router.url)
        var id=this.router.url.split('/')[2]
        if(id!=undefined) this.authIputSend=id
        this.StartTimer();
        document.getElementById('authbtn').click();
        var isPlaying = false;
        var gotMetadata = false;
        this.video = document.getElementById('myVideo');
        navigator.mediaDevices.getUserMedia(this.constraints)
            .then(stream => {
                this.video.srcObject = stream;
                this.video.onloadedmetadata = () => {
                    gotMetadata = true;
                    if (isPlaying && this.video.srcObject != null)
                        this.startObjectDetection()
                };
                //see if the video has started playing
                this.video.onplaying = () => {
                    isPlaying = true;
                    if (gotMetadata && this.video.srcObject != null) {
                        this.startObjectDetection()
                    }
                    else {
                    }
                };
            })
            .catch(err => {
                console.log('navigator.getUserMedia error: ', err)
            });
        if (this.video.srcObject == null) {
        }
    }

    /**
   * Function name : closemodal
   * Input : null
   * Output : Modal closing
   * Desc : To close the modal.
   */
    closemodal() {
        this.isclosed = true;
        this.closeModel.emit({ 'res': "failed" });
    }

    
    ngOnDestroy() {
        if (this.video.srcObject != null) {
            this.closecam();
        }
    }

    /**
   * Function name : StartTimer
   * Input : null
   * Output : Timer will get start.
   * Desc : To start timer.
   */
    StartTimer() {
        this.timer = setTimeout(x => {
            if (this.time < this.maxTime) {
                if (!this.isclosed) {
                    this.time += 1;
                    this.progresscount = ((this.time) / this.maxTime) * 100;
                    document.getElementById('progressdynamic').style.width = this.progresscount + '%';
                    this.StartTimer();
                }
            }
            else {
                document.getElementById('closebtn').click();
                window.close()

                // this.closeModel.emit({ 'res': "failed" });
            }
        }, 1000);
    }

    /**
   * Function name : postFile
   * Input : file
   * Output : Added file blob to a form
   * Desc : Add file blob to a form and post.
   */
    postFile = (file): any => {
        from(new Promise((resolve, reject) => {
            let that = this
            //Set options as form data
            var formdata = new FormData();
            let xhr = new XMLHttpRequest()
            formdata.append("image", file);
            formdata.append("threshold", '0.4');
            console.log(this.authIputSend)
            formdata.append("kycid", this.authIputSend)
            xhr.open('POST', this.serverurl + '/image', true);
            xhr.onload = function () {
                if (xhr.status === 200) {
                    var objects = JSON.parse(xhr.response);
                    that.data = objects[0].class_name
                    var event = new CustomEvent('objectDetection', { detail: objects });
                    document.dispatchEvent(event);
                    that.sendImageFromCanvas()
                }
                else {
                    console.error("error");
                }
            }
            
            if (this.data != "trying to detect liveness") {
                if (this.data != "Unknown" && this.data != this.spoof && this.data != 'no face or more than one face detected' && this.data != 'more than one faces detected' && this.data != 'No bottlenck available') {
                    this.pythonid = that.data;
                    if (this.authIputSend == this.pythonid) {
                        this.isclosed = true;
                        document.getElementById('closebtn').click();
                        this.closeModel.emit({ 'res': "success" });
                    }

                } else {
                   
                    if (this.data == "Unknown") {
                        this.isclosed = true;
                        document.getElementById('closebtn').click();
                        this.closeModel.emit({ 'res': "failed" });
                       
                    }
                    else if (this.data == this.spoof) {
                        this.isclosed = true;
                        document.getElementById('closebtn').click();
                        this.closeModel.emit({ 'res': "failed" });
                        
                    }
                    else if (this.data == 'no face or more than one face detected') {
                        this.isclosed = true;
                        document.getElementById('closebtn').click();
                        this.closeModel.emit({ 'res': "failed" });
                       
                    }
                    else if (this.data == 'more than one faces detected') {
                        this.isclosed = true;
                        document.getElementById('closebtn').click();
                        this.closeModel.emit({ 'res': "failed" });
                        
                       
                    }
                    else if (this.data == 'No bottlenck available') {
                        this.isclosed = true;
                        document.getElementById('closebtn').click();
                        this.closeModel.emit({ 'res': "failed" });
                        
                       
                    }
                    // if(this.authenticateTitle == 'savePhoto'){
                    //     this.setPhotoDefaultSettings(this.authenticateData)
                    // }
                }  
                
                this.closecam()
            }
            if(this.data === 'trying to detect liveness')
            xhr.send(formdata)
          
        }
        ));
    }

    /**
   * Function name : closecam
   * Input : null
   * Output : Cam will be stopped
   * Desc : To close the cam.
   */
     closecam() {
        
        console.log( this.video.srcObject.getTracks()[0].stop())
         this.video.srcObject.getTracks().forEach(track =>  track.stop());
        this.video.srcObject = null  
    }

    /**
   * Function name : imageChange
   * Input : sourceCtx, changeThreshold
   * Output : Change for current and last pixel values
   * Desc : To check the change in the current and last pixel.
   */
    imageChange = (sourceCtx, changeThreshold) => {
        let changedPixels = 0;
        const threshold = changeThreshold * sourceCtx.canvas.width * sourceCtx.canvas.height;   //the number of pixes that change change
        let currentFrame = sourceCtx.getImageData(0, 0, sourceCtx.canvas.width, sourceCtx.canvas.height).data;
        if (this.lastFrameData == null) {
            this.lastFrameData = currentFrame;
            return true;
        }
        //look for the number of pixels that changed
        for (let i = 0; i < currentFrame.length; i += 4) {
            let lastPixelValue = this.lastFrameData[i] + this.lastFrameData[i + 1] + this.lastFrameData[i + 2];
            let currentPixelValue = currentFrame[i] + currentFrame[i + 1] + currentFrame[i + 2];
            //see if the change in the current and last pixel is greater than 10; 0 was too sensitive0
            if (Math.abs(lastPixelValue - currentPixelValue) > 10) {
                changedPixels = changedPixels + 1;
            }
        }
        this.lastFrameData = currentFrame;
        return (changedPixels > threshold);
    }

    /**
   * Function name : sendImageFromCanvas
   * Input : null
   * Output : Image will be sent
   * Desc : Check if the image has changed & enough time has passeed sending it to the API.
   */
    sendImageFromCanvas = () => {
        this.imageCtx.drawImage(this.video, 0, 0, this.video.videoWidth, this.video.videoHeight, 0, 0, this.uploadWidth, this.uploadWidth * (this.video.videoHeight / this.video.videoWidth));
        this.imageChanged = this.imageChange(this.imageCtx, this.imageChangeThreshold)
        let enoughTime = (+new Date() - this.lastFrameTime) > this.updateInterval;
        let that = this
        if (this.imageChanged && enoughTime) {
            this.lastFrameTime = new Date();
            if (this.video.srcObject != null) {
                this.imageCanvas.toBlob(function (blob) {

                    that.postFile(blob)
                }, 'image/jpeg');
            }
        }
        else {
            if (this.video.srcObject != null) {
                setTimeout(() => { this.sendImageFromCanvas() }, this.updateInterval);
            }
        }
    }

    /**
   * Function name : startObjectDetection
   * Input : null
   * Output : Object detection
   * Desc : To check canvas sizes .
   */
    startObjectDetection = (): any => {
        //Set canvas sizes based on input video
        this.imageCanvas.width = this.uploadWidth;
        this.imageCanvas.height = this.uploadWidth * (this.video.videoHeight / this.video.videoWidth);
        //Now see if we should send an image
        this.sendImageFromCanvas()
    }
    /**
     * Function name : setPhotoDefaultSettings
     * Input  : {json} selected Photo
     * Output : {json} updated Photo document
     * Desc   :  To set default Photo or remove from default 
     */
  setPhotoDefaultSettings(sign) {
    sign.setDelete=true;
    this.documentService.setPhotoDefaultSettings(sign).subscribe(data => {
    })
  }
};


