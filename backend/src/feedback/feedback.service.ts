import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';

@Injectable()
export class FeedbackService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, createFeedbackDto: CreateFeedbackDto) {
    return this.prisma.feedback.create({
      data: {
        userId,
        content: createFeedbackDto.content,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            role: true,
          },
        },
      },
    });
  }

  async findAll(requestingUserId: number, requestingUserRole: string) {
    if (requestingUserRole === 'ADMIN') {
      // Admin can see all feedback
      return this.prisma.feedback.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              role: true,
            },
          },
        },
      });
    } else if (requestingUserRole === 'INCHARGE') {
      // Incharge can see feedback from their assigned members
      return this.prisma.feedback.findMany({
        where: {
          user: {
            inchargeId: requestingUserId,
          },
        },
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              role: true,
            },
          },
        },
      });
    } else {
      // Members can only see their own feedback
      return this.prisma.feedback.findMany({
        where: { userId: requestingUserId },
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              role: true,
            },
          },
        },
      });
    }
  }

  async findOne(id: number, requestingUserId: number, requestingUserRole: string) {
    const feedback = await this.prisma.feedback.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            role: true,
            inchargeId: true,
          },
        },
      },
    });

    if (!feedback) {
      return null;
    }

    // Check permissions
    if (requestingUserRole === 'ADMIN') {
      return feedback;
    } else if (requestingUserRole === 'INCHARGE' && feedback.user.inchargeId === requestingUserId) {
      return feedback;
    } else if (feedback.userId === requestingUserId) {
      return feedback;
    }

    return null;
  }

  async remove(id: number, requestingUserId: number, requestingUserRole: string) {
    const feedback = await this.findOne(id, requestingUserId, requestingUserRole);

    if (!feedback) {
      return null;
    }

    // Only admin or the feedback owner can delete
    if (requestingUserRole === 'ADMIN' || feedback.userId === requestingUserId) {
      return this.prisma.feedback.delete({ where: { id } });
    }

    return null;
  }
}
