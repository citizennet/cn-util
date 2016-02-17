'use strict';

(function () {
  'use strict';

  /**
   * Some useful util functions to add to lodash/underscore
   *
   * author: dzuch
   */

  _.mixin({
    empty: empty,
    add: add,
    subtract: subtract,
    multiply: multiply,
    divide: divide,
    round: round,
    floor: floor,
    ceil: ceil,
    percentage: percentage,

    /* TODO: remove this, not needed and can achieve with lodash
     * Override lodash's range to allow high to low ranges
     */
    range: range
  });

  ////////

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
})();
'use strict';

(function () {
  'use strict';
  /**
   * Definition for the cn.model module
   */

  angular.module('cn.util', []).factory('cnUtil', function () {
    return {
      diff: diff,
      getModified: getModified,
      inheritCommon: inheritCommon,
      extend: extend,
      constructErrorMessageAsHtml: constructErrorMessageAsHtml,
      constructPopoverHtml: constructPopoverHtml
    };

    /////////

    function diff(original, current, shallow, removeStrategy) {
      console.log('shallow:', shallow);
      return getModified(original, current, removeStrategy || 'model', shallow);
    }

    function getModified(original, copy, removeStrategy, shallow) {
      //console.log('getModified:', removeStrategy, shallow);
      var removeStretegies = {
        'delete': function _delete(obj, key) {
          delete obj[key];
        },
        'null': function _null(obj, key) {
          obj[key] = null;
        }
      };
      var removeHandler = removeStretegies[removeStrategy] || removeStretegies[null];
      if (removeStrategy === 'model') removeStrategy = 'delete';

      if (angular.equals(original, copy)) {
        return;
      } else if (_.isArray(copy) || !_.isObject(copy)) {
        return copy;
      }
      var modified = {};
      _.each(copy, function (val, key) {
        if (shallow) {
          if (!angular.equals(val, original[key])) modified[key] = val;
        } else {
          var tmp = original[key] ? getModified(original[key], val, removeStrategy) : val;
          if (tmp !== undefined && !angular.equals(original[key], tmp)) modified[key] = tmp;
        }
      });
      _.each(original, function (val, key) {
        if (val && (copy[key] === null || copy[key] === undefined)) removeHandler(modified, key);
      });
      if (!_.isEmpty(modified)) return modified;
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