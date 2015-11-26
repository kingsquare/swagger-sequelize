Generate Sequelize model definitions from a Swagger 2.0 schema
====

Prequisites: 

- Create a description of your REST service in a JSON format (see [http://swagger.io/](Swagger.io)) 
- Create your app and install (see [http://docs.sequelizejs.com/en/latest/](Sequelizejs.com))

Currently, the project simply maps Swagger-datatypes to their Sequelize counterpart.

Sample usage:

```
var swaggerSequelize = require('swagger-sequelize');
var fs = require('fs');
var Sequelize = require('sequelize');

var sequelize = new Sequelize('<your uri>');
var swaggerSpec = JSON.parse(fs.readFileSync('<your swagger.sjon>', 'utf-8'));

var MyModel =  sequelize.define('MyModel', swaggerSequelize.generate(swaggerSpec.definitions.MyModel));

// ... do stuff with MyModel e.g. to setup your tables:

MyModel.sync({force: true})

```