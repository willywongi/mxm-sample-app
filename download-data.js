/*
 * Downloads game data: it downloads lyrics for the first 100 
 * most popular songs in english, then extract the words and builds a list of the 
 * words used in the songs, indexed by # of occurrencies.
**/

var fs = require('fs'),
	path = require('path'),
	stopwords = require('./english-stopwords'),
	Promise = require('promise'),
	natural = require('natural'),
	_ = require('underscore'),
	MXM = require('./mxm'),
	keys = require('./keys'),
	mxm = new MXM(keys.musixmatch),
	tokenizer = new natural.WordTokenizer(),
	copyrightText = "******* This Lyrics is NOT for Commercial use *******",
	gameDataPath = path.join(__dirname, "game_data"),
	songs = {};
	
function wait(seconds) {
	return new Promise(function(resolve) {
		console.log('waiting %s sec', seconds);
		setTimeout(resolve, seconds * 1000);
	});
}

function mapSequential(values, promiseFn) {
	return values.reduce(function(curr, next) {
		return curr.then(function() {
			return promiseFn(next);
		});
	}, Promise.resolve(null));
}

function readFile(filePath) {
	return new Promise(function(resolve, reject) {
		fs.readFile(filePath, function(err, data) {
			if (err) {
				reject(err);
			} else {
				resolve(data);
			}
		});
	});
}

mxm.method('chart.tracks.get', {
	country: 'US',
	page: 1,
	page_size: 100,
	f_has_lyrics: 1,
	//f_music_genre_id: genreId
}).then(function(body) {
	try {
		fs.mkdirSync(gameDataPath);
	} catch(err) {
		if (err.code != 'EEXIST') {
			throw err;
		}
	}
	fs.writeFile(path.join(gameDataPath, "chart.json"), JSON.stringify(body, null, 2));
	mapSequential(body.track_list, function(o) {
		var lyricsPath = path.join(gameDataPath, o.track.track_id + ".json");
		return readFile(lyricsPath).then(function(data) {
			/* cache hit */
			var body = JSON.parse(data);
			songs[o.track.track_id] = {
				lyrics_body: body.lyrics.lyrics_body,
				track_name: o.track.track_name,
				artist_name: o.track.artist_name
			}
			console.log('Reading file for', o.track.track_name);
			return Promise.resolve(null);
		}, function() {
			/* download file */
			return mxm.method('track.lyrics.get', {
				track_id: o.track.track_id
			}).then(function(body) {
				songs[o.track.track_id] = {
					lyrics_body: body.lyrics.lyrics_body,
					track_name: o.track.track_name,
					artist_name: o.track.artist_name
				}
				fs.writeFile(lyricsPath, JSON.stringify(body, null, 2));
			});
		});
	}).then(function() {
		// Now I got all the lyrics
		var index,
			wordsFile = path.join(gameDataPath, "words.json"),
			allWords = Object.keys(songs)
				.map(function(track_id) {
					var lyrics_body = songs[track_id].lyrics_body.replace(copyrightText, ''),
						songWords = tokenizer.tokenize(lyrics_body);
					// every word of this song to lower case
					return songWords.map(function(w) { return w.toLowerCase(); });
				});
		/* http://underscorejs.org/#flatten */
		allWords = _.flatten(allWords);

		/* remove stopwords */
		allWords = _.filter(allWords, function(w) {
										return stopwords.indexOf(w) == -1; });
		/* remove numbers */
		allWords = _.filter(allWords, function(w) {
										return isNaN(parseInt(w, 10)); });
		/* remove one letter words */
		allWords = _.filter(allWords, function(w) {	return w.length != 1; });
		
		var index = _.countBy(allWords, function(word) { return word; });
		
		var reverseIndex = _.groupBy(Object.keys(index), function(w) { return index[w]; });
		
		fs.writeFile(wordsFile, JSON.stringify(reverseIndex, null, 2));
		console.log("file written", wordsFile);
		
	}, function(err) {
		console.log('Cant download all songs lyrics');
		console.log(err);
		throw err;
	})
});
