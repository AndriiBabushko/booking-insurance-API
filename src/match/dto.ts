export interface Booking {
  id: string;
  patient: string;
  test: string;
  insurance: string;
  reservationDate: string;
}

export interface Claim {
  id: string;
  medicalServiceCode: string;
  bookingDate: string;
  insurance: string;
  patient: string;
}

export interface MatchRequestDto {
  bookings: Booking[];
  claims: Claim[];
}

export interface MatchResult {
  claim: string;
  booking: string;
  mismatch?: string[];
}
