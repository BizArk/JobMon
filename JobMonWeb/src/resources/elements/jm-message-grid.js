import { bindable, inject } from 'aurelia-framework';
import { DialogService } from 'aurelia-dialog';
import { ConfirmDialog } from 'dialogs/confirm/confirm';

@inject(DialogService)
export class JmMessageGridCustomElement {
	@bindable messages;

	constructor(dlg) {
		this.dlg = dlg;
	}

	valueChanged(newValue, oldValue) {

	}

	showDetails() {
		this.dlg.open({
			viewModel: ConfirmDialog,
			model: 'Dis es de detal'
		}).then(result => {
			if(result.wasCancelled) return;
			alert('hello');
		});
	}
}

