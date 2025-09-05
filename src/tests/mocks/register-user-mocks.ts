// Input mocks for registration
export const registerInputMocks = {
  validMerchant: {
    email: "contato@precobom.com",
    password: "Segredo1",
    name: "João da Silva / Supermercado Preço Bom",
    phone_number: "95991234567",
    role: "merchant" as const,
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
  },

  validProducer: {
    email: "produtor@fazenda.com",
    password: "Segredo1",
    name: "Maria Rodrigues",
    phone_number: "11987654321",
    role: "producer" as const,
    collection_capacity_kg: 250,
    accepted_waste_types: ["frutas", "legumes"] as const,
    reputation: {
      average_rating: 0,
      total_reviews: 0,
    },
  },

  producerWithoutReputation: {
    email: "produtor2@fazenda.com",
    password: "Segredo2",
    name: "Carlos Silva",
    phone_number: "11987654322",
    role: "producer" as const,
    collection_capacity_kg: 150,
    accepted_waste_types: ["folhagens", "outros"] as const,
  },
};

// Database user mocks (what's returned from repository)
export const userDatabaseMocks = {
  merchantUser: {
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
  },

  producerUser: {
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
  },

  existingUser: {
    uid: "existing-user-uid",
    email: "existing@email.com",
  },
};

// Login input mocks
export const loginInputMocks = {
  validMerchantLogin: {
    email: "contato@precobom.com",
    password: "Segredo1",
  },

  validProducerLogin: {
    email: "produtor@fazenda.com",
    password: "Segredo1",
  },

  invalidCredentials: {
    email: "nonexistent@email.com",
    password: "wrongpassword",
  },
};

// Legacy compatibility
export const registerUserMocks = {
  validMerchandt: registerInputMocks.validMerchant, // Keep old typo for compatibility
};
