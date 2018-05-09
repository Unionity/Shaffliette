"use strict";
var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var sourcemaps = require("gulp-sourcemaps");
var babel = require('gulp-babel');

gulp.task("js", () => {
    var js_globs = ["lib/*.js",
                     "www/js/*.js",
                     "!www/js/bundle.js",
                     "www/js/Models/*.js",
                     "www/js/Views/*.js",
                     "www/js/Controllers/*.js",
                     "www/js/Datatypes/*.js",
                     "www/js/Datatypes/Collections/*.js"];
    return gulp.src(js_globs)
      .pipe(sourcemaps.init())
      .pipe(babel())
      .pipe(concat("bundle.js"))
      .pipe(uglify({
        mangle: { toplevel: true } 
      }))
      .pipe(sourcemaps.write("."))
      .pipe(gulp.dest("www/js"));
});
gulp.task("default", ["js"]);