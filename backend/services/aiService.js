const axios = require('axios');

// ─── Tavily: fetches latest financial news in real-time ──────
const fetchFinancialContext = async (userQuery) => {
    try {
        const response = await axios.post(
            'https://api.tavily.com/search',
            {
                api_key: process.env.TAVILY_API_KEY,
                query: `${userQuery} Indian financial markets Economic Times`,
                search_depth: 'basic',
                max_results: 6,
                include_answer: true,
            },
            {
                headers: { 'Content-Type': 'application/json' },
                timeout: 15000,
            }
        );

        const data = response.data;
        let context = '';

        if (data.answer) {
            context += `TAVILY ANSWER SUMMARY:\n${data.answer}\n\n`;
        }

        if (data.results && data.results.length > 0) {
            context += 'HEADLINES:\n';
            data.results.forEach((r, i) => {
                context += `${i + 1}. ${r.title}: ${r.content?.substring(0, 150) || ''}\n`;
            });
        }

        // Return both the compact text context AND the raw results for the sources footer
        return {
            context: context || 'No real-time financial context available.',
            sources: (data.results || []).slice(0, 5).map(r => ({ title: r.title, url: r.url })),
        };
    } catch (err) {
        console.warn('⚠️  Tavily search failed:', err.response?.data || err.message);
        return { context: 'Real-time news data temporarily unavailable.', sources: [] };
    }
};

// ─── HuggingFace: OpenAI-compatible chat completions ─────────
const callHuggingFaceLLM = async (systemPrompt, userQuery, chatHistory) => {
    const HF_MODEL = 'Qwen/Qwen2.5-7B-Instruct'; // 7B: ~1-3s vs 72B: ~40-50s

    // Build OpenAI-style messages array
    const messages = [
        { role: 'system', content: systemPrompt },
    ];

    // Add conversation history (last 4 messages for context — keeps it fast)
    if (chatHistory && chatHistory.length > 0) {
        const recent = chatHistory.slice(-4);
        recent.forEach((msg) => {
            messages.push({
                role: msg.isAi ? 'assistant' : 'user',
                content: msg.content.substring(0, 300),
            });
        });
    }

    // Add the current user query
    messages.push({ role: 'user', content: userQuery });

    try {
        const response = await axios.post(
            'https://router.huggingface.co/v1/chat/completions',
            {
                model: HF_MODEL,
                messages,
                max_tokens: 512,   // ← Reduced for faster responses (~40% speedup)
                temperature: 0.6,  // Slightly lower = more focused, less wandering
                top_p: 0.85,
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.HF_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                timeout: 120000, // Allow up to 2 minutes for free tier
            }
        );

        const text = response.data?.choices?.[0]?.message?.content;
        return text ? text.trim() : null;
    } catch (err) {
        const status = err.response?.status;
        const errData = err.response?.data;
        console.error(`HuggingFace API error (${status}):`, JSON.stringify(errData)?.substring(0, 300) || err.message);

        if (status === 503) {
            const wait = errData?.estimated_time || 30;
            return `> ⏳ **The AI model is warming up** (estimated ~${Math.ceil(wait)}s). This happens on HuggingFace's free tier when the model hasn't been used recently. Please try again in a moment.`;
        }
        if (status === 429) {
            return `> ⚠️ **Rate limit reached.** The free HuggingFace tier has been temporarily exhausted. Please wait a minute and try again.`;
        }

        throw err;
    }
};

// ─── Main: Tavily search → HuggingFace LLM → Final answer ──
const generateFinancialAdvice = async (previousMessages, userQuery, userProfile) => {
    // 1. Fetch real-time financial context + sources via Tavily
    console.log('🔍 Tavily: Searching for real-time context...');
    const { context: newsContext, sources } = await fetchFinancialContext(userQuery);
    console.log('✅ Tavily: Context fetched');

    // 2. Build the system prompt (compact — no huge source URLs, 7B handles this better)
    const systemPrompt = `You are "ET AI Concierge", a knowledgeable financial advisor for The Economic Times.

USER PROFILE:
- Life Stage: ${userProfile?.lifeStage || 'Early Career'}
- Risk Appetite: ${userProfile?.riskLabel || 'Moderate'} (${userProfile?.riskScore || 5}/10)

REAL-TIME DATA (Tavily Search):
${newsContext}

INSTRUCTIONS:
- Use the real-time data above to answer the user's question.
- Format your response in clear Markdown: headings, bullet points, bold key terms.
- Provide actionable advice tailored to the user's risk profile.
- Be concise. Do NOT include source URLs — they will be appended automatically.
- End with: "*This is AI-generated advice. Verify with a SEBI-registered advisor.*"`;

    try {
        // 3. Call HuggingFace LLM
        console.log('🤖 HuggingFace: Generating response...');
        const aiResponse = await callHuggingFaceLLM(systemPrompt, userQuery, previousMessages);
        console.log('✅ HuggingFace: Response generated');

        const responseText = aiResponse || `Based on the latest financial data:\n\n${newsContext}`;

        // 4. Always append the Tavily sources footer — guaranteed regardless of model
        const sourcesFooter = sources.length > 0
            ? `\n\n---\n**📰 Sources**\n${sources.map((s, i) => `${i + 1}. [${s.title}](${s.url})`).join('\n')}`
            : '';

        return responseText + sourcesFooter;
    } catch (err) {
        console.error('AI generation error:', err.message);
        const sourcesFooter = sources.length > 0
            ? `\n\n---\n**📰 Sources**\n${sources.map((s, i) => `${i + 1}. [${s.title}](${s.url})`).join('\n')}`
            : '';
        return `> ⚠️ **ET AI Concierge encountered an issue.**\n\n${newsContext}${sourcesFooter}\n\n*AI analysis temporarily unavailable.*`;
    }
};

// ─── Document Analysis: PDF/text → HuggingFace → Portfolio Insight ──
const analyzeDocument = async (fileText, fileName, userProfile) => {
    const systemPrompt = `You are "ET AI Concierge", a financial document analyst for The Economic Times.

USER PROFILE:
- Life Stage: ${userProfile?.lifeStage || 'Early Career'}
- Risk Appetite: ${userProfile?.riskLabel || 'Moderate'} (${userProfile?.riskScore || 5}/10)

INSTRUCTIONS:
- You have been given a parsed financial document below.
- Analyse it and provide: asset allocation breakdown, risk exposure, concentration risks, and 3 actionable recommendations.
- Format your response in clear Markdown with headings and bullet points.
- Be concise. Limit response to key insights only.
- End with: "*This is AI-generated advice. Please verify with a SEBI-registered advisor.*"`;

    const userQuery = `Please analyse this financial document titled "${fileName}":\n\n${fileText.substring(0, 2000)}`;

    try {
        console.log(`📊 Analysing document: ${fileName}`);
        const aiResponse = await callHuggingFaceLLM(systemPrompt, userQuery, []);
        console.log('✅ Document analysis complete');
        return aiResponse || `> Unable to analyse the document at this time. Please try again.`;
    } catch (err) {
        console.error('analyzeDocument error:', err.message);
        return `> ⚠️ **Document analysis failed.** Error: ${err.message}\n\nPlease try uploading again.`;
    }
};

module.exports = { generateFinancialAdvice, analyzeDocument };
