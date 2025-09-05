import { GetLotesByProximityUseCase } from "../../features/usecases/lotes/get-lotes-proximity.usecase";
import { LoteRepository } from "../../shared/repositories/lote.repository";
import {
  validProximityInput,
  mockLotes,
  emptyLotesResult,
  loteRepositoryMocks,
} from "../mocks/get-lotes-proximity-mocks";

// Mock do repositório
jest.mock("../../shared/repositories/lote.repository");
const MockedLoteRepository = LoteRepository as jest.MockedClass<typeof LoteRepository>;

describe("GetLotesByProximityUseCase - Integration Tests", () => {
  let useCase: GetLotesByProximityUseCase;
  let mockLoteRepository: jest.Mocked<LoteRepository>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockLoteRepository = new MockedLoteRepository() as jest.Mocked<LoteRepository>;
    useCase = new GetLotesByProximityUseCase();
    // Substituir a instância do repositório no usecase
    (useCase as any).loteRepository = mockLoteRepository;
  });

  describe("Successful cases", () => {
    test("should return lotes when found within proximity", async () => {
      // Arrange
      mockLoteRepository.findByProximity = loteRepositoryMocks.findByProximitySuccess;

      // Act
      const result = await useCase.execute(validProximityInput);

      // Assert
      expect(result).toEqual(mockLotes);
      expect(mockLoteRepository.findByProximity).toHaveBeenCalledWith(
        validProximityInput.latitude,
        validProximityInput.longitude,
        validProximityInput.radiusKm
      );
      expect(mockLoteRepository.findByProximity).toHaveBeenCalledTimes(1);
    });

    test("should return empty array when no lotes found within proximity", async () => {
      // Arrange
      mockLoteRepository.findByProximity = loteRepositoryMocks.findByProximityEmpty;

      // Act
      const result = await useCase.execute(validProximityInput);

      // Assert
      expect(result).toEqual(emptyLotesResult);
      expect(result).toHaveLength(0);
      expect(mockLoteRepository.findByProximity).toHaveBeenCalledWith(
        validProximityInput.latitude,
        validProximityInput.longitude,
        validProximityInput.radiusKm
      );
    });

    test("should handle small radius search", async () => {
      // Arrange
      const smallRadiusInput = { ...validProximityInput, radiusKm: 0.5 };
      mockLoteRepository.findByProximity = loteRepositoryMocks.findByProximitySuccess;

      // Act
      const result = await useCase.execute(smallRadiusInput);

      // Assert
      expect(result).toEqual(mockLotes);
      expect(mockLoteRepository.findByProximity).toHaveBeenCalledWith(
        smallRadiusInput.latitude,
        smallRadiusInput.longitude,
        smallRadiusInput.radiusKm
      );
    });

    test("should handle maximum radius search", async () => {
      // Arrange
      const maxRadiusInput = { ...validProximityInput, radiusKm: 100 };
      mockLoteRepository.findByProximity = loteRepositoryMocks.findByProximitySuccess;

      // Act
      const result = await useCase.execute(maxRadiusInput);

      // Assert
      expect(result).toEqual(mockLotes);
      expect(mockLoteRepository.findByProximity).toHaveBeenCalledWith(
        maxRadiusInput.latitude,
        maxRadiusInput.longitude,
        maxRadiusInput.radiusKm
      );
    });

    test("should handle different geographic locations", async () => {
      // Arrange - Rio de Janeiro coordinates
      const rioCoordinates = {
        latitude: -22.9068,
        longitude: -43.1729,
        radiusKm: 10,
      };
      mockLoteRepository.findByProximity = loteRepositoryMocks.findByProximitySuccess;

      // Act
      const result = await useCase.execute(rioCoordinates);

      // Assert
      expect(result).toEqual(mockLotes);
      expect(mockLoteRepository.findByProximity).toHaveBeenCalledWith(
        rioCoordinates.latitude,
        rioCoordinates.longitude,
        rioCoordinates.radiusKm
      );
    });
  });

  describe("Error handling", () => {
    test("should propagate repository errors", async () => {
      // Arrange
      mockLoteRepository.findByProximity = loteRepositoryMocks.findByProximityError;

      // Act & Assert
      await expect(useCase.execute(validProximityInput)).rejects.toThrow(
        "Database connection error"
      );
      expect(mockLoteRepository.findByProximity).toHaveBeenCalledWith(
        validProximityInput.latitude,
        validProximityInput.longitude,
        validProximityInput.radiusKm
      );
    });

    test("should handle unexpected repository errors", async () => {
      // Arrange
      const unexpectedError = new Error("Unexpected database error");
      mockLoteRepository.findByProximity = jest.fn().mockRejectedValue(unexpectedError);

      // Act & Assert
      await expect(useCase.execute(validProximityInput)).rejects.toThrow(
        "Unexpected database error"
      );
    });
  });

  describe("Input validation flow", () => {
    test("should accept valid input parameters", async () => {
      // Arrange
      mockLoteRepository.findByProximity = loteRepositoryMocks.findByProximitySuccess;

      // Act
      const result = await useCase.execute(validProximityInput);

      // Assert
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    test("should handle edge case coordinates", async () => {
      // Arrange - Edge coordinates (North Pole)
      const edgeCoordinates = {
        latitude: 90,
        longitude: 0,
        radiusKm: 50,
      };
      mockLoteRepository.findByProximity = loteRepositoryMocks.findByProximityEmpty;

      // Act
      const result = await useCase.execute(edgeCoordinates);

      // Assert
      expect(result).toEqual(emptyLotesResult);
      expect(mockLoteRepository.findByProximity).toHaveBeenCalledWith(
        edgeCoordinates.latitude,
        edgeCoordinates.longitude,
        edgeCoordinates.radiusKm
      );
    });

    test("should handle another edge case coordinates", async () => {
      // Arrange - Edge coordinates (South Pole)
      const edgeCoordinates = {
        latitude: -90,
        longitude: 180,
        radiusKm: 25,
      };
      mockLoteRepository.findByProximity = loteRepositoryMocks.findByProximityEmpty;

      // Act
      const result = await useCase.execute(edgeCoordinates);

      // Assert
      expect(result).toEqual(emptyLotesResult);
      expect(mockLoteRepository.findByProximity).toHaveBeenCalledWith(
        edgeCoordinates.latitude,
        edgeCoordinates.longitude,
        edgeCoordinates.radiusKm
      );
    });
  });

  describe("Performance and data consistency", () => {
    test("should return results in consistent format", async () => {
      // Arrange
      mockLoteRepository.findByProximity = loteRepositoryMocks.findByProximitySuccess;

      // Act
      const result = await useCase.execute(validProximityInput);

      // Assert
      expect(Array.isArray(result)).toBe(true);
      result.forEach((lote) => {
        expect(lote).toHaveProperty("id");
        expect(lote).toHaveProperty("merchantId");
        expect(lote).toHaveProperty("status");
        expect(lote).toHaveProperty("weight");
        expect(lote).toHaveProperty("location");
        expect(lote.location).toHaveProperty("latitude");
        expect(lote.location).toHaveProperty("longitude");
        expect(lote.location).toHaveProperty("geohash");
      });
    });

    test("should handle multiple consecutive calls", async () => {
      // Arrange
      mockLoteRepository.findByProximity = loteRepositoryMocks.findByProximitySuccess;

      // Act
      const result1 = await useCase.execute(validProximityInput);
      const result2 = await useCase.execute(validProximityInput);
      const result3 = await useCase.execute(validProximityInput);

      // Assert
      expect(result1).toEqual(mockLotes);
      expect(result2).toEqual(mockLotes);
      expect(result3).toEqual(mockLotes);
      expect(mockLoteRepository.findByProximity).toHaveBeenCalledTimes(3);
    });
  });
});
