// Project Setup
const rp = require('request-promise');
const cheerio = require('cheerio');

// Setting up Request
const options = {
    //uri: `https://www.google.com`,
    uri: `https://mainnet.aion.network/`,
    transform: function (body) {
        return cheerio.load(body);
    }
};

// Making the Request
rp(options)
    .then(($) => {
        console.log($);
    })
    .catch((err) => {
        console.log(err);
    });