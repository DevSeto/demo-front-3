import { Messages } from './messages/index';

export class MessageCode {

    /**
     * @description: Find the message config by the given message code.
     * @param {string} messageCode
     */
    public static getMessageFromMessageCode(messageCode: string): any {
        let messageConfig: any = [];
        Object.keys(Messages).some(key => {
            if (key === messageCode) {
                messageConfig = Messages[key];
                return true;
            }
            return false;
        });

        return messageConfig;
    }
}