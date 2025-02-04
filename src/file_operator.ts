import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as vscode from 'vscode';
import { SudoPromptHelper } from './SudoPromptHelper';

const fileName = "workbench.desktop.main.js";
const filePath = path.join(vscode.env.appRoot, "out", "vs", "workbench", fileName);

enum systemType {
    WINDOWS = "Windows_NT",
    MAC = "Darwin",
    LINUX = "Linux"
}

// 適用時の処理
export async function apply(context: string) {
    if (!fs.existsSync(filePath)) {
        const errorMessage = `Error: Failed to apply animation.`;
        vscode.window.showErrorMessage(errorMessage);
        return;
    }
    vscode.window.showInformationMessage(`File found: ${filePath}`);
    const nowContext: string = fs.readFileSync(filePath, 'utf-8');
    const newContext = clearContext(nowContext) + "\n" + makeContext(context);
    await write(newContext);
}
//　削除時の処理
export async function remove() {
    const nowContext: string = fs.readFileSync(filePath, 'utf-8');
    const newContext = clearContext(nowContext);
    await write(newContext);
}

// コメントの内側を削除
function clearContext(context: string) {
    const regex = /\/\*ext-sidebar-animation-start\*\/[\s\S]*?\/\*ext-sidebar-animation-end\*\//g;
    return context.replace(regex, "").trim();
}

// 書き込み内容にコメントを追加
function makeContext(context: string) {
    return `/*ext-sidebar-animation-start*/${context}/*ext-sidebar-animation-end*/`.trim();
}

// 書き込み処理
async function write(context: string) {
    try {
        await fs.writeFileSync(filePath, context, { encoding: 'utf-8' });
    } catch (e) {
        console.log("権限が不足している可能性あり");
        //await givePermission();
        //await fs.writeFileSync(filePath, context, { encoding: 'utf-8' });
        console.log(e);
    }
}

async function givePermission() {
    switch (os.type()) {
        case systemType.WINDOWS:
            await SudoPromptHelper.exec(`takeown /f "${filePath}" /a`);
            await SudoPromptHelper.exec(`icacls "${filePath}" /grant Users:F`);
            break;
        case systemType.MAC:
            await SudoPromptHelper.exec(`chmod a+rwx "${filePath}"`);
            break;
        case systemType.LINUX:
            await SudoPromptHelper.exec(`chmod 666 "${filePath}"`);
            break;
    }
}