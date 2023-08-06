import { Component, HostListener, OnInit } from '@angular/core';
import { Peer } from "peerjs"; 
import { ActivatedRoute, Router } from '@angular/router'; 
import { Clipboard } from '@angular/cdk/clipboard'; 
import {WebcamImage, WebcamInitError, WebcamUtil} from 'ngx-webcam'; 
import { Observable, Subject } from 'rxjs'; 
import { MessageService, PrimeNGConfig } from 'primeng/api'; 
import { faVideoSlash } from '@fortawesome/free-solid-svg-icons'; 
import { faVideo } from '@fortawesome/free-solid-svg-icons'; 
import { faPhone } from '@fortawesome/free-solid-svg-icons';
import { faPhoneSlash } from '@fortawesome/free-solid-svg-icons'; 
import { faMicrophoneSlash } from '@fortawesome/free-solid-svg-icons'; 
import { faMicrophone } from '@fortawesome/free-solid-svg-icons';
 import { faCloudUploadAlt } from '@fortawesome/free-solid-svg-icons'; 
 import { faCamera } from '@fortawesome/free-solid-svg-icons'; 
 import { UserService } from 'src/app/services/user.service'; 
import * as RecordRTC from "recordrtc";
 import { HttpEventType, HttpResponse } from '@angular/common/http';
import { TokenizeResult } from '@angular/compiler/src/ml_parser/lexer';
//import { unescape } from 'querystring';
@Component({
  selector: 'app-meeting',
  templateUrl: './meeting.component.html',
  styleUrls: ['./meeting.component.css'],
  providers: [MessageService]
})
export class MeetingComponent implements OnInit {
  faCamera = faCamera
  faCloudUploadAlt = faCloudUploadAlt
  faVideo = faVideo
  faVideoSlash = faVideoSlash
  faPhone =faPhone
  faPhoneSlash = faPhoneSlash
  faMicrophoneSlash = faMicrophoneSlash
  faMicrophone = faMicrophone
  isCameraOn = false
  isCameraOn1 = false
  buttonColor = '#00aeef'
  buttonColor1 = '#00aeef'
  showactionbutton = false;
  peer:any;
  anotherId:any;
  mypeerid:any;
  public displaywebcam:boolean = false;
  video: HTMLVideoElement | undefined;
  private peerList: Array<any> = []
  currentPeer:any;
  isMicMuted:boolean= false;
  indentification:boolean = false;
  private lazyStream: any;
  //webcam preview
  public multipleWebcamsAvailable = false;
  public showWebcam = false;
  public showWebcam1 = false;
  public showcode:boolean = false;
  public allowCameraSwitch = true;
  public deviceId : any;
  public errors: WebcamInitError[] = [];
  public displaymeeting: boolean = false;
  public videoOptions: MediaTrackConstraints = {
     width: {ideal: 1024},
     height: {ideal: 576}
  };
  // webcam snapshot trigger
  private trigger: Subject<void> = new Subject<void>();
  // switch to next / previous / specific webcam; true/false: forward/backwards, string: deviceId
  private nextWebcam: Subject<boolean|string> = new Subject<boolean|string>();
  audioTrack: any;
  call: any;
  videoTrack: any;
  localStream: any;
  localVideoTrack: any;
  currentCall: any;
  recorder: any;
  isScreenSharing: boolean = false;
  timerValue: number = 0;
  interval: any;
  timer: boolean = false;
  isRecording: boolean = false;
  rem: any;
  msg: any;
  //filename: boolean;
  constructor(private router : Router, private clipboard: Clipboard, private userService : UserService) {
    this.onResize()
   }

  ngOnInit(): void {
    WebcamUtil.getAvailableVideoInputs()
    .then((mediaDevices:MediaDeviceInfo[])=>{
      this.multipleWebcamsAvailable = mediaDevices && mediaDevices.length>1;
    })
  }

  private streamRemoteVideo(stream:any,isRecording:boolean){
    const video = document.createElement('video');
    video.classList.add('video');
    video.srcObject = stream;
    video.play();
    const myVide = document.getElementById('myvideo2');
    if(myVide != null){
      myVide.append(video);
      let wfo = document.getElementById('text') as HTMLElement
      wfo.style.display = 'none';
      this.showactionbutton = true

      if(isRecording && this.recorder){
        this.recorder.addStream(stream)
      }
    }
  }

  callCam(pr:any){
    var n = <any>navigator;
    n.getUserMedia = n.getUserMedia || n.webkitGetUserMedia || n.mozGetUserMedia;
    pr.on('call',(call:any)=>{
      this.currentCall = call;
      navigator.mediaDevices
      .getUserMedia({
        video: true,
        audio: !this.isMicMuted
      })
      .then((stream)=>{
        this.lazyStream = stream

        call.answer(stream)

        call.on('stream',(remoteStream: any)=>{
          this.rem = remoteStream
          if(!this.peerList.includes(call.peer)){
            this.showWebcam1 = true;
            this.streamRemoteVideo(remoteStream,this.isRecording);
            this.currentPeer = call.peerConnection;
            this.peerList.push(call.peer)
          }
        })
      })
      .catch((err)=>{
        console.log(err + 'Unable to get media')
      })
    })
  }

  startmeeting(){
    this.showcode = true
    let start =  document.getElementById('start') as HTMLElement
    start.style.display = 'none'
    this.peer = new Peer()

    setTimeout(()=>{
      this.mypeerid= this.peer.id
      this.displaymeeting = true
      console.log(this.mypeerid)
    },2000)

    this.callCam(this.peer)
  }

  reloadCode(){
    this.router.navigateByUrl('/RefreshComponent',{skipLocationChange:true}).then(()=>{
      this.router.navigate(['/meeting']);
    });
  }

  copyLink(text:any){
    let clone = document.getElementById('clone') as HTMLElement
    clone.style.color='#00aeef';
    this.clipboard.copy(text)
  }
  
  joinCall(){
    localStorage.setItem('meetingId',this.anotherId)
    this.indentification = true
  }

  mute(){
    this.isCameraOn1 = !this.isCameraOn1;
    console.log(this.faMicrophoneSlash)
    if(this.isCameraOn1){
      this.faMicrophone = faMicrophoneSlash;//Set the icon to faVideo
      this.buttonColor1 = '#FF0000'
    }else{
      this.faMicrophone = this.faMicrophone
      this.buttonColor1 = '#00aeef'
    }

    this.isMicMuted = !this.isMicMuted
    if(this.lazyStream){
      this.lazyStream.getAudioTracks().forEach((track:MediaStreamTrack)=>{
        track.enabled = !this.isMicMuted
      })
    }
  }

  turnOffCamera(){
    this.isCameraOn = !this.isCameraOn;
    if(this.isCameraOn){
      this.faVideo = this.faVideoSlash
      this.buttonColor = '#FF0000'
    }else{
      this.faVideo = this.faVideo
      this.buttonColor = '#00aeef'
    }

    this.showWebcam1 = !this.showWebcam1
    this.localVideoTrack = this.lazyStream.getVideoTracks()[0];
    this.localVideoTrack.enabled = !this.localVideoTrack.enabled
  }

  openCameraSettings(){
    window.open('ms-settings:privacy-webcam','_blank')
  }

  endCall(){
    if(this.currentCall){
      this.showWebcam1 = false
      this.lazyStream.getTracks().forEach((track:MediaStreamTrack)=>{
        track.stop()
      })

      this.currentCall.close()

      this.currentCall = null
      this.displaymeeting = false
    }
  }

  startCallRecording() {
    let record = document.getElementById('record') as HTMLElement
    if(record.innerText == 'Start Recording'){
      this.recorder = new RecordRTC(this.rem, {
        type: "video",
        mimeType: "video/mp4",
      });
      this.recorder.startRecording();
      this.isRecording = true;
      record.innerText = 'Stop Recording'
      record.style.backgroundColor = '#FF0000'
      this.timer = true
      this.timerValue = 0;
      this.interval = setInterval(() => {
        const minutes = Math.floor(this.timerValue / 60);
        const seconds = this.timerValue % 60;
        this.timerValue++;
       const formattedTime = `${this.padTime(minutes)}:${this.padTime(seconds)}`;
       let timerdisplay = document.getElementById("timerDisplay") as HTMLElement
       timerdisplay.textContent = formattedTime;
      }, 1000);
    } else if (record.innerText == 'Stop Recording') {
      //let self = this;
      this.isRecording = false;
      this.timer = false
      this.recorder.stopRecording( () => {
        let blob = this.recorder.getBlob();
        //let video = document.createElement("videoStream");
        let video: any = document.getElementById("videoStream");
        video.src = URL.createObjectURL(blob);
        this.downloadBlob(blob, 'recorded-video.webm')
      });
      record.innerText = 'Start Recording'
      record.style.backgroundColor = '#00aeef'
      clearInterval(this.interval)
    }
   
  }

  downloadBlob(blob: Blob, fileName: string){
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url;
    link.download = fileName
    link.click();
    URL.revokeObjectURL(url)
  }

  padTime(time:number){
    return(time<10?'0':'') + time
  }

  //webcam related features//

  public toggleWebCam():void{
    this.showWebcam = !this.showWebcam;
    this.displaywebcam = !this.displaywebcam
    if(this.showWebcam == true){
      let label = document.getElementById('prev') as HTMLElement
      label.innerText = 'Close'
    }else{
      let label = document.getElementById('prev') as HTMLElement
      label.innerText = 'Preview'
    }
  }

  public handleInitError(error:WebcamInitError):void{
    this.errors.push(error)
  }
  public cameraWasSwitched(deviceId: string): void{
    this.deviceId = deviceId
  }
  public get nextWebcamObservable():Observable<boolean|string>{
    return this.nextWebcam.asObservable();
  }
  public get triggerObservable():Observable<void>{
    return this.trigger.asObservable();
  }
  //////////////////////////////////////
  file1:any
  file1Name:any
  isFileUpload:boolean = false
  isSelfieUpload:boolean = false
  disableSubmit:boolean = false
  showSelfie:boolean = false
  selfieName:any
  showWebcamera:boolean = false
  showWebcamButton:boolean = true
  disableWebcam:boolean = false
  showButton:boolean = false
  webcamWidth:number = 0
  webcamHeight: number = 0
  webcamImage: WebcamImage | undefined;
  file2:any;
  showSelfieMsg: boolean = false
  errMsg: boolean = false
  selfieMsg: any
  loading:boolean = false
  idMsg:boolean = false
  filename:boolean = false
  togCam:boolean = false
  togverify:boolean = false
  getFile1(e:any){
    this.filename = true;
    this.togCam = true;
    this.file1 = e.target.files[0];
    this.file1Name = e.target.files[0]['name']
    if(typeof this.file1['name'] != undefined){
      this.isFileUpload = true;
    }
  }

  public triggerSnapshot():void{
    this.togverify = true;
    this.trigger.next();
    this.showWebcam = false;
    this.showWebcamButton = true;
    this.showButton = false;
  }

  @HostListener('window:resize',['$event'])
  onResize(event?:Event){
    const win = !!event ? (event.target as Window) : window;
    this.webcamWidth = win.innerWidth
    this.webcamHeight = win.innerHeight
  }

  public handleImage(webcamImage:WebcamImage):void{
    console.info('received webcam image', webcamImage);
    this.webcamImage = webcamImage;
    console.log(webcamImage['_imageAsDataUrl']);
    const base64 = webcamImage['_imageAsDataUrl'];
    const imageName = 'selfie.png';
    const imageBlob = this.dataURItoBlob(base64);
    const imageFile = new File([imageBlob], imageName, { type: 'image/png' });
    console.info(imageFile);
    this.file2 = imageFile;
    this.isSelfieUpload = true;
    this.showSelfie = true;
    this.showSelfieMsg = true;
    this.selfieName = imageName;
    this.errMsg = false;
    this.selfieMsg = 'Picture captured, please verify identity';
  }

  dataURItoBlob(dataURI:any){
    var byteString;
    if(dataURI.split(',')[0].indexOf('base64') >= 0)
    byteString = atob(dataURI.split(',')[1]);
    else byteString = unescape(dataURI.split(',')[1]);

    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]

    var ia = new Uint8Array(byteString.length);
    for(var i = 0; i<byteString.length;i++){
      ia[i] = byteString.charCodeAt(i)
    }
    return new Blob([ia],{type : mimeString});
  }

  public toggleWebcamera():void{
    this.loading = true;
    this.showWebcamera = !this.showWebcamera
    this.showSelfieMsg = false;
    if(this.showWebcamera == true){
      this.showButton = true;
      this.showWebcamButton = false;
    } else {
      this.showButton = false;
      this.showWebcamButton = true;
    }

    this.loading = false;
  }

  uploadFiles() {
    this.closeWebcam()
    this.showWebcamButton = true;
    this.loading = true;
    this.idMsg = false;
    this.errMsg = false;
    this.showSelfieMsg = false;
    this.userService.uploadId(this.file1, this.file2).subscribe(
      (event: any) => {
        if (event.type === HttpEventType.UploadProgress) {
          console.log('File completely uploaded now')
        } else if (event instanceof HttpResponse) {
          this.loading = false;

          if (event['body']['error']) {
            this.errMsg = true
            this.msg = "Oops..Indentity couldn't be verified, Would you like to try again?"
          } else if (event['body']['face']['error']) {
            this.errMsg = true;
            this.msg = "Oops..Indentity couldn't be verified, Would you like to try again?"
          } else if (event['body']['face']['isIdentical'] == true) {
            this.idMsg = true;
            this.msg = 'Indetity has been verified successfully. You are now joining the call';

            this.disableSubmit = true;
            this.disableWebcam = true;
            setTimeout(() => {
              this.router.navigateByUrl('videocall')
            }, 2000)
          } else if (event['body']['face']['isIdentical'] == false) {
            this.errMsg = true;
            this.msg = "Oops..Identity couldn't be verify, Would you like to try again?"
          }
        }
      },
      (err: any) => {
        console.log(err)
      }
    )
  }

  public closeWebcam(){
    this.showWebcamera = false;
    this.showButton = false;
  }
}
