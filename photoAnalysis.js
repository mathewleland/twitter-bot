var twit = require('twit');
var config = require('./config.js');
var fs = require('fs');
var request = require('request');
var vision = require('@google-cloud/vision')({
  projectId: 'mathewstwitbot',
  keyFilename: './keyfile.json' //get it from the cloud vision website.
})


var bot = new twit(config);
var stream = bot.stream('statuses/filter', {track: '@mathewstwitbot'});

stream.on('connecting', function(response) {
  console.log('connecting...');
});

stream.on('connected', function(response) {
  console.log('connected!');
});

stream.on('error', function(err) {
  console.log(err);
});

stream.on('tweet', function(tweet) {
  if (tweet.entities.media) {
    downloadPhoto(tweet.entities.media[0].media_url, tweet.user.screen_name, tweet.id_str);
  }
});

function downloadPhoto(url, replyToName, tweetId) {
  var parameters = {
    url: url,
    encoding: 'binary'
  };
  request.get(parameters, function(err, response, body) {
    var filename = 'photo'+Date.now() + '.jpg';
    fs.writeFile(filename, body, 'binary', function(err) {
      console.log('Downloaded photo.');
      analyzePhoto(filename, replyToName, tweetId);
    });
  });
}

function analyzePhoto(filname, replyToName, tweetId) {
  vision.detectFaces(filename, function(err, faces) {
    var allEmotions = [];
    faces.forEach(function(face) {
      extractFaceEmotions(face).forEac(function(emotion) {
        if (allEmotions.indexOf(emotion) === -1) {
          allEmotions.push(emotion);
        }
      });
    });
    postStatus(allEmotions, replyToName, tweetId);
  });
}

function extractFaceEmotions(face) {
  var emotions = ['joy', 'anger', 'sorrow', 'surprise'];
  return emotions.filter(function(emotion) {
    return face[emotion];
  })
}

function postStatus(allEmotions, replyToName, tweetId) {
  var status = formatStatus(allEmotions, replyToName);
  bot.post('statuses/update', {status: status, in_reply_to_status_id: tweetId}, function(err, data, resposne) {
    if (err) console.log(err);
    else console.log('bot has tweeted ' + status);
  })
}

function formatStatus(allEmotions, replyToName) {
  var reformatEmotions = {
    joy: "happy",
    anger: "angry",
    surprise: "surprised",
    sorrow: "sad"
  };
  var status = "@" + replyToName + ' looking ';
  if (allEmotions.length > 0 ) {
    allEmotions.forEach(function(emotion, i) {
      if (i ===0) {
        status += reformatEmotions[emotion];
      } else status += ' and ' reformatEmotions[emotion];
    });
    status += '!'
  } else status += 'neutral';

  return status;
}
