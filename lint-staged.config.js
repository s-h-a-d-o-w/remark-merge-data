export default {
  "**/*.{mjs,js,ts}": "eslint --cache",
  "**/*.ts": () => "tsc",
};
