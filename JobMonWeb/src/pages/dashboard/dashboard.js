import zingchart from 'zingchart';
import { inject } from 'aurelia-framework';
import { ApplicationState } from '../../services/ApplicationState';
import { JobMonUtil } from '../../services/JobMonUtil';
import moment from 'moment';
import { LogManager } from "aurelia-framework";

const log = LogManager.getLogger('JobMon.Dashboard');

@inject(ApplicationState, JobMonUtil)
export class Dashboard {

	constructor(appState, jmutil) {
		this.appState = appState;
		this.jmutil = jmutil;

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
				logLevel: this.jmutil.levels[parseInt(6 * Math.random(), 10)],
				created: dt,
				message: `Message ${i}`,
				source: 'SOURCE',
				details: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed lacinia magna eu pretium accumsan. Donec vitae tortor feugiat, ultricies libero vel, molestie mi. Quisque vitae fringilla ex, sit amet faucibus turpis. Integer posuere quis dolor viverra faucibus. Proin fermentum cursus erat at euismod. Nullam auctor sagittis consequat. Integer tempor sapien mauris, sit amet ultricies arcu gravida ac. Nullam blandit pretium tortor. Nullam vehicula, felis eu efficitur congue, urna felis blandit felis, vitae consequat magna tellus ut eros. Nulla sodales semper finibus. Pellentesque elit dolor, pellentesque non cursus et, ornare vel ante.

Mauris ullamcorper scelerisque diam. Proin lacus ex, placerat faucibus elit sed, mattis congue sapien. Sed vitae porta ex, nec laoreet mi. Suspendisse potenti. Maecenas aliquet, neque et pretium consequat, arcu velit aliquet mi, ac auctor eros risus eu nunc. Interdum et malesuada fames ac ante ipsum primis in faucibus. In ullamcorper a nunc id faucibus. Ut tincidunt nunc est, et finibus nisi consectetur in.

Nunc ut nisl ante. Nunc a ex urna. Nam dui metus, dapibus ut rhoncus vel, commodo quis odio. Etiam quam arcu, tincidunt vitae mi vitae, dignissim consequat risus. Etiam sollicitudin ornare fermentum. Nullam sed porta ex. Fusce volutpat massa purus, sit amet interdum leo egestas sit amet. Etiam sit amet mi a dolor porttitor vulputate. Aenean aliquet sollicitudin vehicula. Proin fermentum imperdiet sem, id sagittis eros volutpat et.

Suspendisse bibendum, arcu non pellentesque finibus, magna nibh accumsan nulla, nec eleifend metus purus tempor massa. Nam dignissim ultrices ultricies. Nam efficitur ultricies est a sollicitudin. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Cras in ultrices ante, vel laoreet nisl. Sed eu tortor sagittis, vulputate libero vel, pulvinar lectus. Curabitur diam purus, ultricies vitae risus eget, faucibus scelerisque lacus. Etiam felis metus, ornare quis arcu nec, pretium efficitur velit. Duis efficitur congue ipsum, ac ultrices nulla blandit ac. Donec sed volutpat dui. Phasellus viverra neque ut laoreet tincidunt. Pellentesque odio quam, accumsan a egestas ut, pellentesque dictum nulla. Aenean venenatis ornare quam, ac pellentesque massa lobortis id. Suspendisse potenti. Sed non ex pellentesque, ultrices tortor malesuada, dapibus purus.

Aliquam aliquam quam risus, tincidunt bibendum lorem imperdiet eu. Morbi sollicitudin ac nisi vitae ultricies. Integer vel faucibus elit. Morbi et mattis metus. Nam vitae aliquam tortor. Aliquam a consequat nisi, id consequat tortor. Praesent ac lorem eros. Sed ut neque semper, facilisis nunc sit amet, interdum orci. Nunc sodales quis enim a suscipit. Curabitur eu magna luctus, gravida elit in, mollis libero. In id nisi lacinia, ornare erat vel, egestas nibh.`,
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

