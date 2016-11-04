import Focss from '../../src';
var fox;

function insertSpecs(selector) {
  it(selector + ' affects existing elements', function() {
    affix(selector);

    fox.insert(selector, {
      'max-width': 'width'
    });

    fox.process({ width: 100 });

    expect($(selector).css('max-width')).toBe('100px');
  });

  it(selector + ' affects new elements', function() {
    fox.insert(selector, {
      'max-width': 'width'
    });

    fox.process({ width: 100 });

    affix(selector);

    expect($(selector).css('max-width')).toBe('100px');
  });

  it(selector + ' affects existing elements with newly inserted and processed rule', function() {
    affix(selector);

    fox.insert(selector, {
      'max-width': 'width'
    });
    fox.process({ width: 100 });

    expect($(selector).css('max-width')).toBe('100px');
  });

  it(selector + ' affects new elements with newly inserted and processed rule', function() {
    fox.insert(selector, {
      'max-width': 'width'
    });
    fox.process({ width: 100 });

    affix(selector);

    expect($(selector).css('max-width')).toBe('100px');
  });
}

describe('static rules', function() {
  beforeEach(function() {
    fox = new Focss();
  });

  afterEach(function() {
    fox.destroy();
    fox = null;
  });

  describe('id selectors', function() {
    insertSpecs('#foo');
  });

  describe('class selectors', function() {
    insertSpecs('.bar');
    insertSpecs('.foo.bar.baz');
  });

  describe('descendant selectors', function() {
    insertSpecs('div span ul li');
  });

  describe('direct descendant selectors', function() {
    insertSpecs('foo > bar > baz');
  });

  describe('attribute selectors', function() {
    insertSpecs('div[data-bind="my_item"]');
  });

  describe('sibling positional selectors', function() {
    insertSpecs('div h1+h2');
  });

  describe('tag selectors', function() {
    insertSpecs('article#foo');
    insertSpecs('section.bar');
  });

  describe('vendor-prefixed selectors', function() {
    it('rules that contain the incorrect vendor prefix are ignored', function() {
      affix('input');

      var incorrectPrefix = navigator.userAgent.toLowerCase().indexOf('webkit') > -1 ? 'moz' : 'webkit';
      var selector = 'input';
      var $el = affix(selector);
      var oldValue = $el.css('fontSize');
      var artifacts = fox.insert('input, input::-' + incorrectPrefix + '-input-placeholder', {
        'font-size': 'size'
      });

      fox.process({ size: '20px' });

      expect($el.css('fontSize')).toBe(oldValue);
      expect(artifacts).toEqual({});
    });
  });
});
