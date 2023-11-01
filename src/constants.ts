export const APP_NAME = 'browser-bookmark';

export enum Commands {
    openLink = `${APP_NAME}.open`,
    copyLink = `${APP_NAME}.copyLink`,
    refresh = `${APP_NAME}.refresh`,
    search = `${APP_NAME}.search`,
    openInternal = `${APP_NAME}.openInternal`,
    openExternal = `${APP_NAME}.openExternal`,
    openSetting = `${APP_NAME}.openSetting`,
    changeBookmarkFile = `${APP_NAME}.changeBookmarkFile`,
}

export const CTX_URL = `${APP_NAME}.url`;
export const CTX_BROWSER = `${APP_NAME}.browser`;

export const VIEW_BOOKMARK = 'BrowserBookmark.bookmark';

export const browsers = ['chrome', 'edge'] as const;

export namespace PathConfig {
    export enum Chrome {
        mac = 'path.mac.chrome',
        win = 'path.win.chrome',
        linux = 'path.linux.chrome',
    }
    export enum Edge {
        mac = 'path.mac.edge',
        win = 'path.win.edge',
        linux = 'path.linux.edge',
    }
    export type AllConfig = `${PathConfig.Chrome}` | `${PathConfig.Edge}`
}