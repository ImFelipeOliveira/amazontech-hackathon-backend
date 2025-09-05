import { Agendamento, ConfirmAgendamento, CreateAgendamento } from "../schemas";
import { LoteRepository } from "./lote.repository";
import { BaseRepository } from "./repository";
import { UserRepository } from "./user.repository";

export class AgendamentoRepository extends BaseRepository<Agendamento> {
  protected collectionName = "agendamentos";

  async createAgendamento(agendamentoData: CreateAgendamento): Promise<string> {
    const [userRepo, loteRepo] = [new UserRepository(), new LoteRepository()];
    const [producer, lote] = await Promise.all([
      userRepo.findById(agendamentoData.producerId),
      loteRepo.findById(agendamentoData.loteId),
    ]);

    if (!producer || producer.role !== "producer") {
      throw new Error("Producer não encontrado");
    }
    if (!lote) {
      throw new Error("Lote não encontrado");
    }

    const data = {
      ...agendamentoData,
      status: "aguardando_confirmacao" as const,
      collectionData: null,
      producerName: producer.name,
      loteImageUrl: lote.image_url,
      merchantName: lote.merchantName,
    };

    return await this.create(data);
  }

  async findByProducer(producerId: string): Promise<Agendamento[]> {
    const snapshot = await this.db
      .collection(this.collectionName)
      .where("producerId", "==", producerId)
      .orderBy("created_at", "desc")
      .get();

    return snapshot.docs.map((doc) => doc.data() as Agendamento);
  }

  async findByMerchant(merchantId: string): Promise<Agendamento[]> {
    const snapshot = await this.db
      .collection(this.collectionName)
      .where("merchantId", "==", merchantId)
      .orderBy("created_at", "desc")
      .get();

    return snapshot.docs.map((doc) => doc.data() as Agendamento);
  }

  async findByLote(loteId: string): Promise<Agendamento[]> {
    const snapshot = await this.db
      .collection(this.collectionName)
      .where("loteId", "==", loteId)
      .get();

    return snapshot.docs.map((doc) => doc.data() as Agendamento);
  }

  async confirmarAgendamento(
    agendamentoId: string,
    collectionData: ConfirmAgendamento
  ): Promise<void> {
    await this.update(agendamentoId, {
      status: "confirmado",
      ...collectionData,
    });
  }

  async rejeitarAgendamento(agendamentoId: string): Promise<void> {
    await this.update(agendamentoId, {
      status: "rejeitado",
    });
  }

  async finalizarAgendamento(agendamentoId: string): Promise<void> {
    await this.update(agendamentoId, {
      status: "finalizado",
    });
  }
}
