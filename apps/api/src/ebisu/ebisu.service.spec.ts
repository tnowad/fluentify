import { Test, TestingModule } from '@nestjs/testing';
import { EbisuService } from './ebisu.service';

describe('EbisuService', () => {
  let service: EbisuService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EbisuService],
    }).compile();

    service = module.get<EbisuService>(EbisuService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
