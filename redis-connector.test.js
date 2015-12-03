/*
 * Just a sample code to test the connector plugin.
 * Kindly write your own unit tests for your own plugin.
 */
'use strict';

var cp     = require('child_process'),
	assert = require('assert'),
	connector;

var options = {
	user: 'rbanquerigo',
	pass: 'rozzwalla',
	host: 'pub-redis-16219.us-east-1-2.1.ec2.garantiadata.com',
	port: 16219,
	publish_key: 'test_channel'
};

describe('Connector', function () {
	this.slow(5000);

	after('terminate child process', function () {
		connector.kill('SIGKILL');
	});

	describe('#spawn', function () {
		it('should spawn a child process', function () {
			assert.ok(connector = cp.fork(process.cwd()), 'Child process not spawned.');
		});
	});

	describe('#handShake', function () {
		it('should notify the parent process when ready within 5 seconds', function (done) {
			this.timeout(5000);

			connector.on('message', function (message) {
				if (message.type === 'ready')
					done();
			});

			connector.send({
				type: 'ready',
				data: {
					options: options
				}
			}, function (error) {
				assert.ifError(error);
			});
		});
	});

	//describe('#data', function (done) {
	//	it('should process the data', function () {
	//		this.timeout(6000);
	//		var redis  = require('redis'),
	//			url = 'redis://' + options.user  + ':' + options.pass + '@' + options.host +':' + options.port + '/',
	//			client = redis.createClient(url);
    //
    //
	//		client.on('ready', function(){
	//			client.subscribe(options.publish_key);
	//		});
    //
    //
    //
	//		client.on('subscribe', function(channel, count) {
	//			console.log(channel);
	//			console.log(count);
	//			done();
	//		});
    //
	//		setTimeout( function() {
    //
	//			connector.send({
	//				type: 'data',
	//				data: {
	//					key1: 'value1',
	//					key2: 121,
	//					key3: 40
	//				}
	//			}, function(err){
    //
	//			});
	//		}, 4000);
    //
	//	});
	//});

	describe('#data', function (done) {
		it('should process the data', function () {
			this.timeout(6000);
			var redis  = require('redis'),
				url = 'redis://' + options.user  + ':' + options.pass + '@' + options.host +':' + options.port + '/',
				client = redis.createClient(url);

			client.on('message', function(channel, message) {
				console.log('help');
				assert.equal(message.key1, 'value1');
				assert.equal(message.key2, 121);
				assert.equal(message.key3, 40);
				done();
			});

			client.on('subscribe', function(channel, count) {
				console.log(channel);
				console.log(count);
				connector.send({
					type: 'data',
					data: {
						key1: 'value1',
						key2: 121,
						key3: 40
					}
				}, function(err){
					assert.ifError(err);
				});
			});

			client.subscribe(options.publish_key);
		});
	});

});