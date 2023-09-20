# Custom image for the sqlfluff linter 

This image needs to be built on the production server for the sql fluff linter to work properly.

This is done by the deployment scripts.

This linter is used in the database question type. 

## Building the image

Important : the image name must be `custom-sqlfluff` for the linter sandbox to work properly. 

```bash
docker build -t custom-sqlfluff .
```

