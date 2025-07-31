import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Users } from '../src/users/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { App } from 'supertest/types';

jest.mock('bcrypt', () => ({
  compare: jest.fn((plain, hash) => hash === 'hashed_password'),
  hash: jest.fn().mockResolvedValue('hashed_password'),
}));

describe('Authentication System (e2e)', () => {
  let app: INestApplication<App>;
  let jwtService: JwtService;
  let usersRepository: {
    findOne: jest.Mock;
    findOneBy: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
  };

  beforeAll(async () => {
    usersRepository = {
      findOne: jest.fn(),
      findOneBy: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(getRepositoryToken(Users))
      .useValue(usersRepository)
      .compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

    jwtService = moduleFixture.get<JwtService>(JwtService);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
    jest.clearAllMocks();
  });

  describe('/auth/login (POST)', () => {
    it('should return token when credentials are valid', async () => {
      // Arrange
      const mockUser = {
        id: '1',
        username: 'test',
        password: 'hashed_password',
      };
      usersRepository.findOneBy.mockResolvedValueOnce(mockUser);

      // Act & Assert
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: 'test', password: 'valid_password' })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('access_token');
        });
    });

    it('should return 401 when credentials are invalid', async () => {
      // Arrange
      usersRepository.findOneBy.mockResolvedValueOnce(null);

      // Act & Assert
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: 'nonexistent', password: 'invalid_password' })
        .expect(401)
        .expect((res: { body: { message: string } }) => {
          expect(res.body.message).toContain('Invalid credentials');
        });
    });

    it('should return 400 when validation fails', async () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: 'te', password: '123' })
        .expect(400)
        .expect((res: { body: { message: string[] } }) => {
          expect(res.body.message).toContain(
            'username must be longer than or equal to 4 characters',
          );
          expect(res.body.message).toContain(
            'password must be longer than or equal to 6 characters',
          );
        });
    });
  });

  describe('/auth/register (POST)', () => {
    it('should create a user and return token', async () => {
      // Arrange
      const mockUser = {
        id: '2',
        username: 'newuser',
        password: 'hashed_password',
      };
      usersRepository.findOneBy.mockResolvedValueOnce(null);
      usersRepository.create.mockReturnValueOnce(mockUser);
      usersRepository.save.mockResolvedValueOnce(mockUser);

      // Act & Assert
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({ username: 'newuser', password: 'password123' })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('access_token');
        });
    });

    it('should return 409 when username already exists', async () => {
      // Arrange
      const existingUser = { id: '1', username: 'existing', password: 'hash' };
      usersRepository.findOneBy.mockResolvedValueOnce(existingUser);

      // Act & Assert
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({ username: 'existing', password: 'password123' })
        .expect(409)
        .expect((res: { body: { message: string } }) => {
          expect(res.body.message).toContain('already exists');
        });
    });

    it('should return 400 when validation fails', async () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({ username: 'a', password: '123' })
        .expect(400);
    });
  });

  describe('Authentication middleware', () => {
    it('should allow access to protected routes with valid token', async () => {
      const token = jwtService.sign({ sub: '1', username: 'test' });

      return request(app.getHttpServer())
        .get('/users/profile')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    });

    it('should deny access to protected routes without token', async () => {
      return request(app.getHttpServer()).get('/users/profile').expect(401);
    });

    it('should deny access with invalid token', async () => {
      return request(app.getHttpServer())
        .get('/users/profile')
        .set('Authorization', 'Bearer invalid_token')
        .expect(401);
    });
  });
});
