import {
  Injectable,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterCompanyDto } from './dto/register-company.dto';
import axios from 'axios';
import { UserRole } from '@prisma/client';

@Injectable()
export class CompanyService {
  constructor(private prisma: PrismaService) {}

  async registerCompany(userId: string, dto: RegisterCompanyDto) {
    const { token, subdomain } = dto;

    try {
      const response = await axios.get(
        `https://${subdomain}.ox-sys.com/profile`,
        {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.data) {
        throw new BadRequestException('Invalid token or subdomain');
      }
    } catch (error) {
      throw new BadRequestException('Failed to validate token with OX API');
    }

    const existingCompany = await this.prisma.company.findUnique({
      where: { subdomain },
    });

    if (existingCompany) {
      const userCompany = await this.prisma.userCompany.findUnique({
        where: {
          userId_companyId: {
            userId,
            companyId: existingCompany.id,
          },
        },
      });

      if (userCompany) {
        return {
          message: 'Already associated with this company',
          company: existingCompany,
          role: userCompany.role,
        };
      }

      await this.prisma.userCompany.create({
        data: {
          userId,
          companyId: existingCompany.id,
          role: UserRole.MANAGER,
        },
      });

      return {
        message: 'Associated with existing company as manager',
        company: existingCompany,
        role: UserRole.MANAGER,
      };
    }

    const company = await this.prisma.company.create({
      data: {
        subdomain,
        token,
        adminId: userId,
      },
    });

    await this.prisma.userCompany.create({
      data: {
        userId,
        companyId: company.id,
        role: UserRole.ADMIN,
      },
    });

    return {
      message: 'Company registered successfully',
      company,
      role: UserRole.ADMIN,
    };
  }

  async deleteCompany(userId: string, companyId: string) {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      throw new BadRequestException('Company not found');
    }

    if (company.adminId !== userId) {
      throw new ForbiddenException(
        'Only the admin who created the company can delete it',
      );
    }

    await this.prisma.company.delete({
      where: { id: companyId },
    });

    return {
      message: 'Company deleted successfully',
    };
  }
}
