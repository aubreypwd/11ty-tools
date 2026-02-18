# How to install

1. `npm install git+ssh://git@github.com:aubreypwd/11ty-tools.git#main --save-dev`
2. Then add a symlink into your `_includes` folder

```bash
ln -sf node_modules/@aubreypwd/11ty-tools _includes/
```

## Testing

To test just use `{% include '11ty-tools/test.html' %}` in one of your files.

# Development

To install this for upstream development, `git clone` it directly into your `_includes` folder (don't forget to add itto `.gitignore`) and run `npm link _includes/11ty-tools`. This way you can use it and contribute upstrem.

I recommend you add a `postinstall` script that does:

```bash
( [ -d ./src/_includes/11ty-tools/.git ] || git clone git@github.com:aubreypwd/11ty-tools.git ./src/_includes/11ty-tools ) && npm link ./src/_includes/11ty-tools
```

Or you can clone it and `npm link` it everytime you install a new package.
