'use strict';

var Service, Characteristic;
var mqtt = require("mqtt");

module.exports = function(homebridge) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;

    homebridge.registerAccessory("homebridge-mqtt-fan-tasmota", "mqtt-fan-tasmota", MqttFanTasmotaAccessory);
}


function MqttFanTasmotaAccessory(log, config) {
    var that = this;

    this.log = log;

    this.state = {
        speed: 0,
        power: false,
        reachable: true
    };

    this.url = config['url'];
    this.topic = config['topic'];
    this.name = config['name'];
    this.serialNumber = config['serialNumber'] || "";

    this.topicFanspeedSet = 'cmnd/' + this.topic + '/fanspeed';
    this.topicResultGet = 'stat/' + this.topic + '/RESULT';
    this.topicTeleLWT = 'tele/' + this.topic + '/LWT';

    this.client_Id = 'mqttjs_' + Math.random().toString(16).substr(2, 8);
    this.options = {
        keepalive: 10,
        clientId: this.client_Id,
        protocolId: 'MQTT',
        protocolVersion: 4,
        clean: true,
        reconnectPeriod: 1000,
        connectTimeout: 30 * 1000,
        will: {
            topic: 'WillMsg',
            payload: 'Connection Closed abnormally..!',
            qos: 0,
            retain: false
        },
        username: config["username"],
        password: config["password"],
        rejectUnauthorized: false
    };

    this.client = mqtt.connect(this.url, this.options);
    this.client.on('message', function(topic, message) {
        if (topic == that.topicResultGet) {
            var data = {};
            try { data = JSON.parse(message); } catch(e) {}

            if (data.hasOwnProperty('FanSpeed')) {
                that.fanService
                    .getCharacteristic(Characteristic.RotationSpeed)
                    .setValue(data['FanSpeed'], undefined, 'fromMQTT');

                    that.fanService.getCharacteristic(Characteristic.On).setValue(data['FanSpeed'] > 0, undefined, 'fromMQTT');
            }   
        }

        if (topic == that.topicTeleLWT) {
            if (message == "Offline") {
                that.state.reachable = false;
                that.fanService.getCharacteristic(Characteristic.On).setValue(new Error("Unreachable"));
            }
            if (message == "Online") {
                that.state.reachable = true;
                that.fanService.getCharacteristic(Characteristic.On).setValue(that.state.speed);
            }
        }
    });

    this.client.subscribe(this.topicResultGet);
    this.client.subscribe(this.topicTeleLWT);
}

MqttFanTasmotaAccessory.prototype.getServices = function() {
    var informationService = new Service.AccessoryInformation();
    informationService
        .setCharacteristic(Characteristic.Name, this.name)
        .setCharacteristic(Characteristic.Manufacturer, 'ITEAD')
        .setCharacteristic(Characteristic.Model, 'Sonoff iFan02')
        .setCharacteristic(Characteristic.SerialNumber, this.serialNumber);

    this.fanService = new Service.Fan();

    this.fanService.getCharacteristic(Characteristic.On)
        .on('get', this.getOn.bind(this))
        .on('set', this.setOn.bind(this));

    this.fanService.getCharacteristic(Characteristic.RotationSpeed)
        .setProps({ minValue: 0, maxValue: 3})
        .on('get', this.getSpeed.bind(this))
        .on('set', this.setSpeed.bind(this));

    return [informationService, this.fanService];
}

MqttFanTasmotaAccessory.prototype.getOn = function(callback) {
    if (! this.state.reachable) {
        callback("no_response");
        return;
    }

    callback(null, this.state.power);
}

MqttFanTasmotaAccessory.prototype.setOn = function(value, callback, context) {
    if (! this.state.reachable) {
        callback("no_response");
        return;
    }

    if (this.state.power != value) {
        this.log('Setting power to ' + value);
        this.state.power = value;

        if (context !== 'fromMQTT') {
            if (this.state.power) {
                this.client.publish(this.topicFanspeedSet, this.state.speed.toString());
            } else {
                this.client.publish(this.topicFanspeedSet, "0");
            }
        }
    }
    
    callback(null);
}

MqttFanTasmotaAccessory.prototype.setSpeed = function(value, callback, context) {
    if (! this.state.reachable) {
        callback("no_response");
        return;
    }

    if (this.state.speed != value) {
        this.log("Setting speed to " + value);
        this.state.speed = value;

        if (context !== 'fromMQTT' && this.state.power) {
            this.client.publish(this.topicFanspeedSet, this.state.speed.toString());
        }
    }

    callback(null);
}

MqttFanTasmotaAccessory.prototype.getSpeed = function(callback) {
    if (! this.state.reachable) {
        callback("no_response");
        return;
    }

    callback(null, this.state.speed);
}
