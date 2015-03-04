'use strict';

var path = require('path'),
	gulp = require('gulp'),
    livereload = require('gulp-livereload'),
    http = require('http'),
    st = require('st'),
    babel = require("gulp-babel"),
    Promise = require('promise'),
    fs = require('fs'),
	express = require('express');

var app = express();

gulp.task('default', ['build', 'server']);

gulp.task('build', function() {
	gulp.src("src/index.html").pipe(gulp.dest("dist"));
	gulp.src("src/lib/*").pipe(gulp.dest("dist/lib"));
	return gulp.src("src/app.js")
		.pipe(babel())
		.pipe(gulp.dest("dist"));
});

//gulp.task('watch', function() {
//  livereload.listen({
//	  port: 35730
//  });
//  gulp.watch('src/*', ['build', function(evt) {
//		console.log(evt);
//		livereload.reload();
//  }]);
//});

var EVENT;

gulp.task('reload', function() {
	console.log(EVENT);
	if (EVENT) {
		livereload.changed(EVENT.path);
		EVENT = null;
	} else {
		
	}
});

gulp.task('server', function(done) {
	// startup livereload server on default port: 35729
	livereload.listen(35730);
	// inject the livereload script
	app.use(require('connect-livereload')());
	// serve static files from ./dist
	app.use(express.static(path.join(__dirname, 'dist')));

	// reload the page when a file under ./src/ changes
	gulp.watch('src/*', ['build', 'reload']).on('change', function(event) {
		console.log("changed", event.path);
 		EVENT = event;
	});
	app.listen(8090);
});

function downloadFile(url, destination) {
	return new Promise(function(resolve, reject) {
		http.get(url, function(res) {
			// explicitly treat incoming data as utf8 (avoids issues with multi-byte chars)
			res.setEncoding('utf8');
			var output = fs.createWriteStream(destination);
			res.on('end', function() {
				resolve(true)
			});
			res.pipe(output);
		}).on('error', function(err) {
			// handle errors with the request itself
			console.error('Error with the request:', err.message);
			reject(err);
		});
	});
}

gulp.task('download', function(done) {
	var libs = [
			"http://code.jquery.com/jquery-1.10.0.min.js",
			"http://fb.me/react-with-addons-0.12.2.js",
			"http://yui.yahooapis.com/combo?pure/0.6.0/base-min.css&pure/0.6.0/grids-min.css"
		],
		libPath = path.join(__dirname, "src", "lib");
	try {
		fs.mkdirSync(libPath);
	} catch(err) {
		if (err.code != 'EEXIST') {
			throw err;
		}
	}
	
	Promise.all(libs.map(function(url) {
		return downloadFile(url, path.join(libPath, url.split("/").reverse()[0]));
	})).then(function() {
		done();
	});
	
});

