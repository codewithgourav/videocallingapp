import { Component, OnInit } from '@angular/core';
import Peer from 'peerjs'; 
import { faVideoSlash } from '@fortawesome/free-solid-svg-icons'; 
import { faVideo } from '@fortawesome/free-solid-svg-icons'; 
import { faPhone } from '@fortawesome/free-solid-svg-icons'; 
import { faPhoneSlash } from '@fortawesome/free-solid-svg-icons'; 
import { faMicrophoneSlash } from '@fortawesome/free-solid-svg-icons'; 
import { faMicrophone } from '@fortawesome/free-solid-svg-icons'; 
import { WebcamImage, WebcamInitError, WebcamUtil } from 'ngx-webcam'; 
import { Observable, Subject } from 'rxjs'; 
import { ActivatedRoute, Router } from '@angular/router'; 
import * as RecordRTC from "recordrtc";
@Component({
  selector: 'app-videocall',
  templateUrl: './videocall.component.html',
  styleUrls: ['./videocall.component.css']
})
export class VideocallComponent implements OnInit {
  faVideo = faVideo
  faVideoSlash = faVideoSlash
  faPhone = faPhone
  faPhoneSlash = faPhoneSlash
  faMicrophoneSlash = faMicrophoneSlash
  faMicrophone = faMicrophone
  isCameraOn1 = false
  buttonColor = "#00aeef";
  buttonColor1 = "#00aeef";
  isCameraOn = false;
  localVideoTrack:any;
  showactionbutton = false;

  meetingId: any;
  private peer: Peer;
  isScreenSharing: boolean = false
  isMicMuted : boolean = false

  peerIdShare: any
  peerId: any
  peerId2: any
  private lazyStream : any;
  currentPeer: any;
  private peerList: Array<any> = []
  recorder:any;
  isRecording:boolean = false
  currentCall:any
  timerValue: number = 0
  interval: any
  timer: boolean = false
  //webcam preview
  public displaywebcam : boolean = false
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
  rem:any;
  constructor(private router: Router) {
    this.peer = new Peer()
   }

  ngOnInit(): void {
    this.meetingId = (localStorage.getItem('meetingId'))
    this.displaymeeting = true
    this.callPeer(this.meetingId)

    WebcamUtil.getAvailableVideoInputs()
    .then((mediaDevices:MediaDeviceInfo[])=>{
      this.multipleWebcamsAvailable = mediaDevices && mediaDevices.length>1;
    })
  }

  private callPeer(id:string):void{
    var n = <any>navigator;
    n.getUserMedia = n.getUserMedia || n.webkitGetUserMedia || n.mozGetUserMedia;

      navigator.mediaDevices
      .getUserMedia({
        video: true,
        audio: !this.isMicMuted
      })
      .then((stream)=>{
        this.lazyStream = stream
        const call = this.peer.call(id,stream)
        this.currentCall = call
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
  
  mute(){
    this.isCameraOn1 = !this.isCameraOn1;
    console.log(this.faMicrophoneSlash)
    if(this.isCameraOn1){
      //this.faMicrophone = faMicrophoneSlash;//Set the icon to faVideo
      this.buttonColor1 = '#FF0000'
    }else{
      //this.faMicrophone = this.faMicrophone
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
      //this.faVideo = this.faVideoSlash
      this.buttonColor = '#FF0000'
    }else{
      //this.faVideo = this.faVideo
      this.buttonColor = '#00aeef'
    }

    this.showWebcam1 = !this.showWebcam1
    this.localVideoTrack = this.lazyStream.getVideoTracks()[0];
    this.localVideoTrack.enabled = !this.localVideoTrack.enabled
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

      this.router.navigateByUrl('meeting')
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
}
