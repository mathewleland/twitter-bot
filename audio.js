var twit = require('twit');
var config = require('./config.js');
var rita = require('rita');
var midi = require('jsmidgen');
var fs = require('fs');
var path = require('path');
var child_process = require('child_process');
var ffmpegPath = require('@ffmpeg-installer/ffmpeg');
var ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath.path);

var bot = new twit(config);

var bot_username = '@mathewstwitbot';
var imgFn = path.join(process.cwd(), 'https://static-s.aa-cdn.net/img/gp/20600004317609/D3-HPa_LtLX4JTcwiWa85ImVyWjJi2phLlHK91dYt8t8insyOuGVsVDBOU0hEt3AaA=h900');
var midiFn = path.join(process.cwd(), 'output.mid');
var wavFn = path.join(process.cwd(), 'output.wav');
var vidFn = path.join(process.cwd(), 'output.mp4');

var stream = bot.stream('statuses/filter', {track: bot_username});
stream.on('connecting', function(response) { console.log('connecting...') });
stream.on('connected', function(response) { console.log('connected!'); });
stream.on('error', function(err) { console.log(err); });

stream.on('tweet', function(tweet) {
  if (tweet.text.length > 0) {
    createMedia(tweet, imgFn, midiFn, wavFn, vidFn, function(err) {
      if (err) console.log(err);
      else {
        console.log('media created');
        deleteWav(wavFn, function(err) {
          if(err) console.log(err);
          else uploadMedia(tweet, vidFn);
        })
      }

    })
  }
})

function createMedia(tweet, imgFn, midiFn, wavFn, vidFn, cb) {
  createMidi(tweet, midiFn, function(err, result) {
    if (err) console.log(err);
    else convertMidiToWav(midiFn, wavFn, function(err) {
      if (err) console.log(err);
      else console.log('Midi converted');
      createVideo(imgFn, wavFn, vidFn, cb);
    })
  })
}


function createMidi(tweet, midiFn, cb) {
  var file = new midi.File();
  var track = new midi.Track();
  file.addTrack(track);
  var cleanedText = rita.RiTa.tokenize(tweet.text)
                             .filter(isNotPunctuation)
                             .join(' ');
  var taggedTweet = getPartsOfSpeech(cleanedText);
  compose(taggedTweet, track);
  fs.writeFile(midiFn, file.toBytes(), {encoding: 'binary'}, cb);
}

function getPartsOfSpeech(text) {
  return rita.RiTa.getPosTags(text);
}

function cleanText(text) {
  return text.split(' ')
              .filter(hasNoStopwords)
              .join(' ')
              .trim();
}

function hasNoStopwords(token) {
  var stopwards = ['@', 'RT', 'http'];
  return stopwards.every(function(sw) {
    return !token.includes(sw);
  })
}

function isNotPunctuation(token) {
  return !rita.RiTa.isPunctuation(token);
}

function compose(taggedTweet, track) {
  var notes = taggedTweet.map(function(tag) {
    if (tag.includes('nn') || tag.includes('i')) {
      return 'e4';
    }
    if (tag.includes('vb')){
      return 'g4';
    }
    return 'c4;'
  });
  notes.forEach(function(note) {
    track.addNote(0, note, 128);
  });
  return track;
}

function convertMidiToWav(midiFn, wavFn, cb) {
  var command = 'timidity --output-24bit -A120 '+ midiFn + ' -0w -o ' + wavFn;
  child_process.exec(command, {}, function(err, stdout, stderr) {
    if (err) console.log(cb(err));
    else cb(null);

  })
}

function createVideo(imgFn, wavFn, vidFn, cb) {
  ffmpeg()
    .on('end', function() { cb(null); })
    .on('error', function(err, stdout, stderr) { cb(err); })
    .input(imgFn)
    .inputFPS(1/6)
    .input(wavFn)
    .output(vidFn)
    .outputFPS(30)
    .run();
}

function deleteWav(wavFn, cb) {
  var command = 'rm ' + wavFn;
  child_process.exec(command, {}, function(err,stdout,stderr) {
    if(err) cb(err);
    else cb(null);
  })
}

function uploadMedia(tweet, vidFn) {
  bot.postMediaChunked({file_path: vidFn}, function(err, data, response) {
    if (err) console.log(err);
    else {
      var stat = tweet.text.split(bot_username)
                .join(' ')
                .trim();
      var params = {
        status: '@' + tweet.user.screen_name + ' ' + stat,
        in_reply_to_status_id: tweet.id_str,
        media_ids: data.media_id_string
      }
      postStatus(params);
    }
  })
}

function postStatus(params) {
  bot.post('statuses/update', params, function(err, data, response) {
    if (err) console.log(err);
    else console.log('bot has posted!');
  })
}
