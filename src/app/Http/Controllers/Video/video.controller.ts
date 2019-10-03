import { Controller, HttpStatus, Post, Get, Response, Body, Bind, Param } from '@nestjs/common';
import { FoldersService } from '../../../Services/folders.service';
import { ENV } from '../../../../config';
import * as request from 'request';

@Controller('/api/video-hook')
export class VideoController {

    constructor(
        private readonly foldersService: FoldersService
    ) {}

    /**
     * Update video convert status
     *
     * @param res
     * @param data
     */

    @Get('get-video-info/:videoId')
    @Bind(Param('videoId'))
    public async getVideoInfo(videoId: string, @Response() res: any): Promise<any> {
        const nzbMediaUrl: string  = ENV.nzb_media_server_host + 'jobstatus/' + videoId;
        const options: any         = {
            method  : 'GET',
            url     : nzbMediaUrl,
            headers : {
                'content-type': 'application/json'
            },
            json    : true
        };

        request(options, function (error: any, response: any, body: any) {
            if (error) {
                throw new Error(error);
            }

            let video: any;

            if (body.error) {
                video = []
            } else {
                video = body;
            }

            return res.status(HttpStatus.ACCEPTED).send({
                status: true,
                httpStatus: HttpStatus.OK,
                video: video
            });
        })
    }


    /**
     * Change File data
     *
     * @param folder
     * @param newValue
     * @param oldValue
     * @param key
     */
    public async changeFileData(folder: any, newValue: any, oldValue: any, key: string) {
        function replace(objSource: any, oldValue: any, newValue: any, oldKey: any = false) {
            if(typeof objSource === 'object') {
                if(objSource === null) return null;

                for(var property in objSource) {
                    objSource[property] = replace(objSource[property], oldValue, newValue, property);
                }
            } else {
                if(typeof objSource === 'string' && objSource == oldValue && oldKey == key){
                    return newValue;
                }
            }

            return objSource;
        }

        return replace(folder, oldValue, newValue);
    }

}
