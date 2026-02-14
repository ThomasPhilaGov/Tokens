export default {
  source: ["build/tokens.json"],
  platforms: {
    css: {
      transformGroup: "css",
      buildPath: "build/css/",
      files: [
        {
          destination: "variables.css",
          format: "css/variables",
        },
      ],
    },
    scss: {
      transformGroup: "scss",
      buildPath: "build/scss/",
      files: [
        {
          destination: "_variables.scss",
          format: "scss/variables",
        },
        {
          destination: "_map-flat.scss",
          format: "scss/map-flat",
        },
        {
          destination: "_map-deep.scss",
          format: "scss/map-deep",
        },
      ],
    },
    less: {
      transformGroup: "less",
      buildPath: "build/less/",
      files: [
        {
          destination: "variables.less",
          format: "less/variables",
        },
      ],
    },
    js: {
      transformGroup: "js",
      buildPath: "build/js/",
      files: [
        {
          destination: "tokens.js",
          format: "javascript/es6",
        },
        {
          destination: "tokens-module.js",
          format: "javascript/module-flat",
        },
      ],
    },
    ts: {
      transformGroup: "js",
      buildPath: "build/ts/",
      files: [
        {
          destination: "tokens.d.ts",
          format: "typescript/es6-declarations",
        },
        {
          destination: "tokens-module.d.ts",
          format: "typescript/module-declarations",
        },
      ],
    },
    json: {
      transformGroup: "js",
      buildPath: "build/json/",
      files: [
        {
          destination: "tokens.json",
          format: "json",
        },
        {
          destination: "tokens-flat.json",
          format: "json/flat",
        },
        {
          destination: "tokens-nested.json",
          format: "json/nested",
        },
      ],
    },
    android: {
      transformGroup: "android",
      buildPath: "build/android/",
      files: [
        {
          destination: "colors.xml",
          format: "android/colors",
        },
        {
          destination: "resources.xml",
          format: "android/resources",
        },
      ],
    },
    compose: {
      transformGroup: "compose",
      buildPath: "build/compose/",
      files: [
        {
          destination: "Tokens.kt",
          format: "compose/object",
          options: {
            className: "Tokens",
            packageName: "com.phila.tokens",
          },
        },
      ],
    },
    ios: {
      transformGroup: "ios",
      buildPath: "build/ios/",
      files: [
        {
          destination: "tokens.h",
          format: "ios/macros",
        },
        {
          destination: "tokens.m",
          format: "ios/colors.m",
        },
      ],
    },
    "ios-swift": {
      transformGroup: "ios-swift",
      buildPath: "build/ios-swift/",
      files: [
        {
          destination: "Tokens.swift",
          format: "ios-swift/class.swift",
          options: {
            className: "Tokens",
          },
        },
        {
          destination: "TokensEnum.swift",
          format: "ios-swift/enum.swift",
          options: {
            className: "Tokens",
          },
        },
      ],
    },
    flutter: {
      transformGroup: "flutter",
      buildPath: "build/flutter/",
      files: [
        {
          destination: "tokens.dart",
          format: "flutter/class.dart",
          options: {
            className: "Tokens",
          },
        },
      ],
    },
  },
};
