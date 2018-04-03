var http = require('http');

function performHttpRequest(jsonData, callback) {
    var options = {
        hostname: '127.0.0.1',
        port: 8545,
        method: 'POST',
        //auth    : instance.user + ':' + instance.password,
        headers: {
            'Content-Length': jsonData.length
        }
    };

    var parseJson = function (res, data) {
        var dataJson;

        if (res.statusCode === 401) {
            logger('error', 'Unauthorized RPC access - invalid RPC username or password');
            return;
        }

        try {
            dataJson = JSON.parse(data);
        }
        catch (e) {
            if (data.indexOf(':-nan') !== -1) {
                data = data.replace(/:-nan,/g, ":0");
                parseJson(res, data);
                return;
            }
            logger('error', 'Could not parse rpc data from daemon instance  ' + instance.index
                + '\nRequest Data: ' + jsonData
                + '\nReponse Data: ' + data);

        }
        if (dataJson)
            callback(dataJson.error, dataJson, data);
    };

    var req = http.request(options, function (res) {
        var data = '';
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            data += chunk;
        });
        res.on('end', function () {
            parseJson(res, data);
        });
    });

    req.on('error', function (e) {
        if (e.code === 'ECONNREFUSED')
            callback({type: 'offline', message: e.message}, null);
        else
            callback({type: 'request error', message: e.message}, null);
    });

    req.end(jsonData);
}

exports.cmd = function (method, params, callback, streamResults, returnRawData) {

    var results = [];
     var itemFinished = async function (error, result, data) {

        var returnObj = {
            error: error,
            response: (result || {}).result,
        };

        if (returnRawData) returnObj.data = data;
        if (streamResults) callback(returnObj);
        else results.push(returnObj);
        callback(result);
        itemFinished = function () {
        };
    };

    var requestJson = JSON.stringify({
        method: method,
        params: params,
        id: Date.now() + Math.floor(Math.random() * 10)
    });

    performHttpRequest(requestJson, function (error, result, data) {
        itemFinished(error, result, data);
    });
}


