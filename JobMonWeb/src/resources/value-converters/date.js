import moment from 'moment';

export class DateValueConverter {
	toView(value, fmt) {
		if(!moment(value).isValid()) return '';
		return moment(value).format(fmt);
	}
}

