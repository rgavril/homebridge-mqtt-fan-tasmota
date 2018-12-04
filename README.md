# homebridge-mqtt-fan-tasmota
Homebridge Plugin that Exposes the Fan on [Sonoff IFan02 / Tasmota MQTT](https://github.com/arendst/Sonoff-Tasmota/wiki/Sonoff-iFan02)


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
* "url": The url of the MQTT broker (required)

# To Do
* Implement username and password MQTT authentication
