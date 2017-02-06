import numeral from 'numeral';

export class Dashboard {

	constructor() {
		this.message = 'Welcome to JobMon!';

		this.summary = {
			errors: 5,
			warnings: 10,
			messages: 1000,
			instances: 100,
			jobs: 10,
			agents: 5
		};

		this.lastUpdated = new Date();
	}

}

