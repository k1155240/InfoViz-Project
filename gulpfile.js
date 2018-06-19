var gulp = require('gulp');
var browserSync = require('browser-sync');
var connect = require('gulp-connect');

gulp.task('serve', function() {
    connect.server({
      root: "./",
      port: process.env.PORT || 30000
    });
  });

gulp.task('browser-sync', function() {
    browserSync({
        server: {
            baseDir: "./"
        }
    });
});

gulp.task('default', ['serve']);