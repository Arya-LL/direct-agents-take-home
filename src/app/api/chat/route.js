import { GoogleGenAI } from "@google/genai";

// API key in .env file
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// API route handler
export async function POST(req) {
  try {
    // Extract the message and history from the request body
    const { message, history } = await req.json();

    const contents = [
      ...history.map((msg) => ({
        role: msg.role,
        parts: [{ text: msg.content }],
      })),
      {
        role: "user",
        parts: [{ text: message }],
      },
    ];
    // Define the grounding tool - this allows the model to browse the web
    const groundingTool = {
      googleSearch: {},
    };

    // Storing the groundingTool in a general config field for easy modularity
    const config = {
      tools: [groundingTool],
    };

    const responseStream = await ai.models.generateContentStream({
      model: "gemini-2.0-flash",
      contents: contents,
      systemInstruction: {
        role: "system",
        parts: [
          {
            text: "You are a helpful and friendly restaurant recommendation chatbot. Your goal is to answer user questions about restaurants by searching the web for the latest reviews, pricing, menu details, and opinions. Synthesize the information you find into a clear, helpful, and concise answer. When possible, mention the source of your information (e.g., a specific website or a general consensus from reviews). Whwn asked for opinions or reviews of restaurants, check for Reddit conversations about the restaurants. If those conversations exists, give the user a summary of these revies from Reddit. Make it explicitily clear that you summarized from Reddit when you do so.",
          },
        ],
      },
      config,
    });

    const stream = new ReadableStream({
      async start(controller) {
        // Iterate over the streamed in responses from the model
        for await (const chunk of responseStream) {
          const text = chunk.text;
          if (text) {
            controller.enqueue(new TextEncoder().encode(text));
          }
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response(
      "There was an error communicating with the AI model, please try again later.",
      { status: 500 },
    );
  }
}
