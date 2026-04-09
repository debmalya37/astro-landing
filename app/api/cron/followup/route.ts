// app/api/cron/followup/route.ts
import { NextResponse } from "next/server";
import { sendWhatsAppMessage } from "@/app/api/whatsapp/webhook/route";
import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL!, {
  lazyConnect: true,
  maxRetriesPerRequest: 3
});

export async function GET(req: Request) {
  // Security check: Ensure this is called by Vercel Cron
  if (req.headers.get("Authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const interactions = await redis.hgetall("wa_last_interaction");
    const names = await redis.hgetall("wa_names");
    const now = Date.now();
    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

    for (const [phone, timestampStr] of Object.entries(interactions)) {
      const lastInteractionTime = parseInt(timestampStr, 10);
      const timeDiff = now - lastInteractionTime;

      // If it's been exactly between 24 and 25 hours since their last message
      if (timeDiff >= TWENTY_FOUR_HOURS && timeDiff < TWENTY_FOUR_HOURS + (60 * 60 * 1000)) {
        
        // Ensure we haven't already sent a follow-up to this user today
        const alreadyFollowedUp = await redis.get(`followed_up:${phone}`);
        
        if (!alreadyFollowedUp) {
          const userName = names[phone] || "Ji";
          
          const followUpMsg = `🙏 Radhe Radhe ${userName} ji,\n\nWe noticed you reached out yesterday. If you are still looking for guidance, you can explore Surbhi ji's premium services below:`;
          
          const serviceList = {
            button: "View Services",
            sections: [{
              title: "Premium Consultations",
              rows: [
                { id: "career", title: "Career & Wealth", description: "Professional growth analysis" },
                { id: "love", title: "Love & Marriage", description: "Relationship mapping" },
                { id: "all", title: "Complete Kundali", description: "100+ page life report" }
              ]
            }]
          };

          // Send the message
          await sendWhatsAppMessage(phone, followUpMsg, { list: serviceList });
          
          // Mark as followed up for 48 hours so we don't spam them
          await redis.set(`followed_up:${phone}`, "1", "EX", 48 * 60 * 60);
          
          // Clean up the hash to keep Redis memory low
          await redis.hdel("wa_last_interaction", phone);
        }
      }
    }

    return NextResponse.json({ success: true, message: "Processed follow-ups" });
  } catch (error) {
    console.error("Cron Job Error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}