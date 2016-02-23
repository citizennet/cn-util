(function() {
  'use strict';
  /**
   * Definition for the cn.model module
   */
  angular.module('cn.util', [])
      .factory('cnUtil', function() {
        return {
          cleanModel,
          cleanModelVal,
          diff,
          getModified,
          inheritCommon,
          extend,
          constructErrorMessageAsHtml,
          constructPopoverHtml
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
          return modelVal;
        }

        function diff(original, current, deep, removeStrategy) {
          return getModified(original, current, removeStrategy, !deep);
        }

        function getModified(original, copy, removeStrategy, shallow) {
          //console.log('getModified:', removeStrategy, shallow);
          var removeStretegies = {
            'delete': (obj, key) => {delete obj[key]},
            'null': (obj, key) => {obj[key] = null}
          };
          var removeHandler = removeStretegies[removeStrategy] || removeStretegies[null];
          //if(removeStrategy === 'model') removeStrategy = 'delete';

          if(angular.equals(original, copy)) {
            return;
          } else if(_.isArray(copy) || !_.isObject(copy)) {
            return copy;
          }
          var modified = {};
          _.each(copy, function(val, key) {
            if(shallow) {
              if(!angular.equals(val, original[key])) modified[key] = val;
            }
            else {
              var tmp = original[key] ? getModified(original[key], val, removeStrategy) : val;
              if(tmp !== undefined && !angular.equals(original[key], tmp)) modified[key] = tmp;
            }
          });
          _.each(original, function(val, key) {
            if(val && (copy[key] === null || copy[key] === undefined)) removeHandler(modified, key);
          });
          if(!_.isEmpty(modified)) return modified;
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
