import { inject, NewInstance } from 'aurelia-framework';
import { ValidationRules } from 'aurelia-validation';
import { ApplicationState } from '../../services/ApplicationState';
import {ValidationController} from 'aurelia-validation';
import { LogManager } from "aurelia-framework";
import {BootstrapFormRenderer} from '../../services/bootstrap-form-renderer';
import $ from 'bootstrap';

const log = LogManager.getLogger('JobMon.Settings');

@inject(ApplicationState, NewInstance.of(ValidationController))
export class Settings {

	constructor(appState, valCtrl) {
		this.dashboard = {
			errsMax: appState.cfg.maxErrs,
			errsCritical: appState.cfg.critical,
			errsCaution: appState.cfg.caution
		};

		this.appState = appState;

		this.valCtrl = valCtrl;
		this.valCtrl.addRenderer(new BootstrapFormRenderer());

		this._setupValidation();
	}

	_setupValidation() {
		ValidationRules
			.ensure('errsMax')
				.required()
				.satisfies(this._validateMaxErrs).withMessage('ID:10-t error.')
			.on(this.dashboard);
	}

	_validateMaxErrs(val, obj) {
		log.debug('_validateMaxErrs', val, obj);
		if(val === null) return true;
		if(val === undefined) return true;
		return false;
	}

	save() {
		log.debug('save');
		this.valCtrl.validate();
		this.appState.cfg.maxErrs = this.dashboard.errsMax;
		this.appState.cfg.critical = this.dashboard.errsCritical;
		this.appState.cfg.caution = this.dashboard.errsCaution;
	}

}