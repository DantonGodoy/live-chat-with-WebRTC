const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const myPeer = new Peer(undefined, {
  host: '/',
  port: '3001'
})
const myVideo = document.createElement('video')
myVideo.muted = true
const peers = {}
navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
  console.log();
  addVideoStream(myVideo, stream)

  myPeer.on('call', call => {
    call.answer(stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream)
    })
  })

  socket.on('user-connected', userId => {
    connectToNewUser(userId, stream)
  })
}).catch(function (err) {
  //log to console first 
  console.log(err); /* handle the error */
  if (err.name == "NotFoundError" || err.name == "DevicesNotFoundError") {
    //required track is missing 
    console.log('NotFoundError & DevicesNotFoundError');
  } else if (err.name == "NotReadableError" || err.name == "TrackStartError") {
    //webcam or mic are already in use 
    console.log('NotReadableError & TrackStartError');
  } else if (err.name == "OverconstrainedError" || err.name == "ConstraintNotSatisfiedError") {
    //constraints can not be satisfied by avb. devices 
    console.log('OverconstrainedError & ConstraintNotSatisfiedError');
  } else if (err.name == "NotAllowedError" || err.name == "PermissionDeniedError") {
    //permission denied in browser 
    console.log('NotAllowedError & PermissionDeniedError');
  } else if (err.name == "TypeError" || err.name == "TypeError") {
    //empty constraints object 
    console.log('TypeError');
  } else {
    //other errors 
  }
})

socket.on('user-disconnected', userId => {
  if (peers[userId]) peers[userId].close()
})

myPeer.on('open', id => {
  socket.emit('join-room', ROOM_ID, id)
})

function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream)
  const video = document.createElement('video')
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream)
  })
  call.on('close', () => {
    video.remove()
  })

  peers[userId] = call
}

function addVideoStream(video, stream) {
  video.srcObject = stream
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })
  videoGrid.append(video)
}