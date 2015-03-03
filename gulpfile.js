'use strict';

var path = require('path'),
	gulp = require('gulp'),
    livereload = require('gulp-livereload'),
    http = require('http'),
    st = require('st'),
    babel = require("gulp-babel"),
    Promise = require('promise'),
    fs = require('fs');

gulp.task('default', ['build', 'server', 'watch']);

gulp.task('build', function() {
	gulp.src("src/index.html").pipe(gulp.dest("dist"));
	gulp.src("src/lib/*").pipe(gulp.dest("dist/lib"));
	return gulp.src("src/app.js")
		.pipe(babel())
		.pipe(gulp.dest("dist"));
});

gulp.task('watch', function() {
  livereload.listen({
	  port: 35730
  });
  gulp.watch('src/*', ['build', function(evt) {
		console.log(evt);
		livereload.reload();
  }]);
});

gulp.task('server', function(done) {
  http.createServer(
    st({ path: __dirname + '/dist', index: 'index.html', cache: false })
  ).listen(8080, done);
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

