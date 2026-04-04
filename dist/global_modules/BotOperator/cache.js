"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _classPrivateFieldInitSpec(e, t, a) { _checkPrivateRedeclaration(e, t), t.set(e, a); }
function _checkPrivateRedeclaration(e, t) { if (t.has(e)) throw new TypeError("Cannot initialize the same private elements twice on an object"); }
function _classPrivateFieldGet(s, a) { return s.get(_assertClassBrand(s, a)); }
function _classPrivateFieldSet(s, a, r) { return s.set(_assertClassBrand(s, a), r), r; }
function _assertClassBrand(e, t, n) { if ("function" == typeof e ? e === t : e.has(t)) return arguments.length < 3 ? t : n; throw new TypeError("Private element is not present on this object"); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var _require = require("./util"),
  isNumber = _require.isNumber;
var FS = _objectSpread(_objectSpread({}, FileStream), {}, {
  writeObject: function writeObject(path, data) {
    return FileStream.write(path, JSON.stringify(data));
  },
  readObject: function readObject(path) {
    var _FileStream$read;
    var defaultValue = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    return JSON.parse((_FileStream$read = FileStream.read(path)) !== null && _FileStream$read !== void 0 ? _FileStream$read : JSON.stringify(defaultValue));
  }
});
var _channel2Id = /*#__PURE__*/new WeakMap();
var _id2Channel = /*#__PURE__*/new WeakMap();
var _fileStream = /*#__PURE__*/new WeakMap();
var _path = /*#__PURE__*/new WeakMap();
var _botOperator = /*#__PURE__*/new WeakMap();
var ChannelCache = /*#__PURE__*/function () {
  function ChannelCache(fileStream, path, botOperator) {
    _classCallCheck(this, ChannelCache);
    _classPrivateFieldInitSpec(this, _channel2Id, {});
    _classPrivateFieldInitSpec(this, _id2Channel, {});
    _classPrivateFieldInitSpec(this, _fileStream, void 0);
    _classPrivateFieldInitSpec(this, _path, void 0);
    _classPrivateFieldInitSpec(this, _botOperator, void 0);
    _classPrivateFieldSet(_fileStream, this, fileStream);
    _classPrivateFieldSet(_path, this, path);
    _classPrivateFieldSet(_botOperator, this, botOperator);
  }
  return _createClass(ChannelCache, [{
    key: "load",
    value: function load() {
      var rooms = {};
      var studentRooms = {};
      var _classPrivateFieldGet2 = _classPrivateFieldGet(_fileStream, this).readObject(_classPrivateFieldGet(_path, this), {
          i2c: {},
          c2i: {}
        }),
        i2c = _classPrivateFieldGet2.i2c,
        c2i = _classPrivateFieldGet2.c2i;
      for (var _i = 0, _Object$entries = Object.entries(c2i); _i < _Object$entries.length; _i++) {
        var _Object$entries$_i = _slicedToArray(_Object$entries[_i], 2),
          name = _Object$entries$_i[0],
          id = _Object$entries$_i[1];
        var ch = _classPrivateFieldGet(_botOperator, this).getChannelById(id);
        if (ch == null) continue;
        _classPrivateFieldGet(_channel2Id, this)[name] = id;
        _classPrivateFieldGet(_id2Channel, this)[id] = name;
        if (isNumber(name)) {
          if (ch.isGroupChannel() && ch.raw.active_members_count > 80)
            // 기수 톡방이 맞는지 검사 (조건: 최소 80명 이상)
            studentRooms[name] = ch;
        }
        rooms[name] = ch;
      }
      this.dump();
      return {
        rooms: rooms,
        studentRooms: studentRooms
      };
    }
  }, {
    key: "push",
    value: function push(channel) {
      _classPrivateFieldGet(_channel2Id, this)[channel.customName] = channel.id;
      _classPrivateFieldGet(_id2Channel, this)[channel.id] = channel.customName;
    }
  }, {
    key: "dump",
    value: function dump() {
      _classPrivateFieldGet(_fileStream, this).writeObject(_classPrivateFieldGet(_path, this), {
        c2i: _classPrivateFieldGet(_channel2Id, this),
        i2c: _classPrivateFieldGet(_id2Channel, this)
      });
    }
  }, {
    key: "has",
    value: function has(channel) {
      return channel.id in _classPrivateFieldGet(_id2Channel, this);
    }
  }, {
    key: "data",
    value: function data() {
      return {
        i2c: _classPrivateFieldGet(_id2Channel, this),
        c2i: _classPrivateFieldGet(_channel2Id, this)
      };
    }
  }]);
}();
exports.FS = FS;
exports.ChannelCache = ChannelCache;