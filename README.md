# How to install

`npm install git+ssh://git@github.com:aubreypwd/11ty-tools.git#main --save-dev`

Then symlink into your `_includes` e.g.

```bash
ln -sf node_modules/@aubreypwd/11ty-tools _includes/
```

## Testing

To test just use `{% include '11ty-tools/test.html' %}` in one of your files.


# Development

To work upstream, clone the repo locally and link it with `npm link /path/to/repo`
