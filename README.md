# Redis Connector

[![Build Status](https://travis-ci.org/Reekoh/pubnub-connector.svg)](https://travis-ci.org/Reekoh/redis-connector)
![Dependencies](https://img.shields.io/david/Reekoh/redis-connector.svg)
![Dependencies](https://img.shields.io/david/dev/Reekoh/redis-connector.svg)
![Built With](https://img.shields.io/badge/built%20with-gulp-red.svg)

Redis Connector Plugin for the Reekoh IoT Platform. Integrates a Reekoh instance to a Redis to synchronise device data.

The Redis Connector Plugin will push or publish data coming from your connected devices to your Redis Channel in real-time.

## Configuration Parameters

The following configuration parameters are injected to the plugin from the platform.

* host - The Redis Host to connect to.
* port - The port to connect to.
* user - The username to use to authenticate.
* pass - The password to use to authenticate.
* publishKey - The publish key to use to publish data.