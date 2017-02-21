import { inject, NewInstance } from 'aurelia-framework';
import { ValidationRules } from 'aurelia-validation';
import { ApplicationState } from '../ApplicationState';
import {ValidationController} from 'aurelia-validation';
import {BootstrapFormRenderer} from '../bootstrap-form-renderer';
import $ from 'bootstrap';

@inject(ApplicationState, NewInstance.of(ValidationController))
export class Settings {

	constructor(appState, valCtrl) {
		this.dashboard = {
			errsMax: appState.cfg.maxErrs,
			errsCritical: appState.cfg.critical,
			errsCaution: appState.cfg.caution
		};

		this.valCtrl = valCtrl;
		this.valCtrl.addRenderer(new BootstrapFormRenderer());

		this._setupValidation();
	}

	_setupValidation() {
		ValidationRules
			.ensure('errsMax')
				.required()				
			.on(this.dashboard);
	}

	save() {
		this.valCtrl.validate();
	}

}