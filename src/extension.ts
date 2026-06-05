import * as vscode from 'vscode';

function isControlStatement(line: string): boolean {
    const t = line.trim();
    return t.startsWith('if') ||
        t.startsWith('for') ||
        t.startsWith('while') ||
        t.startsWith('switch');
}

function isComment(line: string): boolean {
    const t = line.trim();
    return t.startsWith('//') ||
        t.startsWith('*') ||
        t.startsWith('/*') ||
        t.startsWith('*/') ||
        t.startsWith('@');
}

function alignDocument(document: vscode.TextDocument): string {
    const text = document.getText();
    const lines = text.split('\n');

    let newLines: string[] = [];

    let insideCall = false;
    let baseIndent = 0;
    let parenBalance = 0;

    for (let i = 0; i < lines.length; i++) {

        const line = lines[i];
        const trimmed = line.trim();

        // ✅ skip comments
        if (isComment(line)) {
            newLines.push(line);
            continue;
        }

        // ✅ START
        if (!insideCall && line.includes('(') && !isControlStatement(trimmed)) {

            const index = line.indexOf('(');

            // multiline mı kontrol et
            let isCall = false;
            for (let j = i; j < Math.min(i + 6, lines.length); j++) {
                if (lines[j].includes(');')) {
                    isCall = true;
                    break;
                }
            }

            if (!isCall || trimmed.endsWith(');')) {
                newLines.push(line);
                continue;
            }

            // ✅ doğru hizalama: ilk parametreye göre
            const afterParen = line.slice(index + 1);
            const firstParamOffset = afterParen.search(/\S/);

            if (firstParamOffset >= 0) {
                baseIndent = index + 1 + firstParamOffset;
            } else {
                baseIndent = index + 1;
            }

            insideCall = true;

            parenBalance =
                (line.match(/\(/g) || []).length -
                (line.match(/\)/g) || []).length;

            newLines.push(line);
            continue;
        }

        if (insideCall) {

            if (isComment(line)) {
                newLines.push(line);
                continue;
            }

            // paren hesapla
            parenBalance += (line.match(/\(/g) || []).length;
            parenBalance -= (line.match(/\)/g) || []).length;

            const spaces = ' '.repeat(baseIndent);

            newLines.push(spaces + trimmed);

            if (parenBalance <= 0) {
                insideCall = false;
            }

            continue;
        }

        newLines.push(line);
    }

    return newLines.join('\n');
}

export function activate(context: vscode.ExtensionContext) {

    console.log('Align Params extension is active!');

    vscode.workspace.onWillSaveTextDocument((event) => {
        const doc = event.document;

        const newText = alignDocument(doc);

        const fullRange = new vscode.Range(
            doc.positionAt(0),
            doc.positionAt(doc.getText().length)
        );

        event.waitUntil(
            Promise.resolve([
                vscode.TextEdit.replace(fullRange, newText)
            ])
        );
    });

    const disposable = vscode.commands.registerCommand('align.params', () => {

        const editor = vscode.window.activeTextEditor;
        if (!editor) return;

        const doc = editor.document;

        const newText = alignDocument(doc);

        const fullRange = new vscode.Range(
            doc.positionAt(0),
            doc.positionAt(doc.getText().length)
        );

        editor.edit(editBuilder => {
            editBuilder.replace(fullRange, newText);
        });
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}
``