const fs = require('fs');
const path = require('path');
const sass = require('sass');

// Function to resolve variable references
function resolveVariable(value, variables) {
  const variableReferenceRegex = /\$([a-zA-Z0-9-_]+)/g;
  return value.replace(variableReferenceRegex, (match, variableName) => {
    return variables[variableName] || match;
  });
}

// Function to extract variables from SCSS content
function extractVariables(scssContent) {
  const variableRegex = /^\$([a-zA-Z0-9-_]+):\s*(.+);$/gm;
  let match;
  const variables = {};

  while ((match = variableRegex.exec(scssContent)) !== null) {
    const variableName = match[1];
    let variableValue = match[2];

    // Resolve nested variable references
    variableValue = resolveVariable(variableValue, variables);

    variables[variableName] = variableValue;
  }

  return variables;
}

// Function to read and extract variables from SCSS files
function readScssFiles(filePaths) {
  let variables = {};
  filePaths.forEach(filePath => {
    const scssContent = fs.readFileSync(filePath, 'utf8');
    const fileVariables = extractVariables(scssContent);
    variables = { ...variables, ...fileVariables };
  });
  return variables;
}

// Main function
function main() {
  const inputFilePath = process.argv[2];
  const outputFilePath = process.argv[3];

  // List of SCSS files to read (including imports)
  const scssFiles = [
    path.resolve(__dirname, 'css-imports/colors.scss'),
    path.resolve(__dirname, 'css-imports/derived-colors.scss'),
    path.resolve(__dirname, 'css-imports/fonts.scss'),
    inputFilePath
  ];

  // Read and extract variables from SCSS files
  const variables = readScssFiles(scssFiles);

  // Format variables into the desired JSON structure
  const jsonOutput = {
    "global": {},
    "Colors/Mode 1": {}
  };

  Object.keys(variables).forEach(variableName => {
    let variableType = "color"; // Default type is color

    // Determine the type based on the variable name or value
    if (variableName.includes('font') || variableName.includes('family')) {
      variableType = "font-family";
    } else if (variableName.includes('size') || variableName.includes('width') || variableName.includes('height')) {
      variableType = "dimension";
    } else if (variableName.includes('padding') || variableName.includes('margin')) {
      variableType = "spacing";
    }

    let variableValue = resolveVariable(variables[variableName], variables);

    jsonOutput["Colors/Mode 1"][variableName] = {
      "$type": variableType,
      "$value": variableValue
    };
  });

  // Write JSON output to file
  fs.writeFileSync(outputFilePath, JSON.stringify(jsonOutput, null, 2));
}

main();