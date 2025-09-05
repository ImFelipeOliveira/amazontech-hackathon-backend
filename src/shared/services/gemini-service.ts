import {
  GenerativeModel,
  GoogleGenerativeAI,
  HarmBlockThreshold,
  HarmCategory,
} from "@google/generative-ai";
import { env } from "../config/env";

export class GeminiService {
  private readonly model: GenerativeModel;

  constructor() {
    const gemini = new GoogleGenerativeAI(env.gemini.apiKey!);
    this.model = gemini.getGenerativeModel({
      model: "gemini-1.5-flash",
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      ],
    });
  }

  /**
   * Gera descrição de lote baseada na análise de imagem
   * @param {Buffer} imageBuffer - Buffer da imagem do lote
   * @param {number} weight - Peso do lote em kg
   * @return {Promise<string>} Descrição gerada pela IA
   */
  async generateLoteDescription(imageBuffer: Buffer, weight: number): Promise<string> {
    try {
      const base64Image = imageBuffer.toString("base64");

      const prompt = `
        Analise esta imagem de resíduos orgânicos e forneça uma descrição detalhada.
        
        Peso informado: ${weight}kg
        
        Por favor, forneça uma descrição que inclua:
        1. Tipos de resíduos identificados (frutas, legumes, folhagens, etc.)
        2. Estado de conservação
        3. Estimativa de qualidade para compostagem
        4. Recomendações de uso
        
        Seja específico e técnico, mas mantenha linguagem acessível.
        Máximo 200 palavras.
      `;

      const result = await this.model.generateContent([
        prompt,
        {
          inlineData: {
            data: base64Image,
            mimeType: "image/jpeg",
          },
        },
      ]);

      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error("Erro ao gerar descrição com Gemini:", error);
      return `Lote de resíduos orgânicos com ${weight}kg. Análise detalhada indisponível no momento.`;
    }
  }

  /**
   * Gera sugestões de melhoria para o processo de compostagem
   * @param {string[]} wasteTypes - Tipos de resíduos identificados
   * @param {number} weight - Peso total do lote
   * @return {Promise<string>} Sugestões de compostagem
   */
  async generateCompostingSuggestions(wasteTypes: string[], weight: number): Promise<string> {
    try {
      const prompt = `
        Com base nos seguintes tipos de resíduos: ${wasteTypes.join(", ")}
        E peso total de ${weight}kg
        
        Forneça sugestões específicas para:
        1. Melhor método de compostagem
        2. Tempo estimado de decomposição
        3. Proporções ideais
        4. Cuidados especiais necessários
        
        Máximo 150 palavras.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error("Erro ao gerar sugestões:", error);
      return "Sugestões de compostagem indisponíveis no momento.";
    }
  }
}
