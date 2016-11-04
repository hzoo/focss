import Style from '../../../src/Style';

describe('Style', function() {
  beforeEach(function() {
    this._style = new Style();
  });

  afterEach(function() {
    if (this._style) {
      this._style.destroy();
      this._style = null;
    }
  });

  it('is a constructor', function() {
    let style;

    expect(() => {
      style = new Style();
    }).not.toThrow();
    expect(style).toBeDefined();

    style.destroy();
  });

  describe('#constructor', function() {
    describe('when no root element is given', function() {
      it('it inserts style element into document body', function() {
        expect(this._style.style.parentNode).toEqual(document.body);
      });
    });

    describe('when a root element is given', function() {
      it('inserts the stylesheet as the first child of the root element', function() {
        const rootEl = affix('.root');
        rootEl.affix('.first-child');
        expect(rootEl[0].firstChild.classList[0]).toEqual('first-child');
        const style = new Style(rootEl);
        expect(rootEl[0].firstChild).toEqual(style.style);
        style.destroy();
      });
    });
  });

  describe('#insertRule', function() {
    it('inserts rule if style sheet exists', function() {
      // CSSStyleSheet.insertRule() returns the index at which the new rule is inserted
      expect(this._style.insertRule('.foo{width:100px;}', 0)).toEqual(0);
      expect(this._style.cssRules[0].cssText).toEqual('.foo { width: 100px; }');
    });
  });

  describe('#deleteRule', function() {
    it('deletes a rule if style sheet exists', function() {
      this._style.insertRule('.foo{width:100px;}', 0);
      expect(this._style.cssRules[0]).toBeDefined();
      this._style.deleteRule(0);
      expect(this._style.cssRules[0]).toBeUndefined();
    });
  });

  describe('#destroy', function() {
    it('removes style element from the document', function() {
      expect(document.body.firstChild).toEqual(this._style.style);
      this._style.destroy();
      expect(document.body.firstChild).not.toEqual(this._style.style);
      this._style = null;
    });
  });

  describe('get#sheet', function() {
    it('returns sheet if style element exists', function() {
      expect(this._style.sheet).toBeDefined();
      expect(this._style.sheet instanceof CSSStyleSheet).toEqual(true);
    });
  });

  describe('get#cssRules', function() {
    it('returns list of rules if style sheet exists', function() {
      expect(this._style.cssRules).toBeDefined();
      expect(this._style.cssRules.length).toEqual(0);
      this._style.insertRule('.foo{width:100px;}', 0);
      expect(this._style.cssRules.length).toEqual(1);
      expect(this._style.cssRules[0].cssText).toEqual('.foo { width: 100px; }');
    });
  });
});