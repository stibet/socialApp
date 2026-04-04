import {
  Controller, Get, Post, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { IsString, IsOptional, IsDateString, IsUUID } from 'class-validator';

class CreateEventDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  eventDate: Date;

  @IsUUID()
  venueId: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}

@Controller('events')
@UseGuards(JwtAuthGuard)
export class EventsController {
  constructor(private eventsService: EventsService) {}

  @Get()
  findAll(@Query('venueId') venueId?: string) {
    return this.eventsService.findUpcoming(venueId);
  }

  @Get('today')
  findToday() {
    return this.eventsService.findToday();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventsService.findById(id);
  }

  @Post()
  create(@Body() dto: CreateEventDto) {
    return this.eventsService.create(dto);
  }
}
