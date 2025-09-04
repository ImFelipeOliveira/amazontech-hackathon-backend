import { CreateMerchant, CreateProducer, User } from "../schemas";
import { BaseRepository } from "./repository";

export class UserRepository extends BaseRepository<User> {
  protected collectionName = "users";

  async createMerchant(merchantData: CreateMerchant): Promise<string> {
    const data = {
      ...merchantData,
      uid: this.db.collection(this.collectionName).doc().id,
    };
    return await this.create(data);
  }

  async createProducer(producerData: CreateProducer): Promise<string> {
    const data = {
      ...producerData,
      uid: this.db.collection(this.collectionName).doc().id,
      reputation: producerData.reputation || {
        average_rating: 0,
        total_reviews: 0,
      },
    };
    return this.create(data);
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
}
