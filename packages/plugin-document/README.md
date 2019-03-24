# @rola/plugin-document
Quick access to the document creation process in
[rola](https://github.com/estrattonbailey/rola).

> See [plugin docs](https://github.com/estrattonbailey/rola/issues/20) for more info.

## Install
```bash
npm i @rola/plugin-document --save
```

## Usage
Add the plugin to the `plugins` array in your `rola.plugins.js`:

```javascript
import document from '@rola/plugin-document'

export default [
  document(({ context, ...customProps }) => {
    return {
      head: [ '<link />' ],
      body: [ '<script />' ]
    }
  })
]
```

## License
MIT License © [Eric Bailey](https://estrattonbailey.com)
