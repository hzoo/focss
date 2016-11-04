import Engine from '../../../src/Engine';
import Rule from '../../../src/Rule';

describe('Engine', function() {
  beforeEach(function() {
    this._engine = new Engine();
  });

  afterEach(function() {
    if (this._engine) {
      this._engine.destroy();
    }
  });

  it('is a constructor', function() {
    let engine;

    expect(function() {
      engine = new Engine();
    }).not.toThrow();
    expect(engine).toBeDefined();

    engine.destroy();
  });

  describe('#insert()', function() {
    it('inserts a new Rule', function() {
      const rule = this._engine.insert('.selector', {});
      expect(rule).toBeDefined();
      expect(rule).toEqual(jasmine.any(Rule));
    });
  });

  describe('#process()', function() {
    it('runs individual rule.process()', function() {
      spyOn(Rule.prototype, 'process');
      const payload = {
        foo: 'bar'
      };
      const rule = this._engine.insert('selector', {});
      this._engine.process(payload);
      expect(rule.process).toHaveBeenCalledWith(jasmine.objectContaining(payload), jasmine.anything());
    });
  });

  describe('#toString()', function() {
    beforeEach(function() {
      this.payload = {
        a: 100,
        b: 200,
        c: 300
      };
    });

    it('returns an empty string if no rules are inserted', function() {
      expect(this._engine.toString(this.payload)).toEqual('');
    });

    it('returns processed styles in the order in which they are inserted', function() {
      this._engine.insert('.foo', {
        'max-width': 'a + b'
      });
      this._engine.insert('.bar', {
        width: 'c'
      });
      this._engine.insert('.baz', {
        height: 'a + c'
      });
      expect(this._engine.toString(this.payload)).toEqual('.foo{max-width:300px;}.bar{width:300px;}.baz{height:400px;}');
    });

    it('returns processed styles when the inserted rules contain multiple properties', function() {
      this._engine.insert('.foo', {
        'max-width': 'a + b',
        width: 'b - a',
        height: 'a + c'
      });
      expect(this._engine.toString(this.payload)).toEqual('.foo{max-width:300px;width:100px;height:400px;}');
    });

    it('does not delete previously inserted rules when called', function() {
      this._engine.insert('.foo', {
        'max-width': 'a + b'
      });
      expect(this._engine.toString(this.payload)).toEqual('.foo{max-width:300px;}');
      this._engine.insert('.bar', {
        width: 'c'
      });
      expect(this._engine.toString(this.payload)).toEqual('.foo{max-width:300px;}.bar{width:300px;}');
    });
  });

  describe('#toggleSelector()', function() {
    beforeEach(function() {
      this._engine.insert('selector', {});
      this._engine.process({});
      this._engine.toggleSelector('key1', true);
      spyOn(this._engine, 'process');
    });

    it('it does not run rule.process() if the keys value has not changed', function() {
      this._engine.toggleSelector('key1', true);
      expect(this._engine.process).not.toHaveBeenCalled();
    });

    it('it runs rule.process() if the keys value has changed', function() {
      this._engine.toggleSelector('key1', false);
      expect(this._engine.process).toHaveBeenCalled();
    });

    it('it does not run rule.process() if the keys value is falsey and has not been set before', function() {
      this._engine.toggleSelector('newkey2', false);
      expect(this._engine.process).not.toHaveBeenCalled();
    });
  });
});