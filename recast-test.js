module.exports = function({ types: t }) {
  function isFox(node) {
    return t.isMemberExpression(node.callee) &&
           t.isIdentifier(node.callee.property, { name: 'insert' }) &&
         (
             t.isIdentifier(node.callee.object, { name: 'fox' }) ||
             t.isMemberExpression(node.callee.object) &&
             t.isThisExpression(node.callee.object.object) &&
             t.isIdentifier(node.callee.object.property, { name: '_fox' })
           );
  }

  return {
    visitor: {
      CallExpression(path) {
        if (isFox(path.node)) {
          // console.log('fox.insert');

          let args = path.node.arguments;
          if (args.length === 1) {
            if (t.isObjectExpression(args[0])) {
              // console.log(args[0]);

              let objs = args[0].properties.map((prop) => {
                return t.objectExpression([
                  t.objectProperty(t.identifier('selector'), prop.key),
                  t.objectProperty(t.identifier('rules'), prop.value)
                ]);
              });

              path.node.arguments = [
                t.arrayExpression(objs)
              ];
            }
          }

          if (args.length === 2) {
            if (/*t.isStringLiteral(args[0]) && */ t.isObjectExpression(args[1])) {
              // console.log('("str", {})');

              let objs = args[1].properties.map((prop) => {
                return t.objectExpression([
                  t.objectProperty(t.identifier('selector'), args[0]),
                  t.objectProperty(t.identifier('rules'), args[1]),
                ]);
              });

              path.node.arguments = [
                t.arrayExpression(objs)
              ];
            }
          }
        }
      }
    }
  };
};
