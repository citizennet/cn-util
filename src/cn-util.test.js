ngDescribe({
  name: 'isTrulyEmpty',
  tests: function() {
    it('should check if argument is empty', function() {
      expect(_.isTrulyEmpty(undefined)).toEqual(true);
      expect(_.isTrulyEmpty(null)).toEqual(false);
      expect(_.isTrulyEmpty(false)).toEqual(false);
      expect(_.isTrulyEmpty([])).toEqual(true);
      expect(_.isTrulyEmpty({})).toEqual(true);
      expect(_.isTrulyEmpty(123)).toEqual(false);
      expect(_.isTrulyEmpty('abc')).toEqual(false);
      expect(_.isTrulyEmpty([1,2,3])).toEqual(false);
      expect(_.isTrulyEmpty({foo: 'bar'})).toEqual(false);
    });
  }
})({
  name: 'allEqual',
  tests: function() {
    it('should check if all array values are the same', function() {
      expect(_.allEqual([1, 2, 1])).toEqual(false);
      expect(_.allEqual([1, 1, 1])).toEqual(true);
      expect(_.allEqual(["foo", "bar"])).toEqual(false);
      expect(_.allEqual(["foo", "foo"])).toEqual(true);
    });
    it('should check if all collection values are the same', function() {
      expect(_.allEqual([{foo: 1}, {foo: 2}, {foo: 1}])).toEqual(false);
      expect(_.allEqual([{foo: 1, bar: 2}, {foo: 1, bar: 2}, {foo: 1, bar: 2}])).toEqual(true);
      expect(_.allEqual([["foo"], ["bar"]])).toEqual(false);
      expect(_.allEqual([["foo"], ["foo"]])).toEqual(true);
      expect(_.allEqual([[{foo: "foo"}], [{foo: "bar"}]])).toEqual(false);
      expect(_.allEqual([[{foo: "foo"}, {foo: "bar"}], [{foo: "foo"}, {foo: "bar"}]])).toEqual(true);
    });
  }
})({
  name: 'cleanModel',
  modules: 'cn.util',
  tests: function(cnUtil) {
    it('should remove `null` keys from non-root level fields', function() {
      expect(cnUtil.cleanModel({
        foo: null,
        foz: false,
        bar: [{foo: 1, bar: null}],
        baz: {
          doo: [{foo: 1, bar: null}, {foo: 1, bar: null}],
          far: null,
          faz: {foo: 2, bar: null}
        }
      })).toEqual({
        foo: null,
        foz: false,
        bar: [{foo: 1}],
        baz: {
          doo: [{foo: 1}, {foo: 1}],
          faz: {foo: 2}
        }
      });
    });
  }
})({
  name: 'getModified',
  modules: 'cn.util',
  tests: function(cnUtil) {
    it('should return nothing for identical objects', function() {
      expect(cnUtil.getModified(1, 1)).toBeUndefined();
      expect(cnUtil.getModified([1, 2], [1, 2])).toBeUndefined();
      expect(cnUtil.getModified({foo: 1}, {foo: 1})).toBeUndefined();
      expect(cnUtil.getModified({foo: [1, 2, 3]}, {foo: [1, 2, 3]})).toBeUndefined();
      expect(cnUtil.getModified(
          {foo: {bar: [1, 2, 3], baz: 'foo'}},
          {foo: {bar: [1, 2, 3], baz: 'foo'}}
      )).toBeUndefined();
    });

    it('should return only differing values', function() {
      expect(cnUtil.getModified(1, 2)).toBe(2);
      expect(cnUtil.getModified([1, 2], [1, 3])).toEqual([1, 3]);
      expect(cnUtil.getModified({foo: 1}, {foo: 2})).toEqual({foo: 2});
      expect(cnUtil.getModified({foo: 1}, {foo: 1, bar: 2})).toEqual({bar: 2});
      expect(cnUtil.getModified({foo: 1, bar: 1}, {foo: 1, bar: 2})).toEqual({bar: 2});
      expect(cnUtil.getModified({foo: [1, 2, 3]}, {foo: [1, 2, 4]})).toEqual({foo: [1, 2, 4]});
      expect(cnUtil.getModified(
          {foo: {bar: [1, 2, 3], baz: 'foo'}},
          {foo: {bar: [1, 2, 3], baz: 'bar'}}
      )).toEqual({foo: {baz: 'bar'}});
      expect(cnUtil.getModified(
          {foo: {bar: [1, 2, 4], baz: 'foo'}},
          {foo: {bar: [1, 2, 3], baz: 'foo'}}
      )).toEqual({foo: {bar: [1, 2, 3]}});
      expect(cnUtil.getModified(
          {foo: {bar: [1, 2, 3], baz: 'foo'}},
          {foo: {bar: [1, 2, 3], baz: 'foo', biz: 1}, bar: 2}
      )).toEqual({foo: {biz: 1}, bar: 2});
      expect(cnUtil.getModified(
          {foo: {bar: {baz: [1, 2, 3], biz: 1, buz: 'two'}}},
          {foo: {bar: {baz: [1, 2, 4], biz: 1, buz: 'three'}}}
      )).toEqual({foo: {bar: {baz: [1, 2, 4], buz: 'three'}}});
      expect(cnUtil.getModified(
          {}, {foo: {bar: {baz: [1, 2, 3]}}}
      )).toEqual({foo: {bar: {baz: [1, 2, 3]}}});
    });

    it('should return null for deleted values', function() {
      expect(cnUtil.getModified(
          {foo: {bar: {baz: [1, 2, 3], biz: 1, buz: 'two'}}},
          {foo: {bar: {baz: [1, 2, 3]}}}
      )).toEqual({foo: {bar: {biz: null, buz: null}}});
      expect(cnUtil.getModified(
          {foo: {bar: {baz: [1, 2, 3]}}, biz: 1, buz: 'two'},
          {foo: {bar: {baz: [1, 2, 3]}}}
      )).toEqual({biz: null, buz: null});
      expect(cnUtil.getModified(
          {foo: 2, biz: 1, buz: 'two'},
          {foo: 3},
          'delete'
      )).toEqual({foo: 3});
      expect(cnUtil.getModified(
          {foo: 2, biz: 1, buz: 'two'},
          {foo: 2},
          'delete'
      )).toBeUndefined();
    });
  }
})({
  name: 'diff',
  modules: 'cn.util',
  tests: function(cnUtil) {
    it('should use shallow diff and `null` remove strategy by default', function() {
      expect(cnUtil.diff(
          {foo: 1, bar: 2, baz: {doo: 3, far: 4, faz: {foo: 1, bar: 2}}},
          {foo: 1, baz: {doo: 2, far: null, faz: {foo: 2, bar: null}}}
      )).toEqual({bar: null, baz: {doo: 2, faz: {foo: 2}}});

      expect(cnUtil.diff(
          {foo: 1, bar: {boo: false}},
          {foo: 2, bar: {boo: false, far: {a: undefined, b: undefined, c: undefined}}}
      )).toEqual({foo: 2});
    });
    it('should handle nested arrays/objects properly', function() {
      expect(cnUtil.diff(
          {foo: [1, 2, 3], bar: [{far: 1}, {far: 2}]},
          {foo: [1, 2, 3], bar: [{far: 1, boo: []}, {far: 2}]}
      )).toBeUndefined();

      expect(cnUtil.diff(
          {foo: [1, 2, 3], bar: [{far: 1}, {far: 2}]},
          {foo: [1, 2], bar: [{far: 1, boo: []}, {far: 1}]}
      )).toEqual({foo: [1, 2], bar: [{far: 1}, {far: 1}]});
    });
    it('should ignore empty arrays from previously undefined or null fields', function() {
      expect(cnUtil.diff(
          {foo: 1, bar: undefined, baz: null},
          {foo: 1, bar: [1, 2], baz: [1, 2]}
      )).toEqual({bar: [1, 2], baz: [1, 2]});

      expect(cnUtil.diff(
          {foo: 1, bar: undefined, baz: null, far: {foo: 1, bar: null}},
          {foo: 2, bar: [], baz: [], far: {foo: 1}}
      )).toEqual({foo: 2});
    });
    it('should recursively ignore empty fields', function() {
      expect(cnUtil.diff(
          {far: {foo: 1, bar: undefined, baz: null, boz: {}}, faz: 1},
          {far: {foo: 1, bar: [1, 2], baz: [1, 2], boz: [1]}, faz: 1}
      )).toEqual({far: {foo: 1, bar: [1, 2], baz: [1, 2], boz: [1]}});

      expect(cnUtil.diff(
          {far: {foo: 1, bar: undefined, baz: null, boz: {foo: []}}, faz: 1},
          {far: {foo: 1, bar: [], baz: [], boz: {foo: {}}}, faz: 2}
      )).toEqual({faz: 2});

      expect(cnUtil.diff(
          {far: {foo: 1, boz: {foo: {baz: []}}}, faz: 1},
          {far: {foo: 1, boz: {foo: {baz: {}}}}, faz: 2}
      )).toEqual({faz: 2});
    });
  }
})({
  name: 'inheritCommon',
  modules: 'cn.util',
  tests: function(cnUtil) {
    it('should return no inherited values', function() {
      expect(cnUtil.inheritCommon({foo: 1}, {bar: 1})).toEqual({bar: 1});
    });
    it('should return inherited values', function() {
      expect(cnUtil.inheritCommon({foo: 1}, {foo: 2})).toEqual({foo: 1});
      expect(cnUtil.inheritCommon({foo: 1, bar: 1}, {foo: 2})).toEqual({foo: 1});
      expect(cnUtil.inheritCommon({foo: 1}, {foo: 2, bar: 1})).toEqual({foo: 1, bar: 1});
      expect(cnUtil.inheritCommon({foo: [1]}, {foo: [2]})).toEqual({foo: [1]});
      expect(cnUtil.inheritCommon({foo: {foo: 1}}, {foo: {foo: 2}})).toEqual({foo: {foo: 1}});
      expect(cnUtil.inheritCommon({foo: {foo: 1}}, {foo: undefined})).toEqual({foo: {foo: 1}});
    });
  }
})({
  name: 'constructErrorMessageAsHtml',
  modules: 'cn.util',
  tests: function(cnUtil) {
    var deliveryStatus = {
      errors:[
        {description: 'An error'}
      ]
    };
    it('should have an html p tag at the beginning', function(){
      //dump(cnUtil.constructErrorMessageAsHtml(deliveryStatus.errors))
      expect(/^<p class="cn-error">/.test(cnUtil.constructErrorMessageAsHtml(deliveryStatus.errors))).toBe(true);
    });
    it('should have an html p tag at the end', function(){
      expect(/<\/p>$/.test(cnUtil.constructErrorMessageAsHtml(deliveryStatus.errors))).toBe(true);
    });
  }
})({
  name: 'constructPopoverHtml',
  modules: 'cn.util',
  tests: function(cnUtil) {
    var objectArray = [
      {name: 'test 1', id: 1},
      {name: 'test 2', id: 2}
    ];

    it('should return the array with a popoverHtml key on each object in the array', function(){
      objectArray = cnUtil.constructPopoverHtml(objectArray, 'name', 'id');
      objectArray.forEach(function(object){
        expect(object.hasOwnProperty('popoverHtml')).toBe(true);
      });
    });
    it('should have an html p tag at the beginning', function(){
      expect(/^<p class="popover-text">/.test(cnUtil.constructPopoverHtml(objectArray, 'name', 'id')[0].popoverHtml)).toBe(true);
    });
    it('should have an html p tag at the end', function(){
      expect(/<\/p>$/.test(cnUtil.constructPopoverHtml(objectArray, 'name', 'id')[0].popoverHtml)).toBe(true);
    });
  }
});