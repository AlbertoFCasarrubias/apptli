import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {AgoraClient, ClientEvent, NgxAgoraService, Stream, StreamEvent} from 'ngx-agora';
import {Router} from '@angular/router';
import {FirebaseService} from '../../services/firebase/firebase.service';

declare var Peer: any;

@Component({
  selector: 'app-videocall',
  templateUrl: './videocall.page.html',
  styleUrls: ['./videocall.page.scss'],
})
export class VideocallPage implements OnInit, OnDestroy {
  @ViewChild('myVideo', {static: false}) myVideo: any;
  peer: any;
  anotherid: any = '';
  myPeerId: any;
  user: any;
  interval: any;

  //AGORA
  localCallId = 'agora_local';
  remoteCalls: string[] = [];

  private client: AgoraClient;
  private localStream: Stream;
  private uid: number;

  constructor(private firebaseService: FirebaseService,
              public router: Router) {
    this.uid = Math.floor(Math.random() * 100);
  }

  ngOnInit(): void {

  }

  peerInit(): void {

    let video;
    this.peer = new Peer({key: 'apptli-93f0bc16-0bfb-4870-ad1d-feb1d8713d17'});

    this.peer.on('open', id => {
      video = this.myVideo.nativeElement;
      this.myPeerId = id;
    });

    this.peer.on('connection', conn => {
      conn.on('data', data => {
        console.log('Received', data);
      });
    });

    let n = <any> navigator;
    n.getUserMedia = n.getUserMedia || n.webkitGetUserMedia || n.mozGetUserMedia;

    const constraints = { video: true, audio: true };

    this.peer.on('call' , call => {
      n.mediaDevices.getUserMedia(constraints)
          .then(stream => {
            call.answer(stream);
            call.on('stream', remoteStream => {
              //video.src = URL.createObjectURL(remoteStream);
              video.srcObject = remoteStream;
              video.src = remoteStream;
              video.play();
            });
          })
          .catch(e => console.error(e));


    });

    this.interval = setInterval(() => {
      console.log('interval ...this.myPeerId ', this.myPeerId);
      if(this.myPeerId)
      {
        clearInterval(this.interval);
        console.log('cleared interval ', this.myPeerId);
        console.log('update user ', this.myPeerId);

        console.log('user ', this.user)
        if(!this.user)
        {
          console.log('obtener usuario');
          this.firebaseService.getUserByAuthId()
              .then(userData => {
                userData
                    .subscribe(user => {
                      user['peerID'] = this.myPeerId;
                      this.user = user;

                      console.log(new Date().toISOString());
                      console.log('this.myPeerId ' , this.myPeerId);
                      console.log('this.user.peerID ' , this.user.peerID);

                      /*
                      this.firebaseService.updateUser(user)
                          .then(() => console.log('update user'));*/
                    }, error => console.error(error));
              });
        }
      }
    },500);


  }

  ngOnDestroy(): void {
    this.myPeerId = null;
    clearInterval(this.interval);
    this.interval = null;
  }

  connect(){
    const conn = this.peer.connect(this.anotherid);

    conn.on('open', () => {

      // Send messages
      conn.send('Hello! ' + this.anotherid);
    });
  }

  videoconnect(){
    const video = this.myVideo.nativeElement;
    const localvar = this.peer;
    const fname = this.anotherid;

    let n = <any> navigator;
    n.getUserMedia = n.getUserMedia || n.webkitGetUserMedia || n.mozGetUserMedia;

    const constraints = { video: true, audio: true };

    n.mediaDevices.getUserMedia(constraints)
        .then(stream => {
          const call = localvar.call(fname, stream);
          call.on('stream', remoteStream => {
            video.srcObject = remoteStream;
            video.play();
          });
        })
        .catch(e => console.error(e));
  }

}
