import { callDeepSeek } from './deepseek';
import { ParsedEntry, VoiceParseResult } from '../types/voice';
import { Child, UserCategory } from '../types';
import { CategoryConfig } from '../types';

function buildSystemPrompt(
  children: Child[],
  userCategories: UserCategory[],
  hardcodedCategories: CategoryConfig[]
): string {
  const childNames = children.map((c) => c.name).join(', ');

  const categoryList = userCategories.length > 0
    ? userCategories.map((c) => `- "${c.name}" (type: ${c.category_type}, total: ${c.total_lessons ?? 'unlimited'})`).join('\n')
    : hardcodedCategories.map((c) => `- "${c.name}"`).join('\n');

  return `You are a homeschool lesson log parser. The user will speak or type a quick update about their children's learning activities.

CHILDREN: ${childNames}
CATEGORIES:
${categoryList}

RULES:
1. Extract individual log entries from the text
2. Match child names to the CHILDREN list (case-insensitive, handle nicknames)
3. Match subjects/categories to the CATEGORIES list (fuzzy match OK)
4. Extract lesson numbers when mentioned (e.g., "lesson 58", "page 42", "#58")
5. Extract any additional notes
6. If a child name is ambiguous or missing, use the first child
7. If a category is ambiguous, pick the closest match
8. Set confidence 0.0-1.0 based on how certain you are about each field

RESPONSE FORMAT (JSON only):
{
  "entries": [
    {
      "childName": "exact name from CHILDREN list",
      "categoryName": "exact name from CATEGORIES list",
      "lessonNumber": 58,
      "notes": "any additional context",
      "confidence": 0.95
    }
  ]
}

If the input doesn't contain any loggable activities, return: { "entries": [] }`;
}

export async function parseVoiceNote(
  text: string,
  children: Child[],
  userCategories: UserCategory[],
  hardcodedCategories: CategoryConfig[]
): Promise<VoiceParseResult> {
  if (!text.trim()) {
    return { entries: [], rawText: text, tokensUsed: 0 };
  }

  const systemPrompt = buildSystemPrompt(children, userCategories, hardcodedCategories);
  const result = await callDeepSeek(systemPrompt, text);

  let parsed: { entries: ParsedEntry[] };
  try {
    parsed = JSON.parse(result.content);
  } catch {
    console.error('[VoiceParser] Failed to parse DeepSeek response:', result.content);
    return { entries: [], rawText: text, tokensUsed: result.tokens.total };
  }

  return {
    entries: parsed.entries ?? [],
    rawText: text,
    tokensUsed: result.tokens.total,
  };
}
