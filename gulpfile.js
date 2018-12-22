'use strict';
try {
  require('os').networkInterfaces();
}
catch (e) {
  require('os').networkInterfaces = () => ({});
}
var gulp = require('gulp'),
  watch = require('gulp-watch'),
  sass = require('gulp-sass'),
  webserver = require('gulp-webserver'),
  rigger = require('gulp-rigger'),
  browserSync = require("browser-sync"),
  imagemin = require('gulp-imagemin'),
  autoprefixer = require('gulp-autoprefixer'),
  plumber = require('gulp-plumber'),
  typograf = require('gulp-typograf'),
  reload = browserSync.reload;


var config = {
  server: {
    baseDir: "./build"
  },
  host: 'localhost',
  livereload: true,
  port: 9001
};
gulp.task('webserver', function () {
  browserSync(config);
});
gulp.task('sass:watch', function () {
  gulp.watch('build/sass/**/*.scss', ['sass']);
});

gulp.task('typograf', function() {
  gulp.src('./build/*.html')
    .pipe(typograf({ locale: ['ru', 'en-US'], htmlEntity: { type: 'name' }, enableRule: ['common/nbsp/afterShortWord'], }))
    .pipe(gulp.dest('./build/'));
});
// Compile sass into CSS & auto-inject into browsers
gulp.task('sass', function() {
  return gulp.src("build/sass/*.scss")
    .pipe(plumber())
    .pipe(sass())
    .pipe(autoprefixer({
      browsers: ['last 99 versions'],
      cascade: false
    }))
    .pipe(gulp.dest("build/css"))
    .pipe(browserSync.stream());
});

// Default Task
gulp.task('compress', function() {
  gulp.src('build/img/*')
    .pipe(imagemin([
      imagemin.gifsicle({interlaced: true}),
      imagemin.jpegtran({progressive: true}),
      imagemin.optipng({optimizationLevel: 5}),
      imagemin.svgo({
        plugins: [
          {removeViewBox: true},
          {cleanupIDs: false}
        ]
      })
    ]))
    .pipe(gulp.dest('build/img'))
});
gulp.task('html:build', function () {
  gulp.src('*.html')
    .pipe(rigger())
    .pipe(gulp.dest('build/'))
    .pipe(reload({stream: true}));
});
gulp.task('build', [
  'html:build'
]);
gulp.task('watch', function(){
  watch('*.html', function(event, cb) {
    gulp.start('html:build');
  });
  watch('templates/*.html', function(event, cb) {
    gulp.start('html:build');
  });
});
gulp.task('default', ['build', 'webserver', 'watch', 'sass:watch']);
