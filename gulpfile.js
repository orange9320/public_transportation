var gulp = require('gulp');
var rename = require('gulp-rename');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var jshint = require('gulp-jshint');
var minifyCSS = require('gulp-minify-css');	
var connect = require('gulp-connect');


// Default task
gulp.task('default',['scripts','css', 'connect','html','watch'], function() {

});


// JS check, concat and minify scripts
gulp.task('scripts', function(){
	gulp.src(['./src/js/lib/*.js','./src/js/app.js'])
		.pipe(concat('all.js'))
		.pipe(gulp.dest('./build/js'))
		.pipe(rename('all.min.js'))
		.pipe(uglify())
		.pipe(gulp.dest('./build/js'));
});

//css
gulp.task('css', function(){
    gulp.src(['./src/css/lib/*.css', './src/css/style.css'])
    	.pipe(concat('style.css'))
        .pipe(minifyCSS())
        .pipe(gulp.dest('./build/css'));
});

  
// Server
gulp.task('connect', function() {
  connect.server({
    root: './',
    livereload: true,
    fallback: 'index.html'
  });
});

// Watch
gulp.task('html', function () {
  gulp.src('./index.html')
    .pipe(connect.reload());
});
 
gulp.task('watch', function () {
  gulp.watch(['./index.html','./sw.js'], ['html']);
  gulp.watch(['./src/js/*.js'], ['scripts', 'html']);

});