import { inject } from 'aurelia-framework';
import { ApplicationState } from '../ApplicationState';

@inject(ApplicationState)
export class Jobs {

	constructor(appState) {
		this.message = 'Welcome to JobMon!';
	}

}