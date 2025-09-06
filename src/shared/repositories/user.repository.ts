import { CreateMerchant, CreateProducer, User } from "../schemas";
import { AuthenticationService } from "../services/authentication.service";
import { BaseRepository } from "./repository";


export class UserRepository extends BaseRepository<User> {
  protected collectionName = "users";
  private authService: AuthenticationService;

  constructor() {
    super();
    this.authService = new AuthenticationService();
  }

  async createMerchant(merchantData: CreateMerchant): Promise<string> {
    const data = {
      ...merchantData,
      password: await this.authService.hashPassword(merchantData.password),
      uid: this.db.collection(this.collectionName).doc().id,
    };
    return await this.create(data);
  }

  async createProducer(producerData: CreateProducer): Promise<string> {
    const data = {
      ...producerData,
      password: await this.authService.hashPassword(producerData.password),
      uid: this.db.collection(this.collectionName).doc().id,
      reputation: producerData.reputation || {
        average_rating: 0,
        total_reviews: 0,
      },
    };
    return await this.create(data);
  }

  async findByEmail(email: string): Promise<User | null> {
    const snapshot = await this.db
      .collection(this.collectionName)
      .where("email", "==", email)
      .limit(1)
      .get();

    return snapshot.empty ? null : (snapshot.docs[0].data() as User);
  }

  async findByRole(role: "merchant" | "producer"): Promise<User[]> {
    const snapshot = await this.db
      .collection(this.collectionName)
      .where("role", "==", role)
      .get();

    return snapshot.docs.map((doc) => doc.data() as User);
  }

  async findByTaxId(taxId: string) {
    const snapshot = await this.db
      .collection(this.collectionName)
      .where("tax_id", "==", taxId)
      .limit(1)
      .get();

    return snapshot.empty ? null : (snapshot.docs[0].data() as User);
  }

  async findMerchantByLoteId(loteId: string): Promise<User | null> {
    const snapshot = await this.db
      .collection(this.collectionName)
      .where("role", "==", "merchant")
      .where("lote_id", "==", loteId)
      .limit(1)
      .get();

    return snapshot.empty ? null : (snapshot.docs[0].data() as User);
  }
}
