import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Request,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { AccountabilityService } from './accountability.service';
import { CreateAccountabilityDto } from './dto/create-accountability.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('accountability')
@UseGuards(JwtAuthGuard)
export class AccountabilityController {
  constructor(private readonly accountabilityService: AccountabilityService) {}

  @Post()
  create(@Request() req, @Body() createAccountabilityDto: CreateAccountabilityDto) {
    return this.accountabilityService.create(req.user.userId, createAccountabilityDto);
  }

  @Get()
  findAll(@Request() req) {
    return this.accountabilityService.findAll(req.user.userId, req.user.role);
  }

  @Get(':id')
  async findOne(@Request() req, @Param('id', ParseIntPipe) id: number) {
    const accountability = await this.accountabilityService.findOne(id, req.user.userId, req.user.role);
    if (!accountability) {
      throw new NotFoundException('Accountability record not found or access denied');
    }
    return accountability;
  }

  @Delete(':id')
  async remove(@Request() req, @Param('id', ParseIntPipe) id: number) {
    const result = await this.accountabilityService.remove(id, req.user.userId, req.user.role);
    if (!result) {
      throw new ForbiddenException('Cannot delete this accountability record');
    }
    return result;
  }
}
