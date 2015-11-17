describe('CN Util Test', function() {
  var cnUtil;

  beforeEach(function() {
    module('cn.util');
  });

  beforeEach(inject(function($injector) {
    cnUtil = $injector.get('cnUtil');
  }));

  describe('getModified', function() {
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
  });

  describe('inheritCommon', function() {
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
  });

  describe('constructErrorMessageAsHtml', function(){
    var deliveryStatus = {
      errors:[
        {description: 'An error'}
      ]
    };
    it('should have an html p tag at the beginning', function(){
      dump(cnUtil.constructErrorMessageAsHtml(deliveryStatus.errors))
      expect(/^<p class="cn-error">/.test(cnUtil.constructErrorMessageAsHtml(deliveryStatus.errors))).toBe(true);
    });
    it('should have an html p tag at the end', function(){
      expect(/<\/p>$/.test(cnUtil.constructErrorMessageAsHtml(deliveryStatus.errors))).toBe(true);
    });
  });

  describe('constructPopoverHtml', function(){
    var objectArray;
    beforeEach(function(){
      objectArray = [
        {name: 'test 1', id: 1},
        {name: 'test 2', id: 2}
      ];
    })

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
  });


});