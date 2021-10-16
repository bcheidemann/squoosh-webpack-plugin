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

Documentation for this project is available [here](https://github.com/bcheidemann/squoosh-webpack-plugin/blob/master/docs/index.html). I plan to host this somewhere soon but for now you will need to clone the repo and open `index.html` in a browser.

## Contributing

Want to get involved? Great! Feel free to help out by raising a bug, submitting a feature request or opening a pull request in [github](https://github.com/bcheidemann/squoosh-webpack-plugin).
