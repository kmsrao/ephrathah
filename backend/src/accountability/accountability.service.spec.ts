import { Test, TestingModule } from '@nestjs/testing';
import { AccountabilityService } from './accountability.service';

describe('AccountabilityService', () => {
  let service: AccountabilityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AccountabilityService],
    }).compile();

    service = module.get<AccountabilityService>(AccountabilityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
