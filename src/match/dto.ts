import {
  IsArray,
  IsDateString,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class Booking {
  @IsString()
  id: string;

  @IsString()
  patient: string;

  @IsString()
  test: string;

  @IsString()
  insurance: string;

  @IsDateString()
  reservationDate: string;
}

export class Claim {
  @IsString()
  id: string;

  @IsString()
  medicalServiceCode: string;

  @IsDateString()
  bookingDate: string;

  @IsString()
  insurance: string;

  @IsString()
  patient: string;
}

export class MatchRequestDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Booking)
  bookings: Booking[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Claim)
  claims: Claim[];
}

export interface MatchResult {
  claim: string;
  booking: string;
  mismatch?: string[];
}
