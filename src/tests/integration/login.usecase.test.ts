import { describe, test, expect, beforeEach, jest } from "@jest/globals";
import { LoginUseCase } from "../../features/usecases/auth/login/login.usecase";
import {
  loginInputMocks,
  userDatabaseMocks,
  testConstants,
} from "../mocks";
  
// Mock UserRepository and AuthenticationService used inside the use case
jest.mock("../../shared/repositories/user.repository", () => {
  return {
    UserRepository: jest.fn().mockImplementation(() => ({
      findByEmail: jest.fn(),
    })),
  };
});

jest.mock("../../shared/services/authentication.service", () => {
  return {
    AuthenticationService: jest.fn().mockImplementation(() => ({
      comparePasswords: jest.fn(),
      sign: jest.fn(),
    })),
  };
});

describe("LoginUseCase - integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should login user with valid credentials and return token + user", async () => {
    const usecase = new LoginUseCase();
    const repoInstance = (usecase as any).userRepository as any;
    const authInstance = (usecase as any).authService as any;

    (repoInstance.findByEmail as any).mockResolvedValueOnce(userDatabaseMocks.merchantUser);
    (authInstance.comparePasswords as any).mockResolvedValueOnce(true);
    (authInstance.sign as any).mockReturnValue(testConstants.defaultTokens.login);

    const result = await usecase.execute(loginInputMocks.validMerchantLogin);

    expect(result.token).toBe(testConstants.defaultTokens.login);
    expect(result.user.email).toBe(loginInputMocks.validMerchantLogin.email);
    expect(result.user.uid).toBe(userDatabaseMocks.merchantUser.uid);
    expect(authInstance.comparePasswords).toHaveBeenCalledWith({
      password: loginInputMocks.validMerchantLogin.password,
      passwordHash: userDatabaseMocks.merchantUser.password,
    });
    expect(authInstance.sign).toHaveBeenCalledWith({
      sub: userDatabaseMocks.merchantUser.uid,
      role: userDatabaseMocks.merchantUser.role,
      email: userDatabaseMocks.merchantUser.email,
      name: userDatabaseMocks.merchantUser.name,
    });
  });

  test("should error when user does not exist", async () => {
    const usecase = new LoginUseCase();
    const repoInstance = (usecase as any).userRepository as any;

    (repoInstance.findByEmail as any).mockResolvedValueOnce(null);

    await expect(usecase.execute(loginInputMocks.invalidCredentials)).rejects.toThrow(/User not found/i);
  });

  test("should error when password is invalid", async () => {
    const usecase = new LoginUseCase();
    const repoInstance = (usecase as any).userRepository as any;
    const authInstance = (usecase as any).authService as any;

    (repoInstance.findByEmail as any).mockResolvedValueOnce(userDatabaseMocks.merchantUser);
    (authInstance.comparePasswords as any).mockResolvedValueOnce(false);

    await expect(usecase.execute(loginInputMocks.validMerchantLogin)).rejects.toThrow(/Invalid password/i);
  });

  test("should login producer user successfully", async () => {
    const usecase = new LoginUseCase();
    const repoInstance = (usecase as any).userRepository as any;
    const authInstance = (usecase as any).authService as any;

    (repoInstance.findByEmail as any).mockResolvedValueOnce(userDatabaseMocks.producerUser);
    (authInstance.comparePasswords as any).mockResolvedValueOnce(true);
    (authInstance.sign as any).mockReturnValue(testConstants.defaultTokens.producer);

    const result = await usecase.execute(loginInputMocks.validProducerLogin);

    expect(result.token).toBe(testConstants.defaultTokens.producer);
    expect(result.user.role).toBe("producer");
    expect(result.user.email).toBe(loginInputMocks.validProducerLogin.email);
  });
});
