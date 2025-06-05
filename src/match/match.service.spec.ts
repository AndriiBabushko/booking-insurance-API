import { MatchService } from './match.service';
import { Booking, Claim, TestMapping } from './dto';

describe('MatchService', () => {
  let service: MatchService;
  const mapping: TestMapping[] = [
    { test: 'test_1', medicalServiceCode: 'medical_service_1' },
    { test: 'test_2', medicalServiceCode: 'medical_service_2' },
  ];

  beforeEach(() => {
    service = new MatchService();
  });

  it('matches booking and claim with identical data', () => {
    const bookings: Booking[] = [
      {
        id: 'b1',
        patient: 'p1',
        test: 'test_1',
        insurance: 'AON',
        reservationDate: '2025-05-15T10:00:00.000Z',
      },
    ];
    const claims: Claim[] = [
      {
        id: 'c1',
        medicalServiceCode: 'medical_service_1',
        bookingDate: '2025-05-15T10:00:00.000Z',
        insurance: 'AON',
        patient: 'p1',
      },
    ];

    const result = service.match(bookings, claims, mapping);
    expect(result).toEqual([{ booking: 'b1', claim: 'c1' }]);
  });

  it('detects time mismatch', () => {
    const bookings: Booking[] = [
      {
        id: 'b2',
        patient: 'p2',
        test: 'test_1',
        insurance: 'AON',
        reservationDate: '2025-05-15T09:00:00.000Z',
      },
    ];
    const claims: Claim[] = [
      {
        id: 'c2',
        medicalServiceCode: 'medical_service_1',
        bookingDate: '2025-05-15T10:00:00.000Z',
        insurance: 'AON',
        patient: 'p2',
      },
    ];

    const result = service.match(bookings, claims, mapping);
    expect(result).toEqual([
      { booking: 'b2', claim: 'c2', mismatch: ['time'] },
    ]);
  });

  it('detects test and insurance mismatches', () => {
    const bookings: Booking[] = [
      {
        id: 'b3',
        patient: 'p3',
        test: 'test_1',
        insurance: 'AON',
        reservationDate: '2025-05-15T08:00:00.000Z',
      },
    ];
    const claims: Claim[] = [
      {
        id: 'c3',
        medicalServiceCode: 'medical_service_2',
        bookingDate: '2025-05-15T08:00:00.000Z',
        insurance: 'BUPA',
        patient: 'p3',
      },
    ];

    const result = service.match(bookings, claims, mapping);
    expect(result).toEqual([
      { booking: 'b3', claim: 'c3', mismatch: ['test', 'insurance'] },
    ]);
  });

  it('ignores invalid dates without throwing', () => {
    const bookings: Booking[] = [
      {
        id: 'b4',
        patient: 'p4',
        test: 'test_1',
        insurance: 'AON',
        reservationDate: 'not-a-date',
      },
    ];
    const claims: Claim[] = [
      {
        id: 'c4',
        medicalServiceCode: 'medical_service_1',
        bookingDate: 'also-invalid',
        insurance: 'AON',
        patient: 'p4',
      },
    ];

    const result = service.match(bookings, claims, mapping);
    expect(result).toEqual([]);
  });
});
