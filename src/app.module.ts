import { Module } from '@nestjs/common';
import { MatchModule } from './match/match.module';

@Module({
  imports: [MatchModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
