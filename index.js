/**
 * @namespace
 * @property {object} Sequelize
 * @property {function} Sequelize.BLOB
 * @property {function} Sequelize.ENUM
 * @property {function} Sequelize.STRING
 * @property {function} Sequelize.STRING.BINARY
 * @property {function} Sequelize.DATE
 * @property {function} Sequelize.ARRAY
 * @property {function} Sequelize.BOOLEAN
 * @property {function} Sequelize.DOUBLE
 * @property {function} Sequelize.FLOAT
 * @property {function} Sequelize.INTEGER
 * @property {function} Sequelize.BIGINT
 */
var Sequelize = require('sequelize');

var dialect = 'mysql';
/**
 * @param {string} newDialect
 * @returns {*}
 */
function setDialect(newDialect) {
	if (['mysql', 'mariadb', 'sqlite', 'postgres', 'mssql'].indexOf(newDialect) === -1) {
		throw new Error('Unknown sequalize dialect');
	}
	dialect = newDialect;
}

/**
 *
 * @param {Object|string} swaggerPropertySchema
 * @param {Object} swaggerPropertySchema.properties
 * @param {Object} swaggerPropertySchema.$ref
 * @param {Array} swaggerPropertySchema.enum
 * @param {string} swaggerPropertySchema.type
 * @param {string} swaggerPropertySchema.format
 * @param {Object|string} swaggerPropertySchema.items
 * @returns {*}
 */
function getSequalizeType(swaggerPropertySchema) {
	if (typeof swaggerPropertySchema === 'string') {
		swaggerPropertySchema = {
			type: swaggerPropertySchema
		}
	}

	if (swaggerPropertySchema.properties) {
		console.log('Warning: encountered', JSON.stringify(swaggerPropertySchema.properties));
		console.log('Cannot handle complex subschemas (yet?), falling back to blob');
		return Sequelize.BLOB;
	}

	if (swaggerPropertySchema.$ref) {
		console.log('Warning: encountered', JSON.stringify(swaggerPropertySchema.$ref));
		console.log('Cannot handle $ref (yet?), falling back to blob');
		return Sequelize.BLOB;
	}

	if (swaggerPropertySchema.enum) {
		return Sequelize.ENUM.apply(null, swaggerPropertySchema.enum);
	}

	// as seen http://swagger.io/specification/#dataTypeType
	switch (swaggerPropertySchema.type) {
		case 'string':
			switch (swaggerPropertySchema.format || "") {
				case 'byte':
				case 'binary':
					return Sequelize.STRING.BINARY;

				case 'date':
					return Sequelize.DATEONLY;

				case 'date-time':
					//return Sequelize.DATETIME; //not working?
					return Sequelize.DATE;

				default:
					if (swaggerPropertySchema.maxLength) {
						// http://stackoverflow.com/questions/13932750/tinytext-text-mediumtext-and-longtext-maximum-sto
						// http://stackoverflow.com/questions/7755629/varchar255-vs-tinytext-tinyblob-and-varchar65535-v
						// NOTE: text may be in multibyte format!
						if (swaggerPropertySchema.maxLength > 5592415) {
							return Sequelize.TEXT('long');
						}

						if (swaggerPropertySchema.maxLength > 21845) {
							return Sequelize.TEXT('medium');
						}

						// NOTE: VARCHAR(255) may container 255 multibyte chars: it's _NOT_ byte delimited
						if (swaggerPropertySchema.maxLength > 255) {
							return Sequelize.TEXT();
						}
					}

					return Sequelize.STRING; // === VARCHAR
			}

		case 'array':
			if (dialect === 'postgres') {
				return Sequelize.ARRAY(getSequalizeType(swaggerPropertySchema.items));
			}
			console.log('Warning: encountered', JSON.stringify(swaggerPropertySchema));
			console.log('Can only handle array for postgres (yet?), see http://docs.sequelizejs.com/en/latest/api/datatypes/#array, falling back to blob');
			return Sequelize.BLOB;

		case 'boolean':
			return Sequelize.BOOLEAN;

		case 'integer':
			switch (swaggerPropertySchema.format || "") {
				case 'int32':
					return Sequelize.INTEGER;

				default:
					return Sequelize.BIGINT;
			}

		case 'number':
			switch (swaggerPropertySchema.format || "") {
				case 'float':
					return Sequelize.FLOAT;

				default:
					return Sequelize.DOUBLE;
			}

		default:
			console.log('Warning: encountered', JSON.stringify(swaggerPropertySchema));
			console.log('Unknown data type, falling back to blob');
			return Sequelize.BLOB;
	}
}

function generate (schema) {
	//poor mans deep-clone
	var result = JSON.parse(JSON.stringify(schema.properties));

	Object.keys(result).forEach((propertyName) => {
		var propertySchema = result[propertyName];
		propertySchema.type = getSequalizeType(propertySchema);
	});

	return result;
}

module.exports = { setDialect, generate };
