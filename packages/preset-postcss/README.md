# @rola/preset-postcss
Enable PostCSS support in [rola](https://github.com/estrattonbailey/rola). Comes
with sane defaults for things like CSS variables and SASS-like nesting.

## Install
```bash
npm i @rola/preset-postcss --save
```

## Usage
Add the preset to the `presets` array in your `rola.config.js`:

```javascript
import css from '@rola/preset-postcss'

export const presets = [
  css()
]
```

## License
MIT License © [Eric Bailey](https://estrattonbailey.com)
