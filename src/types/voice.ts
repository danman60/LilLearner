export interface ParsedEntry {
  childName: string;
  categoryName: string;
  lessonNumber?: number;
  notes?: string;
  confidence: number; // 0-1, how confident the AI is in this parse
}

export interface VoiceParseResult {
  entries: ParsedEntry[];
  rawText: string;
  tokensUsed: number;
}
