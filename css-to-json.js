const fs = require('fs');
const sass = require('node-sass');
const css = require('css');

const inputFilePath = process.argv[2];
const outputFilePath = process.argv[3];

// Compile SCSS to CSS
const result = sass.renderSync({ file: inputFilePath });
const cssContent = result.css.toString();

const parsedCss = css.parse(cssContent);

const jsonOutput = {
  "global": {},
  "Colors/Mode 1": {}
};

parsedCss.stylesheet.rules.forEach(rule => {
  if (rule.type === 'rule') {
    rule.declarations.forEach(declaration => {
      if (declaration.type === 'declaration') {
        const propertyName = declaration.property.replace(/-([a-z])/g, g => g[1].toUpperCase());
        jsonOutput["Colors/Mode 1"][propertyName] = {
          "$type": "color",
          "$value": declaration.value
        };
      }
    });
  }
});

fs.writeFileSync(outputFilePath, JSON.stringify(jsonOutput, null, 2));