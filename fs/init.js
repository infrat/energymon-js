load('api_file.js');
load('api_mqtt.js');
load('api_gpio.js');
load('api_config.js');
load('api_timer.js');

let pcnt = 0;

// remove few unnecessary js api libraries to free up some space
File.remove('api_neopixel.js');
File.remove('api_ota.js');

GPIO.set_button_handler(Cfg.get('energy.sensor_gpio'), GPIO.PULL_UP, GPIO.INT_EDGE_POS, Cfg.get('energy.sensor_debounce'), function() {
    pcnt++;
}, null);

function _top() {
    return 'v1/' + Cfg.get('mqtt.user') + '/things/' + Cfg.get('mqtt.client_id') + "/data/" + JSON.stringify(Cfg.get('energy.cayenne_channel'));
}

function _pub(msg) {
    return MQTT.pub(_top(), msg, 1);
}

function up() {
    let pulse = Math.ceil(pcnt / Cfg.get('energy.pulse_div'));
    let power = Math.ceil((pulse / Cfg.get('energy.pulse_per_unit')) / (1 / (3600 / (Cfg.get('energy.upload_interval')))) * 1000);
    let msg = "power," + "w=" + JSON.stringify(power);
    let res = _pub(msg);
    print('MQTT Message: \'' + msg + '\'; Topic: ' + _top());
    if (res) {
        print('MQTT Message published');
    }
    pcnt = 0;
}

Timer.set(Cfg.get('energy.upload_interval') * 1000, true, up, null);
