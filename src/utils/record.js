function Recorder() {
  this.dataChunks = []
  this.recorder = null
  navigator.permissions.query({
    name: "microphone"
  }).then(result => {
    navigator.mediaDevices.getUserMedia({
      audio: true
    }).then((stream) => {
      this.recorder = new MediaRecorder(stream)
      this.recorder.addEventListener("dataavailable", (e) => {
        if (e.data.size > 0) {
          this.dataChunks.push(e.data)
        }
      })
      this.recorder.start()
    })
  }).catch(err => {
    alert("火狐浏览器")
  })
}
Recorder.prototype.start = function () {
  this.dataChunks = []
  this.recorder.start()
}
Recorder.prototype.stop = function (callback) {
  if (this.recorder) {
    this.recorder.addEventListener("stop", () => {
      if (this.dataChunks) {
        callback(this.dataChunks[0])
      }
    })
    this.recorder.stop()
  }
}

export default Recorder