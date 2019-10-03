import { ExpressMiddleware, Middleware, NestMiddleware, Inject } from "@nestjs/common";
import { Model } from 'mongoose';
import { MessageCode } from '../../Helpers/responseMessages/MessageCode';
import { UsersInterface } from '../../Interfaces/Dto/users.interface';
import { ENV } from '../../../config';
import * as jwt from 'jsonwebtoken';

@Middleware()
export class ApiMiddleware implements NestMiddleware {

    constructor(
        @Inject('UserModelToken') private userModel: Model<UsersInterface>
    ) {}

    resolve(): ExpressMiddleware {
        return (req: any, res: any, next: any) => {
            if (req.headers.authorization) {
                const token = req.headers.authorization;
                try {
                    const decoded: any = jwt.verify(token, ENV.JWT_KEY);
                    const user: any    = this.userModel.findOne({
                        email: decoded.email
                    });

                    if (!user) {
                        const error = MessageCode.getMessageFromMessageCode('request:incorrectAccessToken');
                        return res.json(error);
                    }
                } catch (e) {
                    const error = MessageCode.getMessageFromMessageCode('request:incorrectAccessToken');
                    return res.json(error);
                }
            } else {
                const error = MessageCode.getMessageFromMessageCode('request:unauthorized');
                return res.json(error);
            }

            next();
        };
    }
}
