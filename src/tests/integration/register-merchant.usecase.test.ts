import { describe, test, expect, beforeEach, jest } from "@jest/globals";
import { RegisterMerchantUserUseCase } from "../../features/usecases/auth/register/register-merchant.usecase";
import {
  registerInputMocks,
  userDatabaseMocks,
  testConstants,
} from "../mocks";

// Mock UserRepository and AuthenticationService used inside the use case
jest.mock("../../shared/repositories/user.repository", () => {
  return {
    UserRepository: jest.fn().mockImplementation(() => ({
      findByEmail: jest.fn(),
      findByTaxId: jest.fn(),
      createMerchant: jest.fn(),
    })),
  };
});

jest.mock("../../shared/services/authentication.service", () => {
  return {
    AuthenticationService: jest.fn().mockImplementation(() => ({
      hashPassword: jest.fn(),
      sign: jest.fn(),
    })),
  };
});

describe("RegisterMerchantUserUseCase - integration", () => {
  const baseInput = registerInputMocks.validMerchant;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should register merchant and return token + user", async () => {
    const usecase = new RegisterMerchantUserUseCase();
    const repoInstance = (usecase as any).repository as any;
    const authInstance = (usecase as any).authService as any;

    // Setup successful registration flow
    (repoInstance.findByEmail as any).mockResolvedValueOnce(null); // email not exists
    (repoInstance.findByTaxId as any).mockResolvedValueOnce(null); // tax id not exists
    (repoInstance.createMerchant as any).mockResolvedValueOnce(userDatabaseMocks.merchantUser.uid);
    (authInstance.hashPassword as any).mockResolvedValueOnce("hashed-password");
    (authInstance.sign as any).mockReturnValue(testConstants.defaultTokens.merchant);

    // after create, findByEmail returns the created user
    (repoInstance.findByEmail as any).mockResolvedValueOnce(userDatabaseMocks.merchantUser);

    const result = await usecase.execute(baseInput as any);

    expect(result.token).toBe(testConstants.defaultTokens.merchant);
    expect(result.user.role).toBe("merchant");
    expect(result.user.email).toBe(baseInput.email);
    expect(repoInstance.createMerchant).toHaveBeenCalled();
  });

  test("should error when email already exists", async () => {
    const usecase = new RegisterMerchantUserUseCase();
    const repoInstance = (usecase as any).repository as any;

    // Setup email already exists
    (repoInstance.findByEmail as any).mockResolvedValueOnce(userDatabaseMocks.existingUser);

    await expect(usecase.execute(baseInput as any)).rejects.toThrow(/Email já cadastrado/i);
  });

  test("should error when tax id already exists", async () => {
    const usecase = new RegisterMerchantUserUseCase();
    const repoInstance = (usecase as any).repository as any;

    // Setup tax id already exists (findByEmail returns null for email, but tax id exists)
    (repoInstance.findByEmail as any).mockResolvedValueOnce(null);
    (repoInstance.findByTaxId as any).mockResolvedValueOnce(userDatabaseMocks.existingUser);

    await expect(usecase.execute(baseInput as any)).rejects.toThrow(/Tax ID já cadastrado/i);
  });
});
