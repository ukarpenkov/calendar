export const LLM_CALENDAR_PROMPT = `================================================================================
  APPLICATION CALENDAR JSON SCHEMA + LLM PROMPT
================================================================================

Copy the prompt below, paste it into any LLM (Gemini, ChatGPT, DeepSeek, etc.),
and get a ready-to-import calendar JSON file for the mobile app.


================================================================================
  JSON SCHEMA (REFERENCE - THE LLM PROMPT INCLUDES IT)
================================================================================

The root object contains 4 required fields:

{
  "year": <number>,          // Year: integer from 1970 to 9999
  "holidays": [<Holiday>],   // Public holiday days
  "weekends": [<string>],    // Non-working days, normally Saturday/Sunday
  "preholidays": [<string>]  // Shortened working days before holidays
}

--- Holiday ---

{
  "date": "YYYY-MM-DD",      // Required. ISO date
  "name_ru": "...",          // Required. Holiday name in Russian
  "name_en": "...",          // Required. Holiday name in English
  "name_tr": "...",          // Optional. Holiday name in Turkish
  "name_id": "...",          // Optional. Holiday name in Indonesian
  "name_ja": "..."           // Optional. Holiday name in Japanese
}

--- weekends ---
Array of strings in "YYYY-MM-DD" format. Each date MUST fall on
Saturday or Sunday (ISO: Saturday=6, Sunday=7), unless it is an official
substitute non-working day moved by the government.

--- preholidays ---
Array of strings in "YYYY-MM-DD" format. These are working days before
holidays where work time is shortened to 7 hours.
Must NOT overlap with holidays or weekends.

--- Day Type Priority ---
holiday > shortened (preholiday) > weekend > workday

--- All Dates ---
All dates must belong to the year specified in the "year" field.
Duplicate dates inside the same array are forbidden.


================================================================================
  READY EXAMPLE (RUSSIA 2026) - FOR REFERENCE
================================================================================

{
  "year": 2026,
  "holidays": [
    { "date": "2026-01-01", "name_ru": "Russian name for New Year's Day", "name_en": "New Year's Day" },
    { "date": "2026-01-07", "name_ru": "Russian name for Orthodox Christmas Day", "name_en": "Orthodox Christmas Day" },
    { "date": "2026-02-23", "name_ru": "Russian name for Defender of the Fatherland Day", "name_en": "Defender of the Fatherland Day" },
    { "date": "2026-03-08", "name_ru": "Russian name for International Women's Day", "name_en": "International Women's Day" },
    { "date": "2026-05-01", "name_ru": "Russian name for Spring and Labor Day", "name_en": "Spring and Labor Day" },
    { "date": "2026-05-09", "name_ru": "Russian name for Victory Day", "name_en": "Victory Day" },
    { "date": "2026-06-12", "name_ru": "Russian name for Russia Day", "name_en": "Russia Day" },
    { "date": "2026-11-04", "name_ru": "Russian name for National Unity Day", "name_en": "National Unity Day" }
  ],
  "weekends": [
    "2026-01-03", "2026-01-04", "2026-01-10", "2026-01-11",
    "2026-01-17", "2026-01-18", "2026-01-24", "2026-01-25",
    "2026-01-31", "2026-02-01", "2026-02-07", "2026-02-08"
  ],
  "preholidays": [
    "2026-04-30",
    "2026-05-08"
  ]
}

(In a real file, weekends must contain ALL Saturdays and Sundays of the year -
about 104 dates.)


================================================================================
  LLM PROMPT - COPY EVERYTHING BELOW THIS LINE
================================================================================

You are a calendar data generator. Your task is to generate a valid calendar
JSON file for import into a mobile application.

=== TASK ===

Generate a calendar for: [COUNTRY] [YEAR]
(Example: "Armenia 2027", "Japan 2027", "Brazil 2028")

=== FORMAT REQUIREMENTS ===

Return ONLY valid JSON, with no explanations, markdown blocks, or comments.
The JSON must strictly match this schema:

{
  "year": <integer from 1970 to 9999>,
  "holidays": [
    {
      "date": "YYYY-MM-DD",
      "name_ru": "Holiday name in Russian",
      "name_en": "Holiday name in English",
      "name_<language_code>": "Holiday name in the country's language (optional)"
    }
  ],
  "weekends": [
    "YYYY-MM-DD",
    "..."
  ],
  "preholidays": [
    "YYYY-MM-DD",
    "..."
  ]
}

=== RULES ===

1. FIELD "year" - the calendar year, as an integer.

2. FIELD "holidays" - official public holidays of the country:
   - Each item is an object with "date", "name_ru", and "name_en" fields.
   - "date" is a YYYY-MM-DD date belonging to the specified year.
   - "name_ru" is the holiday name in Russian (required, non-empty string).
   - "name_en" is the holiday name in English (required, non-empty string).
   - Add an optional "name_<code>" field for the country's local language
     (for example "name_hy" for Armenia, "name_ka" for Georgia,
     "name_de" for Germany, etc.).
   - Dates must not be repeated.
   - Include only OFFICIAL public holidays / non-working holidays, not
     commemorative or professional observance dates.

3. FIELD "weekends" - all Saturdays and Sundays of the year:
   - Array of strings in "YYYY-MM-DD" format.
   - Each date MUST fall on Saturday or Sunday.
   - If an official holiday falls on Saturday/Sunday and the government
     declares a substitute weekday as a non-working day, add that weekday
     to weekends as the substitute.
   - Dates must not be repeated.
   - The array should contain about 104 dates (all Saturdays + all Sundays
     of the year, minus swapped-out dates, plus substitute non-working days).

4. FIELD "preholidays" - shortened working days before holidays:
   - Array of strings in "YYYY-MM-DD" format.
   - These are working weekdays immediately before a holiday where work time
     is shortened by 1 hour under the country's labor rules.
   - Do NOT include dates that are already present in holidays or weekends.
   - If the country has no shortened-day practice, return an empty array [].
   - Dates must not be repeated.

5. ADDITIONAL RULES:
   - All dates must belong to the specified year.
   - Do not duplicate dates inside the same array.
   - Weekend transfers / swap days: if a holiday falls on Sunday, the
     government may declare Monday as a non-working day and Saturday as a
     working day. In this case, add Monday to weekends and remove Saturday
     from weekends.

=== EXAMPLE (FRAGMENT, RUSSIA 2026) ===

{
  "year": 2026,
  "holidays": [
    { "date": "2026-01-01", "name_ru": "Russian name for New Year's Day", "name_en": "New Year's Day" },
    { "date": "2026-01-07", "name_ru": "Russian name for Orthodox Christmas Day", "name_en": "Orthodox Christmas Day" }
  ],
  "weekends": [
    "2026-01-03", "2026-01-04", "2026-01-10", "2026-01-11"
  ],
  "preholidays": [
    "2026-04-30",
    "2026-05-08"
  ]
}

=== IMPORTANT ===

- Return ONLY JSON. No text before or after it.
- Do not use markdown blocks (\`\`\`json ... \`\`\`).
- Do not add comments inside JSON.
- Check that the JSON is syntactically valid (correct braces, commas, quotes).
- Make sure every day of the year is covered exactly once in one of four
  contexts: holiday, weekend, preholiday, or workday.`;
