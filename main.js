const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

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

			// searchAndLaunchApp(parent.name);
		} else {
			//searchAndLaunchApp(selected.name);
			app.toast.info("The selected message does not have an associated operation.");
			// goToElement = true;
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

function jumpToOperationFromSelectedMessageToLink() {
	jumpToOperationFromSelectedMessage();
	const selected = app.selections.getSelected();
	if(selected.tags.length > 0) {
		const tag = selected.tags[0];
		if(tag.kind == "string" && tag.name.includes("link")) {
			const url = tag.value;
			if (url && url.startsWith("http")) {
				exec(`start ${url}`, (error) => {
					// if (error) {
					// 	console.error(`Failed to open URL: ${error.message}`);
					// 	app.toast.error(`Failed to open URL: ${error.message}`);
					// }
				});
			} else {
				app.toast.error("The tag value is not a valid URL.");
			}
		}
		if(tag.name === "operation") {
			app.modelExplorer.select(tag, true);

		}
	}
}

function openSpecificMdjAndLaunchApp(targetFileName, appPath) {
	const currentProjectPath = app.project.filename;
	if (!currentProjectPath) {
		console.log("현재 열려 있는 프로젝트가 없습니다.");
		app.toast.error("현재 열려 있는 프로젝트가 없습니다.");
		return;
	}

	// 현재 MDJ 파일의 디렉토리 가져오기
	const currentDir = path.dirname(currentProjectPath);

	// 하위 디렉토리를 포함하여 파일 검색 함수
	function findFileInDirectory(directory, fileName) {
		const files = fs.readdirSync(directory);
		for (const file of files) {
			const fullPath = path.join(directory, file);
			const stats = fs.statSync(fullPath);
			if(!stats.isDirectory()) {
				const content = fs.readFileSync(fullPath, 'utf8');
				if (content.includes(fileName)) {
					console.log(`파일에서 텍스트를 찾았습니다: ${fullPath}`);
					return fullPath; // 텍스트를 포함하는 파일 경로 반환
				}
			}

			// if (stats.isDirectory()) {
			// 	// 하위 디렉토리 탐색
			// 	const result = findFileInDirectory(fullPath, fileName);
			// 	if (result) {
			// 		return result; // 파일을 찾으면 경로 반환
			// 	}
			// } else if (file === fileName) {
			// 	return fullPath; // 파일을 찾으면 경로 반환
			// }
		}
		return null; // 파일을 찾지 못한 경우
	}

	// 디렉토리 내에서 특정 MDJ 파일 검색
	const targetFilePath = findFileInDirectory(currentDir, targetFileName);
	if (!targetFilePath) {
		// console.log(`지정된 MDJ 파일을 찾을 수 없습니다: ${targetFileName}`);
		// app.toast.error(`지정된 MDJ 파일을 찾을 수 없습니다: ${targetFileName}`);
		return;
	}

	// 외부 애플리케이션 실행
	exec(`"${appPath}" "${targetFilePath}"`, (error, stdout, stderr) => {
		if (error) {
			console.error(`애플리케이션 실행 중 오류 발생: ${error.message}`);
			app.toast.error(`애플리케이션 실행 중 오류 발생: ${error.message}`);
			return;
		}
		if (stderr) {
			console.error(`애플리케이션 실행 중 경고: ${stderr}`);
		}
		console.log(`애플리케이션 출력: ${stdout}`);
		app.toast.info(`애플리케이션이 성공적으로 실행되었습니다.`);
	});
}

function searchAndLaunchApp(targetFileName) {
	// const targetFileName = 'COM_WEB.mdj'; // 검색할 MDJ 파일 이름
	// targetFileName = `COM_${targetFileName}.mdj`;
	const appPath = 'C:/Program Files/StarUML/StarUML.exe'; // 실행할 애플리케이션 경로

	openSpecificMdjAndLaunchApp(targetFileName, appPath);
}

function init() {
	app.commands.register('jump-to-operation:from-selected-message', jumpToOperationFromSelectedMessage);
	app.commands.register('jump-to-operation:from-selected-message-to-link', jumpToOperationFromSelectedMessageToLink);
	app.commands.register("jump-to-operation:search-and-launch-app", searchAndLaunchApp, "Search and Launch App");
}

exports.init = init;