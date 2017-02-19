import numeral from 'numeral';
import zingchart from 'zingchart';
import { inject } from 'aurelia-framework';
import { ApplicationState } from '../ApplicationState';

@inject(ApplicationState)
export class Dashboard {

	constructor(appState) {
		this.message = 'Welcome to JobMon!';
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
	}

	attached() {
		this._createErrChart();
		this._createErrGauge();
	}

	_createErrChart() {
		var weekErrChartData = {
			type: "line",  // Specify your chart type here.
			plot: {
				aspect: "spline"
			},
			title: {
				text: "# of Errors" // Adds a title to your chart
			},
			subtitle: {
				text: 'Last 7 Days'
			},
			legend: {}, // Creates an interactive legend
			scaleX: {
				labels: [
					'12am', '1am', '2am', '3am', '4am', '5am',
					'6am', '7am', '8am', '9am', '10am', '11am',
					'12pm', '1pm', '2pm', '3pm', '4pm', '5pm',
					'6pm', '7pm', '8pm', '9pm', '10pm', '11pm'
				]
			},
			scaleY: {
				markers: [
					{
						type: "line",
						range: [this.appState.cfg.critical],
						lineColor: "red",
						lineWidth: 5,
						lineStyle: "dotted",
						label: {
							text: "Critical",
							backgroundColor: "red",
							fontColor: "white",
							fontSize: 14
						}
					},
					{
						type: "line",
						range: [this.appState.cfg.caution],
						lineColor: "yellow",
						lineWidth: 5,
						lineStyle: "dotted",
						label: {
							text: "Caution",
							borderWidth: 1,
							fontSize: 14
						}
					}
				],
			},
			series: [
				{
					text: 'Few Days Ago',
					lineColor: '#e0e0e0',
					lineStylex: 'dashed',
					values: [
						94, 80, 20, 25, 57, 62,
						36, 99, 9, 92, 86, 81,
						37, 81, 40, 94, 49, 69,
						34, 98, 85, 95, 17, 69
					],
					marker: {
						backgroundColor: '#e0e0e0'
					}
				},
				{
					text: 'Day Before',
					lineColor: '#c0c0c0',
					lineStylex: 'dashed',
					values: [
						85, 21, 89, 56, 86, 59,
						94, 1, 56, 50, 39, 36,
						9, 80, 69, 88, 43, 92,
						40, 87, 2, 48, 56, 23
					],
					marker: {
						backgroundColor: '#c0c0c0'
					}
				},
				{
					text: 'Yesterday',
					lineColor: '#a0a0a0',
					lineStylex: 'dashed',
					values: [
						60, 18, 9, 19, 3, 44,
						67, 26, 75, 34, 53, 3,
						54, 16, 11, 5, 45, 35,
						74, 35, 24, 95, 44, 56
					],
					marker: {
						backgroundColor: '#a0a0a0'
					}
				},
				{
					text: 'Today',
					lineColor: '#000000',
					lineWidth: 5,
					values: [
						62, 53, 30, 28, 79, 69,
						75, 25, 25, 68, 12, 72,
						42, 27, 10, 89, 69, 100
					],
					marker: {
						backgroundColor: '#000000'
					}
				}
			]
		};
		zingchart.render({ // Render Method[3]
			id: "divLastWeekErrorChart",
			data: weekErrChartData,
			height: 400
		});

		zingchart.bind('divLastWeekErrorChart', 'node_click', function (e) {
			console.log(e);
		});
	}

	_createErrGauge() {
		var hourErrGaugeData = {
			type: "gauge",
			title: {
				text: "# of Errors",
				y: "75%",
				fontColor: "#515151",
				bold: false
			},
			subtitle: {
				text: "Last 60 Minutes",
				y: "82%",
				fontSize: 15,
				bold: false
			},
			scaleR: {
				values: `0:${this.appState.cfg.maxErrs}:10`,
				tick: {
					lineWidth: 4,
					size: 15,
					lineColor: "#5F5F5F",
					placement: "outter"
				},
				markers: [
					{
						type: 'area',
						range: [this.appState.cfg.caution, this.appState.cfg.critical],
						alpha: 1,
						backgroundColor: '#eded00',
						borderColor: '#C1C1C1',
						borderWidth: 1,
						offsetEnd: 0.1,
						offsetStart: 0.7
					},
					{
						type: 'area',
						range: [this.appState.cfg.critical, this.appState.cfg.maxErrs],
						alpha: 1,
						backgroundColor: '#ff4d4d',
						borderColor: 'red',
						borderWidth: 1,
						offsetEnd: 0.1,
						offsetStart: 0.7
					}
				],
				minorTicks: 4,
				minorTick: {
					lineColor: "#818181",
					placement: "inner",
					size: 7
				},
				ring: {
				},
				item: {
					offsetR: -1,
					fontSize: 16
				},
				center: {
					size: 14,
					backgroundColor: "#C1C1C1",
					borderWidth: 1,
					borderColor: '#000000'
				},
			},
			plot: {
				backgroundColor: '#515151',
				borderColor: '#000000',
				borderWidth: 1,
				size: .85,
				xcsize: "14%",
				tooltip: {
					visible: false
				},
				animation: {
					effect: 2,
					method: 3,
					sequence: 1,
					speed: 1000
				}
			},
			plotarea: {
				marginBottom: "20%"
			},
			series: [
				{
					values: [0],
					valueBox: {
						text: "%v",
						placement: "center",
						offsetY: 40,
						fontSize: 28,
						fontColor: "#515151",
					}

				}
			]
		};
		zingchart.render({ // Render Method[3]
			id: "divLastHourErrorGauge",
			data: hourErrGaugeData,
			height: 400
		});

		setInterval(() => this._updateErrGauge(), 2000);
	}

	_updateErrGauge() {
		var newVal = parseInt(100 * Math.random(), 10);
		console.log(newVal);
		newVal = Math.min(newVal, this.appState.cfg.maxErrs);
		zingchart.exec("divLastHourErrorGauge", "setseriesvalues", {
			plotindex: 0,
			values: [newVal]
		});
		//var tick = {};
		//tick.plot0 = 
		//cb(JSON.stringify(tick));
	}

}

