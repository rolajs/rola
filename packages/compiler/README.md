# spitball
A plucky little batteries-included compiler util. Built with Webpack.

### Features
1. glob & multi-entries
2. modern JS
3. modern CSS
4. live-reload
5. conventient CLI

## Install
```bash
npm i spitball
```

## Usage
```bash
spitball <command> [inputs...] --out <dir>
```

## Config
To take advantage of multi-entries and a few other options, you'll need to
define a config file.

```javascript
// spitball.config.js
module.exports = {
  in: 'src/*.js', // string or object syntax
  out: 'dist',
  env: {
    apiKey: 'abcde'
  },
  alias: {
    components: 'src/components/'
  },
  banner: '/** Hello there */', // default undefined
  reload: true // live-reload, defaults to false
}
```

## License
MIT License © [The Couch](https://thecouch.nyc)
