import { CreateLote, Lote, User } from "../schemas";
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
    const data: Omit<Lote, "id" | "created_at"> = {
      ...loteData,
      status: "ativo",
      imageUrl: photoUrl,
      merchantId: merchant.uid,
      location: {
        ...loteData.location,
        geohash: hash,
      },
      merchantName: merchant.name,
      merchantAddressShort: `
      ${merchant.address.street}, 
      ${merchant.address.neighborhood}`,
      descriptionAI: descriptionAI,
    };

    return await this.create(data);
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
    const precision = this.choosePrecision(radiusKm);
    const centerHash = geohash.encode(latitude, longitude, precision);
    const prefixes = [centerHash, ...geohash.neighbors(centerHash)];

    const queries = prefixes.map((prefix) =>
      this.db
        .collection(this.collectionName)
        .where("status", "==", "ativo")
        .orderBy("location.geohash")
        .startAt(prefix)
        .endAt(prefix + "\uf8ff")
        .get()
    );
    const snapshots = await Promise.all(queries);
    const seen = new Set<string>();
    const candidates: Lote[] = [];
    for (const snap of snapshots) {
      for (const doc of snap.docs) {
        if (seen.has(doc.id)) continue;
        seen.add(doc.id);
        candidates.push(doc.data() as Lote);
      }
    }
    return candidates.map((lote) => ({
      lote,
      distance: distanceBetween(
        [latitude, longitude],
        [lote.location.latitude, lote.location.longitude]
      ),
    }))
      .filter((x) => x.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance)
      .map((x) => x.lote);
  }

  private choosePrecision(radiusKm: number): number {
    // p=3 ~156km, 4 ~39km, 5 ~4.9km, 6 ~1.2km, 7 ~0.153km
    if (radiusKm > 78) return 3;
    if (radiusKm > 19) return 4;
    if (radiusKm > 2.5) return 5;
    if (radiusKm > 0.3) return 6;
    return 7;
  }
}
