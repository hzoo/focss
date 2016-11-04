import css from '../../../src/util/css';

describe('css helper', function() {
  describe('.find()', function() {
    it('searches the DOM tree for a selector', function() {
      var div = affix('div.foo');

      expect(css.find('.foo')).toContain(div[0]);
    });

    it('searches the subtree for a selector', function() {
      var section = affix('section .foo');
      var foo = section.find('.foo')[0];

      expect(css.find('.foo', section[0])).toContain(foo);
    });
  });

  describe('.apply()', function() {
    it('applies CSS style directly to element', function() {
      var div = affix('div');

      css.apply(div[0], {
        width: '10px',
        height: '20px'
      });

      expect(div.width()).toEqual(10);
      expect(div.height()).toEqual(20);
    });

    it('uses px as default numeric value', function() {
      var div = affix('div');

      css.apply(div[0], {
        width: 4,
        height: 5,
        'z-index': 1,
        // required for z-index to come back as 1 in Chrome
        position: 'absolute'
      });

      expect(div.css('width')).toEqual('4px');
      expect(div.css('height')).toEqual('5px');
      expect(div.css('z-index')).toEqual('1');
    });
  });
});