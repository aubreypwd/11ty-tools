# How to install

`npm install git@github.com:aubreypwd/11ty-tools.git#main --save-dev`

# Development

The best way to install this for development is:

1. `git clone git@github.com:aubreypwd/11ty-tools.git ./_includes/11ty-tools`
2. `npm link ./_includes/11ty-tools`

Or add a `postinstall` script:

```bash
( [ -d ./src/_includes/11ty-tools/.git ] || git clone git@github.com:aubreypwd/11ty-tools.git ./src/_includes/11ty-tools ) && npm link ./src/_includes/11ty-tools
```

Run `npm i` and you will get the tools. Keep them up to date using `git pull`.

You may have to add:

```js
eleventyConfig.addWatchTarget( path.join( __dirname, '_includes/11ty-tools/*.{njk,html,liquid,md}' ) );
```
