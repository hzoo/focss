/* global Symbol */
import Class from 'nbd/Class';
import Rule from './Rule';
import Style from './Style';
import css from '../util/css';
import expression from '../util/expression';

function getVendorPrefixRegex() {
  var otherVendorPrefixesMap = {
    moz: ['webkit', 'ms'],
    webkit: ['moz', 'ms'],
    ms: ['webkit', 'moz'],
  };
  var ua = navigator.userAgent.toLowerCase();
  var vendorPrefix = ua.indexOf('trident') > -1 ? 'ms' : (ua.indexOf('webkit') > -1 ? 'webkit' : 'moz');
  var otherVendorPrefixes = otherVendorPrefixesMap[vendorPrefix];

  return new RegExp(':-(' + otherVendorPrefixes.join('|') + ')-');
}

var hasDom = typeof window !== 'undefined';
var arrayPropertyRegex = /%([^%]+?)%/g;
var foreachSelectorRegex = /%forEach\(([^,]+),(.+)\)$/i;
var filterEachSelectorRegex = /%filterEach\(([^,]+),([^,]+),(.+)\)$/i;
var toggleSelectorPsuedoRegex = /:(hover|active)/;
var toggleSelectorClassRegex = /\.(__[^ :]+)/;
var otherPrefixRegex = hasDom ? getVendorPrefixRegex() : new RegExp();
var Engine;

Engine = Class.extend({
  init: function(root) {
    this.variables = {};
    this.rules = [];
    this.arrayRuleDescriptors = [];
    this.extensions = Object.create(this.extensions);
    this.traces = {};
    this._toggleKeys = {};
    this._uuid = 0;

    if (hasDom) {
      this.style = new Style(root);
    }
  },

  destroy: function() {
    this.rules.length = 0;

    if (this.style) {
      this.style.destroy();
    }
  },

  process: function(payload) {
    if (!hasDom) {
      return;
    }

    this._state = Object.assign({}, payload, { focssVariables: this.variables });
    this._regenerateArrayRules();
    this.rules.forEach(this._process, this);

    //remove leftover rules
    for (var i = this.style.cssRules.length; i > this.rules.length; i--) {
      this.style.deleteRule(i - 1);
    }
  },

  toString: function(payload) {
    var result = '';
    var i;

    this._state = Object.assign({}, payload, { focssVariables: this.variables });
    this._regenerateArrayRules();

    for (i = 0; i < this.rules.length; i++) {
      this.rules[i].process(this._getStateWithToggles(), this.extensions);

      const selector = this.rules[i].isComputed ?
        this.rules[i].computedSelector :
        this.rules[i].selector;

      result += css.toString(selector, this.rules[i].result);
    }

    return result;
  },

  toggleSelector: function(key, isToggled) {
    var isCurrentlyToggled = this._toggleKeys[key] || false;
    this._toggleKeys[key] = isToggled;

    if (isToggled !== isCurrentlyToggled) {
      this.process(this._state);
    }
  },

  _getToggleSelectorInfo: function(selector) {
    var toggleKeys = [];
    var self = this;

    [toggleSelectorPsuedoRegex, toggleSelectorClassRegex].forEach(function(toggleSelectorRegex) {
      selector = selector.replace(toggleSelectorRegex, function(match, name) {
        var key = name + (++self._uuid);
        toggleKeys.push(key);
        return "${__toggled__['" + key + "']?':not(" + match + ")':'" + match + "'}";
      });
    });

    return {
      selector: selector,
      toggleKeys: toggleKeys
    };
  },

  _getStateWithToggles: function() {
    var state = Object.create(this._state);
    state.__toggled__ = this._toggleKeys;

    return state;
  },

  _process: function(rule, i) {
    var result = rule.process(this._getStateWithToggles(), this.extensions);
    var selector = rule.getSelector();

    // Selector has changed
    if (selector !== this.style.cssRules[i].selectorText) {
      this.style.deleteRule(i);
      this.style.insertRule(rule.getSelector() + '{}', i);
      result = true;
    }

    if (result) {
      css.apply(this.style.cssRules[i], rule.result);
    }
  },

  insert: function(selector, spec) {
    var expr;

    // ignore rules that contain the other vendor prefix, as trying to
    // insert them into a stylesheet will cause an exception to be thrown
    // @see: http://stackoverflow.com/questions/23050001/insert-multiple-css-rules-into-a-stylesheet
    if (hasDom && otherPrefixRegex.test(selector)) {
      return {
        artifacts: {}
      };
    }

    expr = foreachSelectorRegex.exec(selector);
    if (expr !== null) {
      return this._insertArrayDescriptor(expr[2], expr[1], spec);
    }

    expr = filterEachSelectorRegex.exec(selector);
    if (expr !== null) {
      return this._insertArrayDescriptor(expr[3], expr[1], spec, expr[2]);
    }

    return this._insertSingleSelector(selector, spec);
  },

  insertVars: function(spec) {
    Object.assign(this.variables, spec);
  },

  _insertSingleSelector: function(selector, spec) {
    var selectorInfo = this._getToggleSelectorInfo(selector);
    var rule = this._insert(selectorInfo.selector, spec);

    this._addTraces(rule, selectorInfo.toggleKeys);

    return rule;
  },

  _insertArrayDescriptor: function(selector, expr, spec, filterExpr) {
    var toggleSelectorInfo = this._getToggleSelectorInfo(selector);
    var descriptor = {
      selector: toggleSelectorInfo.selector,
      expr: expr,
      spec: spec,
      filterExpr: filterExpr,
      toggleKeys: toggleSelectorInfo.toggleKeys,
      artifacts: this._getArtifactsFromSelector(toggleSelectorInfo.selector)
    };

    descriptor.artifacts[expr] = true;

    this._generateRulesFromArrayRuleDescriptor(descriptor);
    this.arrayRuleDescriptors.push(descriptor);

    return descriptor;
  },

  _regenerateArrayRules: function() {
    this.rules = this.rules.filter(function(rule) {
      return !rule.isArrayRule;
    }, this);

    this.arrayRuleDescriptors.forEach(function(descriptor) {
      this._generateRulesFromArrayRuleDescriptor(descriptor);
    }, this);
  },

  _getArtifactsFromSelector: function(selector) {
    var artifacts = {};
    var expr;

    while ((expr = this.constructor.Rule.computed.exec(selector)) !== null) {
      Object.assign(artifacts, expression.parse(expr[1]).artifacts);
    }

    return artifacts;
  },

  _generateRulesFromArrayRuleDescriptor: function(descriptor) {
    var arrayDataFromState;
    var filterFunction;

    // occurs when .insert is called before .process
    if (!this._state) {
      return;
    }

    filterFunction = descriptor.filterExpr ? expression.compile(descriptor.filterExpr) : false;

    arrayDataFromState = expression.compile(descriptor.expr)(this._state, this._extensions);
    arrayDataFromState.forEach(function(item, index) {
      // Filtering must happen here instead of a separate filter step to ensure that
      // `index` is consistent between the data from process and the index provided to _insert below
      if (filterFunction && !filterFunction(item)) {
        return;
      }

      var toggleSuffix = '';
      var selectorForItem = descriptor.selector.replace(arrayPropertyRegex, function(match, column) {
        toggleSuffix += '_' + column + '_' + item[column];
        return item[column];
      });
      var newToggleKeys;
      var rule;

      newToggleKeys = descriptor.toggleKeys.map(function(toggleKey) {
        var newToggleKey = toggleKey + toggleSuffix;
        selectorForItem = selectorForItem.replace(toggleKey + "']?", newToggleKey + "']?");
        return newToggleKey;
      });

      rule = this._insert(selectorForItem, descriptor.spec, descriptor.expr + '[' + index + ']');
      this._addTraces(rule, newToggleKeys, descriptor.expr + '.' + index + '.');
    }, this);
  },

  _addTraces: function(rule, toggleKeys, prefix) {
    prefix = prefix || '';

    var artifactsPrefixed = {};
    var key;

    for (key in rule.artifacts) {
      if (key.indexOf('__toggled__') !== 0) {
        artifactsPrefixed[prefix + key] = rule.artifacts[key];
      }
    }

    toggleKeys.forEach(function(key) {
      this.traces[key] = artifactsPrefixed;
    }, this);
  },

  _insert: function(selector, spec, arrayMemberExpr) {
    var rule = new this.constructor.Rule(selector, spec, arrayMemberExpr);
    var i = this.rules.length;

    if (hasDom) {
      if (rule.isComputed) {
        // Placeholder rule
        this.style.insertRule(':root {}', i);
      }
      else {
        this.style.insertRule(rule.getSelector() + '{}', i);
      }

      if (this._state) {
        this._process(rule, i);
      }
    }

    this.rules.push(rule);
    return rule;
  },

  extensions: {
    Math: Math
  }
}, {
  Rule: Rule,
  displayName: 'FocssEngine'
});

// ES6 future-proofing
if (typeof Symbol !== 'undefined' && Symbol.iterator) {
  Engine.prototype[Symbol.iterator] = function() {
    return {
      _keys: this.rules.slice(),
      next: function() {
        var rule;
        if (rule = this._keys.shift()) {
          return {
            value: rule,
            done: false
          };
        }
        return { done: true };
      }
    };
  };
}

export default Engine;
