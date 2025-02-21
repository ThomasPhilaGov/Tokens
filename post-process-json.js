const fs = require('fs');

const inputFilePath = 'build/variables.json';
const outputFilePath = 'build/variables.json';

// Read the generated JSON file
const jsonContent = fs.readFileSync(inputFilePath, 'utf8');
const jsonData = JSON.parse(jsonContent);

// Adjust the format as needed
const formattedJson = {
  "global": {},
  "Colors/Mode 1": jsonData
};

// Write the formatted JSON to the output file
fs.writeFileSync(outputFilePath, JSON.stringify(formattedJson, null, 2));