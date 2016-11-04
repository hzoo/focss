/* eslint-env node */

import path from 'path';
import fs from 'fs';
import { parse, parseSync } from '../../src/parser';
import Focss from '../../src';

describe('parser', function() {
  describe('should return an array of parsed Focss descriptors and object of variables', function() {
    function checkDescriptors({ descriptors, variables }) {
      const varsIsObject = variables !== null && typeof variables === 'object' && !Array.isArray(variables);
      expect(varsIsObject).toBeTruthy();
      expect(Object.keys(variables).length).toEqual(1);
      expect(Array.isArray(descriptors)).toBeTruthy();
      expect(descriptors.length).toEqual(2);
    }

    const styles = `$foo: 100;
                    .bar {
                      max-width: $foo;
                    }
                    .baz {
                      width: qux;
                    }`;

    it('when parsed with parse', function(done) {
      parse(styles)
      .then(({ focss }) => {
        checkDescriptors(focss);
      })
      .then(done, done.fail);
    });

    it('when parsed with parseSync', function() {
      const parsedDescriptors = parseSync(styles);
      checkDescriptors(parsedDescriptors);
    });
  });

  describe('should retain the original order of the file contents', function() {
    const styles = `.foo {
                      max-width: bar;
                    }
                    .baz {
                      width: qux;
                    }
                    @media screen and (max-width: 300px) {
                      .foo {
                        max-width: a === b ? c : "";
                      }
                    }`;
    const result = [
      {
        selector: '.foo',
        rules: {
          'max-width': 'bar'
        }
      },
      {
        selector: '.baz',
        rules: {
          width: 'qux'
        }
      },
      {
        selector: '@media screen and (max-width: 300px)',
        rules: [
          {
            selector: '.foo',
            rules: {
              'max-width': 'a === b ? c : ""'
            }
          }
        ]
      }
    ];

    it('when parsed with parse', function(done) {
      parse(styles)
      .then(({ focss: { descriptors } }) => {
        expect(descriptors).toEqual(result);
      })
      .then(done, done.fail);
    });

    it('when parsed with parseSync', function() {
      const { descriptors } = parseSync(styles);
      expect(descriptors).toEqual(result);
    });
  });

  describe('should retain the original order of the file contents when reordered', function() {
    const styles = `.foo {
                      max-width: bar;
                    }
                    @media screen and (max-width: 300px) {
                      .foo {
                        max-width: a + b;
                      }
                    }
                    .baz {
                      width: qux;
                    }`;
    const result = [
      {
        selector: '.foo',
        rules: {
          'max-width': 'bar'
        }
      },
      {
        selector: '@media screen and (max-width: 300px)',
        rules: [
          {
            selector: '.foo',
            rules: {
              'max-width': 'a + b'
            }
          }
        ]
      },
      {
        selector: '.baz',
        rules: {
          width: 'qux'
        }
      }
    ];

    it('when parsed with parse', function(done) {
      parse(styles)
      .then(({ focss: { descriptors } }) => {
        expect(descriptors).toEqual(result);
      })
      .then(done, done.fail);
    });

    it('when parsed with parseSync', function() {
      const { descriptors } = parseSync(styles);
      expect(descriptors).toEqual(result);
    });
  });

  describe('should return Focss descriptors containing', function() {
    describe('rule declarations', function() {
      const styles = `.foo {
                        max-width: bar;
                      }`;
      const result = [
        {
          selector: '.foo',
          rules: {
            'max-width': 'bar'
          }
        }
      ];

      it('when parsed with parse', function(done) {
        parse(styles)
        .then(({ focss: { descriptors } }) => {
          expect(descriptors).toEqual(result);
        })
        .then(done, done.fail);
      });

      it('when parsed with parseSync', function() {
        const { descriptors } = parseSync(styles);
        expect(descriptors).toEqual(result);
      });
    });

    describe('media queries', function() {
      const styles = `@media screen and (max-width: 1000px) {
                        .foo {
                          max-width: bar;
                        }
                      }`;
      const result = [
        {
          selector: '@media screen and (max-width: 1000px)',
          rules: [
            {
              selector: '.foo',
              rules: {
                'max-width': 'bar'
              }
            }
          ]
        }
      ];

      it('when parsed with parse', function(done) {
        parse(styles)
        .then(({ focss: { descriptors } }) => {
          expect(descriptors).toEqual(result);
        })
        .then(done, done.fail);
      });

      it('when parsed with parseSync', function() {
        const { descriptors } = parseSync(styles);
        expect(descriptors).toEqual(result);
      });
    });

    describe('computed selectors', function() {
      const styles = `.<% foo %>1 {
                        max-width: bar;
                      }`;
      const result = [
        {
          selector: '.<% foo %>1',
          rules: {
            'max-width': 'bar'
          }
        }
      ];

      it('when parsed with parse', function(done) {
        parse(styles)
        .then(({ focss: { descriptors } }) => {
          expect(descriptors).toEqual(result);
        })
        .then(done, done.fail);
      });

      it('when parsed with parseSync', function() {
        const { descriptors } = parseSync(styles);
        expect(descriptors).toEqual(result);
      });
    });

    describe('%forEach selectors', function() {
      const styles = `%forEach(foo, .bar[data-id="%id%"]) {
                        max-width: bar;
                      }`;
      const result = [
        {
          selector: '%forEach(foo, .bar[data-id="%id%"])',
          rules: {
            'max-width': 'bar'
          }
        }
      ];

      it('when parsed with parse', function(done) {
        parse(styles)
        .then(({ focss: { descriptors } }) => {
          expect(descriptors).toEqual(result);
        })
        .then(done, done.fail);
      });

      it('when parsed with parseSync', function() {
        const { descriptors } = parseSync(styles);
        expect(descriptors).toEqual(result);
      });
    });

    describe('%filterEach selectors', function() {
      const styles = `%filterEach(foo, true, .bar[data-id="%id%"]) {
                        max-width: bar;
                      }`;
      const result = [
        {
          selector: '%filterEach(foo, true, .bar[data-id="%id%"])',
          rules: {
            'max-width': 'bar'
          }
        }
      ];

      it('when parsed with parse', function(done) {
        parse(styles)
        .then(({ focss: { descriptors } }) => {
          expect(descriptors).toEqual(result);
        })
        .then(done, done.fail);
      });

      it('when parsed with parseSync', function() {
        const { descriptors } = parseSync(styles);
        expect(descriptors).toEqual(result);
      });
    });

    describe('JS ternary expressions', function() {
      const styles = `.foo {
                        max-width: a === "bar" ? c : null;
                      }`;
      const result = [
        {
          selector: '.foo',
          rules: {
            'max-width': 'a === "bar" ? c : null'
          }
        }
      ];

      it('when parsed with parse', function(done) {
        parse(styles)
        .then(({ focss: { descriptors } }) => {
          expect(descriptors).toEqual(result);
        })
        .then(done, done.fail);
      });

      it('when parsed with parseSync', function() {
        const { descriptors } = parseSync(styles);
        expect(descriptors).toEqual(result);
      });
    });

    describe('empty rule declaration values', function() {
      const styles = `.foo {
                        max-width: ;
                      }`;
      const result = [
        {
          selector: '.foo',
          rules: {
            'max-width': ''
          }
        }
      ];

      it('when parsed with parse', function(done) {
        parse(styles)
        .then(({ focss: { descriptors } }) => {
          expect(descriptors).toEqual(result);
        })
        .then(done, done.fail);
      });

      it('when parsed with parseSync', function() {
        const { descriptors } = parseSync(styles);
        expect(descriptors).toEqual(result);
      });
    });

    describe('two rule declarations on the same line that are terminated by semicolons', function() {
      const styles = `.foo {
                         width: bar; max-width: baz;
                      }`;
      const result = [
        {
          selector: '.foo',
          rules: {
            width: 'bar',
            'max-width': 'baz'
          }
        }
      ];

      it('when parsed with parse', function(done) {
        parse(styles)
        .then(({ focss: { descriptors } }) => {
          expect(descriptors).toEqual(result);
        })
        .then(done, done.fail);
      });

      it('when parsed with parseSync', function() {
        const { descriptors } = parseSync(styles);
        expect(descriptors).toEqual(result);
      });
    });
    describe('Focss variables', function() {
      const styles = `$foo: 600;
                      $bar: '#123ABC';
                      $foo-bar: 'px';

                      .test-static {
                        prop: ($foo * 2) + $foo-bar;
                      }
                      .test-method {
                        prop: darken($bar, 16);
                      }
                      .test-jquery {
                        prop: $.extend(true, {}, some.data);
                      }
                      .test-regex {
                        prop: /^test$/.test(some.other.data) ? foo : bar;
                      }`;
      const result = [
        {
          selector: '.test-static',
          rules: {
            prop: '(600 * 2) + \'px\''
          }
        },
        {
          selector: '.test-method',
          rules: {
            prop: 'darken(\'#123ABC\', 16)'
          }
        },
        {
          selector: '.test-jquery',
          rules: {
            prop: '$.extend(true, {}, some.data)'
          }
        },
        {
          selector: '.test-regex',
          rules: {
            prop: '/^test$/.test(some.other.data) ? foo : bar'
          }
        }
      ];

      it('when parsed with parse', function(done) {
        parse(styles)
        .then(({ focss: { descriptors } }) => {
          expect(descriptors).toEqual(result);
        })
        .then(done, done.fail);
      });

      it('when parsed with parseSync', function() {
        const { descriptors } = parseSync(styles);
        expect(descriptors).toEqual(result);
      });

      describe('should throw an error when a variable is not defined before use', function() {
        const styles = `.missing-var {
                                     prop: $not-defined;
                                   }`;
        const errMsg = 'Variable $not-defined is not defined. (2:38)';

        it('when parsed with parse', function(done) {
          parse(styles)
          .then(done.fail, ({ message }) => {
            expect(message).toEqual(errMsg);
            done();
          });
        });

        it('when parsed with parseSync', function() {
          expect(() => {
            parseSync(styles);
          }).toThrowError(errMsg);
        });
      });

      describe('should throw an error when a newline at the end of a rule declaration is not preceded by a semicolon', function() {
        const styles = `.foo {
                           width: bar
                           max-width: baz;
                        }`;
        const errMsg = '<css input>:2:35: Missed semicolon';

        it('when parsed with parse', function(done) {
          parse(styles)
          .then(done.fail, ({ message }) => {
            expect(message).toEqual(errMsg);
            done();
          });
        });

        it('when parsed with parseSync', function() {
          expect(() => {
            parseSync(styles);
          }).toThrow();
        });
      });
    });
  });

  describe('calling toString() should return processed styles', function() {
    describe('when global variables are provided', function() {
      function processAndValidate({ descriptors }, result) {
        const fox = new Focss();
        const data = {
          className: 'foo',
          width1: 200,
          width2: 600,
          num1: 3,
          num2: 5,
          opacity: .6,
          foo: [
            { id: 1, num1: 1, num2: 4, num3: 2, float: 'left' },
            { id: 2, num1: 2, num2: 3, num3: 3, float: 'right' },
            { id: 3, num1: 3, num2: 6, num3: 4, float: 'none' },
            { id: 4, num1: 4, num2: 2, num3: 1, float: 'left' }
          ],
          baz: [
            { id: 1, width: 400 },
            { id: 2, width: 600 }
          ]
        };

        fox.insert(descriptors);
        expect(fox.toString(data)).toEqual(result);
      }

      const variables = fs.readFileSync(path.resolve(__dirname, 'fixtures', 'variables.focss'), { encoding: 'utf8' });
      const styles = fs.readFileSync(path.resolve(__dirname, 'fixtures', 'stylesWithGlobalVars.focss'), { encoding: 'utf8' });
      const result = '.foo{width:300px;}.foo class-name:hover{max-width:800%;}nav .foo a.active, nav .foo a.__fake{margin-left:200px;}.foo 3{opacity:0;}.class1[data-id="3"]{float:none;margin-top:318px;width:18px;}.class1[data-id="4"]{float:left;margin-top:308px;width:8px;}.class2[data-id="1"]{max-width:1800px;}.class2[data-id="2"]{max-width:1800px;}@media screen and (min-width: 800px) and (max-width: 300px){.foo{width:300px;}.foo class-name:hover{max-width:800%;}nav .foo a.active, nav .foo a.__fake{margin-left:200px;}.foo 3{opacity:0;}.class1[data-id="3"]{float:none;margin-top:318px;width:18px;}.class1[data-id="4"]{float:left;margin-top:308px;width:8px;}.class2[data-id="1"]{max-width:1800px;}.class2[data-id="2"]{max-width:1800px;}}';

      it('when inserted descriptors are parsed with parse', function(done) {
        parse(variables)
        .then(({ focss: { variables: parsedVars } }) => parse(styles, parsedVars))
        .then(({ focss: parsedDescriptors }) => processAndValidate(parsedDescriptors, result))
        .then(done, done.fail);
      });

      it('when inserted descriptors are parsed with parseSync', function() {
        const { variables: parsedVars } = parseSync(variables);
        const parsedDescriptors = parseSync(styles, parsedVars);
        processAndValidate(parsedDescriptors, result);
      });
    });

    describe('when no global variables are provided', function() {
      function processAndValidate({ descriptors }, result) {
        const fox = new Focss();
        const data = {
          width1: 200,
          width2: 600,
          num1: 3,
          num2: 5,
          opacity: .6,
          foo: [
            { id: 1, num1: 1, num2: 4, num3: 2, float: 'left' },
            { id: 2, num1: 2, num2: 3, num3: 3, float: 'right' },
            { id: 3, num1: 3, num2: 6, num3: 4, float: 'none' },
            { id: 4, num1: 4, num2: 2, num3: 1, float: 'left' }
          ],
          baz: [
            { id: 1, width: 400 },
            { id: 2, width: 600 }
          ]
        };

        fox.insert(descriptors);
        expect(fox.toString(data)).toEqual(result);
      }

      const styles = fs.readFileSync(path.resolve(__dirname, 'fixtures', 'styles.focss'), { encoding: 'utf8' });
      const result = '.foo{width:300px;}.class-name:hover{max-width:800%;}nav .foo a.active, nav .foo a.__fake{margin-left:200px;}.foo 3{opacity:1;}.class1[data-id="3"]{float:none;margin-top:18px;width:18px;}.class1[data-id="4"]{float:left;margin-top:8px;width:8px;}.class2[data-id="1"]{max-width:400px;}.class2[data-id="2"]{max-width:600px;}@media screen and (min-width: 800px) and (max-width: 300px){.foo{width:300px;}.class-name:hover{max-width:800%;}nav .foo a.active, nav .foo a.__fake{margin-left:200px;}.foo 3{opacity:1;}.class1[data-id="3"]{float:none;margin-top:18px;width:18px;}.class1[data-id="4"]{float:left;margin-top:8px;width:8px;}.class2[data-id="1"]{max-width:400px;}.class2[data-id="2"]{max-width:600px;}}';

      it('when inserted descriptors are parsed with parse', function(done) {
        parse(styles)
        .then(({ focss: parsedDescriptors }) => processAndValidate(parsedDescriptors, result))
        .then(done, done.fail);
      });

      it('when inserted descriptors are parsed with parseSync', function() {
        const parsedDescriptors = parseSync(styles);
        processAndValidate(parsedDescriptors, result);
      });
    });
  });
});