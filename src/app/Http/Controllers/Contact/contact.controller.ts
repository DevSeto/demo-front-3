import { Controller, HttpStatus, Post, Response, Body } from '@nestjs/common';
import { Mail } from '../../../Modules/Mail/component/mail.component';
import { ENV } from '../../../../config';

@Controller('/api/contact-us')
export class ContactController {
    public mail: any;

    constructor() {
        this.mail = new Mail;
    }

    /**
     * Send contact form
     *
     * @param res
     * @param data
     */
    @Post()
    public async sendContactForm(@Response() res: any, @Body() data: any): Promise<any> {

        this.mail.send({
            to       : 'ashavelyan@gmail.com',
            subject  : 'New submit from NZBCloud Contact from',
            template : {
                name      : 'contact_form.html',
                arguments : [
                    {
                        key   : /{{email}}/g,
                        value : data.email
                    },
                    {
                        key   : /{{name}}/g,
                        value : data.name
                    },
                    {
                        key   : /{{message}}/g,
                        value : data.message
                    }
                ]
            }
        });


        return res.status(HttpStatus.ACCEPTED).send({
            status     : true,
            httpStatus : HttpStatus.OK
        });
    }
}