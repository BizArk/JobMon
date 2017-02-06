import moment from 'moment';

export class DateValueConverter {
	toView(value, fmt) {
		return moment(value).format(fmt);
	}
}

