import { inject } from 'aurelia-framework';
import { ApplicationState } from '../../services/ApplicationState';

@inject(ApplicationState)
export class Instances {

	constructor(appState) {
		this.message = 'Welcome to JobMon!';
	}

}