import { getFirestore, admin } from "../config/database";

/**
 * Exemplo de Repository usando o singleton Firestore + Schemas Zod
 */

// Base Repository com métodos comuns
export abstract class BaseRepository<T> {
  protected db: admin.firestore.Firestore;
  protected adm = admin;
  protected abstract collectionName: string;

  constructor() {
    this.db = getFirestore();
  }

  async create(data: Omit<T, "id" | "uid" | "created_at" | "descriptionAI">): Promise<string> {
    const docRef = this.db.collection(this.collectionName).doc();
    const docData = {
      ...data,
      uid: docRef.id,
      created_at: new Date().toISOString(),
    };

    await docRef.set(docData);
    return docRef.id;
  }

  async findById(id: string): Promise<T | null> {
    const doc = await this.db.collection(this.collectionName).doc(id).get();
    return doc.exists ? (doc.data() as T) : null;
  }

  async update(id: string, data: Partial<T>): Promise<void> {
    await this.db.collection(this.collectionName).doc(id).update(data);
  }

  async delete(id: string): Promise<void> {
    await this.db.collection(this.collectionName).doc(id).delete();
  }

  async findAll(limit = 10, offset = 0): Promise<T[]> {
    const snapshot = await this.db
      .collection(this.collectionName)
      .limit(limit)
      .offset(offset)
      .get();

    return snapshot.docs.map((doc) => doc.data() as T);
  }
}
