"use strict";
var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var sourcemaps = require("gulp-sourcemaps");
var babel = require('gulp-babel');

gulp.task("lib_bundle", () => {
    return gulp.src(["lib/jquery.js", "lib/moment.js"])
      .pipe(concat("lib_bundle.js"))
      .pipe(gulp.dest("build/"));
});

gulp.task("src_bundle", () => {
    var js_globs = ["www/js/*.js",
                     "!www/js/bundle.js",
                     "www/js/Models/*.js",
                     "www/js/Views/*.js",
                     "www/js/Controllers/*.js",
                     "www/js/Datatypes/*.js",
                     "www/js/Datatypes/Collections/*.js"];
    return gulp.src(js_globs)
      .pipe(babel())
      .pipe(concat("src_bundle.js"))
      .pipe(gulp.dest("build/"));
});

gulp.task("js_bundle", () => {
    gulp.src("build/*.js")
      .pipe(concat("bundle.js"))
      .pipe(uglify())
      .pipe(gulp.dest("www/js"));
});

gulp.task("default", ["lib_bundle", "src_bundle", "js_bundle"]);