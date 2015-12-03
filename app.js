'use strict';

var platform = require('./platform'),
	redis    = require('redis'),
	client, publish_key;

/**
 * Emitted when device data is received.
 * This is the event to listen to in order to get real-time data feed from the connected devices.
 * @param {object} data The data coming from the device represented as JSON Object.
 */
platform.on('data', function (data) {
	// TODO: Send data outbound to the other platform, service or app here.

	client.publish(publish_key, data, function(err){
		if (!err) {
			platform.log(JSON.stringify({
				title: 'Data successfully published in Redis Connector.',
				data: data
			}));
		} else {
			console.error('Failed to publish data in Redis Connector.', err);
			platform.handleException(err);
		}
	});
});

/**
 * Emitted when the platform shuts down the plugin.
 * The Connector should perform cleanup of the resources on this event.
 */
platform.once('close', function () {
	var domain = require('domain');
	var d = domain.create();

	d.once('error', function(error) {
		console.error(error);
		platform.handleException(error);
		platform.notifyClose();
		d.exit();
	});

	d.run(function() {
		// TODO: Release all resources and close connections etc.
		if (client) client.end();

		platform.notifyClose(); // Notify the platform that resources have been released.
		d.exit();
	});
});

/**
 * Emitted when the platform bootstraps the plugin. The plugin should listen once and execute its init process.
 * Afterwards, platform.notifyReady() should be called to notify the platform that the init process is done.
 * @param {object} options The options or configuration injected by the platform to the plugin.
 */
platform.once('ready', function (options) {

	var url = 'redis://' + options.user  + ':' + options.pass + '@' + options.host +':' + options.port + '/';
	publish_key = options.publish_key;

	client = redis.createClient(url);

	client.on('ready', function() {
		platform.log('Redis Connector Plugin ready.');
		platform.notifyReady();
	});

	client.on('error', function(err) {
		console.error('Error initializing Redis Plugin Connector connection.', err);
		return platform.handleException(err);
	});

	// TODO: Initialize the connection to the other platform, service or app here.


});