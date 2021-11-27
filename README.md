![Squoosh Webpack Plugin Logo](https://raw.githubusercontent.com/bcheidemann/squoosh-webpack-plugin/master/logo/favicons/android-chrome-192x192.png)

# Squoosh Webpack Plugin

The squoosh webpack plugin allows you to integrate [Squoosh](https://squoosh.app/) into your webpack builds. Squoosh is an open source `"image compression web app that reduces image sizes through numerous formats"` ([Squoosh Github](https://github.com/GoogleChromeLabs/squoosh)) as well as a javascript library and command line tool.

## Typescript

This project is written in typescript, meaning that in most modern IDEs you will receive type hinting - even when you're in a javascript file such as `webpack.config.js`.

## What can it do?

The squoosh webpack plugin allows you to leverage the power of squoosh in your webpack builds. It will automatically optimise any images you import in your javascript web app.

By default, it generates a unique ID for each image so as not to generate duplicates. This also means that it will only generate new images when you change the encoder options, update an image (when not using the `preserveFileName` option), or add/rename an image.

It supports all codecs and encoder options supported by squoosh and allows you to configure these in the same way you would when using the squoosh command line tool or API directly.

## What can't it do?

The squoosh webpack plugin currently does not currently support any preprocessor options such as image resizing or rotation.

## What next?

Planned features for this plugin are as follows:

- Add support for all preprocessor options available in Squoosh.
- Add support for per image config files so that you can customise the encoder and preprocessor options an a per image basis
- Any suggestions for improvements? Please raise an issue on [github](https://github.com/bcheidemann/squoosh-webpack-plugin) - I'd love to hear from you!

## Documentation

Documentation for this project is available [here](https://squoosh-webpack-plugin.info/).

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

This will initialise the plugin with default options. By default, squoosh will use the `mozjpeg` codec. By default, output images will be placed in the same folder as the input file.

## Basic Configuration

The plugin constructor accepts an options object which allows you to configure the default behaviour.

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

You can choose a codec and/or specify some encoder options as shown below.

```javascript
new SquooshPlugin({
  ...options,
  codec: 'mozjpeg',
  encoderOptions: {
    quality: 65,
  },
});
```

## Options

| Option | Type | Default | Description |
| - | - | - | - |
| extensions | Aray \| Function | See [extensions](#extensions) | Extensions can be used to implement arbitrary custom behaviour. |
| encoderOptions | `object` | - | The encoder options passed to Squoosh. Each codec has different default options. |
| codec | `string` | `"mozjpeg"` | Codec used to encode images. |
| useWorker | `boolean` | `true` | Invoke Squoosh from a Node child process. This is not a performance optimisation but disabling it may cause conflicts with certain other Webpack plugins. |
| | | | |
| requestPrefix | `string` | - | If specified, only files starting with this prefix will be included. This option is managed internally by the `BaseResolverExtension`. |
| include | `RegExp` | `/\.(jpeg\|jpg\|png)$/` | If defined, files which match the regex pattern will be included. This option is managed internally by the `BaseResolverExtension`. |
| exclude | `RegExp` | - | If defined, files which match the regex pattern will be excluded. This option is managed internally by the `BaseResolverExtension`. |
| dirs | `Array` | - | If defined, only files in one of the directories will be included. This option is managed internally by the `BaseResolverExtension`. |
|  |  |  |  |
| outDir | `string` | - | If defined, encoded images will be output to this directory. This option is managed internally by the `DefaultOutputPathExtension`. |
| uuidNamespace | `string` | - | Used to produce a unique filename if `preserveFileName` is set to `false`. This option is managed internally by the `DefaultOutputPathExtension`. |
| preserveFileName | `boolean` | `false` | If true, file names will be preserved and only the extension will change. This option is managed internally by the `DefaultOutputPathExtension`. |
|  |  |  |  |


For more information on options, see the [documentation](https://squoosh-webpack-plugin.info/) and [Squoosh github page](https://github.com/GoogleChromeLabs/squoosh).

## Extensions

Extensions can be used to customise the behaviour of the plugin. They are used internally to implement the default behaviour.

Setting the `extensions` option to an array will concatenate the extensions in the array with the default extensions:

 - `BaseResolverExtension`
 - `BasicCacheExtension`
 - `DefaultOptionsExtension`
 - `DefaultOutputPathExtension`
 - `EnsureOutputDirectoryExtension`

It is also possible to set the `extensions` option to a function. This will receive an array of the default extensions and should return an array of extensions. This is primarily useful if you wish to exclude one or more of the default extensions.

Extensions should be an object or class which implements the `Extension` type. It is recommended to define the name property for error logging purposes. One or more hook functions may be defined to tap into various stages of the plugins lifecycle.

The available hooks are:

 - `initialize`
 - `request`
 - `prepare`

If you intend to implement an extension, it is recommended to use the existing internal plugins for guidance. If you feel the functionality you are implementing should be part of the plugin, feel free to open a PR or an issue.

## Contributing

Want to get involved? Great! Feel free to help out by raising a bug, submitting a feature request or opening a pull request in [github](https://github.com/bcheidemann/squoosh-webpack-plugin).
