const fs = require('fs');
const css = require('css');

const inputFilePath = process.argv[2];
const outputFilePath = process.argv[3];

const cssContent = fs.readFileSync(inputFilePath, 'utf8');
const parsedCss = css.parse(cssContent);

const jsonOutput = {};

parsedCss.stylesheet.rules.forEach(rule => {
  if (rule.type === 'rule') {
    rule.declarations.forEach(declaration => {
      if (declaration.type === 'declaration') {
        jsonOutput[declaration.property] = declaration.value;
      }
    });
  }
});

fs.writeFileSync(outputFilePath, JSON.stringify(jsonOutput, null, 2));