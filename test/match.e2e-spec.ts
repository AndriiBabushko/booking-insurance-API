import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('MatchController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/match (POST)', async () => {
    const response = await request(app.getHttpServer())
      .post('/match')
      .send({
        bookings: [
          {
            id: 'booking_1',
            patient: 'patient_1',
            test: 'test_1',
            insurance: 'AON',
            reservationDate: '2025-05-16T11:00:00.000Z',
          },
          {
            id: 'booking_7',
            patient: 'patient_7',
            test: 'test_1',
            insurance: 'AON',
            reservationDate: '2025-05-15T10:30:00.000Z',
          },
          {
            id: 'booking_9',
            patient: 'patient_8',
            test: 'test_1',
            insurance: 'FASCHIM',
            reservationDate: '2025-05-15T10:30:00.000Z',
          },
        ],
        claims: [
          {
            id: 'claim_1',
            medicalServiceCode: 'medical_service_1',
            bookingDate: '2025-05-15T10:33:00.000Z',
            insurance: 'AON',
            patient: 'patient_1',
          },
          {
            id: 'claim_9',
            medicalServiceCode: 'medical_service_2',
            bookingDate: '2025-05-15T10:31:00.000Z',
            insurance: 'AON',
            patient: 'patient_8',
          },
          {
            id: 'claim_10',
            medicalServiceCode: 'medical_service_2',
            bookingDate: '2025-05-15T00:00:00.000Z',
            insurance: 'FASCHIM',
            patient: 'patient_8',
          },
        ],
      })
      .expect(201);

    expect(response.body).toEqual([
      {
        claim: 'claim_10',
        booking: 'booking_9',
        mismatch: ['time', 'test'],
      },
    ]);
  });
});
