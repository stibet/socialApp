import {
  Controller, Get, Post, Delete, Param, Body, Request, UseGuards, Query,
} from '@nestjs/common';
import { GroupsService } from './groups.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { OfferType } from './group.entity';
import { IsEnum, IsOptional, IsString, IsUUID, IsNumber, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

class CreateGroupDto {
  @IsUUID()
  eventId: string;

  @IsEnum(OfferType)
  offerType: OfferType;

  @IsOptional()
  @IsString()
  customNote?: string;

  @IsOptional()
  @IsNumber()
  @Min(2)
  @Max(20)
  @Type(() => Number)
  maxMembers?: number;
}

@Controller('groups')
@UseGuards(JwtAuthGuard)
export class GroupsController {
  constructor(private groupsService: GroupsService) {}

  @Get('my')
  getMyGroups(@Request() req) {
    return this.groupsService.findUserGroups(req.user.id);
  }

  @Get('event/:eventId')
  getByEvent(@Param('eventId') eventId: string) {
    return this.groupsService.findByEvent(eventId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.groupsService.findById(id);
  }

  @Post()
  create(@Request() req, @Body() dto: CreateGroupDto) {
    return this.groupsService.create(req.user.id, dto);
  }

  @Post(':id/join')
  join(@Param('id') id: string, @Request() req) {
    return this.groupsService.join(id, req.user.id);
  }

  @Delete(':id/leave')
  leave(@Param('id') id: string, @Request() req) {
    return this.groupsService.leave(id, req.user.id);
  }

  @Delete(':id/close')
  close(@Param('id') id: string, @Request() req) {
    return this.groupsService.close(id, req.user.id);
  }
}
