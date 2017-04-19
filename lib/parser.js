'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = parser;
exports.parse = parse;

var _compat = require('./compat');

function parser(tokens, options) {
  var root = { tagName: null, children: [] };
  var state = { tokens: tokens, options: options, cursor: 0, stack: [root] };
  parse(state);
  return root.children;
}

function parse(state) {
  var tokens = state.tokens,
      options = state.options;
  var stack = state.stack;

  var nodes = stack[stack.length - 1].children;
  var len = tokens.length;
  var cursor = state.cursor;

  while (cursor < len) {
    var token = tokens[cursor];
    if (token.type !== 'tag-start') {
      nodes.push(token);
      cursor++;
      continue;
    }

    var tagToken = tokens[++cursor];
    cursor++;
    var tagName = tagToken.content.toLowerCase();
    if (token.close) {
      var item = void 0;
      while (item = stack.pop()) {
        if (tagName === item.tagName) break;
      }
      while (cursor < len) {
        var endToken = tokens[cursor];
        if (endToken.type !== 'tag-end') break;
        cursor++;
      }
      break;
    }

    if ((0, _compat.arrayIncludes)(options.closingTags, tagName)) {
      // rewind the stack to just above the previous
      // closing tag of the same name
      var currentIndex = stack.length - 1;
      while (currentIndex > 0) {
        if (tagName === stack[currentIndex].tagName) {
          stack = stack.slice(0, currentIndex);
          var previousIndex = currentIndex - 1;
          nodes = stack[previousIndex].children;
          break;
        }
        currentIndex = currentIndex - 1;
      }
    }

    var attributes = [];
    var attrToken = void 0;
    while (cursor < len) {
      attrToken = tokens[cursor];
      if (attrToken.type === 'tag-end') break;
      attributes.push(attrToken.content);
      cursor++;
    }

    cursor++;
    var children = [];
    nodes.push({
      type: 'element',
      tagName: tagToken.content,
      attributes: attributes,
      children: children
    });

    var hasChildren = !(attrToken.close || (0, _compat.arrayIncludes)(options.voidTags, tagName));
    if (hasChildren) {
      stack.push({ tagName: tagName, children: children });
      var innerState = { tokens: tokens, options: options, cursor: cursor, stack: stack };
      parse(innerState);
      cursor = innerState.cursor;
    }
  }
  state.cursor = cursor;
}
//# sourceMappingURL=parser.js.map
