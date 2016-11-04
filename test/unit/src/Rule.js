import Rule from '../../../src/Rule';

describe('Rule', function() {
  let rule;
  it('is a constructor', function() {
    rule = new Rule({
      selector: 'section',
      spec: {}
    });

    expect(rule).toBeDefined();
  });

  it('normalizes CSS2 pseudo-element selectors', function() {
    rule = new Rule({
      selector: 'section:after, section:before, section:first-line, section:first-letter',
      spec: {}
    });

    expect(rule.selector).toBe('section::after, section::before, section::first-line, section::first-letter');
  });

  it('needs a selector and body', function() {
    expect(function() {
      rule = new Rule();
    }).toThrow();

    expect(function() {
      rule = new Rule({
        selector: [],
        spec: {}
      });
    }).toThrow();

    expect(function() {
      rule = new Rule({
        selector: '',
        spec: {}
      });
    }).not.toThrow();
  });

  describe('#constructor', function() {
    it('does not add traces if no toggle keys are provided', function() {
      rule = new Rule({
        selector: '.foo',
        spec: {}
      });

      expect(rule.traces).toBeUndefined();
    });

    describe('adds traces when', function() {
      it('is given a single toggleKey without a togglePrefix', function() {
        rule = new Rule({
          selector: '.foo:hover',
          spec: {
            width: 'bar'
          },
          toggleKeys: ['hover1']
        });

        expect(rule.traces).toEqual({
          hover1: {
            bar: true
          }
        });
      });

      it('is given a single toggleKey with a togglePrefix', function() {
        rule = new Rule({
          selector: '.foo:hover',
          spec: {
            width: 'bar'
          },
          arrayMemberExpr: 'baz[0]',
          toggleKeys: ['hover1'],
          togglePrefix: 'baz.0.'
        });

        expect(rule.traces).toEqual({
          hover1: {
            'baz.0.bar': true
          }
        });
      });

      it('is given multiple toggleKeys', function() {
        rule = new Rule({
          selector: '.foo:hover .__fake',
          spec: {
            width: 'bar'
          },
          toggleKeys: ['hover1', '__fake2']
        });

        expect(rule.traces).toEqual({
          hover1: {
            bar: true
          },
          __fake2: {
            bar: true
          }
        });
      });
    });
  });

  it('accepts expressions in selectors', function() {
    expect(function() {
      rule = new Rule({
        selector: '#<% foo %>',
        spec: {}
      });
    }).not.toThrow();

    expect(rule.artifacts.foo).toBeDefined();
    expect(rule.isComputed).toBeTruthy();
  });

  it('compiles body into a function', function() {
    rule = new Rule({
      selector: '',
      spec: {
        marco: 'polo'
      }
    });

    expect(rule.body).toEqual(jasmine.any(Function));
    expect(rule.body({
      polo: 3
    })).toEqual(jasmine.objectContaining({
      marco: 3
    }));
  });

  describe('#process()', function() {
    it('calculates static selectors', function() {
      rule = new Rule({
        selector: '.static',
        spec: {}
      });
      rule.process();
      expect(rule.computedSelector).toBe('.static');
    });

    it('calculates computed selectors', function() {
      rule = new Rule({
        selector: '.<% dynamic %>',
        spec: {}
      });
      rule.process({ dynamic: 'foobar' });
      expect(rule.computedSelector).toBe('.foobar');
    });

    it('calculates result', function() {
      rule = new Rule({
        selector: '.static',
        spec: {
          foo: 'bar'
        }
      });
      rule.process({ bar: 'baz' });
      expect(rule.result).toEqual({ foo: 'baz' });
    });

    it('calculates result with extensions', function() {
      rule = new Rule({
        selector: '.extended',
        spec: {
          foo: 'bar()'
        }
      });

      var bar = jasmine.createSpy('extension').and.returnValue('baz');
      rule.process({}, { bar });

      expect(bar).toHaveBeenCalled();
      expect(rule.result).toEqual({ foo: 'baz' });
    });

    it('calculates non-idempotent extensions', function() {
      rule = new Rule({
        selector: '.extended',
        spec: {
          foo: 'bar()'
        }
      });

      var bar = jasmine.createSpy('extension').and.returnValues('bar', 'baz');

      rule.process({}, { bar });
      expect(rule.result).toEqual({ foo: 'bar' });

      rule.process({}, { bar });
      expect(rule.result).toEqual({ foo: 'baz' });
    });

    it('ignores missing extensions', function() {
      rule = new Rule({
        selector: '.extended',
        spec: {
          foo: 'bar()'
        }
      });
      rule.process({});

      expect(rule.result).toEqual({ foo: 'bar()' });
    });

    it('returns new result if result has changed', function() {
      rule = new Rule({
        selector: '.static',
        spec: {
          foo: 'bar'
        }
      });
      rule.process({ bar: 'baz' });
      expect(rule.process({ bar: 'bar' })).toEqual({ foo: 'bar' });
    });

    it('returns null if result has not changed', function() {
      rule = new Rule({
        selector: '.static',
        spec: {
          foo: 'bar'
        }
      });
      rule.process({ bar: 'baz' });
      expect(rule.process({ bar: 'baz' })).toEqual(null);
    });
  });

  describe('#getSelector()', function() {
    it('returns all selector parts', function() {
      rule = new Rule({
        selector: '.foo1,.foo2,.foo3',
        spec: {}
      });
      rule.process();

      var res = rule.getSelector();
      expect(res.split(',').length).toBe(3);
      expect(res).toEqual(rule.selector);
    });
  });
});