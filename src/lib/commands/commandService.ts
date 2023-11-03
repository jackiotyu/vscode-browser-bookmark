import * as vscode from 'vscode';
import { Commands } from '@/constants';
import { ICommandService, ICommandHandler } from '@/type';

// TODO 统一 command 注册
export class CommandsService implements ICommandService {
    private readonly handlers: Map<Commands, (...args: any[]) => any> = new Map();
    init(context: vscode.ExtensionContext) {
        this.handlers.forEach((handler, command) => {
            context.subscriptions.push(vscode.commands.registerCommand(command, handler));
        });
        context.subscriptions.push(this);
    }
    use(handler: ICommandHandler) {
        this.handlers.set(handler.command, handler.handler);
    }
    execCommand<T = any>(command: Commands, ...args: any[]): T {
        return this.handlers.get(command)?.(...args);
    }
    dispose() {
        this.handlers.clear();
    }
}