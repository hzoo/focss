import MediaQuery from '../../../src/MediaQuery';
import defaultExtensions from '../../../src/defaultExtensions';

describe('MediaQuery', function() {
  let mediaQuery;

  it('is a constructor', function() {
    mediaQuery = new MediaQuery('@media screen and (max-width: 400px)', []);
    expect(mediaQuery).toBeDefined();
  });

  describe('#constructor', function() {
    it('accepts expressions in media query selectors', function() {
      expect(function() {
        mediaQuery = new MediaQuery('@media screen and (max-width: <% foo %>)', []);
      }).not.toThrow();
      expect(mediaQuery.artifacts.foo).toBeDefined();
      expect(mediaQuery.isComputed).toBeTruthy();
    });

    it('inserts a mediaQuery list from the spec', function() {
      mediaQuery = new MediaQuery('@media screen and (max-width: 400px)', [
        {
          selector: '.class1',
          rules: {
            color: 'foo'
          }
        },
        {
          selector: '.class2',
          rules: {
            width: 'bar'
          }
        }
      ]);
      expect(mediaQuery.rules.getRules()).toEqual([
        jasmine.objectContaining({
          selector: '.class1'
        }),
        jasmine.objectContaining({
          selector: '.class2'
        })
      ]);
    });

    it('combines artifacts from the media query and all of its rule declarations', function() {
      mediaQuery = new MediaQuery('@media screen and (max-width: <% foo %>px)', [
        {
          selector: '.class1',
          rules: {
            color: 'bar'
          }
        },
        {
          selector: '.class2',
          rules: {
            width: 'baz'
          }
        }
      ]);
      expect(mediaQuery.artifacts).toEqual({
        foo: true,
        bar: true,
        baz: true
      });
    });
  });

  describe('#process', function() {
    it('calculates static selectors', function() {
      mediaQuery = new MediaQuery('@media screen and (max-width: 300px)', []);
      mediaQuery.process();
      expect(mediaQuery.computedSelector).toBe('@media screen and (max-width: 300px)');
    });

    it('calculates computed selectors', function() {
      mediaQuery = new MediaQuery('@media screen and (max-width: <% foo %>px)', []);
      mediaQuery.process({ foo: 1600 });
      expect(mediaQuery.computedSelector).toBe('@media screen and (max-width: 1600px)');
    });

    it('concatenates results as a string of its processed rule declarations', function() {
      mediaQuery = new MediaQuery('@media screen and (max-width: 300px)', [
        {
          selector: '.class1',
          rules: {
            color: 'foo'
          }
        },
        {
          selector: '.class2',
          rules: {
            width: 'bar'
          }
        }
      ]);
      mediaQuery.process({ foo: 'red', bar: 100 });
      expect(mediaQuery.result).toEqual('.class1{color:red;}.class2{width:100px;}');
    });

    it('calculates results with extensions', function() {
      mediaQuery = new MediaQuery('@media screen and (max-width: 300px)', [
        {
          selector: '.class1',
          rules: {
            color: 'foo'
          },
        },
        {
          selector: '.class2',
          rules: {
            width: 'Math.floor(bar)'
          }
        }
      ]);
      mediaQuery.process({ foo: 'red', bar: 100.4 }, defaultExtensions);
      expect(mediaQuery.result).toEqual('.class1{color:red;}.class2{width:100px;}');
    });

    it('returns new result if result has changed', function() {
      mediaQuery = new MediaQuery('@media screen and (max-width: 300px)', [
        {
          selector: '.class1',
          rules: {
            color: 'foo'
          }
        },
        {
          selector: '.class2',
          rules: {
            width: 'bar'
          }
        }
      ]);
      mediaQuery.process({ foo: 'red', bar: 100 });
      expect(mediaQuery.process({ foo: 'blue', bar: 102 })).toEqual('.class1{color:blue;}.class2{width:102px;}');
    });

    it('returns null if result has not changed', function() {
      mediaQuery = new MediaQuery('@media screen and (max-width: 300px)', [
        {
          selector: '.class1',
          rules: {
            color: 'foo'
          }
        },
        {
          selector: '.class2',
          rules: {
            width: 'bar'
          }
        }
      ]);
      mediaQuery.process({ foo: 'red', bar: 100 });
      expect(mediaQuery.process({ foo: 'red', bar: 100 })).toEqual(null);
    });
  });
});