import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Anthropic from "@anthropic-ai/sdk";
import admin from "firebase-admin";
import { createRequire } from "module";
import { readFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const getServiceAccount = () => {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    }
    const filePath = join(__dirname, "../service-account.json");
    if (existsSync(filePath)) {
        return JSON.parse(readFileSync(filePath, "utf8"));
    }
    throw new Error("Firebase credentials não encontradas");
};

// Configurar variáveis de ambiente
dotenv.config();

// Inicializar Firebase Admin
admin.initializeApp({
    credential: admin.credential.cert(getServiceAccount())
});
const db = admin.firestore();

// ── Constantes e helpers (espelho do habitsService.js) ──────────────────────

const DAILY_HABITS = 'daily_habits';
const WEEKLY_AGGREGATES = 'weekly_aggregates';

const habitMaxValues = {
    meditar: 7,
    medicar: 1,
    exercitar: 7,
    comunicar: 1,
    alimentar: 6,
    estudar: 6,
    descansar: 6
};

const getWeekStart = (dateISO) => {
    const [year, month, day] = dateISO.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    const dayOfWeek = date.getUTCDay();
    const sunday = new Date(Date.UTC(year, month - 1, day - dayOfWeek));
    return sunday.toISOString().split('T')[0];
};

const formatDateDisplay = (dateISO) => {
    const [, month, day] = dateISO.split('-');
    return `${day}/${month}`;
};

const addDays = (dateISO, days) => {
    const [year, month, day] = dateISO.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day + days));
    return date.toISOString().split('T')[0];
};

const getDayName = (dateISO) => {
    const [year, month, day] = dateISO.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[date.getUTCDay()];
};

const calculatePesoBonus = async (currentPesoMedio, weekStartISO) => {
    if (!currentPesoMedio) return 0;
    const previousWeekISO = addDays(weekStartISO, -7);
    const previousWeekDoc = await db.collection(WEEKLY_AGGREGATES).doc(previousWeekISO).get();
    if (!previousWeekDoc.exists) return 0;
    const previousPeso = previousWeekDoc.data().pesoMedio;
    if (!previousPeso) return 0;
    const diferenca = previousPeso - currentPesoMedio;
    if (diferenca >= 0.3) return 5;
    if (diferenca > 0) return 3;
    return 0;
};

const recalculateWeek = async (weekStartISO) => {
    const days = [];
    for (let i = 0; i < 7; i++) {
        const dayISO = addDays(weekStartISO, i);
        const dayDoc = await db.collection(DAILY_HABITS).doc(dayISO).get();
        if (dayDoc.exists) {
            days.push(dayDoc.data());
        } else {
            days.push({ date: dayISO, peso: null, meditar: false, medicar: false, exercitar: false, comunicar: false, alimentar: false, estudar: false, descansar: false });
        }
    }

    if (days.every(d => !d.meditar && !d.exercitar && !d.alimentar && !d.estudar && !d.descansar && !d.medicar && !d.comunicar)) return;

    const daysWithPeso = days.filter(d => d.peso && d.peso > 0);
    const pesoMedio = daysWithPeso.length > 0
        ? Math.round((daysWithPeso.reduce((sum, d) => sum + d.peso, 0) / daysWithPeso.length) * 10) / 10
        : null;

    const habitCounts = {};
    for (const habit of Object.keys(habitMaxValues)) {
        habitCounts[habit] = Math.min(days.filter(d => d[habit]).length, habitMaxValues[habit]);
    }

    const pontosBase = Object.values(habitCounts).reduce((sum, c) => sum + c, 0);
    const bonusPeso = await calculatePesoBonus(pesoMedio, weekStartISO);
    const totalPontos = pontosBase + bonusPeso;
    const completude = Math.round((totalPontos / 40) * 100);

    await db.collection(WEEKLY_AGGREGATES).doc(weekStartISO).set({
        weekStart: weekStartISO,
        weekStartFormatted: formatDateDisplay(weekStartISO),
        weekEnd: addDays(weekStartISO, 6),
        pesoMedio,
        ...habitCounts,
        pontosBase,
        bonusPeso,
        totalPontos,
        completude,
        updatedAt: new Date().toISOString(),
        source: 'openclaw'
    });
};

// Criar cliente do Claude
const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
});

// Função para testar conexão com Claude
async function testarClaude() {
    try {
        console.log("🤖 Testando conexão com Claude...");
        
        const resposta = await anthropic.messages.create({
            model: "claude-opus-4-6",
            max_tokens: 100,
            messages: [
                { role: "user", content: "Olá! Como você está? Responda em português." }
            ]
        });
        
        console.log("✅ Claude respondeu:");
        console.log(resposta.content[0].text);
        
    } catch (error) {
        console.error("❌ Erro ao conectar com Claude:", error.message);
    }
}

const app = express();
app.use(cors({
    origin: true,
}));
app.use(express.json());


// Rota para conversar com Claude via HTTP
app.post('/api/claude', async (req, res) => {
    try {
        // 1. Pegar o prompt do body da requisição
        const { prompt } = req.body;
        
        // 2. Validar se prompt foi enviado
        if (!prompt) {
            return res.status(400).json({
                success: false,
                error: "Prompt é obrigatório"
            });
        }
        
        console.log(`🤖 Recebido prompt: ${prompt}`);
        
        // 3. Enviar para Claude
        const resposta = await anthropic.messages.create({
            model: "claude-opus-4-6",
            max_tokens: 4000,
            messages: [
                { role: "user", content: prompt }
            ]
        });
        
        console.log(`✅ Claude respondeu: ${resposta.content[0].text.substring(0, 50)}...`);
        
        // 4. Retornar resposta em JSON
        res.json({
            success: true,
            prompt: prompt,
            response: resposta.content[0].text
        });
        
    } catch (error) {
        console.error(`❌ Erro na rota Claude: ${error.message}`);
        
        // 5. Tratar erros
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ── Endpoint OpenClaw ────────────────────────────────────────────────────────

app.post('/api/openclaw/habits', async (req, res) => {
    // Autenticação
    const auth = req.headers.authorization;
    if (!auth || auth !== `Bearer ${process.env.OPENCLAW_SECRET}`) {
        return res.status(401).json({ success: false, error: 'Não autorizado' });
    }

    const { date, peso, sentimento, obs, ...habitsRaw } = req.body;

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return res.status(400).json({ success: false, error: 'Campo "date" obrigatório no formato YYYY-MM-DD' });
    }

    const habits = ['meditar', 'medicar', 'exercitar', 'comunicar', 'alimentar', 'estudar', 'descansar'];
    const dailyDoc = {
        date,
        dateFormatted: formatDateDisplay(date),
        weekStart: getWeekStart(date),
        dayOfWeek: getDayName(date),
        peso: peso || null,
        sentimento: sentimento || '',
        obs: obs || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    for (const habit of habits) {
        dailyDoc[habit] = habitsRaw[habit] === true || habitsRaw[habit] === 'true';
    }

    try {
        await db.collection(DAILY_HABITS).doc(date).set(dailyDoc);
        await recalculateWeek(dailyDoc.weekStart);

        console.log(`✅ OpenClaw salvou dia ${date}`);
        res.json({ success: true, data: dailyDoc });
    } catch (error) {
        console.error(`❌ Erro ao salvar via OpenClaw: ${error.message}`);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ── Helper compartilhado: montar e salvar um dia ─────────────────────────────

const HABITS = ['meditar', 'medicar', 'exercitar', 'comunicar', 'alimentar', 'estudar', 'descansar'];

const buildAndSaveDay = async (dayData) => {
    const { date, peso, sentimento, obs, ...habitsRaw } = dayData;
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;

    const existingDoc = await db.collection(DAILY_HABITS).doc(date).get();
    const existing = existingDoc.exists ? existingDoc.data() : {};

    const obsPartes = [existing.obs, obs].filter(Boolean);

    const dailyDoc = {
        date,
        dateFormatted: formatDateDisplay(date),
        weekStart: getWeekStart(date),
        dayOfWeek: getDayName(date),
        peso: peso || existing.peso || null,
        sentimento: sentimento || existing.sentimento || '',
        obs: obsPartes.join(' | '),
        createdAt: existing.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    for (const habit of HABITS) {
        const newVal = habitsRaw[habit] === true || habitsRaw[habit] === 'true';
        dailyDoc[habit] = existing[habit] || newVal;
    }

    await db.collection(DAILY_HABITS).doc(date).set(dailyDoc);
    return dailyDoc;
};

// ── Endpoint: múltiplos dias estruturados ────────────────────────────────────

app.post('/api/openclaw/week', async (req, res) => {
    const auth = req.headers.authorization;
    if (!auth || auth !== `Bearer ${process.env.OPENCLAW_SECRET}`) {
        return res.status(401).json({ success: false, error: 'Não autorizado' });
    }

    if (!Array.isArray(req.body) || req.body.length === 0) {
        return res.status(400).json({ success: false, error: 'Body deve ser um array de dias não-vazio' });
    }

    try {
        const savedDays = [];
        const weekStarts = new Set();

        for (const dayData of req.body) {
            const doc = await buildAndSaveDay(dayData);
            if (doc) {
                savedDays.push(doc);
                weekStarts.add(doc.weekStart);
            }
        }

        if (savedDays.length === 0) {
            return res.status(400).json({ success: false, error: 'Nenhum dia válido encontrado no array' });
        }

        for (const weekStart of weekStarts) {
            await recalculateWeek(weekStart);
        }

        console.log(`✅ OpenClaw/week salvou ${savedDays.length} dias, recalculou ${weekStarts.size} semana(s)`);
        res.json({
            success: true,
            data: {
                saved: savedDays.length,
                skipped: req.body.length - savedDays.length,
                weeksRecalculated: Array.from(weekStarts),
                days: savedDays
            }
        });
    } catch (error) {
        console.error(`❌ Erro OpenClaw/week: ${error.message}`);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ── Endpoint: linguagem natural → Claude → Firestore ─────────────────────────

app.post('/api/openclaw/parse', async (req, res) => {
    const auth = req.headers.authorization;
    if (!auth || auth !== `Bearer ${process.env.OPENCLAW_SECRET}`) {
        return res.status(401).json({ success: false, error: 'Não autorizado' });
    }

    const { text, referenceDate, lastDate } = req.body;
    if (!text) {
        return res.status(400).json({ success: false, error: 'Campo "text" obrigatório' });
    }
    if (!referenceDate || !/^\d{4}-\d{2}-\d{2}$/.test(referenceDate)) {
        return res.status(400).json({ success: false, error: 'Campo "referenceDate" obrigatório no formato YYYY-MM-DD' });
    }

    const defaultDate = (lastDate && /^\d{4}-\d{2}-\d{2}$/.test(lastDate)) ? lastDate : referenceDate;

    const prompt = `Hoje é ${referenceDate}. Extraia dados de hábitos do seguinte texto e retorne um JSON array.

Hábitos disponíveis (todos booleanos):
- meditar: meditação diária
- medicar: tomar medicação
- exercitar: exercício físico
- comunicar: checkpoint de comunicação semanal
- alimentar: alimentação saudável
- estudar: estudo/leitura
- descansar: descanso/sono adequado

Regras:
- Hábito não mencionado = false
- peso em kg (número), null se não mencionado
- sentimento: string curta descrevendo humor, energia ou produtividade (ex: "produtivo", "ansioso", "cansado", "normal", "sonolento") — capture mesmo que mencionado indiretamente (ex: "produtividade boa" → "produtivo", "dia normal" → "normal"), caso contrário ""
- obs: resumo conciso de contexto relevante mencionado, caso contrário ""
- Se nenhuma data específica for mencionada no texto, use ${defaultDate} como data padrão
- Resolva referências de tempo ("semana passada", "ontem", "segunda-feira") usando a data de referência ${referenceDate}
- Se o usuário falar de uma semana inteira sem especificar dias, gere um objeto por dia (de domingo a sábado da semana referenciada)
- Retorne SOMENTE o JSON array, sem explicações, sem markdown

Formato de cada objeto:
{"date":"YYYY-MM-DD","meditar":bool,"medicar":bool,"exercitar":bool,"comunicar":bool,"alimentar":bool,"estudar":bool,"descansar":bool,"peso":number|null,"sentimento":"","obs":""}

Texto: "${text}"`;

    try {
        const resposta = await anthropic.messages.create({
            model: "claude-opus-4-6",
            max_tokens: 2000,
            messages: [{ role: "user", content: prompt }]
        });

        const rawJson = resposta.content[0].text.trim().replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
        let parsed;
        try {
            parsed = JSON.parse(rawJson);
        } catch {
            return res.status(500).json({ success: false, error: 'Claude retornou JSON inválido', raw: rawJson });
        }

        if (!Array.isArray(parsed)) {
            return res.status(500).json({ success: false, error: 'Claude não retornou um array', raw: rawJson });
        }

        const savedDays = [];
        const weekStarts = new Set();

        for (const dayData of parsed) {
            const doc = await buildAndSaveDay(dayData);
            if (doc) {
                savedDays.push(doc);
                weekStarts.add(doc.weekStart);
            }
        }

        for (const weekStart of weekStarts) {
            await recalculateWeek(weekStart);
        }

        console.log(`✅ OpenClaw/parse salvou ${savedDays.length} dias de texto livre`);
        res.json({
            success: true,
            data: {
                parsed,
                saved: savedDays.length,
                skipped: parsed.length - savedDays.length,
                weeksRecalculated: Array.from(weekStarts)
            }
        });
    } catch (error) {
        console.error(`❌ Erro OpenClaw/parse: ${error.message}`);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Testar Claude quando servidor iniciar
testarClaude();

app.listen(3001, () => {
    console.log("🚀 Servidor ON na porta 3001!");
    console.log("📡 Rota disponível: POST http://localhost:3001/api/claude");
    console.log("✅ Deploy automático configurado!");
});
