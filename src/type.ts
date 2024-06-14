import type { Disposable, ExtensionContext } from 'vscode';
import type { Commands } from '@/constants'

export type BrowserType = 'chrome' | 'edge' | 'firefox';

export interface Bookmark {
    name?: string;
    value: string;
    type: BrowserType;
};

export interface IBookmarkFolder {
    children: Array<IBookmarkFolder | IBookmarkUrl>;
    name: string;
    url: string;
    type: 'folder';
};

export interface IBookmarkUrl {
    name: string;
    url: string;
    type: 'url';
};

export type BookmarkData = Array<IBookmarkFolder | IBookmarkUrl>;
export type BookmarkItem = IBookmarkFolder | IBookmarkUrl;

export interface IBrowserPlugin {
    type: BrowserType;
    defaultPath: string;
    get configPath(): string;
    getBookmarkLocation(): string;
    getBookmarks(): Promise<Array<Bookmark>>;
    getBookmarkTree(): Promise<BookmarkData>;
}

export interface IPluginService extends Disposable {
    use(plugin: IBrowserPlugin): void;
    attach(type: BrowserType): IBrowserPlugin | void;
    getBookmarkLocation(type: BrowserType): string;
    getBookmarks(type: BrowserType): Promise<Array<Bookmark>>;
    getBookmarkTree(type: BrowserType): Promise<BookmarkData>;
}

export interface ICommandHandler {
    command: Commands;
    handler: (...args: any[]) => any;
}

export interface ICommandService extends Disposable {
    init(context: ExtensionContext): void;
    use(handler: ICommandHandler): void;
    execCommand<T = any>(command: Commands, ...args: any[]): T;
}