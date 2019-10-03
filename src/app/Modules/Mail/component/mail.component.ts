import { Component } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as Mailgun from 'mailgun-js';
import * as fs from 'fs';
import * as path from 'path';
import { ENV } from '../../../../config';
import { MailConfig } from '../config/mailer.config';

@Component()
export class Mail {

    public transporter: any;

    constructor() {
        if(ENV.mail == 'smtp') {
            this.transporter = nodemailer.createTransport(MailConfig.smtp);
        } else {
            this.transporter = Mailgun({
                apiKey: MailConfig.mailgun.api_key,
                domain: MailConfig.mailgun.domain
            });
        }
    }

    /**
     * Functionality for sending mail
     *
     * @param mailData
     */
    public async send(mailData: any): Promise<any> {
        const template: any    = await this.getTemplate(mailData.template.name,mailData.template.arguments);
        const mailOptions: any = {
            from    : MailConfig.options.from,
            to      : mailData.to,
            subject : mailData.subject,
            html    : template
        };

        if(ENV.mail == 'smtp') {
            this.transporter.sendMail(mailOptions, (error: any, info: any) => {
                if (error) {
                    return console.log(error);
                }
                return true
            });
        } else {
            this.transporter.messages().send(mailOptions, function (error: any, body: any) {
                if (error) {
                    return console.log(error);
                }
                return true
            });
        }
    }

    /**
     * Get Mail template
     *
     * @param templateName
     * @param data
     * @returns {any}
     */
    public getTemplate(templateName: string, data: any) {
        return new Promise(function (resolve: any, reject: any) {
            fs.readFile(path.resolve(__dirname, '../template/' + templateName), 'utf8', function (error: any, html: any) {
                if (error) {
                    return console.log(error);
                }

                if(data) {
                    data.forEach(function(argument: any) {
                        html = html.replace(argument.key, argument.value);
                    });
                }

                html = html.replace(/{{filePath}}/g, ENV.production_host + '/assets/images/mail');

                return resolve(html);
            });
        });
    }
}