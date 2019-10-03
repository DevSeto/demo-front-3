import { HttpStatus } from '@nestjs/common';

export const fileMessagesConfig: { [messageCode: string]: any } = {
    'files:missingFile': {
        type         : 'BadRequest',
        status       : false,
        httpStatus   : HttpStatus.BAD_REQUEST,
        errorMessage : 'Please select a file to upload.',
        userMessage  : 'Please select a file to upload.',
    },
    'files:successfullyUploaded': {
        type         : 'OK',
        status       : true,
        httpStatus   : HttpStatus.OK,
        errorMessage : '',
        userMessage  : 'Your file has been successfully uploaded.',
    }
};