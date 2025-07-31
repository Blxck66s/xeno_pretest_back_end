import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Quote } from '../src/quotes/entities/quote.entity';
import { JwtService } from '@nestjs/jwt';
import { App } from 'supertest/types';

describe('Quotes System (e2e)', () => {
  let app: INestApplication<App>;
  let jwtService: JwtService;
  let quotesRepository: {
    find: jest.Mock;
    findOne: jest.Mock;
    findOneBy: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
    createQueryBuilder: jest.Mock;
    manager: {
      findOneOrFail: jest.Mock;
    };
  };

  const user = { id: 'user-1', username: 'testuser' };
  const tokenPayload = { sub: user.id, username: user.username };
  let accessToken: string;

  beforeAll(async () => {
    quotesRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      findOneBy: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      createQueryBuilder: jest.fn(),
      manager: {
        findOneOrFail: jest.fn().mockResolvedValue(user),
      },
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(getRepositoryToken(Quote))
      .useValue(quotesRepository)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

    jwtService = moduleFixture.get<JwtService>(JwtService);
    accessToken = jwtService.sign(tokenPayload);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
    jest.clearAllMocks();
  });

  describe('/quotes/list (GET)', () => {
    it('should return paginated quotes with metadata', async () => {
      const mockQuotes = [
        {
          id: 'q1',
          text: 'hello',
          user: { id: user.id, username: user.username },
          createdAt: new Date(),
          updatedAt: new Date(),
          voteCount: 0,
        },
      ];
      const mockQueryBuilder: any = {
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(1),
        getMany: jest.fn().mockResolvedValue(mockQuotes),
        loadRelationCountAndMap: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([mockQuotes, 1]),
        select: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
      };
      quotesRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      return request(app.getHttpServer())
        .get('/quotes/list?page=1&limit=10')
        .expect(200)
        .expect((res: { body: { data: any; page: number; total: number } }) => {
          expect(res.body.data).toBeDefined();
          expect(res.body.page).toBe(1);
          expect(res.body.total).toBe(1);
        });
    });
  });

  describe('/quotes (POST)', () => {
    it('should create a quote', async () => {
      const dto = { text: 'A wise quote' };
      const mockQuote = {
        id: 'q2',
        text: dto.text,
        user: { id: user.id, username: user.username },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      quotesRepository.create.mockReturnValueOnce(mockQuote);
      quotesRepository.save.mockResolvedValueOnce(mockQuote);

      return request(app.getHttpServer())
        .post('/quotes')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(dto)
        .expect(201)
        .expect((res: { body: { text: string } }) => {
          expect(res.body.text).toBe(dto.text);
        });
    });

    it('should fail validation with empty text', async () => {
      return request(app.getHttpServer())
        .post('/quotes')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ text: '' })
        .expect(400);
    });
  });

  describe('/quotes/:id (PUT)', () => {
    it('should update a quote', async () => {
      const updateDto = { text: 'Updated quote' };
      const updatedQuote = { id: 'q2', text: updateDto.text, userId: user.id };
      quotesRepository.update.mockResolvedValueOnce({ affected: 1 });
      quotesRepository.findOne.mockResolvedValueOnce(updatedQuote);

      return request(app.getHttpServer())
        .put('/quotes/q2')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateDto)
        .expect(200)
        .expect((res: { body: { text: string } }) => {
          expect(res.body.text).toBe(updateDto.text);
        });
    });

    it('should return 400 if quote not found', async () => {
      quotesRepository.update.mockResolvedValueOnce({ affected: 0 });

      return request(app.getHttpServer())
        .put('/quotes/q999')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ text: 'nope' })
        .expect(400);
    });
  });

  describe('/quotes/:id (DELETE)', () => {
    it('should delete a quote', async () => {
      quotesRepository.findOne.mockResolvedValueOnce({
        id: 'q2',
        user: { id: user.id },
      });
      quotesRepository.delete.mockResolvedValueOnce({ affected: 1 });

      return request(app.getHttpServer())
        .delete('/quotes/q2')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(204);
    });

    it('should return 400 if quote not found or not owned', async () => {
      quotesRepository.findOne.mockResolvedValueOnce(null);

      return request(app.getHttpServer())
        .delete('/quotes/q999')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(400);
    });
  });
});
