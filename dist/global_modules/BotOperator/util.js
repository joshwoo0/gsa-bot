"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _classPrivateFieldInitSpec(e, t, a) { _checkPrivateRedeclaration(e, t), t.set(e, a); }
function _checkPrivateRedeclaration(e, t) { if (t.has(e)) throw new TypeError("Cannot initialize the same private elements twice on an object"); }
function _classPrivateFieldSet(s, a, r) { return s.set(_assertClassBrand(s, a), r), r; }
function _assertClassBrand(e, t, n) { if ("function" == typeof e ? e === t : e.has(t)) return arguments.length < 3 ? t : n; throw new TypeError("Private element is not present on this object"); }
Array.prototype.flat || (Array.prototype.flat = function (t, r) {
  return r = this.concat.apply([], this), t > 1 && r.some(Array.isArray) ? r.flat(t - 1) : r;
}, Array.prototype.flatMap = function (t, r) {
  return this.map(t, r).flat();
});
String.prototype.replaceAll || (String.prototype.replaceAll = function (t, r) {
  return this.split(t).join(r);
});
var getJosa = function getJosa(str, josaPair) {
  var lastChar = str.charCodeAt(str.length - 1);
  var hasFinalConsonant = (lastChar - 44032) % 28 !== 0;
  var isFinalRieul = (lastChar - 44032) % 28 === 8;
  var josaMap = {
    '이가': hasFinalConsonant ? '이' : '가',
    '은는': hasFinalConsonant ? '은' : '는',
    '을를': hasFinalConsonant ? '을' : '를',
    '으로': hasFinalConsonant && !isFinalRieul ? '으로' : '로',
    '와과': hasFinalConsonant ? '과' : '와'
  };
  return str + josaMap[josaPair];
};
Object.defineProperties(String.prototype, {
  '이가': {
    get: function get() {
      return getJosa(this, '이가');
    }
  },
  '은는': {
    get: function get() {
      return getJosa(this, '은는');
    }
  },
  '을를': {
    get: function get() {
      return getJosa(this, '을를');
    }
  },
  '으로': {
    get: function get() {
      return getJosa(this, '으로');
    }
  },
  '와과': {
    get: function get() {
      return getJosa(this, '와과');
    }
  }
});
var shortURL = function shortURL(url) {
  return org.jsoup.Jsoup.connect("https://tinyurl.com/api-create.php?url=".concat(url)).get().text().substring('https://'.length);
};
var prettyBytes = function prettyBytes(bytes) {
  var units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  var i = 0;
  while (bytes >= 1024 && ++i) bytes /= 1024;
  return "".concat(bytes.toFixed(2), " ").concat(units[i]);
};
var prettyDuration = function prettyDuration(seconds) {
  var hours = String(Math.floor(seconds / 3600)).padStart(2, '0');
  var minutes = String(Math.floor(seconds % 3600 / 60)).padStart(2, '0');
  var secs = String(Math.floor(seconds % 60)).padStart(2, '0');
  return (hours !== "00" ? "".concat(hours, ": ") : '') + "".concat(minutes, ":").concat(secs);
};
var getChannelName = function getChannelName(channel) {};
var _debugRoom = /*#__PURE__*/new WeakMap();
var Logger = /*#__PURE__*/function () {
  function Logger(debugRoom) {
    _classCallCheck(this, Logger);
    _classPrivateFieldInitSpec(this, _debugRoom, void 0);
    _classPrivateFieldSet(_debugRoom, this, debugRoom);
  }
  return _createClass(Logger, [{
    key: "message",
    value: function message(level, msg) {}
  }]);
}();
exports.isNumber = function (name) {
  return /^\d+$/.test(name);
};
exports.isNaN = function (n) {
  return Number.isNaN(n);
};
exports.compress = "\u200B".repeat(500);
exports.getJosa = getJosa;
exports.isValidChannel = function (channel) {
  return channel != null && channel.send != null;
};
exports.shortURL = shortURL;
exports.prettyBytes = prettyBytes;
exports.prettyDuration = prettyDuration;
exports.Logger = Logger;