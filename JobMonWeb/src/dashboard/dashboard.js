import numeral from 'numeral';
import zingchart from 'zingchart';

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

	attached() {
		var chartData = {
			type: "bar",  // Specify your chart type here.
			title: {
				text: "My First Chart" // Adds a title to your chart
			},
			legend: {}, // Creates an interactive legend
			series: [  // Insert your series data here.
				{ values: [35, 42, 67, 89] },
				{ values: [28, 40, 39, 36] }
			]
		};
		zingchart.render({ // Render Method[3]
			id: "chartDiv",
			data: chartData,
			height: 400,
			width: 600
		});
	}
}

