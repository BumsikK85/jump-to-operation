function jumpToOperationFromSelectedMessage() {
	var selected = app.selections.getSelected();
	var goToElement = false;
	if (selected && selected instanceof type.UMLMessage) {
		var operation = selected.signature;
		if (operation) {

			const parent = operation._parent;
			const diagrams = parent?.ownedElements?.filter(e => e instanceof type.Diagram) || [];

			if (diagrams.length > 0) {
				app.workspaceManager.openDiagram(diagrams[0]);
			}
			app.modelExplorer.select(operation, true);
			// app.diagrams.selectView(app.repository.getViewsOf(operation)[0]);
		} else {
			app.toast.info("The selected message does not have an associated operation.");
			goToElement = true;
		}
	} else {
		app.toast.info("Please select a message element.");
		goToElement = true;
	}

	if(goToElement) {
		var selected = app.selections.getSelected();
		if (selected) {
			app.modelExplorer.select(selected, true);
		}
	}
}

function init() {
  window.app.commands.register('jump-to-operation:from-selected-message', jumpToOperationFromSelectedMessage);
}

exports.init = init;