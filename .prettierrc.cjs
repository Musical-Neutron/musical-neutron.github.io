/** @type {import("prettier").Config} */
module.exports = {
  plugins: [require.resolve("prettier-plugin-astro")],

  overrides: [
    {
      // .astro files are written in AstroWind's style; other files use Prettier's defaults.
      files: "*.astro",
      options: {
        parser: "astro",
        printWidth: 120,
        singleQuote: true,
        trailingComma: "es5",
      },
    },
  ],
};
