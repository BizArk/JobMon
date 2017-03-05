import { inject } from 'aurelia-framework';
import { DialogController } from 'aurelia-dialog';

@inject(DialogController)
export class MessageDetailsDialog {

	constructor(dlgCtrl) {
		this.dlgCtrl = dlgCtrl;
		this.msg = null;
	}

	activate(data) {
		this.msg = data;
	}

}
