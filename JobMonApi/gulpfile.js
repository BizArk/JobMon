var gulp = require('gulp');
var nodemon = require('gulp-nodemon');
var debug = require('debug')('jobmon.gulp')

gulp.task('default', function() {
    nodemon({
        script: 'app.js',
        ext: 'js',
        ignore: ['./node_modules/**']
    })
    .on('restart', function() {        
        debug('Restarting...');
    });
});