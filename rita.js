var twit = require('twit');
var config = require('./config.js');
var csvparse = require('csv-parse');
var rita = require('rita');
var inputText = "Mathew spends a lot of time in front of text editors.  Stevie doesnt like that very much.  So he sleeps with Jack out in the living room.";

var bot = new twit(config);

var markov = new rita.RiMarkov(3);
markov.loadText(inputText);
var sentences = markov.generateSentences(1);
console.log(markov.getProbabilities('in'));

var filepath = 'anyfilepathhere';
var tweetData = fs.createReadStream(filepath).pipe(csvparse({delimiter: ','})
                .on('data', function(row) {
                  inputText = inputText + ' ' cleanText(row[5]);
                 })
                 .on('end', function() {
                   var markov = new rita.RiMarkov(3);
                   markove.loadText(inputText);
                      var sentences = markov.generateSentences(1);
                      bot.post('statuses/update', {status: sentence}, function(err, data, response) {
                        if (err) console.log(err) else console.log('status tweeted');
                      })
                 })

                 }))

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
