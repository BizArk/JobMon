import numeral from 'numeral';

export class NumberValueConverter {
	toView(value, fmt) {
		return numeral(value).format(fmt || '0,0');
	}
}

