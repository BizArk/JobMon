import { bindable, inject } from 'aurelia-framework';
import { DialogService } from 'aurelia-dialog';
import { MessageDetailsDialog } from 'dialogs/message-details/message-details';
import { JobMonUtil } from '../../services/JobMonUtil';

@inject(DialogService, JobMonUtil)
export class JmMessageGridCustomElement {
	@bindable messages;

	constructor(dlg, jmutil) {
		this.dlg = dlg;
		this.jmutil = jmutil;
	}

	valueChanged(newValue, oldValue) {

	}

	showDetails(msg) {
		this.dlg.open({
			viewModel: MessageDetailsDialog,
			model: msg
		});
	}

}

