import Focss from '../../src';

var fox;

function css(el, prop, pseudo) {
  return window.getComputedStyle(el[0] || el, pseudo || null)[prop];
}

describe('positional pseudo class selectors', function() {
  beforeEach(function() {
    fox = new Focss();
  });

  afterEach(function() {
    fox.destroy();
    fox = null;
  });

  describe(':first-child', function() {
    it('affects only the first child', function() {
      var ul = affix('ul li+li+li');
      var first = ul.find('li:first-child');
      var second = first.next();
      var last = second.next();
      fox.insert('li:first-child', { 'max-width': 'foo' });
      fox.process({ foo: 100 });

      expect(css(first, 'max-width')).toBe('100px');
      expect(css(second, 'max-width')).toBe('none');
      expect(css(last, 'max-width')).toBe('none');
    });

    it('tracks positions', function() {
      var ul = affix('ul li+li+li');
      var first = ul.find('li:first-child');
      var second = first.next();
      var last = second.next();
      fox.insert('li:first-child', { 'max-width': 'foo' });
      fox.process({ foo: 100 });

      ul[0].insertBefore(second[0], first[0]);

      expect(css(first, 'max-width')).toBe('none');
      expect(css(second, 'max-width')).toBe('100px');
      expect(css(last, 'max-width')).toBe('none');
    });
  });

  describe(':last-child', function() {
    it('affects only the last child', function() {
      var ul = affix('ul li+li+li');
      var last = ul.find('li:last-child');
      var second = last.prev();
      var first = second.prev();
      fox.insert('li:last-child', { 'max-width': 'foo' });
      fox.process({ foo: 100 });

      expect(css(last, 'max-width')).toBe('100px');
      expect(css(second, 'max-width')).toBe('none');
      expect(css(first, 'max-width')).toBe('none');
    });

    it('tracks positions', function() {
      var ul = affix('ul li+li+li');
      var last = ul.find('li:last-child');
      var second = last.prev();
      var first = second.prev();
      fox.insert('li:last-child', { 'max-width': 'foo' });
      fox.process({ foo: 100 });

      ul[0].appendChild(second[0]);

      expect(css(last, 'max-width')).toBe('none');
      expect(css(second, 'max-width')).toBe('100px');
      expect(css(first, 'max-width')).toBe('none');
    });
  });

  describe(':first-of-type', function() {
    it('affects only the first of tag type', function() {
      var ul = affix('section div+span+span+h1');
      var target = $(ul[0].querySelector('span:first-of-type'));

      fox.insert('span:first-of-type', { 'max-width': 'foo' });
      fox.process({ foo: 100 });

      expect(css(target, 'max-width')).toBe('100px');
      expect(target.siblings().css('max-width')).toBe('none');
    });

    it('tracks positions', function() {
      var ul = affix('section div+span+span+h1');
      var target = $(ul[0].querySelector('span:first-of-type'));

      fox.insert('span:first-of-type', { 'max-width': 'foo' });
      fox.process({ foo: 100 });

      var span = document.createElement('span');
      ul[0].insertBefore(span, ul[0].childNodes[0]);

      expect(css(target, 'max-width')).toBe('none');
      expect(css(span, 'max-width')).toBe('100px');
    });
  });

  describe(':last-of-type', function() {
    it('affects only the last of tag type', function() {
      var ul = affix('section div+span+span+h1');
      var target = $(ul[0].querySelector('span:last-of-type'));

      fox.insert('span:last-of-type', { 'max-width': 'foo' });
      fox.process({ foo: 100 });

      expect(target.siblings().css('max-width')).toBe('none');
    });

    it('tracks positions', function() {
      var ul = affix('section div+span+span+h1');
      var target = $(ul[0].querySelector('span:last-of-type'));

      fox.insert('span:last-of-type', { 'max-width': 'foo' });
      fox.process({ foo: 100 });

      var span = document.createElement('span');
      ul[0].appendChild(span);

      expect(css(target, 'max-width')).toBe('none');
      expect(css(span, 'max-width')).toBe('100px');
    });
  });

  describe(':only-of-type', function() {
    it('affects only the last of tag type', function() {
      var ul = affix('section div+span+span+h1');
      var target = $(ul[0].querySelector('div:only-of-type'));

      fox.insert('div:only-of-type', { 'max-width': 'foo' });
      fox.process({ foo: 100 });

      expect(css(target, 'max-width')).toBe('100px');
      expect(target.siblings().css('max-width')).toBe('none');
    });

    it('tracks positions', function() {
      var ul = affix('section div+span+span+h1');
      var target = $(ul[0].querySelector('div:only-of-type'));

      fox.insert('div:only-of-type', { 'max-width': 'foo' });
      fox.process({ foo: 100 });

      expect(css(target, 'max-width')).toBe('100px');
      var div = document.createElement('div');
      ul[0].appendChild(div);

      expect(css(target, 'max-width')).toBe('none');
      expect(css(div, 'max-width')).toBe('none');
    });
  });

  describe(':nth-child()', function() {
    it('affects only the nth element', function() {
      var ul = affix('ul li+li+li+li');

      fox.insert('li:nth-child(2n)', { 'max-width': 'foo' });
      fox.process({ foo: 100 });

      expect(css(ul.find('li:eq(0)'), 'max-width')).toBe('none');
      expect(css(ul.find('li:eq(1)'), 'max-width')).toBe('100px');
      expect(css(ul.find('li:eq(2)'), 'max-width')).toBe('none');
      expect(css(ul.find('li:eq(3)'), 'max-width')).toBe('100px');
    });

    it('tracks when new element shifts positions', function() {
      var ul = affix('ul li+li+li+li');

      fox.insert('li:nth-child(2n)', { 'max-width': 'foo' });
      fox.process({ foo: 100 });

      ul[0].insertBefore(document.createElement('li'), ul[0].childNodes[0]);

      expect(css(ul.find('li:eq(0)'), 'max-width')).toBe('none');
      expect(css(ul.find('li:eq(1)'), 'max-width')).toBe('100px');
      expect(css(ul.find('li:eq(2)'), 'max-width')).toBe('none');
      expect(css(ul.find('li:eq(3)'), 'max-width')).toBe('100px');
      expect(css(ul.find('li:eq(4)'), 'max-width')).toBe('none');
    });

    it('tracks when removing element shifts positions', function() {
      var ul = affix('ul li+li+li+li');

      fox.insert('li:nth-child(3n)', { 'max-width': 'foo' });
      fox.process({ foo: 100 });

      ul[0].removeChild(ul[0].firstChild);

      expect(css(ul.find('li:eq(0)'), 'max-width')).toBe('none');
      expect(css(ul.find('li:eq(1)'), 'max-width')).toBe('none');
      expect(css(ul.find('li:eq(2)'), 'max-width')).toBe('100px');
    });

    it('tracks when positions shift', function() {
      var ul = affix('ul li#first+li#second+li#third+li#last');

      fox.insert('li:nth-child(2n)', { 'max-width': 'foo' });
      fox.process({ foo: 100 });

      ul[0].insertBefore(ul[0].childNodes[1], ul[0].childNodes[0]);

      expect(css(ul.find('li:eq(0)'), 'max-width')).toBe('none');
      expect(css(ul.find('li:eq(1)'), 'max-width')).toBe('100px');
      expect(css(ul.find('li:eq(2)'), 'max-width')).toBe('none');
      expect(css(ul.find('li:eq(3)'), 'max-width')).toBe('100px');
    });
  });

  describe(':nth-last-child()', function() {
    it('affects only the nth element in reverse', function() {
      var ul = affix('ul li+li+li+li');

      fox.insert('li:nth-last-child(2n)', { 'max-width': 'foo' });
      fox.process({ foo: 100 });

      expect(css(ul.find('li:eq(0)'), 'max-width')).toBe('100px');
      expect(css(ul.find('li:eq(1)'), 'max-width')).toBe('none');
      expect(css(ul.find('li:eq(2)'), 'max-width')).toBe('100px');
      expect(css(ul.find('li:eq(3)'), 'max-width')).toBe('none');
    });

    it('tracks when new element shifts positions', function() {
      var ul = affix('ul li+li+li+li');

      fox.insert('li:nth-last-child(2n)', { 'max-width': 'foo' });
      fox.process({ foo: 100 });

      ul[0].appendChild(document.createElement('li'));

      expect(css(ul.find('li:eq(0)'), 'max-width')).toBe('none');
      expect(css(ul.find('li:eq(1)'), 'max-width')).toBe('100px');
      expect(css(ul.find('li:eq(2)'), 'max-width')).toBe('none');
      expect(css(ul.find('li:eq(3)'), 'max-width')).toBe('100px');
      expect(css(ul.find('li:eq(4)'), 'max-width')).toBe('none');
    });
  });
});

describe('relational pseudo class selectors', function() {
  beforeEach(function() {
    fox = new Focss();
  });

  afterEach(function() {
    fox.destroy();
    fox = null;
  });

  describe(':empty', function() {
    it('matches only empty elements', function() {
      var ul = affix('ul');

      fox.insert('ul:empty', { 'max-width': 'foo' });
      fox.process({ foo: 100 });

      expect(css(ul, 'max-width')).toBe('100px');

      ul[0].appendChild(document.createElement('li'));

      expect(css(ul, 'max-width')).toBe('none');
    });
  });
});

describe('input pseudo class selectors', function() {
  beforeEach(function() {
    fox = new Focss();
  });

  afterEach(function() {
    fox.destroy();
    fox = null;
  });

  // IMPORTANT: :visited is impossible due to security restrictions
/*
  describe(':link', function() {});
  describe(':active', function() {});
  describe(':hover', function() {});

  describe(':focus', function() {
    // won't work due to window focus
    it('matches focused inputs', function() {
      var input = affix('input[type=text]');

      fox.insert('input:focus', { 'max-width': 'foo' });
      fox.process({ foo: 100 });

      expect(css(input, 'max-width')).toBe('none');

      input.focus();
      expect(css(input, 'max-width')).toBe('100px');
    });
  });
*/
  describe(':enabled', function() {
    it('matches enabled inputs', function() {
      var input = affix('input[type=text]');

      fox.insert('input:enabled', { 'max-width': 'foo' });
      fox.process({ foo: 100 });

      expect(css(input, 'max-width')).toBe('100px');

      input[0].disabled = true;
      expect(css(input, 'max-width')).toBe('none');
    });
  });

  describe(':disabled', function() {
    it('matches disabled inputs', function() {
      var input = affix('input[type=text]');

      fox.insert('input:disabled', { 'max-width': 'foo' });
      fox.process({ foo: 100 });

      expect(css(input, 'max-width')).toBe('none');

      input[0].disabled = true;
      expect(css(input, 'max-width')).toBe('100px');
    });
  });

  describe(':checked', function() {
    it('matches checked inputs', function() {
      var input = affix('input[type=checkbox]');

      fox.insert('input:checked', { 'max-width': 'foo' });
      fox.process({ foo: 100 });

      expect(css(input, 'max-width')).toBe('none');

      input[0].checked = true;
      expect(css(input, 'max-width')).toBe('100px');
    });
  });

  describe(':indeterminate', function() {
    it('matches indeterminate inputs', function() {
      var input = affix('input[type=checkbox]');

      fox.insert('input:indeterminate', { 'max-width': 'foo' });
      fox.process({ foo: 100 });

      expect(css(input, 'max-width')).toBe('none');

      input[0].indeterminate = true;
      expect(css(input, 'max-width')).toBe('100px');
    });
  });
});

describe('pseudo elements', function() {
  beforeEach(function() {
    fox = new Focss();
  });

  afterEach(function() {
    fox.destroy();
    fox = null;
  });

  describe(':before', function() {
    it('sets pseudo element content', function() {
      var el = affix('div');

      fox.insert('div:before', { content: 'foo' });
      expect(css(el, 'content', ':before')).not.toBe('bar');

      fox.process({ foo: '"bar"' });
      expect(css(el, 'content', ':before')).toBe('bar');
    });
  });
  describe(':after', function() {
    it('sets pseudo element content', function() {
      var el = affix('div');

      fox.insert('div:after', { content: 'foo' });
      expect(css(el, 'content', ':after')).not.toBe('bar');

      fox.process({ foo: '"bar"' });
      expect(css(el, 'content', ':after')).toBe('bar');
    });
  });
});
