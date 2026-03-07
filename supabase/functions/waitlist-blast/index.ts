import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    const sb = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: subscribers, error } = await sb
      .from("waitlist")
      .select("id, email")
      .eq("notified", false);

    if (error) throw error;
    if (!subscribers?.length) {
      return new Response(JSON.stringify({ sent: 0, message: "No unnotified subscribers" }), { status: 200 });
    }

    let sent = 0;
    for (const sub of subscribers) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
        },
        body: JSON.stringify({
          from: "Endless Tales <hello@endless-tales.com>",
          to: sub.email,
          subject: "Endless Tales is live — start your 14-day free trial now",
          html: `
            <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;background:#0a0a10;color:#ffffff;padding:40px 32px;border-radius:12px;">
              <h1 style="font-size:28px;margin-bottom:8px;color:#ffffff;">We are live. 🎉</h1>
              <p style="font-size:16px;color:#ffffff;line-height:1.6;">Endless Tales launched today. Your 14-day free trial is ready and waiting.</p>
              <p style="font-size:16px;color:#ffffff;line-height:1.6;">As an early subscriber your price is <strong>locked at $7.99/month</strong> — you will not be charged anything until your 14-day trial ends. Cancel any time.</p>
              <div style="text-align:center;margin:32px 0;">
                <a href="https://endless-tales.com/welcome" style="display:inline-block;background:#e8520a;color:#ffffff;text-decoration:none;padding:16px 32px;border-radius:10px;font-size:18px;font-weight:700;">Start My 14-Day Free Trial →</a>
              </div>
              <div style="background:#1a1a24;border-radius:10px;padding:20px;margin:24px 0;border-left:4px solid #e8520a;">
                <p style="margin:0;font-size:15px;color:#ffffff;">Full cast. Original score. Zero ads. New stories every week — mystery, thriller, romance, drama and more.</p>
              </div>
              <p style="font-size:14px;color:rgba(255,255,255,0.6);">No spam. Unsubscribe any time. — The Endless Tales Team</p>
            </div>
          `,
        }),
      });

      if (res.ok) {
        await sb.from("waitlist").update({ notified: true }).eq("id", sub.id);
        sent++;
      }
    }

    return new Response(JSON.stringify({ sent, total: subscribers.length }), { status: 200 });
  } catch (err) {
    return new Response(String(err), { status: 500 });
  }
});
