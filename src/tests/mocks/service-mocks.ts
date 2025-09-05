import { jest } from "@jest/globals";

// Mock implementations for UserRepository
export const mockUserRepository = () => ({
  findByEmail: jest.fn(),
  findByTaxId: jest.fn(),
  createMerchant: jest.fn(),
  createProducer: jest.fn(),
  findByRole: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});

// Mock implementations for AuthenticationService
export const mockAuthenticationService = () => ({
  sign: jest.fn(() => "jwt-token-123"),
  verify: jest.fn(),
  decode: jest.fn(),
  hashPassword: jest.fn(() => Promise.resolve("hashed-password")),
  comparePasswords: jest.fn(() => Promise.resolve(true)),
});

// Jest module mocks
export const repositoryMock = {
  UserRepository: jest.fn().mockImplementation(() => mockUserRepository()),
};

export const authServiceMock = {
  AuthenticationService: jest.fn().mockImplementation(() => mockAuthenticationService()),
};

// Common mock setup functions
export const setupSuccessfulRegistration = (repoInstance: any, authInstance: any) => {
  (repoInstance.findByEmail as any).mockResolvedValueOnce(null); // email not taken
  (repoInstance.findByTaxId as any).mockResolvedValueOnce(null); // tax id not taken (merchant only)
  (repoInstance.createMerchant as any).mockResolvedValueOnce("doc-123");
  (repoInstance.createProducer as any).mockResolvedValueOnce("doc-456");
  (authInstance.sign as any).mockReturnValue("jwt-token-123");
};

export const setupEmailAlreadyExists = (repoInstance: any) => {
  (repoInstance.findByEmail as any).mockResolvedValueOnce({ uid: "existing-uid" });
};

export const setupTaxIdAlreadyExists = (repoInstance: any) => {
  (repoInstance.findByEmail as any).mockResolvedValueOnce(null);
  (repoInstance.findByTaxId as any).mockResolvedValueOnce({ uid: "existing-uid" });
};

export const setupSuccessfulLogin = (repoInstance: any, authInstance: any, user: any) => {
  (repoInstance.findByEmail as any).mockResolvedValueOnce(user);
  (authInstance.comparePasswords as any).mockResolvedValueOnce(true);
  (authInstance.sign as any).mockReturnValue("jwt-login-token");
};

export const setupUserNotFound = (repoInstance: any) => {
  (repoInstance.findByEmail as any).mockResolvedValueOnce(null);
};

export const setupInvalidPassword = (repoInstance: any, authInstance: any, user: any) => {
  (repoInstance.findByEmail as any).mockResolvedValueOnce(user);
  (authInstance.comparePasswords as any).mockResolvedValueOnce(false);
};
