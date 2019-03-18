const { emit } = require('./emitter.js')

function formatStats (stats) {
  return [].concat(stats.stats || stats).map(stat => {
    const { startTime, endTime } = stat
    const json = stat.toJson({
      children: false,
      modules: false
    })

    if (stat.hasErrors()) {
      emit('error', json.errors)
    }

    if (stat.hasWarnings()) {
      emit('warn', json.warnings)
    }

    return {
      duration: (endTime - startTime) / 1000,
      assets: json.assets.map(({ name, size }) => {
        return {
          name,
          size: size / 1000
        }
      })
    }
  })
}

module.exports = {
  formatStats
}
