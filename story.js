var twit = require('twit');
var config = require('./config.js');
var tracery = require('tracery-grammar');

var bot = new twit(config);

var grammar = tracery.createGrammar({
  'character': ['Karl', 'Aida,', 'Hans'],
  'action': ['walk', 'stroll', 'meander'],
  'place': ['office', 'bank', 'court'],
  'object': ['paper', 'bribe', 'official'],
  'setPronouns': [
    '[they:they][them:them][their:their]theirs:theirs]',
    '[they:she][them:her][their:her][theirs:hers]',
    '[they:he][them:him][their:his][theirs:his]'
  ],
  'setJob': [
    '[job:lawyer][actions:argued in court, filled some paperwork]',
    '[job:inspector][actions:talked with the lawyer, conducted meetings]',
    '[job:officer][actions:arrested people, stood in court room]'
  ],
  'story': ['#protagonist# the #job# went to the #place# every day.  Usually #they# #actions#. Then #they# picked up #their# #object#'],
  'origin': ['#[#setPronouns#][#setJob#][protagonist:#character#]story#']
  // 'origin': ['#character.capitalize# #action.ed# to the #place# for the #object.a#.']
});

grammar.addModifiers(tracery.baseEngModifiers);

var story = grammar.flatten('#origin#');
// console.log(story);

bot.post('statuses/update', {status: story}, function(err, data, response) {
  if (err) console.log(err)
  else console.log('bot has tweeted ' + story);
});
