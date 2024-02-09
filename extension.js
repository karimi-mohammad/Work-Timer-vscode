// imports
const vscode = require('vscode');
const fs = require('fs');
const files = require('./src/file');
// const debugTools = require('./src/debugTools')

const startedAt = Date.now()
let lastActivityTimeStamp;

// TimerStatusItem
let TimerStatusItem = vscode.StatusBarItem;
TimerStatusItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
TimerStatusItem.show();

// timer
let hour = 0, minute = 0, second = 0;
let timer;

// path
const extensionDataPath = files.findExtensionDataPath() + `/data.json`
let workspacePath
if (vscode.workspace.workspaceFolders !== undefined) {
	workspacePath = vscode.workspace.workspaceFolders[0].uri.fsPath;
}

// start timer
function startTimer() {
	timer = setInterval(() => {
		second++
		if (second >= 60) {
			minute++
			second = 0;
		}
		if (minute >= 60) {
			minute = 0
			hour++
		}
		TimerStatusItem.text = `Worked : ${hour}:${minute}:${second}`
		const now = Date.now();
		const difference = now - lastActivityTimeStamp;
		const isFourMinutesPassed = difference >= (30 * 1000);
		if (isFourMinutesPassed) {
			clearInterval(timer);
		}
	}, 1000);
}

// onChangeDocumentData
function onChangeDocumentText() {
	lastActivityTimeStamp = Date.now()
	if (timer._destroyed) {
		startTimer()
	}
}

// when extension acrive
function activate(context) {
	startTimer();
	onChangeDocumentText();
	context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(onChangeDocumentText));
	// 
	// let panel = vscode.window.createWebviewPanel('catCoding', 'title', vscode.ViewColumn.One, {})
	// panel.webview.html = "<h1>aaaaa</h1>"
	// panel.reveal()
	// 
}
async function saveData() {
	const endedAt = Date.now()
	const dataFileExists = await fs.existsSync(extensionDataPath);
	let extensionData = await files.readFileAndContinueIfExists(dataFileExists, extensionDataPath)
	if (!extensionData) {
		extensionData = {}
	}
	if (extensionData[workspacePath]) {
		let tempData = extensionData[workspacePath]
		tempData[tempData.length] = {
			"started": startedAt,
			"ended": endedAt,
			"worked-time": `${hour}:${minute}:${second}`
		}
		extensionData[workspacePath] = tempData
	} else {
		let tempData = [{
			"started": startedAt,
			"ended": endedAt,
			"worked-time": `${hour}:${minute}:${second}`
		}]
		extensionData[workspacePath] = tempData
	}
	files.ensureDirectoryExists(files.findExtensionDataPath());
	let a = await fs.writeFile(extensionDataPath, JSON.stringify(extensionData), (err) => {
		if (err) {
			console.error(err);
		}
	});
	console.log(await a);
}

// This method is called when your extension is deactivated
async function deactivate() {
	await saveData()
	console.log("ended");
}
module.exports = {
	activate,
	deactivate
}
