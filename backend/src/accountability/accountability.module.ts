import { Module } from '@nestjs/common';
import { AccountabilityService } from './accountability.service';
import { AccountabilityController } from './accountability.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [AccountabilityService],
  controllers: [AccountabilityController]
})
export class AccountabilityModule {}
