export function configure(config) {
	config.globalResources(
		'./value-converters/jm-number', 
		'./value-converters/jm-date', 
		'./value-converters/jm-nulltoemptystring',
		'./elements/jm-message-grid');
}
