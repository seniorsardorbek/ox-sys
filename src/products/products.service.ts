import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async getProducts(userId: string, page: number = 1, size: number = 10) {
    if (size > 20) {
      throw new BadRequestException('Size cannot exceed 20');
    }

    const userWithCompanies = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        companies: {
          include: {
            company: true,
          },
        },
      },
    });

    if (!userWithCompanies || userWithCompanies.companies.length === 0) {
      throw new ForbiddenException('User is not associated with any company');
    }

    const userCompany = userWithCompanies.companies[0];
    const company = userCompany.company;

    try {
      const response = await axios.get(
        `https://${company.subdomain}.ox-sys.com/variations`,
        {
          headers: {
            Accept: 'application/json',
            Authorization: company.token.startsWith('Bearer ')
              ? company.token
              : `Bearer ${company.token}`,
          },
          params: {
            page,
            size,
          },
        },
      );

      return response.data;
    } catch (error) {
      throw new BadRequestException('Failed to fetch products from OX API');
    }
  }
}
