import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { VenuesService } from './venues.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('venues')
@UseGuards(JwtAuthGuard)
export class VenuesController {
  constructor(private venuesService: VenuesService) {}

  @Get()
  findAll(@Query('district') district?: string) {
    return this.venuesService.findAll(district);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.venuesService.findById(id);
  }

  @Post()
  create(@Body() body: any) {
    return this.venuesService.create(body);
  }

  @Post('seed')
  seed() {
    return this.venuesService.seed();
  }
}