import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const { courseContent, courseTitle, numQuestions = 5, difficulty = "medium" } = await req.json();

    if (!courseContent || !courseContent.trim()) {
      return new Response(JSON.stringify({ error: "Le contenu du cours est requis" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const difficultyMap: Record<string, string> = {
      easy: "faciles, testant la compréhension de base",
      medium: "de difficulté moyenne, testant la compréhension et l'application",
      hard: "difficiles, testant l'analyse et la réflexion approfondie",
    };

    const systemPrompt = `Tu es un expert en pédagogie et en création de QCM (questionnaires à choix multiples). 
Tu génères des questions pertinentes, claires et bien formulées à partir du contenu de cours fourni.
Chaque question doit avoir exactement 4 options dont une seule est correcte.
Les questions doivent couvrir les concepts clés du cours.
Réponds UNIQUEMENT via l'appel de fonction fourni.`;

    const userPrompt = `Génère ${numQuestions} questions de QCM ${difficultyMap[difficulty] || difficultyMap.medium} à partir du contenu de cours suivant :

Titre du cours : ${courseTitle || "Sans titre"}

Contenu :
${courseContent.substring(0, 8000)}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_questions",
              description: "Génère des questions QCM structurées",
              parameters: {
                type: "object",
                properties: {
                  questions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        text: { type: "string", description: "Texte de la question" },
                        explanation: { type: "string", description: "Explication de la bonne réponse" },
                        difficulty: { type: "string", enum: ["easy", "medium", "hard"] },
                        points: { type: "number", description: "Points (1-3)" },
                        options: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              text: { type: "string" },
                              isCorrect: { type: "boolean" },
                            },
                            required: ["text", "isCorrect"],
                            additionalProperties: false,
                          },
                        },
                      },
                      required: ["text", "explanation", "difficulty", "points", "options"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["questions"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "generate_questions" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requêtes atteinte, réessayez dans quelques instants." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Crédits IA insuffisants." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("Erreur du service IA");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall?.function?.arguments) {
      throw new Error("Réponse IA invalide");
    }

    const parsed = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify({ questions: parsed.questions }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-quiz error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erreur inconnue" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
