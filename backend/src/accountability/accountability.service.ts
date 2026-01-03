import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAccountabilityDto } from './dto/create-accountability.dto';

@Injectable()
export class AccountabilityService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, createAccountabilityDto: CreateAccountabilityDto) {
    return this.prisma.accountability.create({
      data: {
        userId,
        content: createAccountabilityDto.content,
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
      // Admin can see all accountability records
      return this.prisma.accountability.findMany({
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
      // Incharge can see accountability from their assigned members
      return this.prisma.accountability.findMany({
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
      // Members can only see their own accountability
      return this.prisma.accountability.findMany({
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
    const accountability = await this.prisma.accountability.findUnique({
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

    if (!accountability) {
      return null;
    }

    // Check permissions
    if (requestingUserRole === 'ADMIN') {
      return accountability;
    } else if (requestingUserRole === 'INCHARGE' && accountability.user.inchargeId === requestingUserId) {
      return accountability;
    } else if (accountability.userId === requestingUserId) {
      return accountability;
    }

    return null;
  }

  async remove(id: number, requestingUserId: number, requestingUserRole: string) {
    const accountability = await this.findOne(id, requestingUserId, requestingUserRole);

    if (!accountability) {
      return null;
    }

    // Only admin or the accountability owner can delete
    if (requestingUserRole === 'ADMIN' || accountability.userId === requestingUserId) {
      return this.prisma.accountability.delete({ where: { id } });
    }

    return null;
  }
}
