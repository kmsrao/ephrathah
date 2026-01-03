import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.prisma.users.findUnique({
      where: { username: createUserDto.username },
    });

    if (existingUser) {
      throw new ConflictException('Username already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = await this.prisma.users.create({
      data: {
        username: createUserDto.username,
        password: hashedPassword,
        contactNumber: createUserDto.contactNumber,
        liveMode: createUserDto.liveMode,
        role: createUserDto.role as any,
        watchLiveEnabled: createUserDto.watchLiveEnabled ?? true,
        submitFeedbackEnabled: createUserDto.submitFeedbackEnabled ?? true,
        submitAccountabilityEnabled: createUserDto.submitAccountabilityEnabled ?? true,
        inchargeId: createUserDto.inchargeId,
      },
    });

    const { password, ...result } = user;
    return result;
  }

  async findByUsername(username: string) {
    return this.prisma.users.findUnique({
      where: { username },
    });
  }

  async findOne(id: number) {
    const user = await this.prisma.users.findUnique({
      where: { id },
      include: {
        incharge: {
          select: {
            id: true,
            username: true,
            role: true,
          },
        },
      },
    });

    if (user) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const data: any = {};

    if (updateUserDto.password) {
      data.password = await bcrypt.hash(updateUserDto.password, 10);
    }
    if (updateUserDto.contactNumber !== undefined) {
      data.contactNumber = updateUserDto.contactNumber;
    }
    if (updateUserDto.liveMode) {
      data.liveMode = updateUserDto.liveMode;
    }
    if (updateUserDto.role) {
      data.role = updateUserDto.role as any;
    }
    if (updateUserDto.watchLiveEnabled !== undefined) {
      data.watchLiveEnabled = updateUserDto.watchLiveEnabled;
    }
    if (updateUserDto.submitFeedbackEnabled !== undefined) {
      data.submitFeedbackEnabled = updateUserDto.submitFeedbackEnabled;
    }
    if (updateUserDto.submitAccountabilityEnabled !== undefined) {
      data.submitAccountabilityEnabled = updateUserDto.submitAccountabilityEnabled;
    }
    if (updateUserDto.inchargeId !== undefined) {
      data.inchargeId = updateUserDto.inchargeId;
    }

    const user = await this.prisma.users.update({
      where: { id },
      data,
    });

    const { password, ...result } = user;
    return result;
  }

  async findAll(requestingUserId?: number, requestingUserRole?: string) {
    let users;

    if (requestingUserRole === 'ADMIN') {
      // Admin can see all users
      users = await this.prisma.users.findMany({
        orderBy: { username: 'asc' },
        include: {
          incharge: {
            select: {
              id: true,
              username: true,
              role: true,
            },
          },
        },
      });
    } else if (requestingUserRole === 'INCHARGE' && requestingUserId) {
      // Incharge can only see their assigned members
      users = await this.prisma.users.findMany({
        where: {
          inchargeId: requestingUserId,
        },
        orderBy: { username: 'asc' },
        include: {
          incharge: {
            select: {
              id: true,
              username: true,
              role: true,
            },
          },
        },
      });
    } else {
      // Members or unknown roles cannot list users
      return [];
    }

    return users.map(({ password, ...user }) => user);
  }

  async remove(id: number) {
    const user = await this.prisma.users.delete({
      where: { id },
    });

    const { password, ...result } = user;
    return result;
  }

  async exportToCSV(): Promise<string> {
    const users = await this.prisma.users.findMany({
      orderBy: { username: 'asc' },
    });

    // CSV header
    const header = 'username,password,contactNumber,liveMode,role\n';

    // CSV rows - include encrypted password
    const rows = users.map(user => {
      return `${user.username},${user.password},${user.contactNumber},${user.liveMode},${user.role}`;
    }).join('\n');

    return header + rows;
  }

  async importFromCSV(csvContent: string, userRole: string): Promise<{ imported: number; errors: string[] }> {
    const lines = csvContent.split('\n').filter(line => line.trim());
    const errors: string[] = [];
    let imported = 0;

    // Skip header
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const [username, password, contactNumber, liveMode, role] = line.split(',').map(v => v.trim());

      try {
        // Validate required fields
        if (!username || !password || !contactNumber || !liveMode) {
          errors.push(`Line ${i + 1}: Missing required fields (username, password, contactNumber, liveMode)`);
          continue;
        }

        // Check if user already exists
        const existingUser = await this.prisma.users.findUnique({
          where: { username },
        });

        if (existingUser) {
          errors.push(`Line ${i + 1}: User ${username} already exists`);
          continue;
        }

        // Validate role permissions
        const userRoleToCreate = role || 'MEMBER';
        if (userRole === 'INCHARGE' && userRoleToCreate !== 'MEMBER') {
          errors.push(`Line ${i + 1}: Incharge can only create members`);
          continue;
        }

        // Hash the password from CSV
        const hashedPassword = await bcrypt.hash(password, 10);

        await this.prisma.users.create({
          data: {
            username,
            contactNumber,
            liveMode: liveMode || 'audio',
            role: userRoleToCreate as any,
            password: hashedPassword,
            watchLiveEnabled: true,
            submitFeedbackEnabled: true,
            submitAccountabilityEnabled: true,
          },
        });

        imported++;
      } catch (error) {
        errors.push(`Line ${i + 1}: ${error.message}`);
      }
    }

    return { imported, errors };
  }
}
