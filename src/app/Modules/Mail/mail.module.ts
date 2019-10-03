import { Module } from '@nestjs/common';
import { Mail } from './component/mail.component';

@Module({
    components: [Mail]
})
export class MailModule {
}