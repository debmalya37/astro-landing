import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sendWhatsApp } from "@/lib/notify";

const schema = z.object({
  to: z.string().min(8),
  body: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = schema.parse(await req.json());
    const result = await sendWhatsApp(body);
    return NextResponse.json({ ok: true, result });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message }, { status: 400 });
  }
}