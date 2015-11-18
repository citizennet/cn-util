(function() {
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

})();
