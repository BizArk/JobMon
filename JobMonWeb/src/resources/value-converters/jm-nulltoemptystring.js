export class JmNullToEmptyStringValueConverter {
	toView(value) {
		return value === null ? '' : value;
	}
	fromView(value) {
		return value === '' ? null : value;
	}
}

