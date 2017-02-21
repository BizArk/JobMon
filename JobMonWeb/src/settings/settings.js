import { inject } from 'aurelia-framework';
import { ApplicationState } from '../ApplicationState';

@inject(ApplicationState)
export class Settings {

	constructor(appState) {
		this.dashboard = {
			errsMax: appState.cfg.maxErrs,
			errsCritical: appState.cfg.critical,
			errsCaution: appState.cfg.caution
		};
		
	}

}