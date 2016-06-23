define(function() {
  'use strict';

  // From facebook/react
  /**
   * CSS properties which accept numbers but are not in units of "px".
   */
  var isUnitlessNumber = {
    columnCount: true,
    flex: true,
    flexGrow: true,
    flexShrink: true,
    fontWeight: true,
    lineClamp: true,
    lineHeight: true,
    opacity: true,
    order: true,
    orphans: true,
    widows: true,
    zIndex: true,
    zoom: true,
    // SVG-related properties
    fillOpacity: true,
    strokeOpacity: true
  };

  // Find the prefixed version of Element.prototype.matches()
  var matches = (function(prot) {
    var name;
    var names = ['matches', 'webkitMatchesSelector', 'mozMatchesSelector', 'msMatchesSelector', 'oMatchesSelector'];

    while (name = names.shift()) {
      if (name in prot) {
        return name;
      }
    }
  }(Element.prototype));

  function styleProperty(property) {
    if (styleProperty.memo[property]) {
      return styleProperty.memo[property];
    }
    return (styleProperty.memo[property] = property.replace(styleProperty.pattern, styleProperty.replacement));
  }
  // Prepopulate map with the only exception 'float'
  styleProperty.memo = { float: 'cssFloat' };
  styleProperty.pattern = /-([a-z])/g;
  styleProperty.replacement = function(match, p1) {
    return p1.toLocaleUpperCase();
  };


  return {
    extract: function(element) {
      var style = element.style;

      var arr = {};
      var prop;
      for (var i = 0; i < style.length; ++i) {
        prop = styleProperty(style[i]);
        if (style[prop] != null) {
          arr[prop] = style[prop];
        }
      }
      return arr;
    },

    find: function(selector, base) {
      return (base || document).querySelectorAll(selector);
    },

    matches: function(element, selector) {
      return element[matches](selector);
    },

    normalize: function(styleObj) {
      var key;
      var nStyle = {};
      for (key in styleObj) {
        nStyle[styleProperty(key)] = styleObj[key];
      }
      return nStyle;
    },

    apply: function(element, incoming) {
      var key;
      var value;
      for (key in incoming) {
        value = incoming[key];

        // Array value (CSS space separated)
        if (Array.isArray(value)) {
          value = value.join(' ').trim();
        }

        // Undefined/null value
        if (value == null || value === '') {
          element.style[key] = '';
          continue;
        }

        // Literal value
        if (isNaN(value) || isUnitlessNumber[key] || value === 0) {
          element.style[key] = value;
          continue;
        }

        // Numbers without units
        element.style[key] = value + 'px';
      }
    }
  };
});
