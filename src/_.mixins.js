(function() {
  'use strict';

  /**
   * Some useful util functions to add to lodash/underscore
   *
   * author: dzuch
   */

  _.mixin({
    allEqual,
    empty,
    add,
    subtract,
    multiply,
    divide,
    round,
    floor,
    ceil,
    percentage,
    isFalsy,
    isTrulyEmpty,
    /* deprecate if upgrading lodash to v4 */
    nth,

    /* TODO: remove this, not needed and can achieve with lodash
     * Override lodash's range to allow high to low ranges
     */
    range,
    titleCase
  });

  ////////

  function nth(array, n) {
    if(array && array.length) {
      let l = array.length;
      n += n < 0 ? l : 0;
      if(n > l) return array[n];
    }
  }

  function isFalsy(x) {
    if(!x) return true;
    if(_.isObject(x)) {
      if(_.isDate(x) || _.isRegExp(x)) return false;
      if(_.isEmpty(x)) return true;
      return _.every(x, _.isFalsy);
    }
    return false;
  }

  function isTrulyEmpty(x, ...emptyVals) {
    return (
      x === undefined ||
      _.some(emptyVals, v => x === v) ||
      _.isObject(x) && !x.length && _.every(x, y => _.isTrulyEmpty(y, ...emptyVals))
    );
  }

  function allEqual(vals) {
    let first = _.first(vals);
    if(_.isArray(first) && !_.isObject(_.first(first))) {
      return _.allEqual(vals.map(v => JSON.stringify(v)));
    }
    if(_.isObject(first)) {
      return _.all(vals, first);
    }
    return _.uniq(vals).length === 1;
  }

  function empty(obj) {
    if(_.isArray(obj)) {
      obj.length = 0;
      return obj;
    }
    _.each(obj, function(val, key) {
      delete obj[key];
    });
    return obj;
  }

  function add(x) {
    x = _.isArray(x) ? x : [].slice.call(arguments);

    return _.reduce(x, function(a, b) {
      a = parseFloat(a);
      b = parseFloat(b);
      return (Math.round(a * 100) + Math.round(b * 100)) / 100;
    });
  }

  function subtract(x) {
    x = _.isArray(x) ? x : [].slice.call(arguments);

    return _.reduce(x, function(a, b) {
      a = parseFloat(a);
      b = parseFloat(b);
      return (Math.round(a * 100) - Math.round(b * 100)) / 100;
    });
  }

  function multiply(x) {
    x = _.isArray(x) ? x : [].slice.call(arguments);

    return _.reduce(x, function(a, b) {
      a = parseFloat(a);
      b = parseFloat(b);
      return (Math.round(a * 100) * Math.round(b * 100)) / 10000;
    });
  }

  function divide(x) {
    x = _.isArray(x) ? x : [].slice.call(arguments);

    return _.reduce(x, function(a, b) {
      a = parseFloat(a);
      b = parseFloat(b);
      return (Math.round(a * 100) / Math.round(b * 100));
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
    if(!overflow) {
      if(result > 100) result = 100;
      else if(result < 0) result = 0;
    }
    return result;
  }

  function range(start, end) {
    start = Number(start);
    end = Number(end);
    var result = [],
        dir = (start <= end) ? 1 : -1;
    //end = end + dir;
    while(start !== end) {
      result.push(start);
      start += dir;
    }
    return result;
  }

  function titleCase(str) {
    return _.flow(
      _.words,
      _.partial(_.map, _, _.capitalize),
      w => w.join(" ")
    )(str);
  }

})();
