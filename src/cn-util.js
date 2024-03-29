(function() {
  'use strict';
  /**
   * Definition for the cn.model module
   */
  angular.module('cn.util', [])
      .factory('cnUtil', ['$rootScope', 'cnSession', 'EVENTS', function($rootScope, cnSession, EVENTS) {
        let removeStretegies = {
          'delete': (obj, key) => {delete obj[key];},
          'null': (obj, key) => {obj[key] = null;}
        };

        let user = cnSession.getUser();

        return {
          buildParams,
          buildSref,
          cleanModel,
          cleanModelVal,
          cleanEmptyJson,
          diff,
          getModified,
          inheritCommon,
          extend,
          constructErrorMessageAsHtml,
          constructPopoverHtml,
          equals,
          convertToLocalTime,
          convertToPtTime,
          processDateTime,
        };

        /////////

        function buildParams(...params) {
          if(!params[0]) return '';
          if(_.isArray(params[0])) params = params[0];

          if(params.length > 1) {
            params = params.reduceRight((prev, cur) => _.assign(prev, cur), {});
          }
          else params = params[0];
          return _.isString(params) ? params : angular.toJson(params);
        }

        function buildSref(state, ...params) {
          return `${state}(${buildParams(...params)})`;
        }

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
        }

        function diff(original, current, deep, removeStrategy) {
          const modified = getModified(original, current, removeStrategy, !deep);
          // mutate modified
          processDateTime(modified, original);
          return modified;
        }

        function getModified(original, copy, removeStrategy, shallow) {
          let removeHandler = removeStretegies[removeStrategy] || removeStretegies[null];
          let eq = shallow ? equals : angular.equals;

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
                let tmp = original[key] ?
                    getModified(original[key], val, removeStrategy) :
                    val;
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
            return _.map(
              copy,
              (x, i) => cleanEmptyJson(x, original ? original[i] : undefined)
            );
          }
          if(_.isObject(copy)) {
            let ret = {}, k, v, a, b;
            for(k in copy) {
              a = copy[k];
              b = _.get(original, k);
              if(!_.isTrulyEmpty(a, null)) {
                v = cleanEmptyJson(a, b);
                if(!_.isUndefined(v)) ret[k] = v;
              }
            }
            return _.isEmpty(ret) ? undefined : ret;
          }
          return copy;
        }

        function undefinedAndFalsy(a, b) {
          return (
            (a === undefined || b === undefined) &&
            (a === false || a === 0 || b === false || b === 0)
          );
        }

        /* Ripping off angular.equals but treating empty array and undefined/null as equal */
        function equals(a, b) {
          if(a === b ||
             (_.isTrulyEmpty(a, null) &&
              _.isTrulyEmpty(b, null) &&
              !undefinedAndFalsy(a, b))
            ) return true;
          let ta = typeof a, tb = typeof b, l, k, ks;
          if(ta === tb && ta === 'object' && _.isObject(a) && _.isObject(b)) {
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
                if(!_.isTrulyEmpty(a[k], null)) ks[k] = true;
              }
              for(k in b) {
                if(!(k in ks) &&
                    k.charAt(0) !== '$' &&
                    !_.isTrulyEmpty(b[k], null) &&
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

        /**
         * convert given datetime string to local time from PT time
         *
         * @param ptTime: string
         * @returns localTime: string
         */
        function convertToLocalTime(ptTime) {
          if (!ptTime) return;
          
          if (!moment(ptTime, 'YYYY-MM-DD HH:mm:ss').isValid()) {
            throw `Invalid datetime string detected: ${ptTime}`;
          }

          let dateInPT;
          let localTime;
          
          if (user.timezone) {
            dateInPT = moment.tz(ptTime, "YYYY-MM-DD HH:mm:ss", "America/Los_Angeles");
            localTime = dateInPT.tz(user.timezone).format('YYYY-MM-DD HH:mm:ss');
            return localTime;
          }
          dateInPT = new Date(ptTime + " UTC-8");
          localTime = dateInPT.toLocaleString();

          return localTime;
        }

        /**
         * modified start and end time in the model
         * @param campaign: vm.model
         * @returns campaign: vm.model
         */
        function convertToPtTime(campaign) {
          try {
            if(campaign.startDate && campaign.stopDate) {
              campaign.startDate = convertToPtTimeString(campaign.startDate);
              campaign.stopDate = convertToPtTimeString(campaign.stopDate);
            } else if(campaign.startTime && campaign.endTime) {
              campaign.startTime = convertToPtTimeString(campaign.startTime);
              campaign.endTime = convertToPtTimeString(campaign.endTime);
            }
            return campaign;
          } catch (error) {
            $rootScope.$broadcast(EVENTS.notify, error);
          }
        }

        /**
         * @param localTime: string
         * @returns ptTime: string
         */
        function convertToPtTimeString (localTime) {
          if (!localTime || !moment(localTime, 'YYYY-MM-DD HH:mm:ss').isValid()) {
            throw `Invalid datetime string detected: ${localTime}`;
          }
          const dateInLocal = moment.tz(localTime , "YYYY-MM-DD HH:mm:ss", user.timezone);
          return dateInLocal.tz("America/Los_Angeles").format('YYYY-MM-DD HH:mm:ss');
        }

        function processDateTime(modified, original) {
          const datetimeKeys = ['startDate', 'stopDate', 'startTime', 'endTime'];
  
          for (let key in modified) {
            // if (typeof modified[key] === 'object' && modified[key] !== null) {
            //   processDateTime(modified[key], original[key]);
            // }
            
            if (datetimeKeys.includes(key)) {
              const ptTime = convertToPtTimeString(modified[key]);
              const originalPtTime = original[key];
              if (ptTime === originalPtTime) {
                console.log("datetime not changed");
                delete modified[key];
              }
            }
          }
        }
      }]);
})();
