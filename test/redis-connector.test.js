'use strict';

var cp     = require('child_process'),
	assert = require('assert'),
	connector;

var options = {
	user: 'redisplugin',
	pass: 'HelloWorld2016',
	host: 'pub-redis-15275.us-east-1-4.2.ec2.garantiadata.com',
	port: 15275,
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

	describe('#data', function () {
		it('should process the data', function (done) {
			this.timeout(6000);
			var redis  = require('redis'),
				url    = 'redis://' + options.user + ':' + options.pass + '@' + options.host + ':' + options.port,
				client = redis.createClient(url);

			client.on('message', function (channel, message) {
				message = JSON.parse(message);

				assert.equal(message.key1, 'value1');
				assert.equal(message.key2, 121);
				assert.equal(message.key3, 40);
				done();
			});

			client.on('subscribe', function () {
				connector.send({
					type: 'data',
					data: {
						key1: 'value1',
						key2: 121,
						key3: 40
					}
				}, function (err) {
					assert.ifError(err);
				});
			});

			client.subscribe(options.publish_key);
		});
	});
});