import {
	ValidationRenderer,
	RenderInstruction,
	ValidateResult
} from 'aurelia-validation';
import $ from 'jquery';
import { LogManager } from "aurelia-framework";

const log = LogManager.getLogger('JobMon.BootstrapFormRenderer');

export class BootstrapFormRenderer {
	render(instruction) {
		for (let { result, elements } of instruction.unrender) {
			for (let element of elements) {
				this.remove(element, result);
			}
		}

		for (let { result, elements } of instruction.render) {
			for (let element of elements) {
				this.add(element, result);
			}
		}
	}

	add(element, result) {
		log.debug('BootstrapFormRenderer.add', element, result);

		const $frmGrp = $(element).closest('.form-group');
		if (!$frmGrp) {
			return;
		}

		if (result.valid) {
			$frmGrp.find('span.help-block').remove();
			$frmGrp.find('i.form-control-feedback').remove();
			$frmGrp.removeClass('has-error');
			$frmGrp.addClass('has-success has-feedback');
			$frmGrp.append(`<i class="form-control-feedback fa fa-check"></i>`);
		} else {
			// add the has-error class to the enclosing form-group div
			$frmGrp.find('i.form-control-feedback').remove();
			$frmGrp.removeClass('has-success');
			$frmGrp.addClass('has-error has-feedback');
			$frmGrp.append(`<i class="form-control-feedback fa fa-exclamation-circle"></i>`);
			$frmGrp.append(`<span validation-message-${result.id} class="help-block validation-message">${result.message}</span>`);
		}
	}

	remove(element, result) {
		log.debug('BootstrapFormRenderer.remove', element, result);

		const $frmGrp = $(element).closest('.form-group');
		if (!$frmGrp) {
			return;
		}

		$frmGrp.removeClass('has-success has-error has-feedback');
		$frmGrp.find('span.help-block').remove();
		$frmGrp.find('i.form-control-feedback').remove();
	}
}