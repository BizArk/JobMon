import { inject } from 'aurelia-framework';
import { ApplicationState } from '../ApplicationState';

@inject(ApplicationState)
export class Agents {

	constructor(appState) {
		this.message = 'Welcome to JobMon!';
	}

}