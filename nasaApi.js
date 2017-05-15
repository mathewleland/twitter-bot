var twit = require('twit');
var request = require('request');
var fs = require('fs');
var config = require('./config.js');

var bot = new twit(config);

function getPhoto() {
  var parameters = {
    url: 'https://api.nasa.gov/planetary/apod',
    qs: {
      api_key: 'gQUeb8GvdZfEluYBvBbtcbPZeMOrAP6BZDn8PzP0'
    },
    encdoding: 'binary'
  };
  request.get(parameters, function(err, response, body) {
    body = JSON.parse(body);
    saveFile(body, 'nasa.jpg');
  });
}

function saveFile(body, fileName) {
  var file = fs.createWriteStream(fileName);
  request(body).pipe(file).on('close', function(err) {
    if (err) console.log(err);
    else console.log('Media saved.');
    console.log(body);
    const descriptionText = body.title;
    uploadMedia(descriptionText, fileName);
  })
}

function uploadMedia(descriptionText, fileName) {
  var filePath = __dirname + '/' + fileName;
  bot.postMediaChunked({file_path: filePath}, function(err, data, response) {
    if (err) console.log(err);
    else {
      console.log(data);
      var params = {
        status: descriptionText,
        media_ids: data.media_id_string
      };
      postStatus(params);
    }
  })
}

function postStatus(params) {
  bot.post('statuses/update', params, function(err, data, response) {
    if (err) console.log(err);
    else console.log('status posted.');
  })
}



getPhoto();
