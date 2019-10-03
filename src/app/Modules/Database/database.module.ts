import {Module} from '@nestjs/common';
import {DATABASE_PROVIDERS} from './database.providers';

@Module({
    components: [...DATABASE_PROVIDERS],
    exports: [...DATABASE_PROVIDERS],
})

export class DatabaseModule {}
