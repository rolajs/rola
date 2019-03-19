module.exports = fn => ({
  createDocument (props) {
    return fn(props)
  }
})
