import RuleList from '../../../src/RuleList';

describe('RuleList', function() {
  beforeEach(function() {
    this._rules = new RuleList();
  });

  afterEach(function() {
    this._rules = null;
  });

  it('is a constructor', function() {
    let rules;

    expect(function() {
      rules = new RuleList();
    }).not.toThrow();
    expect(rules).toBeDefined();
  });

  describe('#getRules', function() {
    it('returns list of rule descriptors', function() {
      const rules = ['foo', 'bar'];
      this._rules.rules = rules;
      expect(this._rules.rules).toEqual(rules);
    });
  });

  describe('#getArrayRuleDescriptors', function() {
    it('returns list of array rule descriptors', function() {
      const arrayRules = ['foo', 'bar'];
      this._rules.arrayRuleDescriptors = arrayRules;
      expect(this._rules.getArrayRuleDescriptors()).toEqual(arrayRules);
    });
  });

  describe('#getMediaQueries', function() {
    it('returns list of media query descriptors', function() {
      const mediaQueryRules = ['foo', 'bar'];
      this._rules.mediaQueries = mediaQueryRules;
      expect(this._rules.getMediaQueries()).toEqual(mediaQueryRules);
    });
  });

  describe('#getTraces', function() {
    it('returns traces from inserted rule descriptors', function() {
      this._rules.insert('.foo:hover', {
        width: 'baz'
      });
      this._rules.insert('.bar:hover', {
        width: 'qux'
      });

      expect(this._rules.getTraces()).toEqual({
        hover1: {
          baz: true
        },
        hover2: {
          qux: true
        }
      });
    });

    it('returns empty object if no traces exist', function() {
      this._rules.insert('.foo', {
        width: 'baz'
      });
      this._rules.insert('.bar', {
        width: 'qux'
      });

      expect(this._rules.getTraces()).toEqual({});
    });
  });

  describe('#generateArrayRules', function() {
    beforeEach(function() {
      this._rules.insert('%forEach(foo, .bar[data-id="%id%"])', {
        width: 'baz'
      });

      expect(this._rules.rules.length).toEqual(0);
      this._rules.generateArrayRules({
        foo: [
          { id: 1, baz: 100 },
          { id: 2, baz: 200 },
          { id: 3, baz: 300 }
        ]
      });
    });

    it('generates array rules', function() {
      expect(this._rules.rules.length).toEqual(3);
      expect(this._rules.rules).toEqual([
        jasmine.objectContaining({
          selector: ' .bar[data-id="1"]',
        }),
        jasmine.objectContaining({
          selector: ' .bar[data-id="2"]',
        }),
        jasmine.objectContaining({
          selector: ' .bar[data-id="3"]',
        }),
      ]);
    });

    it('regenerates all previously generated array rules', function() {
      this._rules.generateArrayRules({
        foo: [
          { id: 3, baz: 100 },
          { id: 4, baz: 200 },
          { id: 5, baz: 300 }
        ]
      });

      expect(this._rules.rules.length).toEqual(3);
      expect(this._rules.rules).toEqual([
        jasmine.objectContaining({
          selector: ' .bar[data-id="3"]',
        }),
        jasmine.objectContaining({
          selector: ' .bar[data-id="4"]',
        }),
        jasmine.objectContaining({
          selector: ' .bar[data-id="5"]',
        }),
      ]);
    });
  });

  describe('#insert', function() {
    describe('media queries', function() {
      beforeEach(function() {
        this._rules.insert('@media screen and (max-width: 300px)', [
          {
            selector: '.class1',
            rules: {
              width: 'foo',
              color: 'bar'
            }
          },
          {
            selector: '%forEach(baz, .class2[data-id="%id%"])',
            rules: {
              'max-width': 'qux'
            }
          }
        ]);
      });

      it('inserts a media query rule', function() {
        expect(this._rules.mediaQueries[0]).toBeDefined();
        expect(this._rules.mediaQueries.length).toEqual(1);
      });

      it('contains the correct artifacts', function() {
        expect(this._rules.mediaQueries[0].artifacts).toEqual({
          foo: true,
          bar: true,
          baz: true
        });
      });
    });

    describe('%forEach', function() {
      beforeEach(function() {
        this._rules.insert('%forEach(foo, .bar[data-id="%id%"])', {
          width: 'baz'
        });
      });

      it('inserts a rule descriptor with a %forEach selector', function() {
        expect(this._rules.arrayRuleDescriptors).toBeDefined();
        expect(this._rules.arrayRuleDescriptors.length).toEqual(1);
      });

      it('contains the correct artifacts', function() {
        expect(this._rules.arrayRuleDescriptors[0].artifacts).toEqual({
          foo: true
        });
      });
    });

    describe('%filterEach', function() {
      beforeEach(function() {
        this._rules.insert('%filterEach(foo, baz > 100, .bar[data-id="%id%"])', {
          width: 'baz'
        });
      });

      it('inserts a rule descriptor with a %filterEach selector', function() {
        expect(this._rules.arrayRuleDescriptors).toBeDefined();
        expect(this._rules.arrayRuleDescriptors.length).toEqual(1);
      });

      it('contains the correct artifacts', function() {
        expect(this._rules.arrayRuleDescriptors[0].artifacts).toEqual({
          foo: true
        });
      });
    });

    describe('static selectors', function() {
      beforeEach(function() {
        this._rules.insert('.foo', {
          width: 'bar'
        });
      });

      it('inserts a rule descriptor with a static selector', function() {
        expect(this._rules.rules).toBeDefined();
        expect(this._rules.rules.length).toEqual(1);
      });

      it('contains the correct artifacts', function() {
        expect(this._rules.rules[0].artifacts).toEqual({
          bar: true
        });
      });
    });

    describe('toggle selectors', function() {
      it('inserts a rule descriptor with a toggle selector', function() {
        this._rules.insert('.foo.__fake', {
          width: 'bar'
        });

        expect(this._rules.rules).toBeDefined();
        expect(this._rules.rules.length).toEqual(1);
      });

      describe('toggle selector classes', function() {
        beforeEach(function() {
          this._rules.insert('.foo.__fake', {
            width: 'bar'
          });
        });

        it('creates toggle selector', function() {
          expect(this._rules.rules[0].selector).toEqual(".foo<%__toggled__['__fake1']?':not(.__fake)':'.__fake'%>");
        });

        it('contains the correct artifacts', function() {
          expect(this._rules.rules[0].artifacts).toEqual({
            bar: true,
            '__toggled__.__fake1': true
          });
        });
      });

      describe('toggle selector pseudo classes', function() {
        describe(':hover', function() {
          beforeEach(function() {
            this._rules.insert('.foo:hover', {
              width: 'bar'
            });
          });

          it('creates toggle selector', function() {
            expect(this._rules.rules[0].selector).toEqual(".foo<%__toggled__['hover1']?':not(:hover)':':hover'%>");
          });

          it('contains the correct artifacts', function() {
            expect(this._rules.rules[0].artifacts).toEqual({
              bar: true,
              '__toggled__.hover1': true
            });
          });
        });

        describe(':active', function() {
          beforeEach(function() {
            this._rules.insert('.foo:active', {
              width: 'bar'
            });
          });

          it('creates toggle selector', function() {
            expect(this._rules.rules[0].selector).toEqual(".foo<%__toggled__['active1']?':not(:active)':':active'%>");
          });

          it('contains the correct artifacts', function() {
            expect(this._rules.rules[0].artifacts).toEqual({
              bar: true,
              '__toggled__.active1': true
            });
          });
        });
      });
    });
  });
});