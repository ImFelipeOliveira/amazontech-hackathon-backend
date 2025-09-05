import { CreateLote, Lote, User } from "../../shared/schemas";

// Mock data for lote registration
export const registerLoteMocks = {
  validCreateLoteInput: {
    user: {
      uid: "uid-merchant-123",
      id: "uid-merchant-123",
      email: "contato@precobom.com",
      password: "hashed-password-merchant",
      name: "João da Silva / Supermercado Preço Bom",
      phone_number: "95991234567",
      role: "merchant" as const,
      created_at: new Date().toISOString(),
      tax_id: "12.345.678/0001-99",
      legal_name: "Supermercado Preço Bom Ltda.",
      address: {
        street: "Av. Capitão Ene Garcez",
        number: "1234",
        neighborhood: "Centro",
        city: "Boa Vista",
        state: "RR",
        zip_code: "69301-160",
      },
      location: {
        latitude: 2.8235,
        longitude: -60.6758,
        geohash: "u1h2k3",
      },
    } as User,
    weight: 15.5,
    limit_date: new Date("2025-12-31T23:59:59.000Z").toISOString(),
    location: {
      latitude: 2.8235,
      longitude: -60.6758,
      geohash: "u1h2k3",
    },
    photo: Buffer.from("fake-image-data", "utf8"),
  } as CreateLote,

  validLoteResponse: {
    id: "lote-123",
    merchantId: "uid-merchant-123",
    status: "ativo" as const,
    weight: 15.5,
    imageUrl: "https://storage.googleapis.com/bucket/images/lotes/lote-123.jpg",
    descriptionAI: "Lote com resíduos orgânicos de boa qualidade, principalmente frutas e legumes frescos. Ideal para compostagem doméstica.",
    limit_date: new Date("2025-12-31T23:59:59.000Z").toISOString(),
    created_at: new Date().toISOString(),
    location: {
      latitude: 2.8235,
      longitude: -60.6758,
      geohash: "u1h2k3",
    },
    merchantName: "João da Silva / Supermercado Preço Bom",
    merchantAddressShort: "Av. Capitão Ene Garcez, Centro",
  } as Lote,

  invalidInputs: {
    missingPhoto: {
      user: {
        uid: "uid-merchant-123",
        role: "merchant" as const,
      } as User,
      weight: 15.5,
      limit_date: new Date("2025-12-31T23:59:59.000Z").toISOString(),
      location: {
        latitude: 2.8235,
        longitude: -60.6758,
        geohash: "u1h2k3",
      },
      // photo: undefined - missing photo
    },

    missingWeight: {
      user: {
        uid: "uid-merchant-123",
        role: "merchant" as const,
      } as User,
      // weight: undefined - missing weight
      limit_date: new Date("2025-12-31T23:59:59.000Z").toISOString(),
      location: {
        latitude: 2.8235,
        longitude: -60.6758,
        geohash: "u1h2k3",
      },
      photo: Buffer.from("fake-image-data", "utf8"),
    },

    invalidUser: {
      user: {
        uid: "uid-producer-456",
        role: "producer" as const,
      } as User,
      weight: 15.5,
      limit_date: new Date("2025-12-31T23:59:59.000Z").toISOString(),
      location: {
        latitude: 2.8235,
        longitude: -60.6758,
        geohash: "u1h2k3",
      },
      photo: Buffer.from("fake-image-data", "utf8"),
    },
  },
};

// Mock responses from services
export const loteServiceMocks = {
  geminiDescription: "Lote com resíduos orgânicos de boa qualidade, principalmente frutas e legumes frescos. Ideal para compostagem doméstica.",
  storageUrl: "https://storage.googleapis.com/bucket/images/lotes/lote-123.jpg",
  loteId: "lote-123",
};

// Mock for merchant user data
export const merchantUserMock = {
  uid: "uid-merchant-123",
  id: "uid-merchant-123",
  email: "contato@precobom.com",
  password: "hashed-password-merchant",
  name: "João da Silva / Supermercado Preço Bom",
  phone_number: "95991234567",
  role: "merchant" as const,
  created_at: new Date().toISOString(),
  tax_id: "12.345.678/0001-99",
  legal_name: "Supermercado Preço Bom Ltda.",
  address: {
    street: "Av. Capitão Ene Garcez",
    number: "1234",
    neighborhood: "Centro",
    city: "Boa Vista",
    state: "RR",
    zip_code: "69301-160",
  },
  location: {
    latitude: 2.8235,
    longitude: -60.6758,
    geohash: "u1h2k3",
  },
} as User;

// Mock for producer user (invalid for lote creation)
export const producerUserMock = {
  uid: "uid-producer-456",
  id: "uid-producer-456",
  email: "produtor@fazenda.com",
  password: "hashed-password-producer",
  name: "Maria Rodrigues",
  phone_number: "11987654321",
  role: "producer" as const,
  created_at: new Date().toISOString(),
  collection_capacity_kg: 250,
  accepted_waste_types: ["frutas", "legumes"],
  reputation: {
    average_rating: 4.5,
    total_reviews: 10,
  },
} as User;
