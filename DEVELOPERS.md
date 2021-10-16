# Documentation for Developers

## Publishing to NPM

Run the run-publish script:

`npm run run-publish`

## Publishing to Digital Ocean

Before you begin, you will need to install and configure `doctl`. A guide can be found [here](https://docs.digitalocean.com/reference/doctl/how-to/install/).

Switch to the authentication context you set up in the above guide:

```
doctl auth list
doctl auth switch --context <NAME>
```

Authenticate Docker with the container registry:

`doctl registry login`

Build the docker image:

`docker build -t squoosh-webpack-plugin-documentation .`

Optionally, test the docker image by running the following command and going to [http://localhost:8080/docs/](http://localhost:8080/docs/):

`docker run -d -p 8080:8080 squoosh-webpack-plugin-documentation`

Tag the image:

`docker tag squoosh-webpack-plugin-documentation registry.digitalocean.com/bcheidemann/squoosh-webpack-plugin-documentation`

Push the image to the container registry:

`docker push registry.digitalocean.com/bcheidemann/squoosh-webpack-plugin-documentation`