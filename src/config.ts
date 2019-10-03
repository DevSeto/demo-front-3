export const ENV: any = {
    production                : false,
    JWT_ID                    : 'nzbcloud',
    JWT_KEY                   : 'cf66f941f8de1552f27ca45bb286f2c7',
    SSL_KEY_PATH              : '/var/www/certificates/nzbcloud.com.key',
    SSL_CERT_PATH             : '/var/www/certificates/nzbcloud.com.crt',
    nzbget_server             : 'http://localhost',
    nzbget_server_port        : '6789',
    production_ip             : 'http://172.104.134.90',
    production_host           : 'https://node.nzbcloud.com',
    production_port           : '8080',
    dev_ip                    : 'http://nzbcloud.loc',
    dev_host                  : 'http://api.nzbcloud.loc',
    dev_port                  : '3000',
    external_storage_host     : 'https://cloud.nzbcloud.com',
    external_storage_port     : '4000',
    dev_external_storage_host : 'http://api.nzbcloud.loc',
    dev_external_storage_port : '4040',
    socket_port               : '3030',
    nzb_media_server_host     : 'https://ffmpeg_admin:SA38r_V-RAC.uwS3xym9@ffmpeg024.nzbcloud.com/api/',
    mail                      : 'mailgun',
    crypto: <object> {
        secret    : '5ebe2294ecd0e0f08eab7690d2a6ee69',
        iv        : Buffer.from('00000000000000000000000000000000', 'hex'),
        algorithm : 'aes-256-ctr'
    },
    db: <object> {
        type     : 'mongodb',
        username : 'admin',
        password : '1234567',
        host     : 'localhost',
        port     : 27017,
        database : 'nzbcloud'
    },
    notification_config: <object> {
        title : 'NZB CLoud',
        icon  : 'https://node.nzbcloud.com/assets/images/favicon.png',
        body  : 'Your file has been successfully downloaded.',
        url   : 'https://node.nzbcloud.com/',
    }
};
