import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Initialize GoogleGenAI server-side with telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// System persona for Baz The Banter Coach
const BANTER_COACH_SYSTEM_INSTRUCTION = `You are 'Baz The Banter Coach', a legendary, quick-witted British and Aussie pub banter expert, seasoned comedy writer, and wingman.
Your mission:
1. Help users turn everyday mishaps into laugh-out-loud stories.
2. Suggest killer comedic punchlines for joke setups or unfinished anecdotes.
3. Provide hilarious, witty comebacks and cheeky responses for forum discussions and social banter.
4. Offer constructive comedic advice (e.g. comic timing, subverting expectations, avoiding cliches).

Tone & Persona:
- Authentic, cheeky, high-energy pub banter (friendly slang like "proper legend", "weapon", "top tier", "rookie mistake", "mate").
- Always structure your advice clearly:
  - Give 3-4 distinct punchlines or response options:
    * Option A: Sharp & Witty (smart timing, clever twist)
    * Option B: Savage Banter (cheeky roast or brutal truth)
    * Option C: Absurd / Catastrophic (over-the-top, slapstick)
    * Option D: Classic Lad Understatement (dry, deadpan)
  - Follow up with a short 1-2 sentence "Baz's Pro Banter Tip".
- Keep it hilarious, punchy, and ready to paste into their post or conversation.`;

// API endpoint for Banter Coach assistance
app.post('/api/banter-coach', async (req, res) => {
  try {
    const { prompt, mode, context, history } = req.body;

    let userPrompt = prompt || '';

    if (mode === 'punchline') {
      userPrompt = `I am writing a joke or story setup and need a killer punchline.
Setup / Context:
"${context || prompt}"

Please provide 3-4 distinct punchlines (Sharp & Witty, Savage Banter, Absurd/Catastrophic, Deadpan Understatement) and your pro banter advice.`;
    } else if (mode === 'witty_response') {
      userPrompt = `Someone wrote this forum post / comment:
"${context || ''}"

I want to reply with a witty, funny, or cheeky comeback. My draft or intent:
"${prompt || 'Give me the best comebacks'}"

Please provide 3-4 hilarious, banter-filled reply options and a quick comedic tip.`;
    } else if (mode === 'story_polish') {
      userPrompt = `Here is my draft confession / pub story:
"${context || prompt}"

How can I punch this up to make it funnier, sharper, and give it a memorable comedic ending? Provide suggested endings and punch-ups.`;
    }

    // Build contents array supporting conversation history if provided
    let contents: any[] = [];
    if (Array.isArray(history) && history.length > 0) {
      for (const h of history) {
        contents.push({
          role: h.role === 'model' ? 'model' : 'user',
          parts: [{ text: h.content }],
        });
      }
      contents.push({
        role: 'user',
        parts: [{ text: userPrompt }],
      });
    } else {
      contents = [
        {
          role: 'user',
          parts: [{ text: userPrompt }],
        },
      ];
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction: BANTER_COACH_SYSTEM_INSTRUCTION,
        temperature: 0.9,
      },
    });

    const replyText = response.text || 'Baz took a sip of his pint and lost his train of thought. Try asking again!';

    res.json({
      success: true,
      reply: replyText,
    });
  } catch (error: any) {
    console.error('Banter Coach API Error:', error);
    res.status(500).json({
      success: false,
      error: error?.message || 'Failed to consult Baz The Banter Coach. Please try again.',
    });
  }
});

// Helper to convert raw PCM base64 into a playable WAV audio buffer
function pcmToWav(pcmBase64: string, sampleRate = 24000, numChannels = 1, bitsPerSample = 16): string {
  const pcmBuffer = Buffer.from(pcmBase64, 'base64');
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);
  const dataSize = pcmBuffer.length;
  const header = Buffer.alloc(44);

  header.write('RIFF', 0);
  header.writeUInt32LE(36 + dataSize, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write('data', 36);
  header.writeUInt32LE(dataSize, 40);

  return Buffer.concat([header, pcmBuffer]).toString('base64');
}

// API endpoint for Experimental Pub Storyteller Text-To-Speech
app.post('/api/story-audio', async (req, res) => {
  try {
    const { title, text, voice = 'baz' } = req.body;

    if (!text) {
      return res.status(400).json({ success: false, error: 'Story text is required.' });
    }

    // Voice mapping for Gemini prebuilt voices
    // 'Fenrir' (deep, dramatic landlord), 'Puck' (young energetic lad), 'Aoede' (expressive, witty)
    let selectedVoiceName = 'Fenrir';
    let voiceStylePrompt = 'You are a veteran British pub landlord reading this wild pub tale to regulars at the bar with dramatic pauses, dry chuckles, and lively comedic timing.';
    
    if (voice === 'callum') {
      selectedVoiceName = 'Puck';
      voiceStylePrompt = 'You are an energetic young lad telling his mates an unbelievable stag do catastrophe with snappy banter, disbelief, and lively laughs.';
    } else if (voice === 'sarah') {
      selectedVoiceName = 'Aoede';
      voiceStylePrompt = 'You are a sharp, sarcastic barmaid recounting this hilarious mishap with dry wit, deadpan timing, and expressive delivery.';
    }

    const narrationScript = `Here is the story titled "${title || 'Pub Confession'}":\n\n${text}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `${voiceStylePrompt}\n\nRead aloud the following story text naturally, with no introductory meta remarks or stage directions:\n\n${narrationScript}`,
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: selectedVoiceName,
            },
          },
        },
      },
    });

    const candidate = response.candidates?.[0];
    const audioPart = candidate?.content?.parts?.find((p: any) => p.inlineData?.data);

    if (audioPart && audioPart.inlineData?.data) {
      const mime = audioPart.inlineData.mimeType || 'audio/pcm;rate=24000';
      let audioBase64 = audioPart.inlineData.data;

      // If PCM, wrap in WAV container for standard browser playback
      if (mime.includes('pcm')) {
        const rateMatch = mime.match(/rate=(\d+)/);
        const sampleRate = rateMatch ? parseInt(rateMatch[1], 10) : 24000;
        audioBase64 = pcmToWav(audioBase64, sampleRate);
      }

      return res.json({
        success: true,
        audioUrl: `data:audio/wav;base64,${audioBase64}`,
        voice: selectedVoiceName,
      });
    }

    // If model returned text or no audio part, notify frontend to use high-fidelity synthesis fallback
    return res.json({
      success: false,
      fallback: true,
      message: 'Gemini audio stream unavailable; switching to client pub synthesis engine.',
    });
  } catch (error: any) {
    console.warn('Gemini Audio TTS Notice (falling back to client synthesizer):', error?.message);
    return res.json({
      success: false,
      fallback: true,
      error: error?.message,
    });
  }
});

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'banter-coach' });
});

// Mount Vite or serve static
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT} (${isDev ? 'development' : 'production'})`);
  });
}

startServer();
