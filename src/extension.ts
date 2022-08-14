import {commands, window, ExtensionContext} from 'vscode';

// Local modules
import {createFiles} from './generator';

/**
 * Activate the VS Code extension.
 */
export async function activate(context: ExtensionContext) {
  context.subscriptions.push(
    commands.registerCommand('lambda-lambda-lambda.createApp', async () => {

      // Prompt the application name.
      const appName: string | undefined = await window.showInputBox({
        placeHolder: 'App name',
        validateInput: value => {
          return (/^[\w-]+$/i.test(value))
            ? null : 'Alphanumeric characters, no spaces.';
        },
        valueSelection: [2, 4]
      });

      // Generate sources from templates.
      if (appName) {
        createFiles(appName, context.extensionPath);
      }
    })
  );
}
