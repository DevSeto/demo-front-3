import { HttpStatus } from '@nestjs/common';

export const folderMessagesConfig: { [messageCode: string]: any } = {
    'folder:missingPath': {
        type         : 'BadRequest',
        status       : false,
        httpStatus   : HttpStatus.BAD_REQUEST,
        errorMessage : 'Please give folder path.',
        userMessage  : '',
    }
};