import { Module } from '@nestjs/common';
import { PeopleService } from './people.service';
import { PeopleController } from './people.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PeopleController],
  providers: [PeopleService],
  exports: [PeopleService], // Export so other modules can use it
})
export class PeopleModule {}
