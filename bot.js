var twit = require('twit');
var config = require('./config.js');
var fs = require('fs');
// var csvparse = require('csv-parse');
var rita = require('rita');
var inputText = "Mathew spends a lot of time in front of text editors.  Stevie doesnt like that very much.  So he sleeps with Jack out in the living room.";
var request = require('request');
var vision = require('@google-cloud/vision')({
  projectId: 'myOwnIdHere',
  keyFilename: './keyfile.json'
});


var bot = new twit(config);





// POST A STATUS
// bot.post('statuses/update', {status: 'hello world!'}, function(err, data, response) {
//   if (err) {
//     console.log(err);
//   } else {
//     console.log(data.text + ' was tweeted.');
//   }
// })

// SEE CURRENT FRIENDS
// bot.get('followers/list', {screen_name: 'mathewstwitbot'}, function(err, data, response) {
//   if (err) {
//     console.log(err);
//   } else {
//     console.log(data);
//   }
// })

// FOLLOW SOMEONE
// bot.post('friendships/create', {screen_name: 'BarackObama'}, function(err, data, response) {
//   if (err) {
//     console.log(err)
//   } else {
//     console.log(data);
//   }
// })

// USEFUL TO LOOKUP A GIVEN FRIEND AND SEE IF YOU HAVE A FOLLOWING OR FOLLOWED BY CONNECTION
// bot.get('friendships/lookup', {screen_name: 'BarackObama'}, function(err, data, response) {
//   if (err) {
//     console.log(err);
//   } else {
//     console.log(data);
//   }
// })

// DM someone
// bot.post('direct_messages/new', {screen_name: 'examplePerson', text: 'hello there'}, function(err, data, response) {
//   if (err) {
//     console.log(err);
//   } else {
//     console.log(data);
//   }
// })

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

function retweet() {
  bot.post('statuses/retweet/:id', {id: '859830987198537731'}, function(err, data, response) {
    if (err) {
      console.log(err);
    } else {
      console.log(data.text + ' was retweeted');
    }
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

function searchTweets() {
    bot.get('search/tweets', {q: 'kitten filter:images', count: 5}, function(err,data,response){
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
// const stream = bot.stream('statuses/filter', {track: 'kittens'});
//
// stream.on('tweet', function(tweet) {
//   console.log(tweet.text + '\n');
// });

function getPhoto() {
  var parameters = {
    url: '',
    qs: {
      api_key
    }
  }
}

function saveFile(body, filename) {
  var file = fs.createWriteStream(filename);
  request(body).pip(file).on('close', function(err){
    if (err) {
      console.log(err);
    } else {
      console.log('Media saved.');
      console.log(body);
      var descriptionText = body.title;
      uploadMedia(descriptionText, filename);
    }
  })
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

var markov = new rita.RiMarkov(3);
markov.loadText(inputText);
var sentences = markov.generateSentences(1);
console.log(markov.getProbabilities('in'));

// var filepath = 'anyfilepathhere';
// var tweetData = fs.createReadStream(filepath).pipe(csvparse({delimiter: ','})
//                 .on('data', function(row) {
//                   inputText = inputText + ' ' cleanText(row[5]);
//                  })
//                  .on('end', function() {
//                    var markov = new rita.RiMarkov(3);
//                    markove.loadText(inputText);
                      // var sentences = markov.generateSentences(1);
                      // bot.post('statuses/update', {status: sentence}, function(err, data, response) {
                      //   if (err) console.log(err) else console.log('status tweeted');
                      // })
//                  })
//
//                  }))

function hasNoStopwords(token) {
  var stopwords = ['@', 'http', 'RT'];
  return stopwards.every(function(sw) {
    return !token.includes(sw);
  })
}
function cleanText(text) {
  return rita.RiTa.tokenize(text, ' ')
          .filter(hasNoStopwords)
          .join(' ')
          .trim();
}

function downloadPhoto(url, replyToName, tweetId) {
  var parameters = {
    url: url,
    encoding: 'binary'
  };
  request.get(parameters, function(err,response, body) {
    var filename = 'photo' + Date.now() + '.jpg';
    fs.writeFile(filename, body, 'binary', funciton(err) {
      console.log('downloaded the photo');
      analyzePhoto(filename, replyToName, tweetId);
    });
  });
}

function analyzePhoto(filenmae, replyToName, tweetId) {
  vision.detectFaces(filename, function(err, faces) {
    console.log(faces);
    var allEmotions = [];
    faces.forEach(function(face) {
      extractFaceEmotions(face).forEach(function(emotion) {
        if (allEmotions.indexOf(emotion) === -1) {
          allEmotions.push(emotion);
        }
      });
    });
    postStatus(allEmotions, replyToName, tweetId);
  })
}

function extractFaceEmotions(face) {
  var emotions = ['joy', 'anger', 'sorrow', 'surprise'];
  return emotions.filter(function(emotion) {
    return face[emotion];
  })
}

postStatus(allEmotions, replyToName, tweetId) {
  var status = formatStatus(allEmotions, replyToName)
  bot.post('statuses/update', {status: status, in_reply_to_status_id: tweetId}, function(err, data, response) {
    if (err) console.log(err);
    else console.log('bot has tweeted ' + status);
  })
}

function formatStatus(allEmotions, replyToName) {
  var reformatEmotions = {
    joy: 'happy',
    anger: 'angry',
    surprise: 'surprised',
    sorrow: 'sad'
  };
  var status = '@' + replyToName + ' Looking ';
  if (allEmotions.length > 0 ) {
    allEmotions.forEach(function(emotion, i) {
      if (i === 0) {
        status = status + reformatEmotions[emotion];
      } else {
        status = status + ' and ' + reformatEmotions[emotion];
      }
    });
    status = status + '!'; 
  }
  else {
    status = status + 'neutral';
  }
}

// MONITOR STREAMS TO LISTEN TO WHEN YOU ARE MENTIONED
var stream = bot.stream('statuses/filter', {track: 'mathewstwitbot'});

stream.on('connecting', function(response){ console.log('connnecting...'); });
stream.on('connected', function(response){ console.log('connected!'); });
stream.on('error', function(err) { console.log(err); })

stream.on('tweet', function(tweet) {
  if (tweet.entities.media) {
    downloadPhoto(tweet.entities.media[0].media_url, tweet.user.screen_name, tweet.id_str);
  }
})
