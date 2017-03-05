import zingchart from 'zingchart';
import { inject } from 'aurelia-framework';
import { ApplicationState } from '../../services/ApplicationState';
import { LogManager } from "aurelia-framework";

const log = LogManager.getLogger('JobMon.ErrorGauge');

@inject(ApplicationState)
export class ErrorGauge {

	constructor(appState) {
		this.appState = appState;
	}
	
	attached() {
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
			id: "errgauge",
			data: hourErrGaugeData,
			height: 400
		});

		this.errGaugeInterval = setInterval(() => this._updateErrGauge(), 2000);
	}

	detached() {
		clearInterval(this.errGaugeInterval);
		zingchart.exec('errgauge', 'destroy');
	}

	_updateErrGauge() {
		var newVal = parseInt(100 * Math.random(), 10);
		newVal = Math.min(newVal, this.appState.cfg.maxErrs);

		zingchart.exec("errgauge", "setseriesvalues", {
			plotindex: 0,
			values: [newVal]
		});
	}
	
}

