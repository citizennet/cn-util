"use strict";

(function () {
  'use strict';

  /**
   * Some useful util functions to add to lodash/underscore
   *
   * author: dzuch
   */

  _.mixin({
    allEqual: allEqual,
    empty: empty,
    add: add,
    subtract: subtract,
    multiply: multiply,
    divide: divide,
    round: round,
    floor: floor,
    ceil: ceil,
    percentage: percentage,
    isFalsy: isFalsy,
    isTrulyEmpty: isTrulyEmpty,
    /* deprecate if upgrading lodash to v4 */
    nth: nth,

    /* TODO: remove this, not needed and can achieve with lodash
     * Override lodash's range to allow high to low ranges
     */
    range: range,
    titleCase: titleCase
  });

  ////////

  function nth(array, n) {
    if (array && array.length) {
      var l = array.length;
      n += n < 0 ? l : 0;
      if (n > l) return array[n];
    }
  }

  function isFalsy(x) {
    if (!x) return true;
    if (_.isObject(x)) {
      if (_.isDate(x) || _.isRegExp(x)) return false;
      if (_.isEmpty(x)) return true;
      var falsy = true;
      for (var k in x) {
        if (!_.isFalsy(x[k])) falsy = false;
      }
      return falsy;
    }
    return false;
  }

  function isTrulyEmpty(x) {
    return x === undefined || _.isObject(x) && _.isEmpty(x);
  }

  function allEqual(vals) {
    var first = _.first(vals);
    if (_.isArray(first) && !_.isObject(_.first(first))) {
      return _.allEqual(vals.map(function (v) {
        return JSON.stringify(v);
      }));
    }
    if (_.isObject(first)) {
      return _.all(vals, first);
    }
    return _.uniq(vals).length === 1;
  }

  function empty(obj) {
    if (_.isArray(obj)) {
      obj.length = 0;
      return obj;
    }
    _.each(obj, function (val, key) {
      delete obj[key];
    });
    return obj;
  }

  function add(x) {
    x = _.isArray(x) ? x : [].slice.call(arguments);

    return _.reduce(x, function (a, b) {
      a = parseFloat(a);
      b = parseFloat(b);
      return (Math.round(a * 100) + Math.round(b * 100)) / 100;
    });
  }

  function subtract(x) {
    x = _.isArray(x) ? x : [].slice.call(arguments);

    return _.reduce(x, function (a, b) {
      a = parseFloat(a);
      b = parseFloat(b);
      return (Math.round(a * 100) - Math.round(b * 100)) / 100;
    });
  }

  function multiply(x) {
    x = _.isArray(x) ? x : [].slice.call(arguments);

    return _.reduce(x, function (a, b) {
      a = parseFloat(a);
      b = parseFloat(b);
      return Math.round(a * 100) * Math.round(b * 100) / 10000;
    });
  }

  function divide(x) {
    x = _.isArray(x) ? x : [].slice.call(arguments);

    return _.reduce(x, function (a, b) {
      a = parseFloat(a);
      b = parseFloat(b);
      return Math.round(a * 100) / Math.round(b * 100);
    });
  }

  function round(x, p) {
    p = Math.pow(10, p || 0);
    return Math.round(parseFloat(x) * p) / p;
  }

  function floor(x, p) {
    p = Math.pow(10, p || 0);
    return Math.floor(parseFloat(x) * p) / p;
  }

  function ceil(x, p) {
    p = Math.pow(10, p || 0);
    return Math.ceil(parseFloat(x) * p) / p;
  }

  function percentage(a, b, overflow) {
    var result = _.round(100 * a / b);
    if (!overflow) {
      if (result > 100) result = 100;else if (result < 0) result = 0;
    }
    return result;
  }

  function range(start, end) {
    start = Number(start);
    end = Number(end);
    var result = [],
        dir = start <= end ? 1 : -1;
    //end = end + dir;
    while (start !== end) {
      result.push(start);
      start += dir;
    }
    return result;
  }

  function titleCase(str) {
    return _.flow(_.words, _.partial(_.map, _, _.capitalize), function (w) {
      return w.join(" ");
    })(str);
  }
})();
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

(function () {
  'use strict';
  /**
   * Definition for the cn.model module
   */

  angular.module('cn.util', []).factory('cnUtil', function () {
    var removeStretegies = {
      'delete': function _delete(obj, key) {
        delete obj[key];
      },
      'null': function _null(obj, key) {
        obj[key] = null;
      }
    };

    return {
      buildParams: buildParams,
      buildSref: buildSref,
      cleanModel: cleanModel,
      cleanModelVal: cleanModelVal,
      cleanEmptyJson: cleanEmptyJson,
      diff: diff,
      getModified: getModified,
      inheritCommon: inheritCommon,
      extend: extend,
      constructErrorMessageAsHtml: constructErrorMessageAsHtml,
      constructPopoverHtml: constructPopoverHtml,
      equals: equals
    };

    /////////

    function buildParams() {
      for (var _len = arguments.length, params = Array(_len), _key = 0; _key < _len; _key++) {
        params[_key] = arguments[_key];
      }

      if (!params[0]) return '';
      if (_.isArray(params[0])) params = params[0];

      if (params.length > 1) {
        params = params.reduceRight(function (prev, cur) {
          return _.assign(prev, cur);
        }, {});
      } else params = params[0];
      return _.isString(params) ? params : angular.toJson(params);
    }

    function buildSref(state) {
      for (var _len2 = arguments.length, params = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        params[_key2 - 1] = arguments[_key2];
      }

      return state + '(' + buildParams.apply(undefined, params) + ')';
    }

    function cleanModel(model) {
      _.each(model, cleanModelVal);
      return model;
    }

    function cleanModelVal(modelVal) {
      // if array,
      if (_.isArray(modelVal)) {
        modelVal.forEach(cleanModelVal);
      } else if (_.isObject(modelVal)) {
        _.each(modelVal, function (val, key) {
          if (val === null || val === undefined) delete modelVal[key];else if (_.isArray(val)) val.forEach(cleanModelVal);else if (_.isObject(val)) cleanModelVal(val);
        });
      }
    }

    function diff(original, current, deep, removeStrategy) {
      return getModified(original, current, removeStrategy, !deep);
    }

    function getModified(original, copy, removeStrategy, shallow) {
      var removeHandler = removeStretegies[removeStrategy] || removeStretegies[null];
      var eq = shallow ? equals : angular.equals;

      if (eq(original, copy)) return;
      if (_.isObject(copy) && !_.isArray(copy)) {
        var modified = {};
        _.each(copy, function (val, key) {
          if (shallow) {
            if (!eq(val, original[key])) {
              modified[key] = cleanEmptyJson(val, original[key]);
            }
          } else {
            var tmp = original[key] ? getModified(original[key], val, removeStrategy) : val;
            if (tmp !== undefined && !eq(original[key], tmp)) modified[key] = tmp;
          }
        });
        _.each(original, function (val, key) {
          if (val && (copy[key] === null || copy[key] === undefined)) {
            removeHandler(modified, key);
          }
        });
        return _.isEmpty(modified) ? undefined : modified;
      }
      return copy;
    }

    function cleanEmptyJson(copy, original) {
      if (_.isArray(copy)) {
        return _.map(copy, function (x, i) {
          return cleanEmptyJson(x, original ? original[i] : undefined);
        });
      }
      if (_.isObject(copy)) {
        var ret = {},
            k = void 0,
            v = void 0,
            a = void 0,
            b = void 0;
        for (k in copy) {
          a = copy[k];
          b = _.nth(original, k);
          if (!_.isFalsy(a) || a === false && a !== b) {
            v = cleanEmptyJson(a, b);
            if (!_.isUndefined(v)) ret[k] = v;
          }
        }
        return _.isEmpty(ret) ? undefined : ret;
      }
      return copy;
    }

    /* Ripping off angular.equals but treating empty array and undefined/null as equal */
    function equals(a, b) {
      if (a === b || _.isFalsy(a) && _.isFalsy(b)) return true;
      var ta = typeof a === 'undefined' ? 'undefined' : _typeof(a),
          tb = typeof b === 'undefined' ? 'undefined' : _typeof(b),
          l = void 0,
          k = void 0,
          ks = void 0;
      if (ta === tb && ta === 'object' && _.isObject(a) && _.isObject(b)) {
        if (_.isArray(a)) {
          if (!_.isArray(b)) return false;
          if ((l = a.length) === b.length) {
            for (k = 0; k < l; k++) {
              if (!equals(a[k], b[k])) return false;
            }
            return true;
          }
        } else if (_.isDate(a)) {
          return _.isDate(b) && equals(a.getTime(), b.getTime());
        } else if (_.isRegExp(a)) {
          return _.isRegExp(b) && a.toString() === b.toString();
        } else {
          if (_.isArray(b) || _.isDate(b) || _.isRegExp(b)) return false;
          ks = Object.create(null);
          for (k in a) {
            if (k.charAt(0) === '$' || _.isFunction(a[k])) continue;
            if (!equals(a[k], b[k])) return false;
            if (!_.isFalsy(a[k])) ks[k] = true;
          }
          for (k in b) {
            if (!(k in ks) && k.charAt(0) !== '$' && !_.isFalsy(b[k]) && !_.isFunction(b[k])) return false;
          }
          return true;
        }
      }
      return false;
    }

    function inheritCommon(from, to) {
      _.each(to, function (val, key) {
        if (key in from) {
          val = from[key];
          if (_.isObject(val) && !_.isArray(val) && to[key]) {
            to[key] = inheritCommon(val, to[key]);
          } else {
            to[key] = val;
          }
        }
      });
      return to;
    }

    function extend(base, sub) {
      // Avoid instantiating the base class just to setup inheritance
      // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/create
      // for a polyfill
      // Also, do a recursive merge of two prototypes, so we don't overwrite
      // the existing prototype, but still maintain the inheritance chain
      // Thanks to @ccnokes
      var ogProto = sub.prototype;
      sub.prototype = Object.create(base.prototype);
      _.extend(sub.prototype, ogProto);
      // Remember the constructor property was set wrong, let's fix it
      sub.prototype.constructor = sub;
      // In ECMAScript5+ (all modern browsers), you can make the constructor property
      // non-enumerable if you define it like this instead
      Object.defineProperty(sub.prototype, 'constructor', {
        enumerable: false,
        value: sub
      });
    }

    /**
     * Used to build an HTML representation of the description keys in the errors array.
     * See: API call GET /campaigns/:id/subCampaigns/status<
     *
     * Sample HTML <p>One error<br/>Another error</p>
     *
     * @param errors{array}
     * @returns {string}
     */
    function constructErrorMessageAsHtml(errors) {
      var errorMessage = '';
      errors.forEach(function (error) {
        errorMessage = errorMessage + '<p class="cn-error">' + error.description + '</p>';
      });
      return errorMessage;
    }

    /**
     * Used to append a popoverHtml key on the objects (campaigns, adSets, ads)
     * that contains the name and id of the object so it can be show in in the popover
     *
     * @param objectsArray
     * @param nameKey
     * @param idKey
     * @returns {*}
     */
    function constructPopoverHtml(objectsArray, nameKey, idKey) {
      objectsArray.forEach(function (object) {
        object.popoverHtml = '<p class="popover-text">Name: ' + object[nameKey] + '</p>' + '<p class="popover-text">ID: ' + object[idKey] + '</p>';
      });
      return objectsArray;
    }
  });
})();