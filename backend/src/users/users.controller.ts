import {
  Controller, Get, Put, Body, Param,
  UseGuards, Request,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { IsString, IsOptional, MaxLength } from 'class-validator';

class UpdateProfileDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;

  @IsOptional()
  @IsString()
  avatar?: string;
}

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  getMe(@Request() req) {
    return this.usersService.getProfile(req.user.id);
  }

  @Put('me')
  updateMe(@Request() req, @Body() dto: UpdateProfileDto) {
    return this.usersService.update(req.user.id, dto);
  }

  @Get(':id')
  getUser(@Param('id') id: string) {
    return this.usersService.getProfile(id);
  }
}
