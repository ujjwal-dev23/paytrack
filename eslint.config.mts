import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import { defineConfig } from "eslint/config";

export default defineConfig([
  // 1. Global ignores
  {
    ignores: ["**/dist/**", "**/node_modules/**"],
  },

  // 2. Base Recommended Configs
  js.configs.recommended,
  ...tseslint.configs.recommended,

  // 3. Global Language Options
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },

  // 4. Frontend/Preact Specific Config
  {
    files: ["frontend/**/*.{ts,tsx}"],
    // Spread the recommended and jsx-runtime configs into this scoped block
    ...pluginReact.configs.flat.recommended,
  },
  {
    files: ["frontend/**/*.{ts,tsx}"],
    ...pluginReact.configs.flat["jsx-runtime"],
  },
  {
    files: ["frontend/**/*.{ts,tsx}"],
    settings: {
      react: {
        // Preact uses the React plugin; set version to silence warnings
        version: "16.0",
      },
    },
    rules: {
      // Preact uses 'class' instead of 'className'
      "react/no-unknown-property": ["error", { ignore: ["class"] }],
    },
  },
]);
