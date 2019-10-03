import { Module } from '@nestjs/common';
import { CloudSocketGateway } from './cloud-socket.gateway';
import { CloudSocketService } from './service/cloud-socket.service';

@Module({
    components: [
        CloudSocketGateway,
        CloudSocketService
    ]
})

export class CloudSocketModule {
}
