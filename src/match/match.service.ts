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

    const groups = new Map<string, Booking[]>();
    for (const booking of bookings) {
      const day = this.extractDay(booking.reservationDate);
      if (!day) {
        continue;
      }
      const key = `${booking.patient}|${day}`;
      const list = groups.get(key);
      if (list) {
        list.push(booking);
      } else {
        groups.set(key, [booking]);
      }
    }

    for (const claim of claims) {
      const day = this.extractDay(claim.bookingDate);
      if (!day) {
        continue;
      }
      const key = `${claim.patient}|${day}`;
      const candidates = groups.get(key);
      if (!candidates) {
        continue;
      }
      for (const booking of candidates) {
        const { score, mismatch } = this.evaluate(booking, claim);
        pairs.push({ booking, claim, score, mismatch });
      }
    }

    pairs.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      const dateA = new Date(a.booking.reservationDate).getTime();
      const dateB = new Date(b.booking.reservationDate).getTime();
      if (!isNaN(dateA) && !isNaN(dateB) && dateA !== dateB) {
        return dateA - dateB;
      }
      return a.booking.id.localeCompare(b.booking.id);
    });
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

    if (this.sameTime(booking.reservationDate, claim.bookingDate)) {
      score++;
    } else {
      mismatch.push('time');
    }

    if (this.testMap.get(booking.test) === claim.medicalServiceCode) {
      score++;
    } else {
      mismatch.push('test');
    }

    if (booking.insurance === claim.insurance) {
      score++;
    } else {
      mismatch.push('insurance');
    }

    return { score, mismatch };
  }

  private sameDate(a: string, b: string): boolean {
    const dateA = new Date(a);
    const dateB = new Date(b);
    if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
      return false;
    }
    return (
      dateA.toISOString().slice(0, 10) === dateB.toISOString().slice(0, 10)
    );
  }

  private sameTime(a: string, b: string): boolean {
    const dateA = new Date(a);
    const dateB = new Date(b);
    if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
      return false;
    }
    return (
      dateA.getUTCHours() === dateB.getUTCHours() &&
      dateA.getUTCMinutes() === dateB.getUTCMinutes()
    );
  }

  private extractDay(date: string): string | undefined {
    const d = new Date(date);
    if (isNaN(d.getTime())) {
      return undefined;
    }
    return d.toISOString().slice(0, 10);
  }
}
