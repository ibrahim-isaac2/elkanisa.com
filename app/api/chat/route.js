export async function POST(req) {
    const { message } = await req.json();
  
    if (!message || typeof message !== "string") {
      return new Response(JSON.stringify({ message: "اكتب رسالة صحيحة" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
  
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
  
      const response = await fetch(`${url}?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: message }] }] }),
      });
  
      if (!response.ok) {
        throw new Error("مشكلة في الاتصال بالـ API");
      }
  
      const data = await response.json();
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!reply) {
        throw new Error("الرد غير صحيح");
      }
  
      return new Response(JSON.stringify({ reply }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("خطأ:", error);
      return new Response(JSON.stringify({ message: "عذراً، حدث خطأ" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }
  