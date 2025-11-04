import gulp from 'gulp';
import bro from 'gulp-bro';
import gulpSass from 'gulp-sass';
import dartSass from 'sass';
import postcss from 'gulp-postcss';
import autoprefixer from 'autoprefixer';
import rename from 'gulp-rename';
import envify from 'gulp-envify';
import uglify from 'gulp-uglify';

const { src, dest, series, parallel, watch: gulpWatch } = gulp;
const sass = gulpSass(dartSass);

const browsers = ['> 1%', 'last 2 versions'];

export function js() {
  return src('app/index.js')
    .pipe(
      bro({
        transform: ['babelify'],
        debug: true
      })
    )
    .pipe(rename('app.js'))
    .pipe(dest('public/js'));
}

export function css() {
  return src('app/styles/index.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss([autoprefixer({ overrideBrowserslist: browsers })]))
    .pipe(rename('app.css'))
    .pipe(dest('public/css'));
}

export function copyAssets() {
  return src('assets/**/*.*').pipe(dest('public'));
}

export function prodJs() {
  return src('app/index.js')
    .pipe(
      bro({
        transform: ['babelify'],
        debug: false
      })
    )
    .pipe(envify({ NODE_ENV: 'production' }))
    .pipe(uglify())
    .pipe(rename('app.min.js'))
    .pipe(dest('public/js'));
}

export function prodCss() {
  return src('app/styles/index.scss')
    .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
    .pipe(postcss([autoprefixer({ overrideBrowserslist: browsers })]))
    .pipe(rename('app.min.css'))
    .pipe(dest('public/css'));
}

function watchFiles() {
  gulpWatch('app/**/*.js', js);
  gulpWatch('app/**/*.scss', css);
  gulpWatch('assets/**/*.*', copyAssets);
}

export const build = parallel(js, css, copyAssets);
export const buildProd = parallel(prodJs, prodCss, copyAssets);
export const watch = series(build, watchFiles);
export const defaultTask = build;

gulp.task('watch', watch);
gulp.task('default', defaultTask);
gulp.task('build-prod', buildProd);
