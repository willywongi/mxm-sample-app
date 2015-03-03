var http = require('http'),
	Promise = require('promise');

function JSONRequest(url) {
	return new Promise(function(resolve, reject) {
		http.get(url, function(res) {
			// explicitly treat incoming data as utf8 (avoids issues with multi-byte chars)
			res.setEncoding('utf8');
			// incrementally capture the incoming response body
			var body = '';
			res.on('data', function(d) {
				body += d;
			});
	 
			// do whatever we want with the response once it's done
			res.on('end', function() {
				try {
					var parsed = JSON.parse(body);
				} catch (err) {
					console.error('Unable to parse response as JSON', err);
					//return cb(err);
					reject(err);
				}
				// pass the relevant data back to the callback
				resolve(parsed);
			});
		}).on('error', function(err) {
			// handle errors with the request itself
			console.error('Error with the request:', err.message);
			reject(err);
		});
	});
}

function encodeOptions(options) {
	return Object.keys(options).map(function(k) {
			return k + "=" + encodeURIComponent(options[k]);
		}).join("&");
}

function MXM(apiKey) {
	this.apiKey = apiKey;
	this.baseURL = "http://api.musixmatch.com/ws/1.1/";
}

MXM.prototype.method = function(methodName, options) {
	var url = this.baseURL + methodName + "?apikey="  + this.apiKey + "&" + encodeOptions(options);
	return new Promise(function(resolve, reject) {
		JSONRequest(url).then(function(res) {
			if (res.message.header.status_code == 200) {
				resolve(res.message.body);
			} else {
				reject(res.message.header);
			}
		}, reject);
	});
}

module.exports = MXM;


