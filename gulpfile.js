const gulp = require('gulp'),
  uglify = require('gulp-uglify'),
  browserSync = require('browser-sync').create(),
  concat = require('gulp-concat'),
  autoprefixer = require('gulp-autoprefixer'),
  plumber = require('gulp-plumber'),
  sourcemaps = require('gulp-sourcemaps'),
  rename = require('gulp-rename'),
  del = require('del'),
  zip = require('gulp-zip'),
  sequence = require('run-sequence'),
  babel = require('gulp-babel'),
  sass = require('gulp-sass'),
  packageImporter = require('node-sass-package-importer'),
  imagemin = require('gulp-imagemin'),
  imageminPngquant = require('imagemin-pngquant'),
  imageminJpegRecompress = require('imagemin-jpeg-recompress');

const DIST_PATH = 'public/dist',
  IMAGES_PATH = 'public/images/**/*.{png,jpeg,jpg,svg,gif}',
  SCRIPTS_PATH = 'public/scripts/**/*.js',
  SCSS_PATH = 'public/scss/**/*.scss',
  HTML_PATH = 'public/*.html',
  EXPORT_PATH = 'export';

gulp.task('clean', () => {
  return del.sync([DIST_PATH, EXPORT_PATH]);
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
    .pipe(
      rename({
        suffix: '.min'
      })
    )
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(DIST_PATH))
    .pipe(browserSync.stream());
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
    .pipe(
      rename({
        suffix: '.min'
      })
    )
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(DIST_PATH))
    .pipe(browserSync.stream());
});

gulp.task('html', () => {
  return gulp.src('public/index.html').pipe(gulp.dest(DIST_PATH));
});

gulp.task('build', () => {
  return sequence('clean', ['images', 'styles', 'scripts', 'html']);
});

gulp.task('export', () => {
  return gulp
    .src(DIST_PATH + '/**/*')
    .pipe(zip('website.zip'))
    .pipe(gulp.dest(EXPORT_PATH));
});

gulp.task('watch', ['build'], () => {
  browserSync.init({
    server: DIST_PATH,
    index: 'index.html'
  });
  gulp.watch(SCSS_PATH, ['styles']);
  gulp.watch(SCRIPTS_PATH, ['scripts']);
  gulp.watch(HTML_PATH, ['html']).on('change', browserSync.reload);
});

gulp.task('default', ['watch'], () => {});
