![Squoosh Webpack Plugin Logo](https://raw.githubusercontent.com/bcheidemann/squoosh-webpack-plugin/master/logo/favicons/android-chrome-192x192.png)

# Squoosh Webpack Plugin

The squoosh webpack plugin allows you to integrate [Squoosh](https://squoosh.app/) into your webpack builds. Squoosh is an open source `"image compression web app that reduces image sizes through numerous formats"` ([Squoosh Github](https://github.com/GoogleChromeLabs/squoosh)) as well as a javascript library and command line tool.

## Typescript

This project is written in typescript, meaning that in most modern IDEs you will receive type hinting - even when you're in a javascript file such as `webpack.config.js`.

## What can it do?

The squoosh webpack plugin allows you to leverage the power of squoosh in your webpack builds.

It will automatically optimise any images you import in your javascript web app and output them to a dist folder to be served in place of the original image.

It generates a unique ID for each image so as not to generate duplicates. This also means that it will only generate new images when you change the encoder options or add/rename an image.

It supports all codecs and encoder options supported by squoosh and allows you to configure these in the same way you would when using the squoosh command line tool or API directly.

## What can't it do?

The squoosh webpack plugin currently does not currently support any preprocessor options such as image resizing or rotation.

## What next?

Planned features for this plugin are as follows:

- Add support for all preprocessor options available in Squoosh.
- Add support for per image config files so that you can customise the encoder and preprocessor options an a per image basis
- Add an option to run squoosh in the same node process as webpack - it currently runs in a worker child process to avoid conflicting with certain webpack plugins.
- Any suggestions for improvements? Please raise an issue on [github](https://github.com/bcheidemann/squoosh-webpack-plugin) - I'd love to hear from you!

## Documentation

Documentation for this project is available [here](https://squoosh-webpack-plugin-docs-apc7q.ondigitalocean.app/).

## Basic Usage

First install the plugin from yarn or npm.

```
npm install --save-dev squoosh-webpack-plugin
```

Now add the following to your `webpack.config.js`.

```javascript
const { SquooshPlugin } = require("squoosh-webpack-plugin");

module.exports = (config, context) => {
  return {
    ...config,
    plugins: [
      ...config.plugins,
      new SquooshPlugin(),
    ],
  };
};
```

This will initialise the plugin with default options. By default, squoosh will use the `mozjpeg` codec and export any images it generates to the `dist` folder at the root of your app.

To change the default options, simply pass an options object to the plugin constructor.

```javascript
new SquooshPlugin({
  ...options,
});
```

One of the first things you might want to change is the output directory. If you have a specific directory to which you wish to export your images after Squoosh has done it's magic, this can be specified with the `outDir` option.

```javascript
new SquooshPlugin({
  ...options,
  outDir: 'public/images',
});
```

Once you have configured this, you will likely want to choose a codec and/or specify some encoder options.

```javascript
new SquooshPlugin({
  ...options,
  codec: 'mozjpeg',
  encoderOptions: {
    quality: 65,
  },
});
```

For more information on options, see the [documentation](https://squoosh-webpack-plugin-docs-apc7q.ondigitalocean.app/) and [Squoosh github page](https://github.com/GoogleChromeLabs/squoosh).

## Contributing

Want to get involved? Great! Feel free to help out by raising a bug, submitting a feature request or opening a pull request in [github](https://github.com/bcheidemann/squoosh-webpack-plugin).
