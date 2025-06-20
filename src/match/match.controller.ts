import {
  Body,
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { MatchService } from './match.service';
import { MatchRequestDto, MatchResult } from './dto';

@Controller('match')
export class MatchController {
  constructor(private readonly matchService: MatchService) {}

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  match(@Body() body: MatchRequestDto): MatchResult[] {
    return this.matchService.match(
      body.bookings,
      body.claims,
      body.testMapping,
    );
  }
}
