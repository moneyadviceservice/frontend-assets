var gulp = require('gulp'),
    jsdoc = require('gulp-jsdoc'),
    livereload = require('gulp-livereload'),
    docsSrcDir = './assets/js/**/*.js',
    docsDestDir = './docs/js',
    jsDocTask;

jsDocTask = function() {
  return gulp.src(docsSrcDir)
    .pipe(
      jsdoc(docsDestDir,
        {
          path: 'ink-docstrap',
          systemName: '',
          footer: '',
          copyright: 'Copyright Money Advice Service &copy;',
          navType: 'vertical',
          theme: 'flatly',
          linenums: true,
          collapseSymbols: false,
          inverseNav: false
        },
        {
          plugins: ['plugins/markdown'],
          cleverLinks: true
        }
      )
    );
};

gulp.task('jsdoc', jsDocTask);

gulp.task('watch', function() {
  jsDocTask();
  gulp.watch(docsSrcDir, ['jsdoc']);
});