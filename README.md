# homebridge-mqtt-fan-tasmota
Homebridge Plugin that Exposes the Fan on Sonoff IFan02/IFan03 using [Tasmota Firmware](https://github.com/arendst/Tasmota)


# Installation
1. Install homebridge using: npm install -g homebridge
2. Install homebridge-http using: npm install -g homebridge-mqtt-fan-tasmota

# Configuration
Sample configuration:
```
"accessories": [
        {
            "accessory": "mqtt-fan-tasmota",
            "name": "Bedroom Fan",
            "topic": "sonoff",
            "url": "mqtt://127.0.0.1"
        }
]
```

Fields:
* "accessory": Must always be "mqtt-fan-tasmota" (required)
* "name": Name visible in your homekit app (required)
* "topic": The MQTT topic set up in Tasmota firware (required)
* "url": The url of the MQTT broker (required). 

You can also specify different mqtt server parameters like username and password in the url:
```
"url" : "mqtt://username:password@ip-address:port"
```
