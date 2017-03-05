import {bindable} from 'aurelia-framework';
import { LogManager } from "aurelia-framework";

const log = LogManager.getLogger('JobMon.JmLoglevelIcon');

export class JmLoglevelIcon {
  @bindable value;

	valueChanged(newValue, oldValue) {
		log.debug(newValue);
		this.logLevel = newValue;
		this.class = this.getLogLevelIconClasses(this.logLevel);
	}

	getLogLevelIconClasses(logLevel) {
		///<summary>Returns the classes needed to display the icon for the given logLevel.</summary>
		///<param name="logLevel">The log level to get the icon classes for.</param>
		switch(logLevel) {
			case 'Trace':
				return 'fa-circle-thin text-muted';
			case 'Debug':
				return 'fa-circle-thin text-muted';
			case 'Info':
				return 'fa-info-circle text-info';
			case 'Warn':
				return 'fa-exclamation-triangle text-warning';
			case 'Error':
				return 'fa-exclamation-circle text-danger';
			case 'Fatal':
				return 'fa-exclamation-circle text-danger';
		}
	}

}

