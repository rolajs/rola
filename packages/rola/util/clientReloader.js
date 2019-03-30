module.exports = function clientReloader (port) {
  return `
    (function (global) {
      try {
        const pocketio = document.createElement('script')
        pocketio.src = 'https://unpkg.com/pocket.io@0.1.4/min.js'
        pocketio.onload = function init () {
          var disconnected = false
          var socket = io('http://localhost:${port}', {
            reconnectionAttempts: 3
          })
          socket.on('connect', () => console.log('rola connected'))
          socket.on('update', () => {
            global.location.reload()
          })
          socket.on('disconnect', () => {
            disconnected = true
          })
          socket.on('reconnect_failed', e => {
            if (disconnected) return
            console.error("rola - connection to server on :${port} failed")
          })
        }
        document.head.appendChild(pocketio)
      } catch (e) {}
    })(this);
  `
}
