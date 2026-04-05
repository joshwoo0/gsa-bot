"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _classPrivateFieldInitSpec(e, t, a) { _checkPrivateRedeclaration(e, t), t.set(e, a); }
function _checkPrivateRedeclaration(e, t) { if (t.has(e)) throw new TypeError("Cannot initialize the same private elements twice on an object"); }
function _classPrivateFieldGet(s, a) { return s.get(_assertClassBrand(s, a)); }
function _classPrivateFieldSet(s, a, r) { return s.set(_assertClassBrand(s, a), r), r; }
function _assertClassBrand(e, t, n) { if ("function" == typeof e ? e === t : e.has(t)) return arguments.length < 3 ? t : n; throw new TypeError("Private element is not present on this object"); }
var _options = /*#__PURE__*/new WeakMap();
var Connection = /*#__PURE__*/function () {
  function Connection(apiKey) {
    var orgCode = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'F10';
    var schoolCode = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 7380031;
    var type = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'xml';
    _classCallCheck(this, Connection);
    _classPrivateFieldInitSpec(this, _options, void 0);
    _classPrivateFieldSet(_options, this, [['KEY', apiKey], ['ATPT_OFCDC_SC_CODE', orgCode], ['SD_SCHUL_CODE', schoolCode], ['Type', type]]);
  }
  return _createClass(Connection, [{
    key: "connect",
    value: function connect(url, args) {
      var queries = [].concat(_toConsumableArray(_classPrivateFieldGet(_options, this)), _toConsumableArray(args)).map(function (opt) {
        return opt.join('=');
      }).join('&');
      var doc = org.jsoup.Jsoup.connect("https://open.neis.go.kr/hub/".concat(url, "?").concat(queries)).get();

      // 에러 코드 처리
      var resultElements = doc.select('RESULT > CODE');
      if (!resultElements.isEmpty() && !resultElements.text().equals('INFO-000')) throw new Error('Error code of resultElements: ' + resultElements.text());

      // 에러 코드 처리 2
      var headElements = doc.select('head > RESULT > CODE');
      if (!headElements.isEmpty() && !headElements.text().equals('INFO-000')) throw new Error('Error code of headElements: ' + headElements.text());
      return doc.select('row');
    }
  }, {
    key: "getMeals",
    value: function getMeals(datetime) {
      var elements = this.connect('mealServiceDietInfo', [['MLSV_YMD', datetime.toString('YYMMDD')]]);
      var meals = [null, null, null];
      for (var i = 0; i < elements.length; i++) {
        var element = elements.get(i);
        var mealType = String(element.select('MMEAL_SC_CODE').text());
        meals[mealType - 1] = String(element.select('DDISH_NM').text()).split(/ (?:\(\d+\.?(?:.\d+)*\))?(?:<br\/>|$)/g).filter(Boolean);
      }
      return meals;
    }
  }, {
    key: "getEvents",
    value: function getEvents() {}
  }]);
}();
exports.Connection = Connection;