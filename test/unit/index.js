import Focss from '../../src';

describe('Focss', function() {
  const payload = { foo: 'bar' };

  beforeEach(function() {
    this._fox = new Focss();
  });

  afterEach(function() {
    if (this._fox) {
      this._fox.destroy();
      this._fox = null;
    }
  });

  it('is instantiable', function() {
    let fox;

    expect(() => {
      fox = new Focss();
    }).not.toThrow();
    expect(fox).toBeDefined();

    fox.destroy();
    fox = null;
  });

  describe('#insert()', function() {
    it('inserts a spec of descriptors from an array', function() {
      spyOn(this._fox.engine, 'insert').and.returnValue({});

      this._fox.insert([
        {
          selector: '.selector',
          rules: {
            prop: ''
          }
        },
        {
          selector: '.selector2',
          rules: {
            otherProp: ''
          }
        }
      ]);

      expect(this._fox.engine.insert.calls.count()).toEqual(2);
      expect(this._fox.engine.insert.calls.allArgs()).toEqual([
        ['.selector', jasmine.objectContaining({
          prop: ''
        })],
        ['.selector2', jasmine.objectContaining({
          otherProp: ''
        })]
      ]);
    });

    it('should throw an error when inserted descriptors are not an array', function() {
      expect(() => {
        this._fox.insert('.selector{width:foo;}');
      }).toThrow(new TypeError('Inserted descriptors must be an array.'));

      expect(() => {
        this._fox.insert([{
          selector: '.selector',

          rules: {
            prop: ''
          }
        }]);
      }).toThrow(new TypeError('Inserted descriptors must be an array.'));
    });
  });

  describe('#process()', function() {
    it('calls its engine', function() {
      spyOn(this._fox.engine, 'process');

      this._fox.process(payload);
      expect(this._fox.engine.process).toHaveBeenCalledWith(payload);
    });
  });

  describe('#toString()', function() {
    it('returns a string of processed styles', function() {
      var payload = {
        a: 100,
        b: 200
      };

      this._fox.insert([
        {
          selector: '.foo',
          rules: {
            'max-width': 'a + b'
          }
        }
      ]);
      expect(this._fox.toString(payload)).toEqual('.foo{max-width:300px;}');
    });
  });

  describe('#toggleSelector()', function() {
    it('calls its engine', function() {
      spyOn(this._fox.engine, 'toggleSelector');

      this._fox.toggleSelector('hover1', true);
      expect(this._fox.engine.toggleSelector).toHaveBeenCalledWith('hover1', true);
    });
  });

  describe('#destroy()', function() {
    it('exists', function() {
      expect(this._fox.destroy).toEqual(jasmine.any(Function));
    });
  });

  describe('get rules', function() {
    beforeEach(function() {
      this._fox.insert([
        {
          selector: '.foo',
          rules: {
            width: 'bar'
          }
        }
      ]);
    });

    it('returns list of rules', function() {
      expect(this._fox.rules).toEqual([jasmine.objectContaining({
        selector: '.foo',
        artifacts: {
          bar: true
        }
      })]);
    });
  });

  describe('get arrayRuleDescriptors', function() {
    beforeEach(function() {
      this._fox.insert([
        {
          selector: '%forEach(foo, .bar[data-id="%id%"])',
          rules: {
            width: 'baz'
          }
        }
      ]);
    });

    it('returns list of rules', function() {
      expect(this._fox.arrayRuleDescriptors).toEqual([jasmine.objectContaining({
        selector: ' .bar[data-id="%id%"]',
        artifacts: {
          foo: true
        }
      })]);
    });
  });

  describe('get arrayRuleDescriptors', function() {
    beforeEach(function() {
      this._fox.insert([
        {
          selector: 'foo:hover',
          rules: {
            width: 'bar'
          }
        }
      ]);
    });

    it('returns list of rules', function() {
      expect(this._fox.traces).toEqual({
        hover1: {
          bar: true
        }
      });
    });
  });
});