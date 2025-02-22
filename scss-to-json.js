const fs = require('fs');
const sass = require('sass');

const inputFilePath = process.argv[2];
const outputFilePath = process.argv[3];

// Compile SCSS to CSS
const result = sass.renderSync({ file: inputFilePath });
const cssContent = result.css.toString();

// Extract SCSS variables
const variableRegex = /^\$([a-zA-Z0-9-_]+):\s*(.+);$/gm;
let match;
const variables = {};

const scssContent = fs.readFileSync(inputFilePath, 'utf8');
while ((match = variableRegex.exec(scssContent)) !== null) {
  const variableName = match[1];
  let variableValue = match[2];

  // Resolve nested variable references
  const variableReferenceRegex = /\$([a-zA-Z0-9-_]+)/g;
  variableValue = variableValue.replace(variableReferenceRegex, (match, variableName) => {
    return variables[variableName] || match;
  });

  variables[variableName] = variableValue;
}

// Format variables into the desired JSON structure
const jsonOutput = {
  "global": {},
  "Colors/Mode 1": {}
};

Object.keys(variables).forEach(variableName => {
  let variableType = "color"; // Default type is color

  // Determine the type based on the variable name or value
  if (variableName.includes('font') || variableName.includes('family')) {
    variableType = "font";
  } else if (variableName.includes('size') || variableName.includes('width') || variableName.includes('height')) {
    variableType = "dimension";
  } else if (variableName.includes('padding') || variableName.includes('margin')) {
    variableType = "spacing";
  }

  jsonOutput["Colors/Mode 1"][variableName] = {
    "$type": variableType,
    "$value": variables[variableName]
  };
});

// Write JSON output to file
fs.writeFileSync(outputFilePath, JSON.stringify(jsonOutput, null, 2));