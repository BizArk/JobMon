import environment from './environment';

//Configure Bluebird Promises.
Promise.config({
	longStackTraces: environment.debug,
	warnings: {
		wForgottenReturn: false
	}
});

export function configure(aurelia) {
	aurelia.use
		.standardConfiguration()
		.feature('resources')
		.globalResources('bootstrap/css/bootstrap.css')
		.plugin('aurelia-dialog')
		.plugin('aurelia-validation');

	if (environment.debug) {
		aurelia.use.developmentLogging();
	}

	if (environment.testing) {
		aurelia.use.plugin('aurelia-testing');
	}

	aurelia.start().then(() => aurelia.setRoot());
}
