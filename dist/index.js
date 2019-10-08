"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
class ClassNameCompletionProvider {
    provideCompletionItems(document, position, token, context) {
        const text = document.getText();
        if (!this.isClassNameCompletion(text, position))
            return [];
        return this.getClassNames(text).map(className => (new vscode_1.CompletionItem(className, vscode_1.CompletionItemKind.Variable)));
    }
    isClassNameCompletion(text, position) {
        const line = text.split('\n')[position.line];
        const start = line.lastIndexOf('className', position.character);
        const end = position.character;
        if (start === -1)
            return false;
        if (!/className\s*=\s*"[^"]*/.test(line.slice(start, end)))
            return false;
        return true;
    }
    getClassNames(text) {
        const classNames = new Set();
        text.replace(/(?:useStyle|useGlobalStyle|css)\s*`([^`]+)`/g, (_, style) => {
            style.replace(/\.([a-zA-Z_][-\w]*)/g, (_, className) => {
                classNames.add(className);
                return '';
            });
            return '';
        });
        return [...classNames];
    }
}
class CSSModuleCompletionProvider {
    provideCompletionItems(document, position, token, context) {
        const text = document.getText();
        if (!this.isModuleObject(text, position))
            return [];
        return this.getClassNames(text).map(className => (new vscode_1.CompletionItem(className, vscode_1.CompletionItemKind.Field)));
    }
    isModuleObject(text, position) {
        const styleObj = new Set();
        text.replace(/(?:var|let|const)\s*(\w+)\s*=\s*useModuleStyle\s*`/, (_, name) => {
            styleObj.add(name);
            return '';
        });
        const line = text.split('\n')[position.line];
        const WORD = '[a-zA-Z_][\\w]*';
        const triggerReg = new RegExp(`(${WORD})\\s*\\.\\s*(${WORD})?`);
        const result = triggerReg.exec(line.slice(0, position.character));
        if (!result)
            return false;
        const [_, name] = result;
        if (!styleObj.has(name))
            return false;
        return true;
    }
    getClassNames(text) {
        const classNames = new Set();
        text.replace(/useModuleStyle\s*`([^`]+)`/g, (_, style) => {
            style.replace(/\.([a-zA-Z_][-\w]*)/g, (_, className) => {
                classNames.add(className);
                return '';
            });
            return '';
        });
        return [...classNames];
    }
}
function activate(context) {
    const mode = [
        { language: "typescriptreact", scheme: 'file' },
        { language: "javascriptreact", scheme: 'file' },
        { language: "typescriptreact", scheme: 'untitled' },
        { language: "javascriptreact", scheme: 'untitled' },
    ];
    context.subscriptions.push(vscode_1.languages.registerCompletionItemProvider(mode, new ClassNameCompletionProvider(), '"', ' '), vscode_1.languages.registerCompletionItemProvider(mode, new CSSModuleCompletionProvider(), '.'));
}
exports.activate = activate;
function deactivate() {
}
exports.deactivate = deactivate;
