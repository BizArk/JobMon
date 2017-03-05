import zingchart from 'zingchart';
import { inject } from 'aurelia-framework';
import { ApplicationState } from '../../services/ApplicationState';
import moment from 'moment';
import { LogManager } from "aurelia-framework";

const log = LogManager.getLogger('JobMon.ErrorChart');

@inject(ApplicationState, Element)
export class ErrorChart {

	constructor(appState, element) {
		this.appState = appState;
		this.element = element;
	}
	
	attached() {
		var weekErrChartData = {
			type: "line",  // Specify your chart type here.
			crosshairX: {
				plotLabel: {
					text: '%t: %v',
					fontColor: '#000000'
				}
			},
			preview: {},
			plot: {
				aspect: "spline",
				tooltip: {
					visible: false
				}
			},
			title: {
				text: "# of Errors" // Adds a title to your chart
			},
			subtitle: {
				text: 'Last 7 Days'
			},
			legend: {
				fontColor: '#000000'
			},
			scaleX: {
				zooming: true,
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
					value: new Date('2/15/2017'),
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
					value: new Date('2/16/2017'),
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
					value: new Date('2/17/2017'),
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
					value: new Date('2/18/2017'),
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
			id: "errchart",
			data: weekErrChartData,
			height: 400
		});

		// Setup a closure so it can be used in the event handler.
		zingchart.bind('errchart', 'node_click', (e) => {
			this._errChart_Node_Click(e, weekErrChartData, this.element);
		});
	}

	detached() {
		zingchart.exec('errchart', 'destroy');
	}

	_errChart_Node_Click(e, weekErrChartData, element) {
		var series = weekErrChartData.series[e.plotindex];

		var args = {
			start: moment(series.value).add(e.scaleval - 1, 'hours'),
			end: moment(series.value).add(e.scaleval, 'hours'),
			value: e.value
		}
		
		log.debug('Node clicked: ' + args.start + ' - ' + args.end + ' #' + args.value);
		this._raiseEvent(element, 'change', args, true, true);
	}

	_raiseEvent(element, name, args, bubbles, cancelable) {
		let evt;

		if (window.CustomEvent) {
			evt = new CustomEvent(name, {
				detail: args,
				bubbles: bubbles
			});
		} else {
			evt = document.createEvent('CustomEvent');
			evt.initCustomEvent(name, bubbles, cancelable, {
				detail: args
			});
		}
		element.dispatchEvent(evt);
	}

}

