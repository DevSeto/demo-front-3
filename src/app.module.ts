/*******************************  Common Section ********************************/
import { Module, NestModule, MiddlewaresConsumer } from '@nestjs/common';
/*****************************  End Common Section ******************************/

/*******************************  Controller Section ********************************/
import { AuthController } from './app/Http/Controllers/Auth/auth.controller';
import { UsersController } from './app/Http/Controllers/Users/users.controller';
import { FoldersController } from './app/Http/Controllers/Folders/folders.controller';
import { FilesController } from './app/Http/Controllers/Files/files.controller';
import { VideoController } from './app/Http/Controllers/Video/video.controller';
import { NotificationsController } from './app/Http/Controllers/Notifications/notifications.controller';
import { NzbGetController } from './app/Http/Controllers/Nzbget/nzbget.controller';
import { ContactController } from './app/Http/Controllers/Contact/contact.controller';
/*****************************  End Controller Section ******************************/

/*********************************  Module Section **********************************/
import { DatabaseModule } from './app/Modules/Database/database.module';
import { MailModule } from './app/Modules/Mail/mail.module';
import { CloudSocketModule } from './app/Modules/CloudSocket/cloud-socket.module';
/*******************************  End Module Section ********************************/

/********************************    Middleware  ***********************************/
import { ApiMiddleware } from './app/Http/Middlewares/api.middleware';
/********************************  End Middleware  *********************************/

/*********************************  Service Section **********************************/
import { UsersService } from './app/Services/users.service';
import { UserSettingsService } from './app/Services/user-settings.service';
import { NzbGetsService } from './app/Services/nzbgets.service';
import { PlansService } from './app/Services/plans.service';
import { LanguagesService } from './app/Services/languages.service';
import { FilesService } from './app/Services/files.service';
import { NzbFilesService } from './app/Services/nzb-files.service';
import { FoldersService } from './app/Services/folders.service';
/*******************************  End Service Section ********************************/

/********************************  Providers Section *********************************/
import { USERS_PROVIDER } from './app/Providers/users.provider';
import { USER_SETTINGS_PROVIDER } from './app/Providers/user-settings.provider';
import { NZBGETS_PROVIDER } from './app/Providers/nzbgets.provider';
import { LANGUAGES_PROVIDER } from './app/Providers/languages.provider';
import { PLANS_PROVIDER } from './app/Providers/plans.provider';
import { FOLDERS_PROVIDER } from './app/Providers/folders.provider';
import { FILES_PROVIDER } from './app/Providers/files.provider';
import { NZB_FILES_PROVIDER } from './app/Providers/nzb-files.provider';
/******************************  End Providers Section *******************************/

@Module({
    modules: [
        DatabaseModule,
        CloudSocketModule,
        MailModule
    ],
    controllers: [
        AuthController,
        UsersController,
        FoldersController,
        FilesController,
        VideoController,
        NotificationsController,
        NzbGetController,
        ContactController
    ],
    components: [
        UsersService,
        UserSettingsService,
        NzbGetsService,
        PlansService,
        LanguagesService,
        FilesService,
        NzbFilesService,
        FoldersService,
        ...USERS_PROVIDER,
        ...USER_SETTINGS_PROVIDER,
        ...NZBGETS_PROVIDER,
        ...LANGUAGES_PROVIDER,
        ...PLANS_PROVIDER,
        ...FOLDERS_PROVIDER,
        ...FILES_PROVIDER,
        ...NZB_FILES_PROVIDER
    ]
})

export class ApplicationModule implements NestModule {

    public configure(consumer: MiddlewaresConsumer): any {
        consumer.apply(ApiMiddleware).forRoutes(UsersController);
        consumer.apply(ApiMiddleware).forRoutes(FilesController);
    }
}