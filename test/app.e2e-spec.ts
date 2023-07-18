import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { describe } from 'node:test';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await Promise.all([app.close()]);
  });

  describe('UserModule', () => {
    it('should create a new user and return the created user details', async () => {
      const userCredentials = {
        email: `${(Math.random() + 1).toString(36).substring(2)}@gmail.com`,
        password: 'Password1!',
      };

      const response = await request(app.getHttpServer())
        .post('/user')
        .send(userCredentials)
        .expect(201);

      expect(response.body).toHaveProperty('email', userCredentials.email);
      expect(response.body).toHaveProperty('id');
    });

    it('should return 400 Bad Request if invalid input is provided', async () => {
      const userCredentials = {
        email: 'invalid-email',
        password: 'short',
      };

      await request(app.getHttpServer())
        .post('/user')
        .send(userCredentials)
        .expect(400);
    });

    it('should return 409 Conflict if input email is duplicated', async () => {
      const userCredentials = {
        email: `${(Math.random() + 1).toString(36).substring(2)}@gmail.com`,
        password: 'Password1!',
      };

      let response = await request(app.getHttpServer())
        .post('/user')
        .send(userCredentials)
        .expect(201);

      expect(response.body).toHaveProperty('email', userCredentials.email);
      expect(response.body).toHaveProperty('id');

      response = await request(app.getHttpServer())
        .post('/user')
        .send(userCredentials)
        .expect(409);

      expect(response.body).toHaveProperty('message', 'Email already exists');
    });
  });

  describe('Authentication', () => {
    let jwtToken: string;
    const dbUser = {
      email: `${(Math.random() + 1).toString(36).substring(2)}@gmail.com`,
      password: 'Password1!',
    };

    beforeAll(async () => {
      await request(app.getHttpServer()).post('/user').send(dbUser);
    });

    describe('AuthModule', () => {
      it('authenticates user with valid credentials and return a jwt token', async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/login')
          .send(dbUser);

        jwtToken = response.body.accessToken;
        expect(jwtToken).toMatch(
          /^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/,
        );
      });

      it('fails to authenticate user with an incorrect password', async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/login')
          .send({ email: dbUser.email, password: 'wrong' })
          .expect(401);

        expect(response.body.accessToken).not.toBeDefined();
      });

      it('fails to authenticate user that does not exist', async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/login')
          .send({ email: 'nobody@example.com', password: dbUser.password })
          .expect(401);

        expect(response.body.accessToken).not.toBeDefined();
      });
    });

    describe('Protected', () => {
      it('gets current logged user with jwt authenticated request', async () => {
        const response = await request(app.getHttpServer())
          .get('/auth/me')
          .auth(jwtToken, { type: 'bearer' })
          .expect(200);

        expect(response.body).toHaveProperty('email', dbUser.email);
      });
    });
  });
});
