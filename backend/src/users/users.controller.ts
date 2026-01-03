import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  UseGuards,
  Request,
  Param,
  ParseIntPipe,
  ForbiddenException,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  getProfile(@Request() req) {
    return this.usersService.findOne(req.user.userId);
  }

  @Put('profile')
  updateProfile(@Request() req, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(req.user.userId, updateUserDto);
  }

  @Get()
  @Roles('ADMIN', 'INCHARGE')
  findAll(@Request() req) {
    return this.usersService.findAll(req.user.userId, req.user.role);
  }

  @Get(':id')
  @Roles('ADMIN', 'INCHARGE')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @Post()
  @Roles('ADMIN', 'INCHARGE')
  create(@Request() req, @Body() createUserDto: CreateUserDto) {
    // Incharge can only create members
    if (req.user.role === 'INCHARGE' && createUserDto.role && createUserDto.role !== 'MEMBER') {
      throw new ForbiddenException('Incharge can only create members');
    }
    // Set default role to MEMBER if not specified
    if (!createUserDto.role) {
      createUserDto.role = 'MEMBER';
    }
    return this.usersService.create(createUserDto);
  }

  @Put(':id')
  update(@Request() req, @Param('id', ParseIntPipe) id: number, @Body() updateUserDto: UpdateUserDto) {
    const userRole = req.user.role;

    // Members cannot edit profiles
    if (userRole === 'MEMBER') {
      throw new ForbiddenException('Members cannot edit profiles');
    }

    // Get the target user to check their role
    return this.usersService.findOne(id).then(targetUser => {
      if (!targetUser) {
        throw new ForbiddenException('User not found');
      }

      // Incharge can only edit member profiles
      if (userRole === 'INCHARGE' && targetUser.role !== 'MEMBER') {
        throw new ForbiddenException('Incharge can only edit member profiles');
      }

      // Incharge cannot change roles
      if (userRole === 'INCHARGE' && updateUserDto.role) {
        throw new ForbiddenException('Incharge cannot change user roles');
      }

      // Admin can edit incharge and member profiles
      // Admin can change roles
      return this.usersService.update(id, updateUserDto);
    });
  }

  @Delete(':id')
  @Roles('ADMIN', 'INCHARGE')
  remove(@Request() req, @Param('id', ParseIntPipe) id: number) {
    const userRole = req.user.role;

    // Get the target user to check their role
    return this.usersService.findOne(id).then(targetUser => {
      if (!targetUser) {
        throw new ForbiddenException('User not found');
      }

      // Incharge can only delete members
      if (userRole === 'INCHARGE' && targetUser.role !== 'MEMBER') {
        throw new ForbiddenException('Incharge can only delete members');
      }

      return this.usersService.remove(id);
    });
  }

  @Get('export/csv')
  @Roles('ADMIN', 'INCHARGE')
  async exportCsv(@Res() res: Response) {
    const csv = await this.usersService.exportToCSV();
    res.header('Content-Type', 'text/csv');
    res.header('Content-Disposition', 'attachment; filename=users.csv');
    res.send(csv);
  }

  @Post('import/csv')
  @Roles('ADMIN', 'INCHARGE')
  @UseInterceptors(FileInterceptor('file'))
  async importCsv(@Request() req, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const csvContent = file.buffer.toString('utf-8');
    const result = await this.usersService.importFromCSV(csvContent, req.user.role);
    return result;
  }
}
