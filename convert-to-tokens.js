#!/usr/bin/env node

/**
 * Convert flat CSS variables JSON to Style Dictionary DTCG format
 *
 * Reads build/variables.json (flat {"--name": "value"} map from parse-figma-css.js)
 * and writes build/tokens.json in W3C Design Tokens Community Group format
 * that Style Dictionary 4.x can consume.
 */

import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const INPUT = join(__dirname, "build", "variables.json");
const OUTPUT = join(__dirname, "build", "tokens.json");

/**
 * Infer the DTCG $type from a CSS value
 */
function inferType(name, value) {
  // Font family
  if (/font-family|family/i.test(name) && /["']/.test(value)) {
    return "fontFamily";
  }

  // Font weight
  if (/font-weight|Weight/i.test(name)) {
    return "fontWeight";
  }

  // Colors: hex, rgb(), rgba(), hsl(), hsla()
  if (/^#([0-9a-f]{3,8})$/i.test(value)) return "color";
  if (/^rgba?\(/.test(value)) return "color";
  if (/^hsla?\(/.test(value)) return "color";

  // Dimensions: px, rem, em values
  if (/^-?\d+(\.\d+)?(px|rem|em)$/.test(value)) return "dimension";

  // Unitless numbers (likely dimensions like scale values)
  if (/^\d+(\.\d+)?$/.test(value) && /scale-|spacing-|width|height|size|radius|margin|padding|lineheight|gap/i.test(name)) {
    return "dimension";
  }

  // Duration
  if (/^\d+(\.\d+)?(ms|s)$/.test(value)) return "duration";

  // Boolean-like
  if (value === "true" || value === "false") return "string";

  // var() references — infer from the reference name
  if (value.startsWith("var(")) {
    const refName = value.match(/var\(--([^)]+)\)/)?.[1] || "";
    if (/color|palettes|schemes|extended|ramp/i.test(refName)) return "color";
    if (/scale|spacing|width|height|size|radius|margin|padding|lineheight|gap|dimension/i.test(refName)) return "dimension";
    if (/font-family|family/i.test(refName)) return "fontFamily";
    if (/font-weight|weight/i.test(refName)) return "fontWeight";
  }

  return "string";
}

/**
 * Convert a CSS variable name to a dot-separated token path
 * e.g., "--colors-Bell-Yellow" → "colors.Bell-Yellow"
 *
 * We use a flat structure (no deep nesting) to avoid path conflicts
 * where a token and a group share the same name.
 */
function varNameToTokenName(varName) {
  // Strip leading --
  return varName.replace(/^--/, "");
}

/**
 * Convert a var() reference to an SD4 alias reference
 * e.g., "var(--colors-Blue)" → "{colors-Blue}"
 */
function convertVarReference(value, allVarNames) {
  if (!value.startsWith("var(")) return value;

  const match = value.match(/^var\(--([^)]+)\)$/);
  if (!match) return value;

  const refVarName = `--${match[1]}`;

  // Check if the referenced variable exists in our token set
  if (allVarNames.has(refVarName)) {
    const tokenName = varNameToTokenName(refVarName);
    return `{${tokenName}}`;
  }

  // Reference not found — return original value
  return value;
}

/**
 * Recursively resolve var() references to concrete values
 * Used as fallback when SD4 alias resolution won't work
 */
function resolveValue(value, flatVars, visited = new Set()) {
  if (!value.startsWith("var(")) return value;

  const match = value.match(/^var\(--([^)]+)\)$/);
  if (!match) return value;

  const refKey = `--${match[1]}`;
  if (visited.has(refKey)) return value; // circular ref guard

  const resolved = flatVars[refKey];
  if (!resolved) return value;

  visited.add(refKey);
  return resolveValue(resolved, flatVars, visited);
}

function main() {
  console.log("Converting variables.json to DTCG tokens format\n");

  const flatVars = JSON.parse(readFileSync(INPUT, "utf8"));
  const allVarNames = new Set(Object.keys(flatVars));
  const tokens = {};

  let aliasCount = 0;
  let resolvedCount = 0;
  let directCount = 0;

  for (const [varName, rawValue] of Object.entries(flatVars)) {
    const tokenName = varNameToTokenName(varName);
    const type = inferType(varName, rawValue);

    let finalValue = rawValue;

    if (rawValue.startsWith("var(")) {
      // Try to convert to SD4 alias
      const aliasValue = convertVarReference(rawValue, allVarNames);
      if (aliasValue !== rawValue) {
        finalValue = aliasValue;
        aliasCount++;
      } else {
        // Reference target not in our set — try to resolve to concrete value
        const resolved = resolveValue(rawValue, flatVars);
        if (resolved !== rawValue) {
          finalValue = resolved;
          resolvedCount++;
        }
      }
    } else {
      directCount++;
    }

    tokens[tokenName] = {
      $value: finalValue,
      $type: type,
    };
  }

  mkdirSync(dirname(OUTPUT), { recursive: true });
  writeFileSync(OUTPUT, JSON.stringify(tokens, null, 2));

  const total = Object.keys(tokens).length;
  console.log(`   Total tokens: ${total}`);
  console.log(`   Direct values: ${directCount}`);
  console.log(`   Alias references (SD4 {ref}): ${aliasCount}`);
  console.log(`   Resolved references (concrete): ${resolvedCount}`);
  console.log(`   Output: ${OUTPUT}`);
  console.log("\nDone!");
}

try {
  main();
} catch (error) {
  console.error("\nError:", error.message);
  console.error(error.stack);
  process.exit(1);
}
