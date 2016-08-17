import Focss from '../..';

let fox;

function css(el, prop) {
  return window.getComputedStyle(el[0] || el)[prop];
}

describe('default extensions', function() {
  beforeEach(function() {
    fox = new Focss();
    this._el = affix('.foo');
  });

  afterEach(function() {
    fox.destroy();
    fox = null;
  });

  describe('Math', function() {
    it('.floor', function() {
      fox.insert('.foo', {
        'max-width': 'Math.floor(width)'
      });

      fox.process({
        width: 100.6
      });

      expect(css(this._el, 'max-width')).toBe('100px');
    });
  });

  describe('Number', function() {
    it('.parseInt', function() {
      fox.insert('.foo', {
        'max-width': 'Number.parseInt(width)'
      });

      fox.process({
        width: '123'
      });

      expect(css(this._el, 'max-width')).toBe('123px');
    });
  });
});
