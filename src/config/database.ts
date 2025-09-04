import * as admin from "firebase-admin";

/**
 * Singleton class para gerenciar a conexão com Firestore
 */
export class FirestoreDatabase {
  private static instance: FirestoreDatabase;
  private _db!: admin.firestore.Firestore;
  private _isInitialized = false;

  private constructor() {
    // Construtor privado para singleton
  }

  /**
   * Obtém a instância singleton do FirestoreDatabase
   * @return {FirestoreDatabase} Instância única
   */
  public static getInstance(): FirestoreDatabase {
    if (!FirestoreDatabase.instance) {
      FirestoreDatabase.instance = new FirestoreDatabase();
    }
    return FirestoreDatabase.instance;
  }

  /**
   * Inicializa o Firebase Admin SDK
   * @param {admin.ServiceAccount} serviceAccount - Credenciais (opcional)
   */
  public initialize(serviceAccount?: admin.ServiceAccount): void {
    if (this._isInitialized) {
      console.log("Firebase Admin já foi inicializado");
      return;
    }

    try {
      // Inicializa o Firebase Admin
      if (serviceAccount) {
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
      } else {
        // Para Cloud Functions, as credenciais são automáticas
        admin.initializeApp();
      }

      this._db = admin.firestore();

      // Configurações do Firestore
      this._db.settings({
        timestampsInSnapshots: true,
      });

      this._isInitialized = true;
    } catch (error) {
      throw new Error("Falha na inicialização do Firestore");
    }
  }

  /**
   * Obtém a instância do Firestore
   * @return {admin.firestore.Firestore} Instância do Firestore
   */
  public getDB(): admin.firestore.Firestore {
    if (!this._isInitialized || !this._db) {
      throw new Error(
        "Firestore não foi inicializado. Chame initialize() primeiro."
      );
    }
    return this._db;
  }

  /**
   * Verifica se o Firestore foi inicializado
   * @return {boolean} True se inicializado
   */
  public isInitialized(): boolean {
    return this._isInitialized;
  }

  /**
   * Testa a conexão com Firestore
   * @return {Promise<boolean>} True se conectado
   */
  public async testConnection(): Promise<boolean> {
    try {
      if (!this._isInitialized || !this._db) {
        return false;
      }

      // Tenta fazer uma operação simples
      await this._db.collection("_health_check").limit(1).get();
      return true;
    } catch (error) {
      console.error("Erro ao testar conexão com Firestore:", error);
      return false;
    }
  }

  /**
   * Fecha a conexão (geralmente não necessário em Cloud Functions)
   */
  public async close(): Promise<void> {
    try {
      if (this._db) {
        await this._db.terminate();
        console.log("Conexão com Firestore fechada");
      }
    } catch (error) {
      console.error("Erro ao fechar conexão:", error);
    }
  }
}

// Instância global do singleton
const database = FirestoreDatabase.getInstance();

// Funções de conveniência para facilitar o uso
export const initializeDatabase = (
  serviceAccount?: admin.ServiceAccount
): void => {
  database.initialize(serviceAccount);
};

export const getFirestore = (): admin.firestore.Firestore => {
  return database.getDB();
};

export const getDatabaseInstance = (): FirestoreDatabase => {
  return database;
};

export const testDatabaseConnection = async (): Promise<boolean> => {
  return await database.testConnection();
};

// Exporta também as classes do Firebase para uso direto se necessário
export { admin };
