import { Lote, LoteFilterByProximity } from "../../shared/schemas";

export const validProximityInput: LoteFilterByProximity = {
  latitude: -23.5505,
  longitude: -46.6333,
  radiusKm: 5,
};

export const invalidProximityInputs = {
  invalidLatitude: {
    latitude: 91, // Invalid: outside [-90, 90]
    longitude: -46.6333,
    radiusKm: 5,
  },
  invalidLongitude: {
    latitude: -23.5505,
    longitude: 181, // Invalid: outside [-180, 180]
    radiusKm: 5,
  },
  invalidRadius: {
    latitude: -23.5505,
    longitude: -46.6333,
    radiusKm: -1, // Invalid: negative radius
  },
  exceedsMaxRadius: {
    latitude: -23.5505,
    longitude: -46.6333,
    radiusKm: 150, // Invalid: exceeds 100km limit
  },
};

export const mockLotes: Lote[] = [
  {
    id: "lote1",
    merchantId: "merchant1",
    status: "ativo",
    weight: 10.5,
    imageUrl: "https://example.com/image1.jpg",
    descriptionAI: "Frutas frescas variadas",
    limit_date: "2024-12-31T23:59:59.000Z",
    created_at: "2024-01-01T00:00:00.000Z",
    location: {
      latitude: -23.5505,
      longitude: -46.6333,
      geohash: "6gyf4bf1s",
    },
    merchantName: "Supermercado A",
    merchantAddressShort: "Rua A, 123",
  },
  {
    id: "lote2",
    merchantId: "merchant2",
    status: "ativo",
    weight: 8.2,
    imageUrl: "https://example.com/image2.jpg",
    descriptionAI: "Legumes frescos",
    limit_date: "2024-12-30T20:00:00.000Z",
    created_at: "2024-01-02T00:00:00.000Z",
    location: {
      latitude: -23.5515,
      longitude: -46.6343,
      geohash: "6gyf4bf1u",
    },
    merchantName: "Supermercado B",
    merchantAddressShort: "Av. B, 456",
  },
  {
    id: "lote3",
    merchantId: "merchant3",
    status: "ativo",
    weight: 15.0,
    imageUrl: "https://example.com/image3.jpg",
    descriptionAI: "Folhagens orgânicas",
    limit_date: "2024-12-28T18:00:00.000Z",
    created_at: "2024-01-03T00:00:00.000Z",
    location: {
      latitude: -23.5525,
      longitude: -46.6353,
      geohash: "6gyf4bf1v",
    },
    merchantName: "Supermercado C",
    merchantAddressShort: "Rua C, 789",
  },
];

export const emptyLotesResult: Lote[] = [];

export const loteRepositoryMocks = {
  findByProximitySuccess: jest.fn().mockResolvedValue(mockLotes),
  findByProximityEmpty: jest.fn().mockResolvedValue(emptyLotesResult),
  findByProximityError: jest.fn().mockRejectedValue(new Error("Database connection error")),
};

export const producerUserMock = {
  uid: "producer123",
  email: "producer@test.com",
  password: "test123456",
  name: "Producer Test",
  phone_number: "11999999999",
  role: "producer" as const,
  collection_capacity_kg: 100,
  accepted_waste_types: ["frutas", "legumes", "folhagens"] as const,
  reputation: {
    average_rating: 4.5,
    total_reviews: 10,
  },
  created_at: "2024-01-01T00:00:00.000Z",
  location: {
    latitude: -23.5505,
    longitude: -46.6333,
    geohash: "6gyf4bf1s",
  },
};

export const merchantUserMock = {
  uid: "merchant123",
  email: "merchant@test.com",
  password: "test123456",
  name: "Merchant Test",
  phone_number: "11888888888",
  role: "merchant" as const,
  tax_id: "12.345.678/0001-90",
  legal_name: "Merchant Test Ltda",
  reputation: {
    average_rating: 4.2,
    total_reviews: 15,
  },
  created_at: "2024-01-01T00:00:00.000Z",
  address: {
    street: "Rua Test",
    number: "123",
    neighborhood: "Centro",
    city: "São Paulo",
    state: "SP",
    zip_code: "01234-567",
  },
  location: {
    latitude: -23.5505,
    longitude: -46.6333,
    geohash: "6gyf4bf1s",
  },
};
