module.exports = function req (file) {
  let mod
  let err

  try {
    mod = require(file)
  } catch (e) {
    err = e
  }

  return {
    mod,
    err
  }
}
