//*************************** Required Imports ******************************/
require('dotenv').config();
const WINSTON = require("winston");
const { ElasticsearchTransport } = require('winston-elasticsearch');
const { Client } = require('@elastic/elasticsearch'); // Import the Elasticsearch client

const elasticsearchNode = 'http://172.17.0.2:9200';
const esTransportOptions = {
  level: 'info',
  index: 'new-logs',
  clientOpts: { node: elasticsearchNode },
//   auth: {
// 	username: 'elastic',
// 	password: 'elasticsearch',
//   },
};

const esTransport = new ElasticsearchTransport(esTransportOptions);

// Create an Elasticsearch client for the ping operation
const client = new Client({ node: elasticsearchNode });

// Function to check the Elasticsearch connection
async function checkElasticsearchConnection() {
  try {
    await client.ping();
    console.log('Connected to Elasticsearch successfully.');
  } catch (error) {
    console.error('Failed to connect to Elasticsearch:', error.message);
    // Handle the error as needed, e.g., terminate the application or retry.
  }
}

// Call the function to check the connection during application initialization.
checkElasticsearchConnection();




//*************************** Custom Log Formatter ******************************/

const LOG_FORMAT = (file) => {
	return WINSTON.format.combine(
	  WINSTON.format.align(),
	  WINSTON.format.timestamp({ format: "YYYY-MM-DD T HH:mm:ss" }),
	  WINSTON.format.label({ label: file }),
	  WINSTON.format.metadata(),
	  WINSTON.format.json(({ level, message, metadata }) => {
		return `[${level} | LOG: ${message} |${metadata}]`;
	  })
	);
  };


/**
 * Returns a logger for a given file. 
 * 
 * @example
 * const { getLogger } = require("@fsm/fsm");
 * const logger = getLogger("server.js");
 * logger.info(`Example app listening at ${process.env.FSM}:${process.env.PORT}`);
 * 
 * @param {string} file - name of the file
 * @returns {import("winston").Logger} Winston logger
 */

//*************************** Main Winston Logger Steup  ******************************/
const elasticSearchEnabled = process.env.ELASTICSEARCH_ENABLED === 'true'; // Read environment variable
const getLogger = (file)=>{

	const logger = WINSTON.createLogger({
		transports:[
		// esTransport,
		elasticSearchEnabled == true ? esTransport : new  WINSTON.transports.Console(), // Use Elasticsearch transport if enabled, otherwise console

		//  new WINSTON.transports.File({filename:'application.log'}),// logging for file
		//  new  WINSTON.transports.Console(),// logging for console of your terminal
		 ],
		 
		 format:LOG_FORMAT(file),
		 level: "info"
	});
	return logger;
}

module.exports = { getLogger };
