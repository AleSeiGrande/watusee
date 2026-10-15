import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// Legacy code-quality rules are kept as warnings so they remain visible and can
// be paid down gradually, without failing `npm run lint` / CI. New code should
// still avoid them.
const legacyWarnings = {
  "@typescript-eslint/no-explicit-any": "warn",
  "react-hooks/set-state-in-effect": "warn",
  "react-hooks/purity": "warn",
  "react-hooks/refs": "warn",
  "react-hooks/immutability": "warn",
};

const pluginOf = (rule) => rule.split("/")[0];

const configs = [...nextVitals, ...nextTs].map((cfg) => ({ ...cfg }));
for (const [rule, level] of Object.entries(legacyWarnings)) {
  const ns = pluginOf(rule);
  for (const cfg of configs) {
    const hasPlugin = Boolean(cfg.plugins && cfg.plugins[ns]);
    const hasRule = Boolean(cfg.rules && Object.prototype.hasOwnProperty.call(cfg.rules, rule));
    if (hasPlugin || hasRule) {
      cfg.rules = { ...(cfg.rules || {}), [rule]: level };
    }
  }
}

const eslintConfig = defineConfig([
  ...configs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Generated folders (not part of the app source):
    "app/generated/**",
  ]),
  // Plain Node entry points and maintenance scripts are CommonJS on purpose.
  {
    files: ["**/*.js", "**/*.cjs"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
]);

export default eslintConfig;
