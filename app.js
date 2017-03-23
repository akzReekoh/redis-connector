'use strict'

let reekoh = require('reekoh')
let _plugin = new reekoh.plugins.Connector()
let async = require('async')
let isArray = require('lodash.isarray')
let isPlainObject = require('lodash.isplainobject')
let client = null

let sendData = (data, callback) => {
  client.publish(_plugin.config.publishKey, JSON.stringify(data), (err) => {
    if (!err) {
      _plugin.log(JSON.stringify({
        title: 'Data successfully published in Redis.',
        data: data
      }))
    }

    callback(err)
  })
}

/**
 * Emitted when device data is received.
 * This is the event to listen to in order to get real-time data feed from the connected devices.
 * @param {object} data The data coming from the device represented as JSON Object.
 */
_plugin.on('data', (data) => {
  if (isPlainObject(data)) {
    sendData(data, (error) => {
      if (error) {
        console.error(error)
        _plugin.logException(error)
      }
    })
  } else if (isArray(data)) {
    async.each(data, (datum, done) => {
      sendData(datum, done)
    }, (error) => {
      if (error) {
        console.error(error)
        _plugin.logException(error)
      }
    })
  } else {
    _plugin.logException(new Error('Invalid data received. Must be a valid Array/JSON Object. Data:' + data))
  }
})

process.on('SIGINT', () => {
  let domain = require('domain')
  let d = domain.create()

  d.once('error', (error) => {
    console.error(error)
    _plugin.logException(error)
    d.exit()
  })

  d.run(function () {
    if (client) client.end()
    d.exit()
  })
})

/**
 * Emitted when the platform bootstraps the plugin. The plugin should listen once and execute its init process.
 */
_plugin.once('ready', () => {
  let redis = require('redis')
  let url = 'redis://' + _plugin.config.user + ':' + _plugin.config.pass + '@' + _plugin.config.host + ':' + _plugin.config.port

  client = redis.createClient(url)

  client.on('error', (err) => {
    console.error('Error initializing Redis Plugin Connector connection.', err)
    _plugin.logException(err)
  })

  client.on('ready', () => {
    _plugin.log('Redis Connector Plugin initialized.')
    _plugin.emit('init')
  })
})

module.exports = _plugin
