import { Controller, Get, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { ManagerOnly } from '../auth/decorators/manager-only.decorator';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ManagerOnly()
  async getProducts(
    @GetUser() user: any,
    @Query('page') page: string = '1',
    @Query('size') size: string = '10',
  ) {
    return this.productsService.getProducts(user.id, parseInt(page), parseInt(size));
  }
}
