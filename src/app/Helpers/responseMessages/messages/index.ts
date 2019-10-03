import { userMessagesConfig } from './userMessages';
import { fileMessagesConfig } from './fileMessages';
import { folderMessagesConfig } from './folderMessages';
import { nzbGetMessagesConfig } from './nzbgetMessages';

export const Messages = Object.assign(
    userMessagesConfig,
    fileMessagesConfig,
    folderMessagesConfig,
    nzbGetMessagesConfig
);
