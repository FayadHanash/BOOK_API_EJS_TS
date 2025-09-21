import {FlatCompat} from "@eslint/eslintrc";
import eslint from "@eslint/js";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import perfectionist from "eslint-plugin-perfectionist";
import { fileURLToPath } from "url";
import path from "path";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const compat = new FlatCompat({baseDirectory: __dirname});

export default [
    {
        ignores: ["**/*.js"],
    },
    eslint.configs.recommended,
    ...compat.extends(
        "plugin:@typescript-eslint/recommended",
        "plugin:@typescript-eslint/recommended-requiring-type-checking",
        

    ),
    {
        files: ["src/**/*.ts"],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                project: path.join(__dirname, "tsconfig.json"),
                tsconfigRootDir: __dirname,
            },
        },
    },
    perfectionist.configs["recommended-natural"],
];