import * as vscode from 'vscode';
import { apply, remove } from './file_operator'

export function activate(context: vscode.ExtensionContext) {

	console.log('Congratulations, your extension "sidebar-animation" is now active!');

	context.subscriptions.push(vscode.commands.registerCommand('sidebar-animation.apply', async () => {
		await apply(`
{
	const style = document.createElement("style");
	style.textContent = \`
	.split-view-view {
		transition: all 0.3s ease-in-out;
	}
	\`;
	document.head.appendChild(style);
}
			`);
		vscode.window.showInformationMessage('Reload to apply the animation.', 'Reload', "not").then((reload) => {
			if (reload === 'Reload') {
				vscode.commands.executeCommand('workbench.action.reloadWindow');
			}
		});
	}));
	context.subscriptions.push(vscode.commands.registerCommand('sidebar-animation.remove', async () => {
		await remove();
		vscode.window.showInformationMessage('Reload to remove the animation.', 'Reload', "not").then((reload) => {
			if (reload === 'Reload') {
				vscode.commands.executeCommand('workbench.action.reloadWindow');
			}
		});
	}));
}

export function deactivate() { }
