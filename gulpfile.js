const gulp = require('gulp');
const uglify = require('gulp-uglify');
const livereload = require('gulp-livereload');
const concat = require('gulp-concat');
const autoprefixer = require('gulp-autoprefixer');
const plumber = require('gulp-plumber');
const sourcemaps = require('gulp-sourcemaps');
const rename = require('gulp-rename');
const del = require('del');
const zip = require('gulp-zip');
const sequence = require('run-sequence');
const babel = require('gulp-babel');
const sass = require('gulp-sass');
const packageImporter = require('node-sass-package-importer');
const imagemin = require('gulp-imagemin');
const imageminPngquant = require('imagemin-pngquant');
const imageminJpegRecompress = require('imagemin-jpeg-recompress');

const DIST_PATH = 'public/dist';
const SCRIPTS_PATH = 'public/scripts/**/*.js';
const SCSS_PATH = 'public/scss/**/*.scss';
const IMAGES_PATH = 'public/images/**/*.{png,jpeg,jpg,svg,gif}';
const EXPORT_PATH = 'export';

gulp.task('clean', () => {
  return del.sync([DIST_PATH, EXPORT_PATH]);
});

gulp.task('export', () => {
  return gulp
    .src(['public/**/dist/**/*', 'public/index.html'])
    .pipe(zip('website.zip'))
    .pipe(gulp.dest(EXPORT_PATH));
});

gulp.task('styles', () => {
  return gulp
    .src('public/scss/styles.scss')
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(
      autoprefixer({
        browsers: ['last 2 versions', 'ie 8']
      })
    )
    .pipe(
      sass({
        outputStyle: 'compressed',
        importer: packageImporter({
          extensions: ['.scss']
        })
      })
    )
    .pipe(rename({ suffix: '.min' }))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(DIST_PATH))
    .pipe(livereload());
});

gulp.task('images', () => {
  return gulp
    .src(IMAGES_PATH)
    .pipe(
      imagemin([
        imagemin.gifsicle(),
        imagemin.jpegtran(),
        imagemin.optipng(),
        imagemin.svgo(),
        imageminPngquant(),
        imageminJpegRecompress()
      ])
    )
    .pipe(gulp.dest(DIST_PATH + '/images'));
});

gulp.task('scripts', () => {
  return gulp
    .src(SCRIPTS_PATH)
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(
      babel({
        presets: ['es2015'],
        plugins: ['transform-es2015-modules-umd']
      })
    )
    .pipe(uglify())
    .pipe(concat('scripts.js'))
    .pipe(rename({ suffix: '.min' }))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(DIST_PATH))
    .pipe(livereload());
});

gulp.task('build', () => {
  sequence('clean', ['styles', 'images', 'scripts']);
});

gulp.task('watch', ['build'], () => {
  require('./server');
  livereload.listen();
  gulp.watch(SCSS_PATH, ['styles']);
  gulp.watch(SCRIPTS_PATH, ['scripts']);
});

gulp.task('default', ['watch'], () => {});
