var twit = require('twit');
var config = require('./config');
var request = require('request');
var fs = require('fs');

var bot = new twit(config);

request.get({
  url: "https://api.nytimes.com/svc/mostpopular/v2/mostviewed/all-sections/1.json",
  qs: {
    'api-key': "1ae39a5cb8c54dd79a5362dd7de1ca63"
  },
}, function(err, response, body) {
  const story = JSON.parse(body).results[0];
  // const headline = body.results[0]
  const headline = story.title;
  const linkURL = story.url;

  // console.log(headline);
  // console.log(linkURL);
  const tweetContent = headline + ' ' + linkURL;
  console.log(tweetContent);

  bot.post('statuses/update', {status: tweetContent}, function(err, data, response) {
    if (err) console.log(err);
    else console.log(tweetContent + ' was successfully tweeted!');
  });
})
