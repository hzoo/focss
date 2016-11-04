import Focss from '../../src';

describe('Focss#toString', function() {
  beforeEach(function() {
    this._fox = new Focss();
  });

  afterEach(function() {
    this._fox.destroy();
    this._fox = null;
  });

  describe('returns a string of processed styles', function() {
    it('when inserted rule contains single selector', function() {
      this._fox.insert([{
        selector: '.foo',

        rules: {
          'max-width': 'width'
        }
      }]);

      expect(this._fox.toString({ width: 100 })).toEqual('.foo{max-width:100px;}');
    });

    it('when inserted rule contains %forEach selector', function() {
      this._fox.insert([{
        selector: '.baz',

        rules: {
          width: 'width'
        }
      }, {
        selector: '%forEach(foo, .bar[data-id="%id%"])',

        rules: {
          'max-width': 'maxWidth'
        }
      }]);

      expect(this._fox.toString({
        width: 400,
        foo: [
          { id: 3, maxWidth: 100 },
          { id: 4, maxWidth: 200 }
        ]
      })).toEqual('.baz{width:400px;}.bar[data-id="3"]{max-width:100px;}.bar[data-id="4"]{max-width:200px;}');
    });

    it('when inserted rule contains %filterEach selector', function() {
      this._fox.insert([{
        selector: '.baz',

        rules: {
          width: 'width'
        }
      }, {
        selector: '%filterEach(foo, true, .bar[data-id="%id%"])',

        rules: {
          'max-width': 'width'
        }
      }]);

      expect(this._fox.toString({
        width: 400,
        foo: [
          { id: 3, width: 100 },
          { id: 4, width: 200 }
        ]
      })).toEqual('.baz{width:400px;}.bar[data-id="3"]{max-width:100px;}.bar[data-id="4"]{max-width:200px;}');
    });

    it('when inserted rule contains media query', function() {
      this._fox.insert([{
        selector: '@media screen and (max-width: 300px)',

        rules: [
          {
            selector: '.class1',
            rules: {
              width: 'foo',
              color: 'bar'
            }
          }
        ]
      }]);

      expect(this._fox.toString({
        foo: 100,
        bar: 'red'
      })).toEqual('@media screen and (max-width: 300px){.class1{width:100px;color:red;}}');
    });

    it('when inserted media query contains %forEach selector', function() {
      this._fox.insert([{
        selector: '@media screen and (max-width: 300px)',

        rules: [
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
        ]
      }]);

      expect(this._fox.toString({
        foo: 100,
        bar: 'red',
        baz: [
          { id: 3, qux: 1200 },
          { id: 4, qux: 800 }
        ]
      })).toEqual('@media screen and (max-width: 300px){.class1{width:100px;color:red;}.class2[data-id="3"]{max-width:1200px;}.class2[data-id="4"]{max-width:800px;}}');
    });

    it('when inserted media query contains %filterEach selector', function() {
      this._fox.insert([{
        selector: '@media screen and (max-width: 300px)',

        rules: [
          {
            selector: '.class1',
            rules: {
              width: 'foo',
              color: 'bar'
            }
          },
          {
            selector: '%filterEach(baz, qux < 1000, .class2[data-id="%id%"])',
            rules: {
              'max-width': 'qux'
            }
          }
        ]
      }]);

      expect(this._fox.toString({
        foo: 100,
        bar: 'red',
        baz: [
          { id: 3, qux: 1200 },
          { id: 4, qux: 800 }
        ]
      })).toEqual('@media screen and (max-width: 300px){.class1{width:100px;color:red;}.class2[data-id="4"]{max-width:800px;}}');
    });

    it('when inserted media query contains computed selector', function() {
      this._fox.insert([{
        selector: '@media screen and (max-width: <% baz + qux %>px)',

        rules: [
          {
            selector: '.class1',
            rules: {
              width: 'foo'
            }
          },
          {
            selector: '.class2',
            rules: {
              color: 'bar'
            }
          }
        ]
      }]);

      expect(this._fox.toString({
        foo: 100,
        bar: 'red',
        baz: 200,
        qux: 1600
      })).toEqual('@media screen and (max-width: 1800px){.class1{width:100px;}.class2{color:red;}}');
    });

    it('when inserted rule list contains multiple media queries', function() {
      this._fox.insert([{
        selector: '@media screen and (max-width: 300px)',

        rules: [
          {
            selector: '.class1',
            rules: {
              width: 'foo'
            }
          }
        ]
      }]);
      this._fox.insert([{
        selector: '@media screen and (max-width: 600px)',

        rules: [
          {
            selector: '.class1',
            rules: {
              color: 'bar'
            }
          }
        ]
      }]);

      expect(this._fox.toString({
        foo: 100,
        bar: 'red'
      })).toEqual('@media screen and (max-width: 300px){.class1{width:100px;}}@media screen and (max-width: 600px){.class1{color:red;}}');
    });

    it('when inserted rule list contains a mixture of non-media query and media query rules', function() {
      this._fox.insert([{
        selector: '.class1',

        rules: {
          'max-width': 'foo'
        }
      }, {
        selector: '@media screen and (max-width: 300px)',

        rules: [
          {
            selector: '.class1',
            rules: {
              width: 'foo',
              color: 'bar'
            }
          }
        ]
      }]);

      expect(this._fox.toString({
        foo: 100,
        bar: 'red'
      })).toEqual('.class1{max-width:100px;}@media screen and (max-width: 300px){.class1{width:100px;color:red;}}');
    });
  });

  it('returns media queries in order in which they were inserted', function() {
    this._fox.insert([{
      selector: '@media screen and (max-width: 300px)',

      rules: [
        {
          selector: '.class1',
          rules: {
            width: 'foo'
          }
        }
      ]
    }]);
    this._fox.insert([{
      selector: '@media screen and (max-width: 600px)',

      rules: [
        {
          selector: '.class1',
          rules: {
            color: 'bar'
          }
        }
      ]
    }]);
    this._fox.insert([{
      selector: '@media screen and (max-width: 100px)',

      rules: [
        {
          selector: '.class1',
          rules: {
            height: 'baz'
          }
        }
      ]
    }]);

    expect(this._fox.toString({
      foo: 100,
      bar: 'red',
      baz: 600
    })).toEqual('@media screen and (max-width: 300px){.class1{width:100px;}}@media screen and (max-width: 600px){.class1{color:red;}}@media screen and (max-width: 100px){.class1{height:600px;}}');
  });

  it('returns non-media query rules before media query rules regardless of order inserted', function() {
    this._fox.insert([{
      selector: '.class1',

      rules: {
        color: 'bar'
      }
    }]);

    this._fox.insert([{
      selector: '@media screen and (max-width: 300px)',

      rules: [
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
      ]
    }]);

    this._fox.insert([{
      selector: '.class2',

      rules: {
        'max-width': 'foo'
      }
    }]);

    expect(this._fox.toString({
      foo: 100,
      bar: 'red',
      baz: [
        { id: 3, qux: 1200 },
        { id: 4, qux: 800 }
      ]
    })).toEqual('.class1{color:red;}.class2{max-width:100px;}@media screen and (max-width: 300px){.class1{width:100px;color:red;}.class2[data-id="3"]{max-width:1200px;}.class2[data-id="4"]{max-width:800px;}}');
  });

  describe('`<% %>` delimiter', function() {
    it('works when used in a an attribute selector', function() {
      this._fox.insert([{
        selector: '.<% foo %>[<% bar %>]',

        rules: {
          'max-width': 'width'
        }
      }]);

      expect(this._fox.toString({
        foo: 'a',
        bar: 'b',
        width: 100
      })).toEqual('.a[b]{max-width:100px;}');
    });

    it('correctly evaulates a JavaScript expression', function() {
      this._fox.insert([{
        selector: '.<% foo || bar %>',

        rules: {
          'max-width': 'width'
        }
      }]);

      expect(this._fox.toString({
        foo: 'a',
        width: 100
      })).toEqual('.a{max-width:100px;}');
    });

    it('correctly evaulates a JavaScript expression', function() {
      this._fox.insert([{
        selector: '.<% foo || bar %>',

        rules: {
          'max-width': 'width',
        }
      }]);

      expect(this._fox.toString({
        bar: 'b',
        width: 100
      })).toEqual('.b{max-width:100px;}');
    });

    it('correctly evaulates a JavaScript expression with a < symbol', function() {
      this._fox.insert([{
        selector: '.class<% foo < bar ? foo : bar %>',

        rules: {
          'max-width': 'width',
        }
      }]);

      expect(this._fox.toString({
        foo: 4,
        bar: 6,
        width: 100
      })).toEqual('.class4{max-width:100px;}');
    });

    it('correctly evaulates a JavaScript expression with a < and % symbol', function() {
      this._fox.insert([{
        selector: '.class<% foo < bar % 5 ? foo % 3 : bar %>',

        rules: {
          'max-width': 'width',
        }
      }]);

      expect(this._fox.toString({
        foo: 4,
        bar: 15,
        width: 100
      })).toEqual('.class15{max-width:100px;}');
    });

    it('correctly evaulates a computed expression regardless of surrounding whitespace', function() {
      this._fox.insert([{
        selector: '.<%foo  %>',

        rules: {
          'max-width': 'width',
        }
      }]);

      expect(this._fox.toString({
        foo: 'a',
        width: '100'
      })).toEqual('.a{max-width:100px;}');
    });
  });
});