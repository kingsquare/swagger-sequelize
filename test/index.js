"use strict";

if (!process.env.DATABASE_URI) {
	console.log('Please set the environment variable DATABASE_URI to test against');
	process.exit(1);
}

var swaggerSequelize = require('../index.js');
var fs = require('fs');
var Sequelize = require('sequelize');
var Promise = require('bluebird');

var sequelize = new Sequelize(process.env.DATABASE_URI);
var swaggerSpec = JSON.parse(fs.readFileSync(__dirname + '/fixtures/swagger.json', 'utf-8'));

exports.testSomething = (test) => {
	let models = {};
	swaggerSequelize.setDialect('mariadb');
	Object.keys(swaggerSpec.definitions).forEach((modelName) => {
		models[modelName] =  sequelize.define(modelName, swaggerSequelize.generate(swaggerSpec.definitions[modelName]), { freezeTableName: true });
	});

	let syncPromises = Object.keys(models).map((modelName) => {
		return models[modelName].sync({force: true});
	});

	Promise.all(syncPromises).then(() => {
		console.log('done?');
		test.done();
	}).catch(test.done);
};