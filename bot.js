var twit = require('twit');
var config = require('./config.js');


var bot = new twit(config);

// bot.post('statuses/update', {status: 'hello world!'}, function(err, data, response) {
//   if (err) {
//     console.log(err);
//   } else {
//     console.log(data.text + ' was tweeted.');
//   }
// })

// bot.get('followers/list', {screen_name: 'mathewstwitbot'}, function(err, data, response) {
//   if (err) {
//     console.log(err);
//   } else {
//     console.log(data);
//   }
// })

bot.post('friendships/create', {screen_name: 'BarackObama'}, function(err, data, response) {
  if (err) {
    console.log(err)
  } else {
    console.log(data);
  }
})
