import { describe, test, expect, beforeEach, jest } from "@jest/globals";
import { RegisterLoteUseCase } from "../../features/usecases/lotes/register-lote.usecase";
import {
  registerLoteMocks,
  loteServiceMocks,
  merchantUserMock,
  producerUserMock,
} from "../mocks";

// Mock all dependencies used by RegisterLoteUseCase
jest.mock("../../shared/repositories/lote.repository", () => {
  return {
    LoteRepository: jest.fn().mockImplementation(() => ({
      createLote: jest.fn(),
      findById: jest.fn(),
    })),
  };
});

jest.mock("../../shared/repositories/user.repository", () => {
  return {
    UserRepository: jest.fn().mockImplementation(() => ({
      findById: jest.fn(),
    })),
  };
});

jest.mock("../../shared/services/gemini-service", () => {
  return {
    GeminiService: jest.fn().mockImplementation(() => ({
      generateLoteDescription: jest.fn(),
    })),
  };
});

jest.mock("../../shared/services/storage-service", () => {
  return {
    StorageService: jest.fn().mockImplementation(() => ({
      uploadImage: jest.fn(),
    })),
  };
});

describe("RegisterLoteUseCase - integration", () => {
  let usecase: RegisterLoteUseCase;
  let loteRepoInstance: any;
  let userRepoInstance: any;
  let geminiServiceInstance: any;
  let storageServiceInstance: any;

  beforeEach(() => {
    jest.clearAllMocks();
    usecase = new RegisterLoteUseCase();

    // Get mocked instances
    loteRepoInstance = (usecase as any).loteRepository;
    userRepoInstance = (usecase as any).userRepository;
    geminiServiceInstance = (usecase as any).geminiService;
    storageServiceInstance = (usecase as any).storageService;
  });

  describe("Successful lote registration", () => {
    test("should register a new lote and return lote data", async () => {
      const input = registerLoteMocks.validCreateLoteInput;

      // Setup successful flow
      userRepoInstance.findById.mockResolvedValueOnce(merchantUserMock);
      geminiServiceInstance.generateLoteDescription.mockResolvedValueOnce(loteServiceMocks.geminiDescription);
      storageServiceInstance.uploadImage.mockResolvedValueOnce(loteServiceMocks.storageUrl);
      loteRepoInstance.createLote.mockResolvedValueOnce(loteServiceMocks.loteId);
      loteRepoInstance.findById.mockResolvedValueOnce(registerLoteMocks.validLoteResponse);

      const result = await usecase.execute(input);

      // Verify the flow
      expect(userRepoInstance.findById).toHaveBeenCalledWith(input.user.uid);
      expect(geminiServiceInstance.generateLoteDescription).toHaveBeenCalledWith(input.photo, input.weight);
      expect(storageServiceInstance.uploadImage).toHaveBeenCalledWith(input.photo);
      expect(loteRepoInstance.createLote).toHaveBeenCalledWith(
        input,
        loteServiceMocks.geminiDescription,
        loteServiceMocks.storageUrl
      );
      expect(loteRepoInstance.findById).toHaveBeenCalledWith(loteServiceMocks.loteId);

      // Verify result
      expect(result).toEqual(registerLoteMocks.validLoteResponse);
      expect(result.status).toBe("ativo");
      expect(result.merchantId).toBe(merchantUserMock.uid);
      expect(result.weight).toBe(input.weight);
    });

    test("should call all services with correct parameters", async () => {
      const input = registerLoteMocks.validCreateLoteInput;

      // Setup mocks
      userRepoInstance.findById.mockResolvedValueOnce(merchantUserMock);
      geminiServiceInstance.generateLoteDescription.mockResolvedValueOnce(loteServiceMocks.geminiDescription);
      storageServiceInstance.uploadImage.mockResolvedValueOnce(loteServiceMocks.storageUrl);
      loteRepoInstance.createLote.mockResolvedValueOnce(loteServiceMocks.loteId);
      loteRepoInstance.findById.mockResolvedValueOnce(registerLoteMocks.validLoteResponse);

      await usecase.execute(input);

      // Verify Gemini service called with correct parameters
      expect(geminiServiceInstance.generateLoteDescription).toHaveBeenCalledWith(
        input.photo,
        input.weight
      );

      // Verify Storage service called with photo buffer
      expect(storageServiceInstance.uploadImage).toHaveBeenCalledWith(input.photo);

      // Verify LoteRepository called with all necessary data
      expect(loteRepoInstance.createLote).toHaveBeenCalledWith(
        input,
        loteServiceMocks.geminiDescription,
        loteServiceMocks.storageUrl
      );
    });
  });

  describe("Validation errors", () => {
    test("should throw error when photo is missing", async () => {
      const input = registerLoteMocks.invalidInputs.missingPhoto;

      await expect(usecase.execute(input as any)).rejects.toThrow(/Photo is required/i);

      // Verify no services were called
      expect(userRepoInstance.findById).not.toHaveBeenCalled();
      expect(geminiServiceInstance.generateLoteDescription).not.toHaveBeenCalled();
      expect(storageServiceInstance.uploadImage).not.toHaveBeenCalled();
      expect(loteRepoInstance.createLote).not.toHaveBeenCalled();
    });

    test("should throw error when weight is missing", async () => {
      const input = registerLoteMocks.invalidInputs.missingWeight;

      await expect(usecase.execute(input as any)).rejects.toThrow(/Weight is required/i);

      // Verify no services were called
      expect(userRepoInstance.findById).not.toHaveBeenCalled();
      expect(geminiServiceInstance.generateLoteDescription).not.toHaveBeenCalled();
      expect(storageServiceInstance.uploadImage).not.toHaveBeenCalled();
      expect(loteRepoInstance.createLote).not.toHaveBeenCalled();
    });

    test("should throw error when limit_date is missing", async () => {
      const input = {
        ...registerLoteMocks.validCreateLoteInput,
        limit_date: undefined,
      };

      await expect(usecase.execute(input as any)).rejects.toThrow(/Limit date is required/i);
    });

    test("should throw error when location is missing", async () => {
      const input = {
        ...registerLoteMocks.validCreateLoteInput,
        location: undefined,
      };

      await expect(usecase.execute(input as any)).rejects.toThrow(/Location is required/i);
    });
  });

  describe("User validation errors", () => {
    test("should throw error when merchant is not found", async () => {
      const input = registerLoteMocks.validCreateLoteInput;

      // Setup merchant not found
      userRepoInstance.findById.mockResolvedValueOnce(null);

      await expect(usecase.execute(input)).rejects.toThrow(/Merchant not found/i);

      expect(userRepoInstance.findById).toHaveBeenCalledWith(input.user.uid);
      expect(geminiServiceInstance.generateLoteDescription).not.toHaveBeenCalled();
      expect(storageServiceInstance.uploadImage).not.toHaveBeenCalled();
      expect(loteRepoInstance.createLote).not.toHaveBeenCalled();
    });

    test("should throw error when user is not a merchant", async () => {
      const input = registerLoteMocks.validCreateLoteInput;

      // Setup user is producer (not merchant)
      userRepoInstance.findById.mockResolvedValueOnce(producerUserMock);

      await expect(usecase.execute(input)).rejects.toThrow(/User is not a merchant/i);

      expect(userRepoInstance.findById).toHaveBeenCalledWith(input.user.uid);
      expect(geminiServiceInstance.generateLoteDescription).not.toHaveBeenCalled();
      expect(storageServiceInstance.uploadImage).not.toHaveBeenCalled();
      expect(loteRepoInstance.createLote).not.toHaveBeenCalled();
    });
  });

  describe("Service errors", () => {
    test("should handle Gemini service error", async () => {
      const input = registerLoteMocks.validCreateLoteInput;

      // Setup successful user validation
      userRepoInstance.findById.mockResolvedValueOnce(merchantUserMock);

      // Setup Gemini service error
      geminiServiceInstance.generateLoteDescription.mockRejectedValueOnce(
        new Error("Gemini API error")
      );

      await expect(usecase.execute(input)).rejects.toThrow(/Gemini API error/i);

      expect(userRepoInstance.findById).toHaveBeenCalled();
      expect(geminiServiceInstance.generateLoteDescription).toHaveBeenCalled();
      expect(storageServiceInstance.uploadImage).not.toHaveBeenCalled();
      expect(loteRepoInstance.createLote).not.toHaveBeenCalled();
    });

    test("should handle Storage service error", async () => {
      const input = registerLoteMocks.validCreateLoteInput;

      // Setup successful user validation and Gemini
      userRepoInstance.findById.mockResolvedValueOnce(merchantUserMock);
      geminiServiceInstance.generateLoteDescription.mockResolvedValueOnce(loteServiceMocks.geminiDescription);

      // Setup Storage service error
      storageServiceInstance.uploadImage.mockRejectedValueOnce(
        new Error("Storage upload error")
      );

      await expect(usecase.execute(input)).rejects.toThrow(/Storage upload error/i);

      expect(userRepoInstance.findById).toHaveBeenCalled();
      expect(geminiServiceInstance.generateLoteDescription).toHaveBeenCalled();
      expect(storageServiceInstance.uploadImage).toHaveBeenCalled();
      expect(loteRepoInstance.createLote).not.toHaveBeenCalled();
    });

    test("should handle LoteRepository error", async () => {
      const input = registerLoteMocks.validCreateLoteInput;

      // Setup successful services
      userRepoInstance.findById.mockResolvedValueOnce(merchantUserMock);
      geminiServiceInstance.generateLoteDescription.mockResolvedValueOnce(loteServiceMocks.geminiDescription);
      storageServiceInstance.uploadImage.mockResolvedValueOnce(loteServiceMocks.storageUrl);

      // Setup repository error
      loteRepoInstance.createLote.mockRejectedValueOnce(
        new Error("Database error")
      );

      await expect(usecase.execute(input)).rejects.toThrow(/Database error/i);

      expect(userRepoInstance.findById).toHaveBeenCalled();
      expect(geminiServiceInstance.generateLoteDescription).toHaveBeenCalled();
      expect(storageServiceInstance.uploadImage).toHaveBeenCalled();
      expect(loteRepoInstance.createLote).toHaveBeenCalled();
      expect(loteRepoInstance.findById).not.toHaveBeenCalled();
    });
  });

  describe("Integration flow validation", () => {
    test("should maintain proper execution order", async () => {
      const input = registerLoteMocks.validCreateLoteInput;
      const callOrder: string[] = [];

      // Setup mocks with call tracking
      userRepoInstance.findById.mockImplementation(() => {
        callOrder.push("userValidation");
        return Promise.resolve(merchantUserMock);
      });

      geminiServiceInstance.generateLoteDescription.mockImplementation(() => {
        callOrder.push("geminiDescription");
        return Promise.resolve(loteServiceMocks.geminiDescription);
      });

      storageServiceInstance.uploadImage.mockImplementation(() => {
        callOrder.push("storageUpload");
        return Promise.resolve(loteServiceMocks.storageUrl);
      });

      loteRepoInstance.createLote.mockImplementation(() => {
        callOrder.push("loteCreation");
        return Promise.resolve(loteServiceMocks.loteId);
      });

      loteRepoInstance.findById.mockImplementation(() => {
        callOrder.push("loteRetrieval");
        return Promise.resolve(registerLoteMocks.validLoteResponse);
      });

      await usecase.execute(input);

      // Verify execution order
      expect(callOrder).toEqual([
        "userValidation",
        "geminiDescription",
        "storageUpload",
        "loteCreation",
        "loteRetrieval",
      ]);
    });

    test("should pass correct data between services", async () => {
      const input = registerLoteMocks.validCreateLoteInput;

      userRepoInstance.findById.mockResolvedValueOnce(merchantUserMock);
      geminiServiceInstance.generateLoteDescription.mockResolvedValueOnce(loteServiceMocks.geminiDescription);
      storageServiceInstance.uploadImage.mockResolvedValueOnce(loteServiceMocks.storageUrl);
      loteRepoInstance.createLote.mockResolvedValueOnce(loteServiceMocks.loteId);
      loteRepoInstance.findById.mockResolvedValueOnce(registerLoteMocks.validLoteResponse);

      await usecase.execute(input);

      // Verify LoteRepository.createLote was called with AI description and storage URL
      expect(loteRepoInstance.createLote).toHaveBeenCalledWith(
        input,
        loteServiceMocks.geminiDescription,
        loteServiceMocks.storageUrl
      );

      // Verify final retrieval uses the created lote ID
      expect(loteRepoInstance.findById).toHaveBeenCalledWith(loteServiceMocks.loteId);
    });
  });
});