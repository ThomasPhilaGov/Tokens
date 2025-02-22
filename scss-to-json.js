const fs = require('fs');
const path = require('path');
const sass = require('sass');

// Function to convert HSL to hex
function hslToHex(hsl) {
  const hslRegex = /hsl\((\d+),\s*([\d.]+)%,\s*([\d.]+)%\)/;
  const result = hslRegex.exec(hsl);
  if (!result) return hsl;

  let h = parseInt(result[1]);
  let s = parseFloat(result[2]) / 100;
  let l = parseFloat(result[3]) / 100;

  let c = (1 - Math.abs(2 * l - 1)) * s;
  let x = c * (1 - Math.abs((h / 60) % 2 - 1));
  let m = l - c / 2;
  let r = 0, g = 0, b = 0;

  if (0 <= h && h < 60) {
    r = c; g = x; b = 0;
  } else if (60 <= h && h < 120) {
    r = x; g = c; b = 0;
  } else if (120 <= h && h < 180) {
    r = 0; g = c; b = x;
  } else if (180 <= h && h < 240) {
    r = 0; g = x; b = c;
  } else if (240 <= h && h < 300) {
    r = x; g = 0; b = c;
  } else if (300 <= h && h < 360) {
    r = c; g = 0; b = x;
  }

  r = Math.round((r + m) * 255).toString(16).padStart(2, '0');
  g = Math.round((g + m) * 255).toString(16).padStart(2, '0');
  b = Math.round((b + m) * 255).toString(16).padStart(2, '0');

  return `#${r}${g}${b}`;
}

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
    if (variableType === "color" && variableValue.startsWith('hsl')) {
      variableValue = hslToHex(variableValue);
    }

    jsonOutput["Colors/Mode 1"][variableName] = {
      "$type": variableType,
      "$value": variableValue
    };
  });

  // Write JSON output to file
  fs.writeFileSync(outputFilePath, JSON.stringify(jsonOutput, null, 2));
}

main();