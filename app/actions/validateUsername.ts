'use server';

export async function validateUsernameAction(username: string): Promise<{ is_clean: boolean; reason: string }> {
  try {
    const GROQ_API_KEY = process.env.GROQ_API_KEY;

    if (!GROQ_API_KEY) {
      console.error("GROQ_API_KEY is missing in .env file.");
      // If API key is missing, fail-safe: allow it or deny it. Let's deny it and prompt user.
      return { is_clean: false, reason: "Server configuration error. Moderation fails." };
    }

    const prompt = `You are a highly strict AI content moderator. 
Your task is to analyze the following username: "${username}".
Check if it contains any abusive, profane, offensive, scam-related, or sexually explicit language.
You must accurately detect bad words in:
1. English
2. Hindi (Devanagari)
3. Hinglish (Hindi written in English alphabet)

Respond ONLY with a valid JSON object in the exact following format, without any extra text or markdown:
{
  "is_clean": boolean, // false if it contains bad/sexual words, true if it is safe
  "reason": "short explanation of why it passed or failed (in English)"
}`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq API Error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    const result = JSON.parse(aiResponse);
    return result;
  } catch (error) {
    console.error("Error validating username with AI:", error);
    // On error, let's just let it pass or block? Let's block if we are strict.
    return { is_clean: false, reason: "Unable to verify name. Try another name." };
  }
}
