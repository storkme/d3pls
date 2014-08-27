/**
 * Created by alex.storkey on 27/08/2014.
 */

var request = require('request');

module.exports = function (host, name, code) {
    return request.getAsync('http://' + host + '/api/d3/profile/' + name + '-' + code + '/')
        .then(function (result) {
            return JSON.parse(result);
        });
};