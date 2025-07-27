import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Anthropic from "@anthropic-ai/sdk";

// Configurar variáveis de ambiente
dotenv.config();

// Criar cliente do Claude
const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
});

// Função para testar conexão com Claude
async function testarClaude() {
    try {
        console.log("🤖 Testando conexão com Claude...");
        
        const resposta = await anthropic.messages.create({
            model: "claude-3-5-haiku-20241022",
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
            model: "claude-3-5-haiku-20241022",
            max_tokens: 300,
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

// Testar Claude quando servidor iniciar
testarClaude();

app.listen(3001, () => {
    console.log("🚀 Servidor ON na porta 3001!");
    console.log("📡 Rota disponível: POST http://localhost:3001/api/claude");
});
