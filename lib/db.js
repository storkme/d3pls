/**
 * Created by stork on 27/08/2014.
 */
var MongoClient = require('mongodb').MongoClient

module.exports = function (connectionString) {
    return MongoClient.connectAsync(connectionString).disposer(function (connection, promise) {
        connection.close();
    });
};