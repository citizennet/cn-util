(function() {
  'use strict';
  /**
   * Definition for the cn.model module
   */
  angular.module('cn.util', [])
      .factory('cnUtil', function() {
        let removeStretegies = {
          'delete': (obj, key) => {delete obj[key];},
          'null': (obj, key) => {obj[key] = null;}
        };

        window.cnUtil = {
          cleanModel,
          cleanModelVal,
          cleanEmptyJson,
          diff,
          getModified,
          inheritCommon,
          extend,
          constructErrorMessageAsHtml,
          constructPopoverHtml,
          equals
        };

        return {
          cleanModel,
          cleanModelVal,
          cleanEmptyJson,
          diff,
          getModified,
          inheritCommon,
          extend,
          constructErrorMessageAsHtml,
          constructPopoverHtml,
          equals
        };

        /////////

        function cleanModel(model) {
          _.each(model, cleanModelVal);
          return model;
        }

        function cleanModelVal(modelVal) {
          // if array,
          if(_.isArray(modelVal)) {
            modelVal.forEach(cleanModelVal);
          }
          else if(_.isObject(modelVal)) {
            _.each(modelVal, (val, key) => {
              if(val === null || val === undefined) delete modelVal[key];
              else if(_.isArray(val)) val.forEach(cleanModelVal);
              else if(_.isObject(val)) cleanModelVal(val);
            });
          }
          //return modelVal;
        }

        function diff(original, current, deep, removeStrategy) {
          return getModified(original, current, removeStrategy, !deep);
        }

        function getModified(original, copy, removeStrategy, shallow) {
          //console.log('getModified:', removeStrategy, shallow);
          let removeHandler = removeStretegies[removeStrategy] || removeStretegies[null];
          let eq = shallow ? equals : angular.equals;

          // console.log('copy, original:', shallow, copy, original, eq(original, copy));
          if(eq(original, copy)) return;
          if(_.isObject(copy) && !_.isArray(copy)) {
            let modified = {};
            _.each(copy, (val, key) => {
              if(shallow) {
                if(!eq(val, original[key])) {
                  modified[key] = cleanEmptyJson(val, original[key]);
                }
              }
              else {
                let tmp = original[key] ? getModified(original[key], val, removeStrategy) : val;
                if(tmp !== undefined && !eq(original[key], tmp)) modified[key] = tmp;
              }
            });
            _.each(original, (val, key) => {
              if(val && (copy[key] === null || copy[key] === undefined)) {
                removeHandler(modified, key);
              }
            });
            return _.isEmpty(modified) ? undefined : modified;
          }
          return copy;
        }

        function cleanEmptyJson(copy, original) {
          if(_.isArray(copy)) {
            return _.map(copy, (x, i) => cleanEmptyJson(x, original ? original[i] : undefined));
          }
          if(_.isObject(copy)) {
            let ret = {}, k, v, a, b;
            for(k in copy) {
              a = copy[k];
              b = _.nth(original, k);
              if(!_.isFalsy(a) || (a === false && a !== b)) {
                v = cleanEmptyJson(a, b);
                if(!_.isUndefined(v)) ret[k] = v;
              }
            }
            return _.isEmpty(ret) ? undefined : ret;
          }
          return copy;
        }

        /* Ripping off angular.equals but treating empty array and undefined/null as equal */
        function equals(a, b) {
          if(a === b || (_.isFalsy(a) && _.isFalsy(b))) return true;
          let ta = typeof a, tb = typeof b, l, k, ks;
          if(ta === tb && ta === 'object') {
            if(_.isArray(a)) {
              if(!_.isArray(b)) return false;
              if((l = a.length) === b.length) {
                for(k = 0; k < l; k++) {
                  if(!equals(a[k], b[k])) return false;
                }
                return true;
              }
            }
            else if(_.isDate(a)) {
              return _.isDate(b) && equals(a.getTime(), b.getTime());
            }
            else if(_.isRegExp(a)) {
              return _.isRegExp(b) && a.toString() === b.toString();
            }
            else {
              if(_.isArray(b) || _.isDate(b) || _.isRegExp(b)) return false;
              ks = Object.create(null);
              for(k in a) {
                if(k.charAt(0) === '$' || _.isFunction(a[k])) continue;
                if(!equals(a[k], b[k])) return false;
                if(!_.isFalsy(a[k])) ks[k] = true;
              }
              for(k in b) {
                if(!(k in ks) &&
                    k.charAt(0) !== '$' &&
                    !_.isFalsy(b[k]) &&
                    !_.isFunction(b[k])) return false;
              }
              return true;
            }
          }
          return false;
        }

        function inheritCommon(from, to) {
          _.each(to, function(val, key) {
            if(key in from) {
              val = from[key];
              if(_.isObject(val) && !_.isArray(val) && to[key]) {
                to[key] = inheritCommon(val, to[key]);
              }
              else {
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
          errors.forEach(function(error) {
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
          objectsArray.forEach(function(object) {
            object.popoverHtml = '<p class="popover-text">Name: ' + object[nameKey] + '</p>' + '<p class="popover-text">ID: ' + object[idKey] + '</p>';
          });
          return objectsArray;
        }
      });
})();
