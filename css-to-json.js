const fs = require('fs');
const path = require('path');
const sass = require('node-sass');

const inputFilePath = process.argv[2];
const outputFilePath = process.argv[3];

// Read SCSS file content
const scssContent = fs.readFileSync(inputFilePath, 'utf8');

// Extract SCSS variables
const variableRegex = /^\$([a-zA-Z0-9-_]+):\s*(.+);$/gm;
let match;
const variables = {};

while ((match = variableRegex.exec(scssContent)) !== null) {
  const variableName = match[1];
  const variableValue = match[2];
  variables[variableName] = variableValue;
}

// Resolve variable references
function resolveVariable(value) {
  const variableReferenceRegex = /\$([a-zA-Z0-9-_]+)/g;
  return value.replace(variableReferenceRegex, (match, variableName) => {
    return variables[variableName] || match;
  });
}

const resolvedVariables = {};
Object.keys(variables).forEach(variableName => {
  resolvedVariables[variableName] = resolveVariable(variables[variableName]);
});

// Format variables into the desired JSON structure
const jsonOutput = {
  "global": {},
  "Colors/Mode 1": {}
};

Object.keys(resolvedVariables).forEach(variableName => {
  jsonOutput["Colors/Mode 1"][variableName] = {
    "$type": "color",
    "$value": resolvedVariables[variableName]
  };
});

// Write JSON output to file
fs.writeFileSync(outputFilePath, JSON.stringify(jsonOutput, null, 2));