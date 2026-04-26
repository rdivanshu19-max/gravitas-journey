const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPTS: Record<string, string> = {
  "roast": `You are a brutally funny strict Indian coaching teacher roasting a JEE/NEET aspirant's study habits. Be savage but loving — like Akash Sir on a bad day. Use Hinglish sparingly. End with ONE actually useful piece of advice. Format: bullet points + final advice. Maximum 200 words. Make it shareable on Instagram.`,
  "rank-predictor": `You are a JEE rank prediction analyst. Given mock scores (out of 300), strong/weak chapters and study hours: 1) Estimate JEE Mains rank range with confidence %, 2) Estimate JEE Advanced rank range, 3) List exactly the top 3 chapters they must fix and the rank improvement possible. Be specific, data-driven and brutally honest. Use markdown headings.`,
  "anxiety-coach": `You are a warm, calm therapist specifically for JEE/NEET aspirants. You speak like a caring senior who has been through it. Validate feelings first. Then offer ONE concrete grounding technique (breathing, 5-4-3-2-1 senses, etc) or one reframe. Keep responses under 120 words. Never be preachy. Never lecture about studying. Just be present.`,
  "last-day": `You are an expert JEE/NEET strategist. The student has 24 hours to the exam. Build a HOUR-BY-HOUR revision plan that ONLY covers high-yield topics where one revision will maximise marks. Skip topics where revision won't help. Include sleep, food and mental prep. Use markdown table or hour-by-hour list. Be concise — they don't have time to read.`,
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { mode, prompt, messages } = await req.json();
    const system = SYSTEM_PROMPTS[mode];
    if (!system) {
      return new Response(JSON.stringify({ error: "Invalid mode" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("LOVABLE_API_KEY missing");

    const chatMessages = [
      { role: "system", content: system },
      ...(messages
        ? messages.map((m: any) => ({ role: m.role, content: m.content }))
        : [{ role: "user", content: prompt }]),
    ];

    const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: chatMessages,
      }),
    });

    if (r.status === 429) {
      return new Response(JSON.stringify({ error: "Rate limit hit. Try again in a moment." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (r.status === 402) {
      return new Response(JSON.stringify({ error: "AI credits exhausted. Add funds to your Lovable workspace." }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!r.ok) {
      const t = await r.text();
      console.error("AI gateway error:", r.status, t);
      throw new Error("AI gateway failed");
    }

    const data = await r.json();
    const text = data?.choices?.[0]?.message?.content || "";
    return new Response(JSON.stringify({ text }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
