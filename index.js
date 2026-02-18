const path = require("path");

module.exports = function (eleventyConfig) {

  const toolsEntry = require.resolve("@aubreypwd/11ty-tools");
  const toolsDir = path.dirname(toolsEntry);

  // 🔥 1️⃣ Watch the entire tools package
  eleventyConfig.addWatchTarget(toolsDir);

  // 🔥 2️⃣ Clear Node require cache EVERY rebuild
  delete require.cache[toolsEntry];

  // 🔥 3️⃣ Load plugin fresh
  eleventyConfig.addPlugin(require("@aubreypwd/11ty-tools"));

  return {
    dir: {
      input: "src",
      includes: "_includes",
      output: "docs"
    },

    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",

    // 🔥 4️⃣ Disable Nunjucks caching
    nunjucksEnvironmentOptions: {
      noCache: true
    }
  };
};
