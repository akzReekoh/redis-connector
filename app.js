'use strict';

var platform      = require('./platform'),
	isPlainObject = require('lodash.isplainobject'),
	client, publish_key;

/**
 * Emitted when device data is received.
 * This is the event to listen to in order to get real-time data feed from the connected devices.
 * @param {object} data The data coming from the device represented as JSON Object.
 */
platform.on('data', function (data) {
	if (isPlainObject(data)) {
		client.publish(publish_key, JSON.stringify(data), function (err) {
			if (!err) {
				platform.log(JSON.stringify({
					title: 'Data successfully published in Redis.',
					data: data
				}));
			} else {
				console.error('Failed to publish data in Redis.', err);
				platform.handleException(err);
			}
		});
	}
	else
		platform.handleException(new Error('Invalid data received. Must be a valid JSON Object. Data:' + data));
});

/**
 * Emitted when the platform shuts down the plugin.
 * The Connector should perform cleanup of the resources on this event.
 */
platform.once('close', function () {
	var domain = require('domain');
	var d = domain.create();

	d.once('error', function (error) {
		console.error(error);
		platform.handleException(error);
		platform.notifyClose();
		d.exit();
	});

	d.run(function () {
		if (client) client.end();

		platform.notifyClose();
		d.exit();
	});
});

/**
 * Emitted when the platform bootstraps the plugin. The plugin should listen once and execute its init process.
 * Afterwards, platform.notifyReady() should be called to notify the platform that the init process is done.
 * @param {object} options The options or configuration injected by the platform to the plugin.
 */
platform.once('ready', function (options) {
	var redis = require('redis'),
		url   = 'redis://' + options.user + ':' + options.pass + '@' + options.host + ':' + options.port;

	publish_key = options.publish_key;

	client = redis.createClient(url);

	client.on('error', function (err) {
		console.error('Error initializing Redis Plugin Connector connection.', err);
		platform.handleException(err);
	});

	client.on('ready', function () {
		platform.log('Redis Connector Plugin initialized.');
		platform.notifyReady();
	});
});