import type { Ai } from '@cloudflare/workers-types';

interface WorkersAiResponse {
    response?: string;
}

async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3, baseDelay = 1000): Promise<T> {
    let lastError: Error | undefined;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (e) {
            lastError = e as Error;
            if (attempt < maxRetries) {
                const delay = baseDelay * 2 ** attempt;
                await new Promise(r => setTimeout(r, delay));
            }
        }
    }
    throw lastError;
}

export async function summarizedByWorkerAI(ai: Ai, model: string, prompt: string): Promise<string> {
    return withRetry(async () => {
        const result = await ai.run(model as any, {
            messages: [
                {
                    role: 'system',
                    content: 'You are a professional email summarization assistant.',
                },
                {
                    role: 'user',
                    content: prompt,
                },
            ],
        }) as WorkersAiResponse | string;

        if (typeof result === 'string') {
            return result;
        }

        return result?.response ?? '';
    });
}

export async function summarizedByOpenAI(key: string, endpoint: string, model: string, prompt: string): Promise<string> {
    if (!key || !endpoint || !model) {
        return 'Sorry, the OpenAI API is not configured properly.';
    }
    return withRetry(async () => {
        const resp = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${key}`,
            },
            body: JSON.stringify({
                model,
                messages: [
                    {
                        role: 'system',
                        content: 'You are a professional email summarization assistant.',
                    },
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
            }),
        });
        if (!resp.ok) {
            throw new Error(`OpenAI API request failed: ${resp.status}`);
        }
        const body = await resp.json() as any;
        return body?.choices?.[0]?.message?.content || '';
    });
}
