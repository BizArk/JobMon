import zingchart from 'zingchart';
import { inject } from 'aurelia-framework';
import { ApplicationState } from '../../services/ApplicationState';
import moment from 'moment';
import { LogManager } from "aurelia-framework";

const log = LogManager.getLogger('JobMon.Dashboard');

@inject(ApplicationState)
export class Dashboard {

	constructor(appState) {
		this.appState = appState;

		this.summary = {
			errors: 5,
			warnings: 10,
			messages: 1000,
			instances: 100,
			jobs: 10,
			agents: 5
		};

		this.lastUpdated = new Date();

		this.errors = {
			data: null,
			criteria: {
				start: null,
				end: null
			},
			loading: false
		};
	}

	updateErrorGrid(e) {
		log.debug(e);
		var errors = this.errors;
		errors.loading = true;

		var criteria = errors.criteria;
		criteria.start = e.detail.start;
		criteria.end = e.detail.end;

		errors.data = [];
		for (var i = 0; i < e.detail.value; i++) {
			var dt = moment(criteria.start);
			var seconds = parseInt(3600 * Math.random(), 10);
			dt = dt.add(seconds, 'seconds');
			errors.data.push({
				logLevel: 'Error',
				created: dt,
				message: `Message ${i}`,
				job: {
					name: 'Job X'
				}
			});
		}
		errors.loading = false;

		errors.data.sort((a, b) => {
			if (a.created < b.created) return -1;
			if (a.created > b.created) return 1;
			return 0;
		});
	}

}

