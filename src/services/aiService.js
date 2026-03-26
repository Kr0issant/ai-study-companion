import axios from 'axios';

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';

/**
 * Core function to send a chat request to the selected AI provider.
 */
export const generateChatResponse = async ({
    messages,
    systemPrompt = "",
    settings,
    model = null,
    temperature = 0.7,
    jsonMode = false
}) => {
    const { aiProvider, openaiApiKey, geminiApiKey } = settings;

    // --- OPENAI HANDLER ---
    if (aiProvider === 'openai') {
        if (!openaiApiKey) throw new Error("OpenAI API key is missing.");

        const formattedMessages = [...messages];
        if (systemPrompt) {
            formattedMessages.unshift({ role: 'system', content: systemPrompt });
        }

        const payload = {
            model: model || 'gpt-5.4-mini',
            messages: formattedMessages,
            temperature,
            response_format: jsonMode ? { type: "json_object" } : { type: "text" }
        };

        const response = await axios.post(OPENAI_URL, payload, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${openaiApiKey}`
            }
        });

        return response.data.choices[0].message.content;
    }

    // --- GEMINI HANDLER ---
    else if (aiProvider === 'gemini') {
        if (!geminiApiKey) throw new Error("Google Gemini API key is missing.");
        
        // Use Gemini 3 Flash as the modern default
        const targetModel = model || 'gemini-3-flash-preview';
        const url = `${GEMINI_BASE_URL}/models/${targetModel}:generateContent?key=${geminiApiKey}`;

        const payload = {
            contents: messages.map(msg => ({
                role: msg.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: msg.content }]
            })),
            generationConfig: {
                temperature,
                responseMimeType: jsonMode ? "application/json" : "text/plain",
            }
        };

        if (systemPrompt) {
            payload.system_instruction = {
                parts: [{ text: systemPrompt }]
            };
        }
        
        try {
            const response = await axios.post(url, payload, {
                headers: { 'Content-Type': 'application/json' }
            });

            const text = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) return text;
            
            throw new Error("Unexpected response structure from Gemini API");

        } catch (error) {
            const serverMessage = error.response?.data?.error?.message;
            if (error.response?.status === 404) {
                 throw new Error(`Model not found (404). Google says: ${serverMessage || 'Unknown 404 issue. Make sure the model string is valid.'}`);
            }
            if (error.response?.status === 429) {
                 throw new Error(`Rate Limit Exceeded (429). Google says: ${serverMessage || 'Wait a moment before trying again.'}`);
            }
            
            throw error; // Rethrow general errors
        }
    }

    throw new Error("Unsupported AI Provider selected.");
};

/**
 * Specialized Prompt: Generate a Quiz
 */
export const generateQuiz = async (contextText, settings, model) => {
    const prompt = `Based on the following context, generate a multiple-choice quiz. Return ONLY a valid JSON object with a single key "questions" containing an array of objects.
Each object must have: 
- "question" (string)
- "options" (array of exactly 4 strings)
- "answer" (string, must exactly match one of the options)
- "hint" (a short helpful string)

Context:
${contextText}`;

    const response = await generateChatResponse({
        messages: [{ role: 'user', content: prompt }],
        settings,
        model,
        temperature: 0.3,
        jsonMode: true
    });

    try {
        const parsed = JSON.parse(response);
        return parsed.questions || parsed;
    } catch (e) {
        throw new Error("Failed to parse Quiz JSON.");
    }
};

export const extractToolCommands = (text) => {
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch) {
        try {
            const parsed = JSON.parse(jsonMatch[1]);
            if (parsed.action && ['create_note', 'update_note', 'generate_quiz'].includes(parsed.action)) {
                return parsed;
            }
        } catch (e) { return null; }
    }
    return null;
};

export const NOTE_INTEGRATION_SYSTEM_PROMPT = `
You are a highly capable academic AI Study Assistant.
You can CREATE or EDIT notes, AND GENERATE QUIZZES. To do so, append this JSON block to your response:

For NEW notes:
\`\`\`json
{
  "action": "create_note",
  "title": "Title",
  "subjectTitle": "Name of Subject (or None)",
  "topicTitle": "Name of Topic (or None)",
  "content": "# Markdown Content"
}
\`\`\`

For UPDATING:
\`\`\`json
{
  "action": "update_note",
  "noteId": "ID",
  "title": "Title",
  "content": "Full content"
}
\`\`\`

For GENERATING A QUIZ (if the user asks to be tested or quizzed):
\`\`\`json
{
  "action": "generate_quiz",
  "questions": [
    {
      "question": "The question text",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "answer": "Exact matching string of correct option",
      "hint": "A short hint"
    }
  ]
}
\`\`\`
`;