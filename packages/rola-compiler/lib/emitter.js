module.exports = function () {
  const events = {}

  function emit (ev, ...data) {
    return (events[ev] || []).map(fn => fn(...data))
  }

  function on (ev, fn) {
    events[ev] = (events[ev] || []).concat(fn)
    return () => events[ev].slice(events[ev].indexOf(fn), 1)
  }

  return {
    on,
    emit
  }
}
