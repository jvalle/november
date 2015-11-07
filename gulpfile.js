var gulp = require('gulp'),
    gutil = require('gulp-util'),

    // gulp plugins and helpers
    browserify = require('browserify'),
    jshint = require('gulp-jshint'),
    lr = require('gulp-livereload'),
    nodemon = require('nodemon'),
    open = require('open'),
    source = require('vinyl-source-stream'),
    stylish = require('jshint-stylish'),
    stylus = require('gulp-stylus'),
    watchify = require('watchify');

// configuration
var paths = {
  libs: {
    all: ['./client/vendor/*.js'],
    dest: './dist/js/vendor'
  },
  html: {
    all: ['./client/index.html'],
    dest: './dist'
  },
  assets: {
    all: ['./client/assets/**/*'],
    dest: './dist/assets/'
  },
  js: {
    main: './client/js/main.js',
    all: ['./client/js/**/*.js', './gulpfile.js'],
    dest: './dist/js'
  },
  stylus: {
    main: './client/styl/index.styl',
    all: './client/styl/**/*.styl',
    dest: './dist/css'
  }
};

gulp.task('copy:html', function () {
  return gulp.src(paths.html.all)
    .pipe(gulp.dest(paths.html.dest))
    .pipe(lr());
});

gulp.task('copy:libs', function () {
  return gulp.src(paths.libs.all)
    .pipe(gulp.dest(paths.libs.dest))
    .pipe(lr());
});

gulp.task('copy:assets', function () {
  return gulp.src(paths.assets.all)
    .pipe(gulp.dest(paths.assets.dest))
    .pipe(lr());
});

gulp.task('stylus', function () {
  return gulp.src(paths.stylus.main)
    .pipe(stylus())
    .pipe(gulp.dest(paths.stylus.dest))
    .pipe(lr());
});

gulp.task('lint', function () {
  return gulp.src(paths.js.all)
    .pipe(jshint())
    .pipe(jshint.reporter(stylish));
});

gulp.task('js', ['lint'], function () {
  return browserify(paths.js.main, {})
    .bundle()
    .on('log', gutil.log)
    .on('error', gutil.log.bind(gutil, 'Browserify Error'))
    .pipe(source('bundle.js'))
    .pipe(gulp.dest(paths.js.dest));
});

gulp.task('watch', ['lint'], function () {
  lr.listen();

  var bundler = watchify(browserify(paths.js.main, {
    cache: {},
    packageCache: {},
    fullPaths: true,
    debug: true
  }));

  function rebundle() {
    gutil.log('Starting Watchify rebundle');
    return bundler.bundle()
        .on('log', gutil.log)
        .on('error', gutil.log.bind(gutil, 'Browserify Error'))
        .pipe(source('bundle.js'))
        .pipe(gulp.dest(paths.js.dest))
        .pipe(lr())
        .on('time', function(time) {
          gutil.log('Finished bundling after:', gutil.colors.magenta(time + 'ms'));
        });
  }

  bundler.on('update', rebundle);
  gulp.watch(paths.js.all, ['lint']);
  gulp.watch(paths.html.all, ['copy:html']);
  gulp.watch(paths.assets.all, ['copy:assets']);
  gulp.watch(paths.stylus.all, ['stylus']);

  return rebundle();
});

// gulp.task('server', function () {
//   nodemon({
//     'script': 'app.js',
//     'ext': 'js,json,hbs',
//     'ignore': ['.git', 'dist/**', 'client/**']
//   });
// });

gulp.task('default', ['copy:html', 'copy:assets', 'copy:libs', 'stylus', 'watch']);
