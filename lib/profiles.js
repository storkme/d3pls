/**
 * Created by alex.storkey on 27/08/2014.
 */

var rp = require('request-promise');

module.exports = function (host, name, code) {
    return rp('http://' + host + '/api/d3/profile/' + name + '-' + code)
        .then(function (result) {
            return JSON.parse(result);
        });
};