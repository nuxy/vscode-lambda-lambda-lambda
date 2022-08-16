import {commands, window, ExtensionContext} from 'vscode';

// Local modules
import {createFiles, AppConfig} from './generator';

interface InputBoxOpts {
  placeHolder: string,
  title: string,
  validateInput: {(value: string): string | undefined},
  value?: string,
  step: number
}

/**
 * Activate the VS Code extension.
 */
export async function activate(context: ExtensionContext) {
  context.subscriptions.push(
    commands.registerCommand('lambda-lambda-lambda.createApp', async () => {
      const inputBoxTitle = (step: number = 1): string => {
        return `Create new L³ application`;
      };

      // Prompt application values.
      const name: string | undefined = await promptInputBox({
        placeHolder: 'Application name',
        title: inputBoxTitle(1),
        validateInput: value => {
          return (value && /^[a-zA-Z0-9]{1,40}$/.test(value))
            ? undefined : 'Alphanumeric characters, no spaces';
        },
        step: 1
      });

      const description: string | undefined = await promptInputBox({
        placeHolder: 'Description',
        title: inputBoxTitle(2),
        validateInput: value => {
          return (value && /^[\w-.,!? ]{1,100}$/.test(value))
            ? undefined : 'Alphanumeric characters, .,!? punctuation';
        },
        step: 2
      });

      const prefix: string | undefined = await promptInputBox({
        placeHolder: 'Prefix',
        title: inputBoxTitle(3),
        validateInput: value => {
          return (value && /^\/[\w-]{0,100}$/.test(value))
            ? undefined : 'Alphanumeric characters, must start with /';
        },
        step: 3,
        value: '/',
      });

      const timeout: string | undefined = await promptInputBox({
        placeHolder: 'Timeout',
        title: inputBoxTitle(4),
        validateInput: value => {
          return (value && /^[\d]{1,2}$/.test(value))
            ? undefined : 'Numbers only';
        },
        step: 4,
        value: '3'
      });

      // Generate sources from templates.
      if (description && name && prefix && timeout) {
        const appConfig: AppConfig = {description, name, prefix, timeout};

        createFiles(appConfig, context.extensionPath);
      } else {
        window.showErrorMessage('Failed to create application sources.');
      }
    })
  );
}

/**
 * Create a new InputBox instance.
 */
async function promptInputBox(opts: InputBoxOpts): Promise<any> {
  return new Promise((resolve, reject) => {
    const inputBox = window.createInputBox();
    inputBox.placeholder = opts.placeHolder;
    inputBox.title       = opts.title;
    inputBox.value       = opts.value || '';
    inputBox.step        = opts.step;
    inputBox.totalSteps  = 4;

    // Handle events.
    inputBox.onDidAccept(() => {
      const value = inputBox.value;
      const error = opts.validateInput(value);

      if (error) {
        inputBox.validationMessage = error;
      } else {
        inputBox.hide();
        resolve(value);
      }
    });

    inputBox.show();
  });
}
