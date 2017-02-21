export function configure(config) {
	config.globalResources('./value-converters/number', './value-converters/date', './value-converters/nulltoemptystring' );
}
