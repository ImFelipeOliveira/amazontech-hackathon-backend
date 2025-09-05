// Export all mocks from a central location
export * from "./register-user-mocks";
export * from "./service-mocks";
export * from "./register-lote-mocks";

// Common test utilities
export const testConstants = {
  defaultTokens: {
    merchant: "jwt-token-merchant-123",
    producer: "jwt-token-producer-456",
    login: "jwt-login-token",
  },

  defaultPasswords: {
    plain: "Segredo1",
    hashed: "hashed-password",
  },

  defaultIds: {
    merchant: "uid-merchant-123",
    producer: "uid-producer-456",
    existing: "existing-uid",
  },
};
