module.exports = function (eleventyConfig, options = {}) {

  eleventyConfig.addShortcode("test", () => {
    return `This is a test.`;
  });

};
