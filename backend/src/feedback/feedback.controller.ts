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
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('feedback')
@UseGuards(JwtAuthGuard)
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  create(@Request() req, @Body() createFeedbackDto: CreateFeedbackDto) {
    return this.feedbackService.create(req.user.userId, createFeedbackDto);
  }

  @Get()
  findAll(@Request() req) {
    return this.feedbackService.findAll(req.user.userId, req.user.role);
  }

  @Get(':id')
  async findOne(@Request() req, @Param('id', ParseIntPipe) id: number) {
    const feedback = await this.feedbackService.findOne(id, req.user.userId, req.user.role);
    if (!feedback) {
      throw new NotFoundException('Feedback not found or access denied');
    }
    return feedback;
  }

  @Delete(':id')
  async remove(@Request() req, @Param('id', ParseIntPipe) id: number) {
    const result = await this.feedbackService.remove(id, req.user.userId, req.user.role);
    if (!result) {
      throw new ForbiddenException('Cannot delete this feedback');
    }
    return result;
  }
}
