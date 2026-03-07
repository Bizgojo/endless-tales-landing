import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  try {
    const { record } = await req.json();
    const email = record?.email;
    if (!email) return new Response("No email", { status: 400 });

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
      },
      body: JSON.stringify({
        from: "Endless Tales <hello@endless-tales.com>",
        to: email,
        subject: "You are in! Endless Tales launches April 17",
        html: `
          <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;background:#0a0a10;color:#ffffff;padding:40px 32px;border-radius:12px;">
            <h1 style="font-size:28px;margin-bottom:8px;color:#ffffff;">You are in. 🎉</h1>
            <p style="font-size:16px;color:#ffffff;line-height:1.6;">Thanks for signing up for <strong>Endless Tales</strong>.</p>
            <p style="font-size:16px;color:#ffffff;line-height:1.6;">We launch on <strong>April 17, 2026</strong>. On that day you will get an email with your <strong>14-day free trial link</strong> — no credit card needed.</p>
            <p style="font-size:16px;color:#ffffff;line-height:1.6;">Because you signed up early, your price is <strong>locked at $7.99/month</strong> for as long as you stay subscribed.</p>
            <div style="background:#1a1a24;border-radius:10px;padding:20px;margin:24px 0;border-left:4px solid #e8520a;">
              <p style="margin:0;font-size:15px;color:#ffffff;">In the meantime, go test out three free stories at <a href="https://endless-tales.com" style="color:#e8520a;">endless-tales.com</a> — no signup required.</p>
            </div>
            <div style="background:#1a1a24;border-radius:10px;padding:20px;margin:24px 0;text-align:center;">
              <p style="font-size:15px;color:#ffffff;margin-bottom:16px;">📬 <strong>One small favor</strong> — hit the button below so our April 17 launch email lands in your inbox and not promotions.</p>
              <a href="mailto:hello@endless-tales.com?subject=I%20am%20ready%20for%20launch%20day%21&body=Sign%20me%20up%20-%20I%20cannot%20wait%20to%20listen%21%20🎧" style="display:inline-block;background:#e8520a;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:8px;font-size:16px;font-weight:700;">🎧 I am ready for launch day!</a>
            </div>
            <p style="font-size:14px;color:rgba(255,255,255,0.6);">No spam. Unsubscribe any time. — The Endless Tales Team</p>
          </div>
        `,
      }),
    });

    const data = await res.json();
    return new Response(JSON.stringify(data), { status: 200 });
  } catch (err) {
    return new Response(String(err), { status: 500 });
  }
});
