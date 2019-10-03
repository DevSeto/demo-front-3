import * as express from 'express';
import * as fileUpload from 'express-fileupload';
import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import * as fs from 'fs';
import { NestFactory } from '@nestjs/core';
import { ApplicationModule } from './app.module';
import { ENV } from './config';

async function bootstrap() : Promise<any> {
    const expressApp: any = express();
    expressApp.use(cors());
    expressApp.use(fileUpload());
    expressApp.use(function (req: any, res: any, next: any) {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Credentials', 'true');
        next();
    });
    expressApp.use(bodyParser.urlencoded({
        extended: true,
        limit: '100mb',
        parameterLimit: 1000000
    }));
    expressApp.use(bodyParser.json({limit: '100mb'}));
    
    let app: any;
    let port: number;

    if(ENV.production) {
        port = ENV.production_port;
        const httpsOptions: object = {
            key  : fs.readFileSync(ENV.SSL_KEY_PATH),
            cert : fs.readFileSync(ENV.SSL_CERT_PATH)
        };
        app = await NestFactory.create(ApplicationModule, expressApp, { httpsOptions });
    } else {
        port = ENV.dev_port;
        app = await NestFactory.create(ApplicationModule, expressApp);
    }

    await app.listen(port, () : void => console.log(`Listening on ${ENV.dev_host}:${port}`));
}

bootstrap();