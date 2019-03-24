# @rola/preset-sass
Bundle for Node using [rola](https://github.com/estrattonbailey/rola).

> Unless you're building something using
> [@rola/compiler](https://github.com/estrattonbailey/rola/tree/master/packages/rola-compiler)
> directly, you won't need this module for your rola project.

## Install
```bash
npm i @rola/preset-node --save
```

## Usage
Add the preset to the `presets` array on your [@rola/compiler](https://github.com/estrattonbailey/rola/tree/master/packages/rola-compiler) instance:

```javascript
import compiler from '@rola/compiler'
import node from '@rola/preset-node'

compiler({
  in: './index.js',
  out: './build',
  presets: [
    node()
  ]
})
```

## License
MIT License © [Eric Bailey](https://estrattonbailey.com)
