import { inject } from 'aurelia-framework';
import { DialogController } from 'aurelia-dialog';

@inject(DialogController)
export class ConfirmDialog {

	constructor(dlgCtrl) {
		this.dlgCtrl = dlgCtrl;
		this.message = null;
	}

	activate(data) {
		this.message = data;
	}

}
