'use strict';

var platform      = require('./platform'),
	isPlainObject = require('lodash.isplainobject'),
	isArray = require('lodash.isarray'),
	async = require('async'),
	client, publish_key;

let sendData = (data) => {
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
};

platform.on('data', function (data) {
	if (isPlainObject(data)) {
		sendData(data);
	}
	else if(isArray(data)){
		async.each(data, (datum) => {
			sendData(datum);
		});
	}
	else
		platform.handleException(new Error('Invalid data received. Must be a valid Array/JSON Object. Data:' + data));
});

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