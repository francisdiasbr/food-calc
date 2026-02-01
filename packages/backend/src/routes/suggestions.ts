import { Router, Request, Response } from 'express';
import OpenAI from 'openai';
import { performance } from 'perf_hooks';

const router = Router();

let openai: OpenAI;
function getOpenAI() {
  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
}

interface NutrientDeficiency {
  nutrient: string;
  current: number;
  target: number;
  percentage: number;
  unit: string;
}

interface SuggestionsRequest {
  deficiencies: NutrientDeficiency[];
}

router.post('/', async (req: Request<{}, {}, SuggestionsRequest>, res: Response) => {
  const requestStartTime = Date.now();
  const performanceStartTime = performance.now();
  console.log('🔍 [BACKEND] Recebida requisição POST /api/suggestions');
  console.log('📥 [BACKEND] Headers recebidos:', req.headers);
  console.log('📦 [BACKEND] Body recebido:', JSON.stringify(req.body, null, 2));
  
  const { deficiencies } = req.body;
  const validationStartTime = performance.now();

  if (!deficiencies || !Array.isArray(deficiencies) || deficiencies.length === 0) {
    const validationTime = performance.now() - validationStartTime;
    console.error(`❌ [BACKEND] Validação falhou após ${validationTime.toFixed(2)}ms`);
    console.error('❌ [BACKEND] Erro: Deficiencies array is required');
    res.status(400).json({ error: 'Deficiencies array is required' });
    return;
  }

  const validationTime = performance.now() - validationStartTime;
  console.log(`✅ [BACKEND] Validação concluída em ${validationTime.toFixed(2)}ms`);
  console.log(`📊 [BACKEND] Total de deficiências recebidas: ${deficiencies.length}`);

  try {
    const processStartTime = performance.now();
    const deficiencyList = deficiencies
      .map(d => `- ${d.nutrient}: ${d.percentage}% da meta (atual: ${d.current}${d.unit}, meta: ${d.target}${d.unit})`)
      .join('\n');
    const processTime = performance.now() - processStartTime;
    console.log(`⏱️ [BACKEND] Processamento da lista concluído em ${processTime.toFixed(2)}ms`);
    console.log('📝 [BACKEND] Lista formatada para OpenAI:', deficiencyList);

    const openaiStartTime = performance.now();
    console.log('🤖 [BACKEND] Iniciando chamada para OpenAI...');
    console.log('📤 [BACKEND] Model: gpt-4o-mini');
    console.log('📤 [BACKEND] Temperature: 0.5');
    
    const completion = await getOpenAI().chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Você é um nutricionista que sugere alimentos para suprir carências nutricionais.
Dado uma lista de nutrientes deficientes, sugira 2-3 alimentos comuns e acessíveis para cada um.
Priorize alimentos do dia a dia brasileiro.
Inclua porção sugerida e contribuição estimada para a meta diária.

Responda APENAS com JSON válido neste formato:
{
  "suggestions": [
    {
      "nutrient": "Nome do nutriente",
      "currentPercentage": número,
      "foods": [
        {
          "name": "Nome do alimento",
          "portion": "Porção sugerida (ex: 100g, 1 unidade)",
          "contribution": "fornece ~X% da meta"
        }
      ]
    }
  ]
}`,
        },
        {
          role: 'user',
          content: `Sugira alimentos para suprir estas carências nutricionais:\n${deficiencyList}`,
        },
      ],
      temperature: 0.5,
    });

    const openaiTime = performance.now() - openaiStartTime;
    console.log(`⏱️ [BACKEND] Resposta da OpenAI recebida em ${openaiTime.toFixed(2)}ms`);
    console.log('📊 [BACKEND] Tokens usados:', {
      prompt: completion.usage?.prompt_tokens,
      completion: completion.usage?.completion_tokens,
      total: completion.usage?.total_tokens
    });

    const parseStartTime = performance.now();
    const content = completion.choices[0]?.message?.content;
    if (!content) {
      const parseTime = performance.now() - parseStartTime;
      console.error(`❌ [BACKEND] Sem conteúdo na resposta após ${parseTime.toFixed(2)}ms`);
      res.status(500).json({ error: 'No response from AI' });
      return;
    }

    console.log('📥 [BACKEND] Conteúdo bruto recebido da OpenAI:', content.substring(0, 200) + '...');
    
    const data = JSON.parse(content);
    const parseTime = performance.now() - parseStartTime;
    console.log(`⏱️ [BACKEND] Parse JSON concluído em ${parseTime.toFixed(2)}ms`);
    console.log('📥 [BACKEND] Dados parseados:', JSON.stringify(data, null, 2));
    console.log(`📈 [BACKEND] Total de sugestões geradas: ${data.suggestions?.length || 0}`);

    const totalTime = performance.now() - performanceStartTime;
    const totalTimeMs = Date.now() - requestStartTime;
    console.log(`✅ [BACKEND] Resposta enviada em ${totalTime.toFixed(2)}ms (${totalTimeMs}ms)`);
    console.log('📊 [BACKEND] Breakdown de tempos:', {
      validacao: `${validationTime.toFixed(2)}ms`,
      processamento: `${processTime.toFixed(2)}ms`,
      openai: `${openaiTime.toFixed(2)}ms`,
      parse: `${parseTime.toFixed(2)}ms`,
      total: `${totalTime.toFixed(2)}ms`
    });
    
    res.json(data);
  } catch (error) {
    const totalTime = performance.now() - performanceStartTime;
    console.error('❌ [BACKEND] Erro após', `${totalTime.toFixed(2)}ms:`, error);
    console.error('❌ [BACKEND] Stack trace:', error instanceof Error ? error.stack : 'N/A');
    res.status(500).json({ error: 'Failed to get suggestions' });
  }
});

export default router;
