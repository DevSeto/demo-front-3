export const MailConfig: any = {
    smtp: {
        host   : 'smtp.gmail.com',
        port   : 465,
        secure : true,
        auth   : {
            user : 'arm.armenian3@gmail.com',
            pass : 'armenian3'
        }
    },
    mailgun : {
        api_key : 'key-050c423f72bd812a4d99b6fa01a4b84d',
        domain  : 'mg.nzbcloud.com',
    },
    options : {
        from : '"NZB Cloud.com team" <team@nzbcloud.com>'
    },
    templateDir : '../template'
};