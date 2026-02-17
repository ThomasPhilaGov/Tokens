#!/usr/bin/env node

/**
 * Parse CSS Variables from Figma CSS Export
 *
 * Extracts CSS custom properties from :root blocks in the Figma CSS export
 * and generates categorized CSS files with variable references preserved.
 *
 * Adapted from phila-ui-4/packages/core/scripts/parse-css-variables.js
 */

import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync, cpSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Allow CLI override: node parse-figma-css.js [inputDir]
const INPUT_DIR = process.argv[2]
  ? join(process.cwd(), process.argv[2])
  : join(__dirname, "input");
const OUTPUT_DIR = join(__dirname, "build", "generated");
const JSON_OUTPUT = join(__dirname, "build", "variables.json");

// Additional output targets — generated CSS is also synced to consuming projects
const SYNC_TARGETS = [
  join(__dirname, "..", "phila-ui-4", "packages", "core", "src", "styles", "generated"),
];

/**
 * Finds the first .css file in the input directory
 */
function findInputFile(inputDir) {
  const files = readdirSync(inputDir).filter((f) => f.endsWith(".css"));
  if (files.length === 0) {
    throw new Error(`No .css files found in ${inputDir}`);
  }
  console.log(`   Found: ${files[0]}`);
  return join(inputDir, files[0]);
}

/**
 * Parses CSS file and extracts only variable definitions from :root blocks
 */
function parseCSSVariables(cssContent) {
  console.log("Parsing CSS variables from :root blocks only...");

  const variables = new Map();
  let count = 0;

  // Match :root blocks and extract their contents
  const rootBlockRegex = /:root\s*\{([^}]+)\}/g;
  let blockMatch;

  while ((blockMatch = rootBlockRegex.exec(cssContent)) !== null) {
    const blockContent = blockMatch[1];

    const varRegex = /--([a-zA-Z0-9-_]+)\s*:\s*([^;]+);/g;
    let varMatch;

    while ((varMatch = varRegex.exec(blockContent)) !== null) {
      const name = `--${varMatch[1]}`;
      const value = varMatch[2].trim();

      // Store in map (later declarations override earlier ones)
      variables.set(name, value);
      count++;
    }
  }

  // Count skipped variables
  const allVarRegex = /--([a-zA-Z0-9-_]+)\s*:\s*([^;]+);/g;
  const totalCount = (cssContent.match(allVarRegex) || []).length;
  const skipped = totalCount - count;

  console.log(`   Found ${count} variable declarations in :root`);
  console.log(
    `   Skipped ${skipped} variables in scoped selectors (e.g., [data-cards], [data-color-roles])`,
  );
  console.log(`   Unique variables: ${variables.size}`);

  return variables;
}

/**
 * Parses variables from a specific selector block
 */
function parseVariablesFromSelector(cssContent, selector) {
  const variables = new Map();

  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const selectorRegex = new RegExp(
    `${escapedSelector}\\s*\\{([^}]+)\\}`,
    "g",
  );
  let blockMatch;

  while ((blockMatch = selectorRegex.exec(cssContent)) !== null) {
    const blockContent = blockMatch[1];
    const varRegex = /--([a-zA-Z0-9-_]+)\s*:\s*([^;]+);/g;
    let varMatch;

    while ((varMatch = varRegex.exec(blockContent)) !== null) {
      const name = `--${varMatch[1]}`;
      const value = varMatch[2].trim();
      variables.set(name, value);
    }
  }

  return variables;
}

/**
 * Checks if a variable is a typography variable
 */
function isTypographyVariable(varName) {
  const lowerName = varName.toLowerCase();
  return lowerName.match(
    /--.*font.*|--body-|--heading-|--display-|--label-|--link-|--quote-|--subtitle-|--icon-/i,
  );
}

/**
 * Checks if a variable name matches the color ramp pattern.
 * Pattern: --{color-name}-{number}-{color-name}
 * Examples: --blue-400-blue, --bell-yellow-100-bell-yellow
 */
function isColorRamp(varName) {
  const match = varName.match(/^--(.+)-(\d+)-(.+)$/);
  if (!match) return false;

  const [, prefix, , suffix] = match;
  return prefix === suffix;
}

/**
 * Checks if a variable belongs to the size category
 */
function isSizeVariable(varName) {
  const lowerName = varName.toLowerCase();
  return (
    lowerName.startsWith("--spacing-") ||
    lowerName.startsWith("--border-width-") ||
    lowerName.startsWith("--border-radius-") ||
    lowerName.startsWith("--breakpoints-") ||
    lowerName.startsWith("--devices-")
  );
}

/**
 * Categorizes variables by their naming patterns
 */
function categorizeVariables(variables) {
  const categories = {
    schemes: new Map(),
    palettes: new Map(),
    "extended-colors": new Map(),
    primitives: new Map(),
    ramps: new Map(),
    size: new Map(),
    typography: new Map(),
    other: new Map(),
  };

  for (const [name, value] of variables) {
    const lowerName = name.toLowerCase();

    if (lowerName.startsWith("--schemes-")) {
      categories.schemes.set(name, value);
    } else if (lowerName.startsWith("--palettes-")) {
      categories.palettes.set(name, value);
    } else if (lowerName.startsWith("--extended-colors-")) {
      categories["extended-colors"].set(name, value);
    } else if (isColorRamp(lowerName)) {
      categories.ramps.set(name, value);
    } else if (
      lowerName.startsWith("--colors-") ||
      lowerName.startsWith("--scale-") ||
      lowerName.startsWith("--dimension-core-")
    ) {
      categories.primitives.set(name, value);
    } else if (isSizeVariable(name)) {
      categories.size.set(name, value);
    } else if (
      lowerName.match(
        /--.*font.*|--body-|--heading-|--display-|--label-|--link-/i,
      )
    ) {
      categories.typography.set(name, value);
    } else {
      categories.other.set(name, value);
    }
  }

  return categories;
}

/**
 * Converts px values to rem (16px = 1rem)
 */
function pxToRem(value) {
  // Unitless number - assume px
  if (/^\d+$/.test(value)) {
    const num = parseInt(value);
    if (num === 0) return "0";
    return `${(num / 16).toFixed(4).replace(/\.?0+$/, "")}rem`;
  }

  // Contains px unit
  if (value.includes("px")) {
    return value.replace(/(\d+(?:\.\d+)?)px/g, (match, num) => {
      const pixels = parseFloat(num);
      if (pixels === 0) return "0";
      return `${(pixels / 16).toFixed(4).replace(/\.?0+$/, "")}rem`;
    });
  }

  return value;
}

/**
 * Checks if a variable is a primitive that needs px-to-rem conversion
 */
function isPrimitiveWithPxValue(varName) {
  const lowerName = varName.toLowerCase();
  return (
    lowerName.startsWith("--scale-") ||
    lowerName.startsWith("--dimension-core-")
  );
}

/**
 * Generates CSS file content for a category
 */
function generateCategoryCSS(categoryName, variables) {
  let css = `:root {\n`;
  css += `  /* ${categoryName} */\n`;
  css += `  /* Generated from Figma CSS export - references preserved */\n\n`;

  const sorted = Array.from(variables.entries()).sort(([a], [b]) =>
    a.localeCompare(b),
  );

  for (const [name, value] of sorted) {
    let processedValue = value;

    // Convert scale and dimension-core values to rem
    if (isPrimitiveWithPxValue(name)) {
      processedValue = pxToRem(value);
    }
    // Convert size variables with px values to rem (but preserve var() references)
    else if (isSizeVariable(name) && value.includes("px")) {
      processedValue = pxToRem(value);
    }

    css += `  ${name}: ${processedValue};\n`;
  }

  css += `}\n`;
  return css;
}

/**
 * Generates responsive typography CSS with mobile base and desktop overrides
 */
function generateTypographyCSS(mobileVars, desktopVars) {
  let css = `:root {\n`;
  css += `  /* typography */\n`;
  css += `  /* Generated from Figma CSS export - mobile-first with desktop overrides */\n\n`;

  const sortedMobile = Array.from(mobileVars.entries()).sort(([a], [b]) =>
    a.localeCompare(b),
  );

  for (const [name, value] of sortedMobile) {
    css += `  ${name}: ${value};\n`;
  }

  css += `}\n\n`;

  // Find desktop overrides (values that differ from mobile)
  const desktopOverrides = new Map();
  for (const [name, desktopValue] of desktopVars) {
    const mobileValue = mobileVars.get(name);
    if (mobileValue !== desktopValue) {
      desktopOverrides.set(name, desktopValue);
    }
  }

  if (desktopOverrides.size > 0) {
    css += `/* Desktop overrides (min-width: 60rem / 960px) */\n`;
    css += `@media (min-width: 60rem) {\n`;
    css += `  :root {\n`;

    const sortedOverrides = Array.from(desktopOverrides.entries()).sort(
      ([a], [b]) => a.localeCompare(b),
    );
    for (const [name, value] of sortedOverrides) {
      css += `    ${name}: ${value};\n`;
    }

    css += `  }\n`;
    css += `}\n`;
  }

  return css;
}

/**
 * Generates a flat JSON object of all :root variables
 */
function generateVariablesJSON(variables) {
  const obj = {};
  const sorted = Array.from(variables.entries()).sort(([a], [b]) =>
    a.localeCompare(b),
  );
  for (const [name, value] of sorted) {
    obj[name] = value;
  }
  return obj;
}

/**
 * Main execution
 */
function main() {
  console.log("Parsing CSS Variables from Figma Export\n");

  console.log(`Input directory: ${INPUT_DIR}`);
  const cssInputFile = findInputFile(INPUT_DIR);
  console.log(`Reading: ${cssInputFile}\n`);
  const cssContent = readFileSync(cssInputFile, "utf8");

  const variables = parseCSSVariables(cssContent);

  console.log("\nCategorizing variables...");
  const categories = categorizeVariables(variables);

  for (const [category, vars] of Object.entries(categories)) {
    if (vars.size > 0) {
      console.log(`   ${category}: ${vars.size} variables`);
    }
  }

  // Parse desktop and mobile typography from specific selectors
  console.log("\nParsing responsive typography...");
  const desktopFonts = parseVariablesFromSelector(
    cssContent,
    '[data-fonts-40="Fonts_Desktop"]',
  );
  const mobileFonts = parseVariablesFromSelector(
    cssContent,
    '[data-fonts-40="Fonts_Mobile"]',
  );

  // Filter to only typography variables
  const desktopTypography = new Map();
  const mobileTypography = new Map();

  for (const [name, value] of desktopFonts) {
    if (isTypographyVariable(name)) {
      desktopTypography.set(name, value);
    }
  }
  for (const [name, value] of mobileFonts) {
    if (isTypographyVariable(name)) {
      mobileTypography.set(name, value);
    }
  }

  console.log(`   Desktop typography: ${desktopTypography.size} variables`);
  console.log(`   Mobile typography: ${mobileTypography.size} variables`);

  // Count differences
  let diffCount = 0;
  for (const [name, desktopValue] of desktopTypography) {
    const mobileValue = mobileTypography.get(name);
    if (mobileValue !== desktopValue) {
      diffCount++;
    }
  }
  console.log(`   Variables with desktop overrides: ${diffCount}`);

  // Ensure output directories exist
  mkdirSync(OUTPUT_DIR, { recursive: true });
  mkdirSync(dirname(JSON_OUTPUT), { recursive: true });

  console.log("\nGenerating CSS files...");
  for (const [categoryName, vars] of Object.entries(categories)) {
    if (vars.size === 0) continue;

    const filename = `${categoryName}.css`;
    const filepath = join(OUTPUT_DIR, filename);

    let css;
    if (categoryName === "typography" && mobileTypography.size > 0) {
      css = generateTypographyCSS(mobileTypography, desktopTypography);
    } else {
      css = generateCategoryCSS(categoryName, vars);
    }

    writeFileSync(filepath, css);
    console.log(`   ${filename}`);
  }

  // Generate JSON output
  console.log("\nGenerating JSON...");
  const jsonData = generateVariablesJSON(variables);
  writeFileSync(JSON_OUTPUT, JSON.stringify(jsonData, null, 2));
  console.log(`   variables.json (${Object.keys(jsonData).length} variables)`);

  // Sync generated CSS to consuming projects
  console.log("\nSyncing to consuming projects...");
  for (const target of SYNC_TARGETS) {
    if (existsSync(join(target, ".."))) {
      mkdirSync(target, { recursive: true });
      cpSync(OUTPUT_DIR, target, { recursive: true });
      console.log(`   Synced → ${target}`);
    } else {
      console.log(`   Skipped (not found): ${target}`);
    }
  }

  console.log("\nDone!");
  console.log(`   CSS output: ${OUTPUT_DIR}`);
  console.log(`   JSON output: ${JSON_OUTPUT}`);

  console.log("\nSummary:");
  console.log(`   Total variables parsed: ${variables.size}`);
  console.log(
    `   Primitives (colors + scale): ${categories.primitives.size}`,
  );
  console.log(`   Ramps: ${categories.ramps.size}`);
  console.log(`   Palettes: ${categories.palettes.size}`);
  console.log(`   Schemes: ${categories.schemes.size}`);
  console.log(`   Extended Colors: ${categories["extended-colors"].size}`);
  console.log(`   Size: ${categories.size.size}`);
  console.log(
    `   Typography: ${mobileTypography.size > 0 ? mobileTypography.size : categories.typography.size} (${diffCount} desktop overrides)`,
  );
  console.log(`   Other: ${categories.other.size}`);
}

try {
  main();
} catch (error) {
  console.error("\nError:", error.message);
  console.error(error.stack);
  process.exit(1);
}
