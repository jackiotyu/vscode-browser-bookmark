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

export const browsers = ['chrome', 'edge', 'firefox'] as const;

export namespace PathConfig {
    export const Chrome = 'path.chrome';
    export const Edge = 'path.edge';
    export const Firefox = 'path.firefox';
    export type AllConfig = typeof PathConfig.Chrome | typeof PathConfig.Edge | typeof PathConfig.Firefox;
}
