import { Body, Controller, Delete, Param, Post, UseGuards } from '@nestjs/common';
import { CompanyService } from './company.service';
import { RegisterCompanyDto } from './dto/register-company.dto';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminOnly } from '../auth/decorators/admin-only.decorator';

@Controller()
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Post('register-company')
  @UseGuards(JwtAuthGuard)
  async registerCompany(@GetUser() user: any, @Body() dto: RegisterCompanyDto) {
    return this.companyService.registerCompany(user.id, dto);
  }

  @Delete('company/:id')
  @AdminOnly()
  async deleteCompany(@GetUser() user: any, @Param('id') companyId: string) {
    return this.companyService.deleteCompany(user.id, companyId);
  }
}
