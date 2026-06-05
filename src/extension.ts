import * as vscode from 'vscode';

/* Checks if a line starts with a control statement (if, for, while, switch). */
function isControlStatement(line: string): boolean {
                            const t = line.trim();
    return t.startsWith('if') ||
                        t.startsWith('for') ||
        t.startsWith('while') ||
                     t.startsWith('switch');
}

/* Checks if a line is a comment or documentation line. */
function isComment(line: string): boolean {
                   const t = line.trim();
    return t.startsWith('//') ||
                        t.startsWith('*') ||
        t.startsWith('/*') ||
                     t.startsWith('*/') ||
        t.startsWith('@');
}

/* Aligns multi-line function call parameters in a document.
 * Keeps alignment consistent based on the first parameter position. */
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

        // skip comments
        if (isComment(line)) {
            newLines.push(line);
            continue;
        }

        /* Detect the start of a function call by looking for an opening parenthesis that is not part of a control statement.
         * Then determine the base indentation for parameters and track parentheses to handle multi-line calls. */
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

/* Activates the extension, registering a command and a save event listener to align parameters. */
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