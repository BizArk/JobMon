import numeral from 'numeral';

export class JmNumberValueConverter {
	toView(value, fmt) {
		return numeral(value).format(fmt || '0,0');
	}
}

