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

// Format variables into the desired JSON structure
const jsonOutput = {
  "global": {},
  "Colors/Mode 1": {}
};

Object.keys(variables).forEach(variableName => {
  jsonOutput["Colors/Mode 1"][variableName] = {
    "$type": "color",
    "$value": variables[variableName]
  };
});

// Write JSON output to file
fs.writeFileSync(outputFilePath, JSON.stringify(jsonOutput, null, 2));