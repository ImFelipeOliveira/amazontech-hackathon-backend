import { CreateLote, Lote } from "../schemas";
import { BaseRepository } from "./repository";
import { UserRepository } from "./user.repository";
import * as geohash from "ngeohash";
import { distanceBetween } from "geofire-common";
export class LoteRepository extends BaseRepository<Lote> {
  protected collectionName = "lotes";

  async createLote(loteData: CreateLote, descriptionAI: string, photoUrl: string): Promise<string> {
    const userRepo = new UserRepository();
    const merchant = await userRepo.findById(loteData.user.uid);
    if (!merchant || merchant.role !== "merchant") throw new Error("Merchant not found");
    const precision = 7;
    const hash = geohash.encode(loteData.location.latitude, loteData.location.longitude, precision);

    const docRef = this.db.collection(this.collectionName).doc();
    const data = {
      ...loteData,
      id: docRef.id, // Add id field as expected by schema
      status: "ativo",
      imageUrl: photoUrl,
      merchantId: merchant.uid,
      location: {
        ...loteData.location,
        geohash: hash,
      },
      merchantName: merchant.name,
      merchantAddressShort: `${merchant.address.street}, ${merchant.address.neighborhood}, ${merchant.address.number}`,
      descriptionAI: descriptionAI,
      created_at: new Date().toISOString(),
    };

    await docRef.set(data);
    return docRef.id;
  }

  async findByMerchant(merchantId: string): Promise<Lote[]> {
    const snapshot = await this.db
      .collection(this.collectionName)
      .where("merchantId", "==", merchantId)
      .orderBy("created_at", "desc")
      .get();

    return snapshot.docs.map((doc) => doc.data() as Lote);
  }

  async findAtivos(): Promise<Lote[]> {
    const snapshot = await this.db
      .collection(this.collectionName)
      .where("status", "==", "ativo")
      .orderBy("created_at", "desc")
      .get();

    return snapshot.docs.map((doc) => doc.data() as Lote);
  }

  async findByProximity(
    latitude: number,
    longitude: number,
    radiusKm: number
  ): Promise<Lote[]> {
    const snapshot = await this.db
      .collection(this.collectionName)
      .where("status", "==", "ativo")
      .get();

    const lotes = snapshot.docs.map((doc) => doc.data() as Lote);

    const filteredLotes = lotes.map((lote) => ({
      lote,
      distance: distanceBetween(
        [latitude, longitude],
        [lote.location.latitude, lote.location.longitude]),
    }))
      .filter((x) => x.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance)
      .map((x) => x.lote);
    return filteredLotes;
  }
}
