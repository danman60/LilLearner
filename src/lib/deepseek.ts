/**
 * DeepSeek API Client
 * Uses plain fetch - no SDK required.
 * DeepSeek uses OpenAI-compatible API format.
 * Docs: https://api-docs.deepseek.com/api/create-chat-completion
 */

const LOG_PREFIX = '[DeepSeek]';

function log(message: string, data?: unknown) {
  const timestamp = new Date().toISOString();
  if (data !== undefined) {
    console.log(`${LOG_PREFIX} [${timestamp}] ${message}`, data);
  } else {
    console.log(`${LOG_PREFIX} [${timestamp}] ${message}`);
  }
}

function logError(message: string, data?: unknown) {
  const timestamp = new Date().toISOString();
  if (data !== undefined) {
    console.error(`${LOG_PREFIX} [${timestamp}] ${message}`, data);
  } else {
    console.error(`${LOG_PREFIX} [${timestamp}] ${message}`);
  }
}

// TEMPORARY: Hardcoded for initial testing
// TODO: Move to Supabase Edge Function before production
const DEEPSEEK_API_KEY = 'sk-6c421e24b1e644749a81d2666fd7239b';

interface DeepSeekMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface DeepSeekResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: 'stop' | 'length' | 'content_filter' | 'tool_calls';
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface DeepSeekError {
  error: {
    message: string;
    type: string;
    code: string;
  };
}

export interface DeepSeekResult {
  content: string;
  tokens: {
    prompt: number;
    completion: number;
    total: number;
  };
}

export async function callDeepSeek(
  systemPrompt: string,
  userMessage: string
): Promise<DeepSeekResult> {
  log('API call started', {
    systemPromptLength: systemPrompt.length,
    userMessageLength: userMessage.length,
  });

  const messages: DeepSeekMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userMessage },
  ];

  const startTime = Date.now();

  const response = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages,
      response_format: { type: 'json_object' },
      temperature: 0.1,
    }),
  });

  const duration = Date.now() - startTime;
  log('Response received', { status: response.status, duration: `${duration}ms` });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `DeepSeek API error: ${response.status}`;

    try {
      const errorJson: DeepSeekError = JSON.parse(errorText);
      errorMessage = `DeepSeek API error: ${errorJson.error.message}`;
      logError('API error response', errorJson.error);
    } catch {
      errorMessage = `DeepSeek API error: ${response.status} - ${errorText}`;
      logError('API error (non-JSON)', { rawError: errorText.substring(0, 500) });
    }

    throw new Error(errorMessage);
  }

  const data: DeepSeekResponse = await response.json();

  if (!data.choices || data.choices.length === 0) {
    logError('No choices in response', { data });
    throw new Error('DeepSeek returned no choices');
  }

  return {
    content: data.choices[0].message.content,
    tokens: {
      prompt: data.usage.prompt_tokens,
      completion: data.usage.completion_tokens,
      total: data.usage.total_tokens,
    },
  };
}
