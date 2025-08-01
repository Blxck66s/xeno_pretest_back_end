import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Quote } from '../src/quotes/entities/quote.entity';
import { JwtService } from '@nestjs/jwt';
import { App } from 'supertest/types';

interface MockQueryBuilder {
  select: jest.Mock;
  leftJoin: jest.Mock;
  loadRelationCountAndMap: jest.Mock;
  andWhere: jest.Mock;
  addSelect: jest.Mock;
  groupBy: jest.Mock;
  orderBy: jest.Mock;
  skip: jest.Mock;
  take: jest.Mock;
  getManyAndCount: jest.Mock;
  getRawAndEntities: jest.Mock;
  having: jest.Mock;
  getCount: jest.Mock;
}

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

      const mockQueryBuilder: MockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        loadRelationCountAndMap: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        having: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getRawAndEntities: jest.fn().mockResolvedValue({
          entities: mockQuotes,
          raw: [{ voteCount: 0 }],
        }),
        getManyAndCount: jest.fn().mockResolvedValue([mockQuotes, 1]),
        getCount: jest.fn().mockResolvedValue(1),
      };

      quotesRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      return request(app.getHttpServer())
        .get(
          '/quotes/list?page=1&limit=10&sortField=createdAt&sortDirection=asc',
        )
        .expect(200)
        .expect(
          (res: {
            body: { data: any; page: number; total: number; limit: number };
          }) => {
            expect(res.body.data).toBeDefined();
            expect(res.body.page).toBe(1);
            expect(res.body.limit).toBe(10);
            expect(res.body.total).toBe(1);
          },
        );
    });

    it('should filter quotes by text', async () => {
      const mockQuotes = [
        {
          id: 'q1',
          text: 'filtered quote',
          user: { id: user.id, username: user.username },
          createdAt: new Date(),
          voteCount: 0,
        },
      ];

      const mockQueryBuilder: MockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        loadRelationCountAndMap: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        having: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([mockQuotes, 1]),
        getRawAndEntities: jest.fn().mockResolvedValue({
          entities: mockQuotes,
          raw: [{ voteCount: 0 }],
        }),
        getCount: jest.fn().mockResolvedValue(1),
      };

      quotesRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      return request(app.getHttpServer())
        .get('/quotes/list?text=filtered&page=1&limit=10')
        .expect(200)
        .expect(() => {
          expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
            'quote.text LIKE :text',
            { text: '%filtered%' },
          );
        });
    });

    it('should filter quotes by vote count', async () => {
      const mockQuotes = [
        {
          id: 'q1',
          text: 'popular quote',
          user: { id: user.id, username: user.username },
          createdAt: new Date(),
          voteCount: 5,
        },
      ];

      const mockQueryBuilder: Partial<MockQueryBuilder> = {
        select: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        having: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getRawAndEntities: jest.fn().mockResolvedValue({
          entities: mockQuotes,
          raw: [{ voteCount: 5 }],
        }),
        getCount: jest.fn().mockResolvedValue(1),
      };

      // Mock for count query
      const mockCountQueryBuilder: Partial<MockQueryBuilder> = {
        leftJoin: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        having: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(1),
      };

      quotesRepository.createQueryBuilder
        .mockReturnValueOnce(mockQueryBuilder)
        .mockReturnValueOnce(mockCountQueryBuilder);

      return request(app.getHttpServer())
        .get('/quotes/list?minVotes=3&maxVotes=10&page=1&limit=10')
        .expect(200)
        .expect(() => {
          expect(mockQueryBuilder.having).toHaveBeenCalledWith(
            'COUNT(vote.id) >= :minVotes',
            { minVotes: 3 },
          );
          expect(mockQueryBuilder.having).toHaveBeenCalledWith(
            'COUNT(vote.id) <= :maxVotes',
            { maxVotes: 10 },
          );
        });
    });

    it('should sort quotes by voteCount', async () => {
      const mockQuotes = [
        {
          id: 'q1',
          text: 'quote with votes',
          user: { id: user.id, username: user.username },
          createdAt: new Date(),
          voteCount: 3,
        },
      ];

      const mockQueryBuilder: Partial<MockQueryBuilder> = {
        select: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getRawAndEntities: jest.fn().mockResolvedValue({
          entities: mockQuotes,
          raw: [{ voteCount: 3 }],
        }),
        getCount: jest.fn().mockResolvedValue(1),
      };

      const mockCountQueryBuilder: Partial<MockQueryBuilder> = {
        leftJoin: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(1),
      };

      quotesRepository.createQueryBuilder
        .mockReturnValueOnce(mockQueryBuilder)
        .mockReturnValueOnce(mockCountQueryBuilder);

      return request(app.getHttpServer())
        .get(
          '/quotes/list?sortField=voteCount&sortDirection=desc&page=1&limit=10',
        )
        .expect(200)
        .expect(() => {
          expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
            'voteCount',
            'DESC',
          );
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

    it('should fail validation with non-string text', async () => {
      return request(app.getHttpServer())
        .post('/quotes')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ text: 123 })
        .expect(400);
    });
  });

  describe('/quotes/:id (PATCH)', () => {
    it('should update a quote', async () => {
      const updateDto = { text: 'Updated quote' };
      const updatedQuote = { id: 'q2', text: updateDto.text, userId: user.id };
      quotesRepository.update.mockResolvedValueOnce({ affected: 1 });
      quotesRepository.findOne.mockResolvedValueOnce(updatedQuote);

      return request(app.getHttpServer())
        .patch('/quotes/q2')
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
        .patch('/quotes/q999')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ text: 'nope' })
        .expect(400);
    });

    it('should fail validation with empty text', async () => {
      return request(app.getHttpServer())
        .patch('/quotes/q2')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ text: '' })
        .expect(400);
    });

    it('should fail validation with non-string text', async () => {
      return request(app.getHttpServer())
        .patch('/quotes/q2')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ text: 123 })
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

    it('should return 400 if quote is owned by different user', async () => {
      quotesRepository.findOne.mockResolvedValueOnce(null);

      return request(app.getHttpServer())
        .delete('/quotes/q2')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(400);
    });
  });

  describe('Authentication', () => {
    it('should require authentication for POST /quotes', async () => {
      return request(app.getHttpServer())
        .post('/quotes')
        .send({ text: 'Test quote' })
        .expect(401);
    });

    it('should require authentication for PATCH /quotes/:id', async () => {
      return request(app.getHttpServer())
        .patch('/quotes/q1')
        .send({ text: 'Updated text' })
        .expect(401);
    });

    it('should require authentication for DELETE /quotes/:id', async () => {
      return request(app.getHttpServer()).delete('/quotes/q1').expect(401);
    });

    it('should allow public access to GET /quotes/list', async () => {
      const mockQueryBuilder: any = {
        select: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        loadRelationCountAndMap: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      };

      quotesRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      return request(app.getHttpServer()).get('/quotes/list').expect(200);
    });
  });
});
