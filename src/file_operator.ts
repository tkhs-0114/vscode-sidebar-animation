import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as sudo from 'sudo-prompt';
import * as vscode from 'vscode';

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
        vscode.window.showErrorMessage(`Error: Failed to apply animation.`);
        return;
    }
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
        //書き込みに失敗した場合、権限を取得して再度書き込みを試みる
        vscode.window.showErrorMessage(`Failed to write file. Grant permissions and try again?`, "Try again", "not").then(async (result) => {
            if (result === "Try again") {
                try {
                    await givePermission();
                    await fs.writeFileSync(filePath, context, { encoding: 'utf-8' });
                } catch (e) {
                    vscode.window.showErrorMessage(`Error: Failed to apply animation.`);
                }
            }
        });
    }
}

async function givePermission() {
    switch (os.type()) {
        case systemType.WINDOWS:
            await execSudo(`takeown /f "${filePath}" /a`);
            await execSudo(`icacls "${filePath}" /grant Users:F`);
            break;
        case systemType.MAC:
            await execSudo(`chmod a+rwx "${filePath}"`);
            break;
        case systemType.LINUX:
            await execSudo(`chmod 666 "${filePath}"`);
            break;
    }
}

async function execSudo(command: string, options: any = { name: 'backgroundCover' }): Promise<string> {
    return new Promise((resolve, reject) => {
        sudo.exec(command, options, (error, stdout, stderr) => {
            if (error) {
                reject(error);
            } else if (stderr) {
                reject(new Error(stderr ? stderr.toString() : ''));
            } else {
                resolve(stdout ? stdout.toString() : '');
            }
        });
    });
}