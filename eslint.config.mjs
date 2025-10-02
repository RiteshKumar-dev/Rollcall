import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // Extend Next.js defaults and Prettier recommended rules
  ...compat.extends(["next/core-web-vitals", "plugin:prettier/recommended"]),

  // Files/folders to ignore
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },

  // Add Prettier plugin rules
  {
    plugins: ["prettier"],
    rules: {
      "prettier/prettier": "error", // Show Prettier issues as ESLint errors
    },
  },
];

export default eslintConfig;
