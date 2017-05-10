var twit = require('twit');
var config = require('./config.js');
var Tabletop = require('tabletop');

var bot = new twit(config);
var spreadsheetURL = 'https://docs.google.com/spreadsheets/d/14qXcOrak5nUd5ETnVVP3RCu5HrQAGj6q9qMW99nxA6A/pubhtml';

Tabletop.init({
  key: spreadsheetURL,
  callback: function(data, tabletop) {
    console.log(data);
    data.forEach(function(d) {
      var status = d.URL + ' is a great API to use for twitter bots';
      bot.post('statuses/update', {status: status}, function(err, response, data) {
        if (err) console.log(err);
        else console.log('it worked');
      });
    });
  },
  simpleSheet:true // if we only have one sheet
});
