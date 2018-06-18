var request = require('request');
var cheerio = require('cheerio');

/* 1.
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
*/

/* 2.
// Doesnt work for dynamic content
request('https://mainnet.aion.network', function (error, response, html) {
  if (!error && response.statusCode == 200) {
    var $ = cheerio.load(html);
    $('span.comhead').each(function(i, element){
      var a = $(this).prev();
      console.log(a.text());
    });
  }
});
*/

/* 3.
// Zombie module doesn't work
var url = 'https://mainnet.aion.network'
var Zombie = require('zombie');
var text = new Promise(function(resolve){
var selector = 'body';
var browser = new Zombie();
  browser.visit(url, function(){
    browser.wait({duration: 500}).then(function(){
      resolve(browser.text(selector));
    });
  });
});
*/