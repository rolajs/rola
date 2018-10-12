exports.id = "main";
exports.modules = {

/***/ "./src/routes/Home.js":
/*!****************************!*\
  !*** ./src/routes/Home.js ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _ultradom = __webpack_require__(/*! ultradom */ "ultradom");

var _foil = __webpack_require__(/*! foil */ "foil");

/** @jsx h */
function Home(props) {
  return (0, _ultradom.h)("h1", null, "Hello world!");
}

var _default = (0, _foil.route)({
  path: '/',
  payload: {
    Component: Home
  }
});

exports.default = _default;

/***/ })

};
//# sourceMappingURL=main.2806e1efd06a6015f0d7.hot-update.js.map