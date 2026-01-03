import { Test, TestingModule } from '@nestjs/testing';
import { AccountabilityController } from './accountability.controller';

describe('AccountabilityController', () => {
  let controller: AccountabilityController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccountabilityController],
    }).compile();

    controller = module.get<AccountabilityController>(AccountabilityController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
