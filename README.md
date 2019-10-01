Generate Sequelize model definitions from a Swagger 2.0 schema
====

Prequisites: 

- Create a description of your REST service in a JSON format (see [http://swagger.io/](Swagger.io)) 
- Create your app and install (see [http://docs.sequelizejs.com/en/latest/](Sequelizejs.com))

Currently, the project simply maps Swagger-datatypes to their Sequelize counterpart.

Sample usage:

```js
var swaggerSequelize = require('swagger-sequelize');
var fs = require('fs');
var Sequelize = require('sequelize');

var sequelize = new Sequelize('<your uri>');
var swaggerSpec = JSON.parse(fs.readFileSync('<your swagger.sjon>', 'utf-8'));

var MyModel =  sequelize.define('MyModel', swaggerSequelize.generate(swaggerSpec.definitions.MyModel));

// ... do stuff with MyModel e.g. to setup your tables:

MyModel.sync({force: true})

```

In case you want to read from a `swagger.yaml` rather than from a `swagger.json`, you could replace the JSON-import

```js
var swaggerSpec = JSON.parse(fs.readFileSync('<your swagger.sjon>', 'utf-8'));
```

with a YAML-import
```js
var yaml = require('js-yaml');
var swaggerSpec = yaml.safeLoad(fs.readFileSync('<your swagger.yaml>', 'utf8'));
```

To be consistent, one should "officially" add js-yaml to the project:

```
npm install --save js-yaml
```

## Primary key

To make your primary key work in Sequelize one may need to mark `"x-primary-key": true` in the model definition in `swagger.json`:

```JSON
"definitions": {
    "Document": {
        "properties": {
            "id": {
                "type": "integer",
                "format": "int32",
                "description": "Unique Identifier representing a document",
                "x-primary-key": true
            },
```

And in `swagger.yaml`, it would be:

```YAML
definitions:
  # Model definition
  Document:
    properties:
      id:
        type: integer
        format: int32
        description: Unique Identifier representing a document
        x-primary-key: true
```

## Additional parametrization

In the same way as with `x-primary-key`, you can parameterize the attributes `x-autoincrement`, `x-unique` and `x-allow-null`

## Default value for UUID fields

It is possible to set default values for fields with `uuid` format
##### JSON
```JSON
"definitions": {
    "Document": {
        "properties": {
            "id": {
                "type": "string",
                "format": "uuid",
                "default": "Sequelize.UUIDV4"
            },
```
##### YAML
```YAML
definitions:
  # Model definition
  Document:
    properties:
      id:
        type: string
        format: uuid
        default: Sequelize.UUIDV4
```
