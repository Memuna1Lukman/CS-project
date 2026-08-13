import { z } from 'zod';

// AI timetable extraction (design doc: ClassSession suggest -> review ->
// publish workflow). Server-only — sends the uploaded timetable image/PDF to
// Gemini's vision API and asks for strict JSON. Output is never trusted
// blindly: it's Zod-validated here, and every row lands as DRAFT — nothing
// this module returns is shown to students until a rep/admin publishes it.

const GEMINI_MODEL = 'gemini-2.0-flash';
const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const FETCH_TIMEOUT_MS = 20000;

export class GeminiApiError extends Error {}

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'] as const;
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

const extractedSessionSchema = z.object({
  course: z.string().trim().max(60).nullable().optional(),
  dayOfWeek: z.enum(DAYS),
  startTime: z.string().regex(TIME_PATTERN, 'Expected 24h HH:MM'),
  endTime: z.string().regex(TIME_PATTERN, 'Expected 24h HH:MM'),
  room: z.string().trim().max(60).nullable().optional(),
  lecturer: z.string().trim().max(120).nullable().optional(),
});

const extractedTimetableSchema = z.array(extractedSessionSchema).max(50);

export type ExtractedSession = z.infer<typeof extractedSessionSchema>;

function buildPrompt(courseCode: string, courseTitle: string): string {
  return `You are reading a university class timetable from an uploaded image or PDF.

Extract every class session that belongs to the course "${courseCode} — ${courseTitle}". The document may list several courses; only include rows for this one (match on course code or a close title match) — ignore sessions for other courses.

Return a JSON array where each item has exactly these keys:
- "course": the course code/title as printed (string)
- "dayOfWeek": one of MON, TUE, WED, THU, FRI, SAT, SUN
- "startTime": 24-hour "HH:MM"
- "endTime": 24-hour "HH:MM"
- "room": the room/venue as printed, or null if not shown
- "lecturer": the lecturer name as printed, or null if not shown

If you cannot find any sessions for this course, or the image is too unclear to read confidently, return an empty array []. Do not guess times or rooms you can't actually read. Return ONLY the JSON array — no commentary, no markdown formatting.`;
}

function stripJsonFences(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  return (fenced ? fenced[1] : text).trim();
}

/**
 * Sends a timetable file to Gemini's vision API and returns the sessions it
 * found for this course. Returns an empty array (not an error) when Gemini
 * legitimately finds nothing — the caller decides how to message that.
 */
export async function extractTimetableFromFile(
  fileBytes: Uint8Array,
  mimeType: string,
  courseCode: string,
  courseTitle: string
): Promise<ExtractedSession[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new GeminiApiError('AI timetable extraction is not configured.');

  const base64 = Buffer.from(fileBytes).toString('base64');
  const url = `${GEMINI_API_BASE}/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: buildPrompt(courseCode, courseTitle) },
              { inline_data: { mime_type: mimeType, data: base64 } },
            ],
          },
        ],
        generationConfig: { responseMimeType: 'application/json', temperature: 0 },
      }),
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
  } catch {
    throw new GeminiApiError('Could not reach the timetable reader right now.');
  }

  if (!response.ok) {
    if (response.status === 429) throw new GeminiApiError('Timetable reader quota reached — try again later.');
    throw new GeminiApiError(`Timetable reader request failed (${response.status}).`);
  }

  const body = await response.json().catch(() => null);
  const text: unknown = body?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (typeof text !== 'string' || !text.trim()) {
    throw new GeminiApiError("Couldn't read this timetable — try a clearer photo or enter manually.");
  }

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(stripJsonFences(text));
  } catch {
    throw new GeminiApiError("Couldn't read this timetable — try a clearer photo or enter manually.");
  }

  const parsed = extractedTimetableSchema.safeParse(parsedJson);
  if (!parsed.success) {
    throw new GeminiApiError("Couldn't read this timetable — try a clearer photo or enter manually.");
  }

  return parsed.data;
}
