import { HttpStatus } from '@nestjs/common';

export const nzbGetMessagesConfig: { [messageCode: string]: any } = {
    'nzbGet:create:error': {
        type         : 'BadRequest',
        status       : false,
        httpStatus   : HttpStatus.BAD_REQUEST,
        errorMessage : 'Unable to add a usenet server, please try again',
        userMessage  : 'Unable to add a usenet server, please try again',
    },
    'nzbGet:create:alreadyExist': {
        type         : 'BadRequest',
        status       : false,
        httpStatus   : HttpStatus.BAD_REQUEST,
        errorMessage : 'Usenet server by this host already exist.',
        userMessage  : 'Usenet server by this host already exist.',
    },
    'nzbGet:successfullyUploaded': {
        type         : 'OK',
        status       : true,
        httpStatus   : HttpStatus.OK,
        errorMessage : '',
        userMessage  : 'Your usenet server has been successfully added.',
    },
    'nzbGet:successfullyDeleted': {
        type         : 'OK',
        status       : true,
        httpStatus   : HttpStatus.OK,
        errorMessage : '',
        userMessage  : 'Your usenet servers has been successfully deleted.',
    }
};