var e,t=(e=require("react"))&&"object"==typeof e&&"default"in e?e.default:e,r=require("styled-components"),n=new Map;module.exports=function(e){return void 0===e&&(e={}),{createDocument:function(e){return{head:e.style}},createServerRoot:function(e){var a=e.root,o=e.context,u=new r.ServerStyleSheet;return n.set(o.pathname,u),function(e){return t.createElement(r.StyleSheetManager,{sheet:u.instance},t.createElement(a,e))}},postServerRender:function(e){var t=e.context,r=n.get(t.pathname);if(!r)return{};var a=r.getStyleTags();return r.seal(),n.delete(t.pathname),{style:a}}}};
//# sourceMappingURL=rola-plugin-styled-components.js.map
