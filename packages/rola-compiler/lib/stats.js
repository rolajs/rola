function formatStats (stats) {
  return [].concat(stats.stats || stats).map(stat => {
    const { startTime, endTime } = stat
    const json = stat.toJson({
      children: false,
      modules: false
    })

    return {
      errors: stats.hasErrors() ? json.errors : null,
      warnings: stats.hasWarnings() ? json.warnings : null,
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
