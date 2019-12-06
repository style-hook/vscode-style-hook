import { languages, ExtensionContext, DocumentFilter, workspace, CompletionItemProvider, TextDocument, CompletionItem, CompletionItemKind, Position, } from "vscode"
import * as vscode from 'vscode'

class ClassNameCompletionProvider implements CompletionItemProvider {
  provideCompletionItems(document: TextDocument, position: Position, token: vscode.CancellationToken, context: vscode.CompletionContext) {
    const text = document.getText()
    if (!this.isClassNameCompletion(text, position)) return []
    return this.getClassNames(text).map(className => (
      new CompletionItem(className, CompletionItemKind.Variable)
    ))
  }
  isClassNameCompletion(text: string, position: Position) {
    const line = text.split('\n')[position.line]
    const start = line.lastIndexOf('className', position.character)
    const end = position.character
    if (start === -1) return false
    if (!/className\s*=\s*"[^"]*/.test(line.slice(start, end))) return false
    return true
  }
  getClassNames(text: string) {
    const classNames = new Set<string>()
    text.replace(/(?:useStyle|useGlobalStyle|css)\s*`([^`]+)`/g, (_, style: string) => {
      style.replace(/\.([a-zA-Z_][-\w]*)/g, (_, className) => {
        classNames.add(className)
        return ''
      })
      return ''
    })
    return [...classNames]
  }
}


class CSSModuleCompletionProvider implements CompletionItemProvider {
  provideCompletionItems(document: TextDocument, position: Position, token: vscode.CancellationToken, context: vscode.CompletionContext) {
    const text = document.getText()
    if (!this.isModuleObject(text, position)) return []
    return this.getClassNames(text).map(className => (
      new CompletionItem(className, CompletionItemKind.Field)
    ))
  }
  isModuleObject(text: string, position: Position) {
    const styleObj = new Set<string>()
    text.replace(/(?:var|let|const)\s*(\w+)\s*=\s*useModuleStyle\s*`/, (_, name) => {
      styleObj.add(name)
      return ''
    })
    const line = text.split('\n')[position.line]
    const WORD = '[a-zA-Z_][\\w]*'
    const triggerReg = new RegExp(`(${WORD})\\s*\\.\\s*(${WORD})?`)
    const result = triggerReg.exec(line.slice(0, position.character))
    if (!result) return false
    const [_, name] = result
    if (!styleObj.has(name)) return false
    return true
  }
  getClassNames(text: string) {
    const classNames = new Set<string>()
    text.replace(/useModuleStyle\s*`([^`]+)`/g, (_, style: string) => {
      style.replace(/\.([a-zA-Z_][-\w]*)/g, (_, className) => {
        classNames.add(className)
        return ''
      })
      return ''
    })
    return [...classNames]
  }
}

export function activate(context: ExtensionContext) {
  const mode: DocumentFilter[] = [
      { language: "typescriptreact", scheme: 'file' },
      { language: "javascriptreact", scheme: 'file' },
      { language: "typescriptreact", scheme: 'untitled' },
      { language: "javascriptreact", scheme: 'untitled' },
  ];

  context.subscriptions.push(
      languages.registerCompletionItemProvider(mode, new ClassNameCompletionProvider(), '"', ' ')
  );

}

export function deactivate() {
}
