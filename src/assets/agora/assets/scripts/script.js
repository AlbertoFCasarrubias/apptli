/**
 * @name handleFail
 * @param err - error thrown by any function
 * @description Helper function to handle errors
 */
let handleFail = function(err){
    console.log("Error : ", err);
};

// Queries the container in which the remote feeds belong
let remoteContainer= document.getElementById("remote-container");
let canvasContainer =document.getElementById("canvas-container");
/**
 * @name addVideoStream
 * @param streamId
 * @description Helper function to add the video stream to "remote-container"
 */
function addVideoStream(streamId){
    let streamDiv=document.createElement("div"); // Create a new div for every stream
    streamDiv.id=streamId;                       // Assigning id to div
    streamDiv.style.transform="rotateY(180deg)"; // Takes care of lateral inversion (mirror image)
    remoteContainer.appendChild(streamDiv);      // Add new div to container
    console.log('addVideoStream addVideoStream');
}
/**
 * @name removeVideoStream
 * @param evt - Remove event
 * @description Helper function to remove the video stream from "remote-container"
 */
function removeVideoStream (evt) {
    let stream = evt.stream;
    stream.stop();
    let remDiv=document.getElementById(stream.getId());
    remDiv.parentNode.removeChild(remDiv);
    console.log("Remote stream is removed " + stream.getId());
}

function addCanvas(streamId){
    let canvas=document.createElement("canvas");
    canvas.id='canvas'+streamId;
    canvasContainer.appendChild(canvas);
    let ctx = canvas.getContext('2d');
    let video=document.getElementById(`video${streamId}`);

    video.addEventListener('loadedmetadata', function() {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
    });

    video.addEventListener('play', function() {
        var $this = this; //cache
        (function loop() {
            if (!$this.paused && !$this.ended) {
                ctx.drawImage($this, 0, 0);
                setTimeout(loop, 1000 / 30); // drawing at 30fps
            }
        })();
    }, 0);
}

// Client Setup
// Defines a client for RTC
let client = AgoraRTC.createClient({
    mode: 'live',
    codec: "h264"
});

// Client Setup
// Defines a client for Real Time Communication
client.init("c7d5f3bc5f4345fcaa57bba1fc1e5f6d",() => console.log("AgoraRTC client initialized") ,handleFail);

// The client joins the channel
client.join(null,"any-channel",null, (uid)=>{

    // Stream object associated with your web cam is initialized
    let localStream = AgoraRTC.createStream({
        streamID: uid,
        audio: true,
        video: true,
        screen: false
    });

    // Associates the stream to the client
    localStream.init(function() {

        //Plays the localVideo
        localStream.play('me');

        //Publishes the stream to the channel
        client.publish(localStream, handleFail);

    },handleFail);

},handleFail);

//When a stream is added to a channel
client.on('stream-added', function (evt) {
    console.log('stream-added stream-added');
    client.subscribe(evt.stream, handleFail);
});

//When you subscribe to a stream
client.on('stream-subscribed', function (evt) {
    console.log('stream-subscribed stream-subscribed');
    let stream = evt.stream;
    addVideoStream(stream.getId());
    stream.play(stream.getId());
    addCanvas(stream.getId());
});

//When a person is removed from the stream
client.on('stream-removed',removeVideoStream);
client.on('peer-leave',removeVideoStream);

subscribeCall = () => {
    AgoraRTC.getDevices(function(devices){
        var audioDevices = devices.filter(function(device){
            return device.kind === "audioinput";
        });
        var videoDevices = devices.filter(function(device){
            return device.kind === "videoinput";
        });

        var uid = Math.floor(Math.random()*10000);
        var selectedMicrophoneId;
        var selectedCameraId;
        var stream = AgoraRTC.createStream({
            streamID: uid,
            // Set audio to true if testing microphone
            audio: true,
            microphoneId: selectedMicrophoneId,
            // Set video to true if testing camera
            video: true,
            cameraId: selectedCameraId,
            screen: false
        });

        // Initialize the stream
        stream.init(function(){
            stream.play("mic-test");
            // Print the audio level every 1000 ms
            setInterval(function(){
                console.log(`Local Stream Audio Level ${stream.getAudioLevel()}`);
            }, 1000);
        })
    });
}





