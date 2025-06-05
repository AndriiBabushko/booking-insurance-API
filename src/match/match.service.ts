import { Injectable } from '@nestjs/common';
import { Booking, Claim, MatchResult } from './dto';

interface Candidate {
  booking: Booking;
  claim: Claim;
  score: number;
  mismatch: string[];
}

@Injectable()
export class MatchService {
  private testMap = new Map<string, string>([
    ['test_1', 'medical_service_1'],
    ['test_2', 'medical_service_2'],
  ]);

  match(bookings: Booking[], claims: Claim[]): MatchResult[] {
    const pairs: Candidate[] = [];

    for (const claim of claims) {
      for (const booking of bookings) {
        if (
          booking.patient === claim.patient &&
          this.sameDate(booking.reservationDate, claim.bookingDate)
        ) {
          const { score, mismatch } = this.evaluate(booking, claim);
          pairs.push({ booking, claim, score, mismatch });
        }
      }
    }

    pairs.sort((a, b) => b.score - a.score);
    const usedBookings = new Set<string>();
    const usedClaims = new Set<string>();
    const results: MatchResult[] = [];

    for (const pair of pairs) {
      if (usedBookings.has(pair.booking.id) || usedClaims.has(pair.claim.id)) {
        continue;
      }
      usedBookings.add(pair.booking.id);
      usedClaims.add(pair.claim.id);
      const mismatch = pair.mismatch.length > 0 ? pair.mismatch : undefined;
      results.push({
        booking: pair.booking.id,
        claim: pair.claim.id,
        ...(mismatch ? { mismatch } : {}),
      });
    }

    return results;
  }

  private evaluate(
    booking: Booking,
    claim: Claim,
  ): { score: number; mismatch: string[] } {
    let score = 0;
    const mismatch: string[] = [];

    if (this.testMap.get(booking.test) === claim.medicalServiceCode) {
      score++;
    } else {
      mismatch.push('test');
    }

    if (this.sameTime(booking.reservationDate, claim.bookingDate)) {
      score++;
    } else {
      mismatch.push('time');
    }

    if (booking.insurance === claim.insurance) {
      score++;
    } else {
      mismatch.push('insurance');
    }

    return { score, mismatch };
  }

  private sameDate(a: string, b: string): boolean {
    return (
      new Date(a).toISOString().slice(0, 10) ===
      new Date(b).toISOString().slice(0, 10)
    );
  }

  private sameTime(a: string, b: string): boolean {
    const dateA = new Date(a);
    const dateB = new Date(b);
    return (
      dateA.getUTCHours() === dateB.getUTCHours() &&
      dateA.getUTCMinutes() === dateB.getUTCMinutes()
    );
  }
}
