var twit = require('twit');
var config = require('./config.js');
var fs = require('fs');
var request = require('request');
var vision = require('@google-cloud/vision')({
  projectId: 'myOwnIdHere',
  keyFilename: './keyfile.json'
});


var bot = new twit(config);





// POST A STATUS
function postStatus(status) {
  bot.post('statuses/update', {status: status}, function(err, data, response) {
    if (err) {
      console.log(err);
    } else {
      console.log(data.text + ' was tweeted.');
    }
  })
}


// SEE CURRENT FRIENDS
function getFriends(screenName) {
  bot.get('followers/list', {screen_name: screenName}, function(err, data, response) {
  if (err) {
    console.log(err);
  } else {
    console.log(data);
  }
})
}


// FOLLOW SOMEONE
function(screenName) {
bot.post('friendships/create', {screen_name: 'BarackObama'}, function(err, data, response) {
  if (err) {
    console.log(err)
  } else {
    console.log(data);
  }
})
}



// USEFUL TO LOOKUP A GIVEN FRIEND AND SEE IF YOU HAVE A FOLLOWING OR FOLLOWED BY CONNECTION
// bot.get('friendships/lookup', {screen_name: 'BarackObama'}, function(err, data, response) {
//   if (err) {
//     console.log(err);
//   } else {
//     console.log(data);
//   }
// })

// DM someone
function directMessage(screenName, message) {
  bot.post('direct_messages/new', {screen_name: screenName, text: message}, function(err, data, response) {
    if (err) console.log(err);
    else console.log(data);
  })
}


// print out all the statuses from the home page
function getBotTimeline() {
  bot.get('statuses/home_timeline', {count: 2}, function(err, data, response) {
    if (err) {
      console.log(err);
    } else {
      data.forEach(function(d) {
        console.log(d.text);
        console.log('from ' + d.user.screen_name);
        console.log(d.id_str)
        console.log(d);
        console.log('\n');
      })
    }
  })
}

function retweet(tweetId) {
  bot.post('statuses/retweet/:id', {id: tweetId}, function(err, data, response) {
    if (err) {
      console.log(err);
    } else {
      console.log(data.text + ' was retweeted');
    }
  })
}

function unretweet(tweetId) {
  bot.post('statuses/unretweet/:id', {id: tweetId}, function(err, data, response) {
    if (err) console.log(err);
    else console.log(data.text + ' was retweeted');
  })
}

function likeTweet(tweetId) {
  bot.post('favorites/create', {id: tweetId}, function(err,data,response) {
    if (err) {
      console.log(err);
    } else {
      console.log(data.text + ' was liked');
    }
  })
}

function replyToTweet(tweetId, screen_name) {
  bot.post('statuses/update', {status: screen_name + ' Cool!', in_reply_to_status_id: tweetId}, function(err, data, response) {
    if (err) {
      console.log(err);
    } else {
      console.log(data);
    }
  })
}

function deleteTweet(tweetId) {
  bot.post('statuses/destroy/:id', {id: tweetId}, function(err,data,resposne){
    if(err) {
      console.log(err);
    } else {
      console.log(data);
    }
  })
}

function searchTweets(searchQuery, limit) {
    //search query can be 'happy =birthday ' or '#superbowl' or 'from:@mathewstwitbot'
    //DOCS: https://dev.twitter.com/rest/public/search
    //in addition to q and count params, result_type: 'popular' or 'recent'
    // or geocode: 'lat, lon'

    bot.get('search/tweets', {q: searchQuery, count: limit}, function(err,data,response){
    if(err) {
      console.log(err);
    } else {
      data.statuses.forEach(function(s) {
        console.log(s.text);
        console.log(s.user.screen_name);
        console.log('\n');
      })
    }
  })
}

//watch tweets as they come in
function watchStream(keyword) {
  const stream = bot.stream('statuses/filter', {track: keyword});

  stream.on('tweet', function(tweet) {
    console.log(tweet.text + '\n');
  });
}


function uploadMedia(descriptionText, filename) {
  var filePath = __dirname + '/' + filename;
  bot.postMediaChunked({file_path: filePath}, function(err,data,response){
    if (err){
      console.log(err);
    } else {
      console.log(data);
      var params  = {
        status: descriptionText,
        media_ids: data.media_id_string
      };
      postStatus(params);
    }
  })
}

function postStatus(params) {
  bot.post('statuses/update', params, function(err, data, response) {
    if (err) {
      console.log(err);
    } else {
      console.log('status posted');
    }
  })
}

// MONITOR STREAMS TO LISTEN TO WHEN YOU ARE MENTIONED
// var stream = bot.stream('statuses/filter', {track: 'mathewstwitbot'});
//
// stream.on('connecting', function(response){ console.log('connnecting...'); });
// stream.on('connected', function(response){ console.log('connected!'); });
// stream.on('error', function(err) { console.log(err); })
//
// stream.on('tweet', function(tweet) {
//   if (tweet.entities.media) {
//     downloadPhoto(tweet.entities.media[0].media_url, tweet.user.screen_name, tweet.id_str);
//   }
// })
