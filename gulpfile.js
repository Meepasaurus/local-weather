var gulp = require('gulp'),
	uglify = require('gulp-uglify'),
	sass = require('gulp-sass');

gulp.task('html', function(){
	gulp.src('assets/*.html')
		.pipe(gulp.dest('build/'));
});

gulp.task('scripts', function(){
	gulp.src('assets/*.js')
		.pipe(uglify())
		.on('error', console.error.bind(console))
		.pipe(gulp.dest('build/'));
});

gulp.task('styles', function(){
	return gulp.src('assets/*.scss')
		.pipe(sass().on('error', sass.logError))
    	.pipe(gulp.dest('build/'));
});

gulp.task('watch', function(){
	gulp.watch('assets/*.html', ['html']);
	gulp.watch('assets/*.js', ['scripts']);
	gulp.watch('assets/*.scss', ['styles']);
});

//build
gulp.task('default', ['html', 'scripts', 'styles']);