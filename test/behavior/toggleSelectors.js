import Focss from '../../src';

function css(el, prop, psuedoEl) {
  return window.getComputedStyle(el[0] || el, psuedoEl)[prop];
}

describe('toggleSelectors rules', function() {
  beforeEach(function() {
    this._fox = new Focss();
  });

  afterEach(function() {
    this._fox.destroy();
    this._fox = null;
  });

  describe('for normal selectors', function() {
    describe('with a single psuedo selector', function() {
      beforeEach(function() {
        this._el = affix('div.bar');
        this._fox.insert('.bar:hover', {
          'max-width': 'width'
        });
        this._fox.process({
          width: 20,
          foo: 'foo'
        });
      });

      it('creates a trace linking the selector to the specs modifying it', function() {
        expect(this._fox.traces).toEqual({
          hover1: {
            width: true
          }
        });
      });

      it('can be toggled to simulate a forced psuedo state', function() {
        expect(css(this._el, 'max-width')).toBe('none');

        this._fox.toggleSelector('hover1', true);
        expect(css(this._el, 'max-width')).toBe('20px');

        this._fox.toggleSelector('hover1', false);
        expect(css(this._el, 'max-width')).toBe('none');
      });
    });

    describe('with multiple psuedo selector', function() {
      beforeEach(function() {
        this._el = affix('div.bar');
        this._fox.insert('.bar:hover, .bar:active', {
          'max-width': 'width'
        });
        this._fox.process({
          width: 20,
          foo: 'foo'
        });
      });

      it('creates a trace linking the selector to the specs modifying it', function() {
        expect(this._fox.traces).toEqual({
          hover1: {
            width: true
          }
        });
      });

      it('can be toggled to simulate a forced psuedo state', function() {
        expect(css(this._el, 'max-width')).toBe('none');

        this._fox.toggleSelector('hover1', true);
        expect(css(this._el, 'max-width')).toBe('20px');

        this._fox.toggleSelector('hover1', false);
        expect(css(this._el, 'max-width')).toBe('none');
      });
    });

    describe('with togglable class selector', function() {
      beforeEach(function() {
        this._el = affix('div.bar.__sent');
        this._fox.insert('.bar.__sent', {
          'max-width': 'width'
        });
        this._fox.process({
          width: 20,
          foo: 'foo'
        });
      });

      it('creates a trace linking the selector to the specs modifying it', function() {
        expect(this._fox.traces).toEqual({
          __sent1: {
            width: true
          }
        });
      });

      it('can be toggled to simulate a forced psuedo state', function() {
        expect(css(this._el, 'max-width')).toBe('20px');

        this._fox.toggleSelector('__sent1', true);
        expect(css(this._el, 'max-width')).toBe('none');

        this._fox.toggleSelector('__sent1', false);
        expect(css(this._el, 'max-width')).toBe('20px');
      });
    });

    describe('with togglable class selector with psuedo element', function() {
      beforeEach(function() {
        this._el = affix('div.bar.__sent');
        this._fox.insert('.bar.__sent:before', {
          'max-width': 'width'
        });
        this._fox.process({
          width: 20,
          foo: 'foo'
        });
      });

      it('creates a trace linking the selector to the specs modifying it', function() {
        expect(this._fox.traces).toEqual({
          __sent1: {
            width: true
          }
        });
      });

      it('can be toggled to simulate a forced psuedo state', function() {
        expect(css(this._el, 'max-width', ':before')).toBe('20px');

        this._fox.toggleSelector('__sent1', true);
        const maxWidth = css(this._el, 'max-width', ':before');
        expect(maxWidth === '' || maxWidth === 'none').toBeTruthy();
      });
    });
  });

  describe('for arrayLike selectors', function() {
    beforeEach(function() {
      this._el = affix('div.bar[data-id="-1"]');
      this._el2 = affix('div.bar[data-id="4"]');
      this._el3 = affix('div.bar[data-id="5"]');
    });

    describe('with a forEach selector', function() {
      beforeEach(function() {
        this._fox.insert('%forEach(foo, .bar[data-id="%id%"]:hover)', {
          'max-width': 'width'
        });
        this._fox.process({
          foo: [
            { id: -1, width: 100 },
            { id: 4, width: 200 },
            { id: 5, width: 300 }
          ]
        });
      });

      it('creates a trace linking the selector to the specs modifying it', function() {
        expect(this._fox.traces).toEqual({
          'hover1_id_-1': {
            'foo.0.width': true
          },
          hover1_id_4: {
            'foo.1.width': true
          },
          hover1_id_5: {
            'foo.2.width': true
          }
        });
      });

      it('modifies traces when array order changes', function() {
        this._fox.process({
          foo: [
            { id: 4, width: 200 },
            { id: -1, width: 100 },
            { id: 5, width: 300 }
          ]
        });

        expect(this._fox.traces).toEqual({
          hover1_id_4: {
            'foo.0.width': true
          },
          'hover1_id_-1': {
            'foo.1.width': true
          },
          hover1_id_5: {
            'foo.2.width': true
          }
        });
      });

      it('can be toggled to simulate a forced psuedo state', function() {
        expect(css(this._el, 'max-width')).toBe('none');
        expect(css(this._el2, 'max-width')).toBe('none');
        expect(css(this._el3, 'max-width')).toBe('none');

        this._fox.toggleSelector('hover1_id_-1', true);
        expect(css(this._el, 'max-width')).toBe('100px');
        expect(css(this._el2, 'max-width')).toBe('none');
        expect(css(this._el3, 'max-width')).toBe('none');

        this._fox.toggleSelector('hover1_id_4', true);
        expect(css(this._el, 'max-width')).toBe('100px');
        expect(css(this._el2, 'max-width')).toBe('200px');
        expect(css(this._el3, 'max-width')).toBe('none');

        this._fox.toggleSelector('hover1_id_5', true);
        expect(css(this._el, 'max-width')).toBe('100px');
        expect(css(this._el2, 'max-width')).toBe('200px');
        expect(css(this._el3, 'max-width')).toBe('300px');

        this._fox.toggleSelector('hover1_id_-1', false);
        this._fox.toggleSelector('hover1_id_4', false);
        this._fox.toggleSelector('hover1_id_5', false);
        expect(css(this._el, 'max-width')).toBe('none');
        expect(css(this._el2, 'max-width')).toBe('none');
        expect(css(this._el3, 'max-width')).toBe('none');
      });

      it('preserves state even when array order changes', function() {
        this._fox.toggleSelector('hover1_id_-1', true);
        this._fox.toggleSelector('hover1_id_4', true);
        this._fox.toggleSelector('hover1_id_5', true);
        expect(css(this._el, 'max-width')).toBe('100px');
        expect(css(this._el2, 'max-width')).toBe('200px');
        expect(css(this._el3, 'max-width')).toBe('300px');

        this._fox.process({
          foo: [
            { id: 4, width: 200 },
            { id: -1, width: 100 },
            { id: 5, width: 300 }
          ]
        });
        expect(css(this._el, 'max-width')).toBe('100px');
        expect(css(this._el2, 'max-width')).toBe('200px');
        expect(css(this._el3, 'max-width')).toBe('300px');
      });
    });
  });
});
