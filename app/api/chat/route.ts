import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { answerFromFaq } from "@/lib/faq";

const bodySchema = z.object({
  message: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = bodySchema.parse(await req.json());
    const reply = answerFromFaq(body.message);
    return NextResponse.json({ reply });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Invalid request" },
      { status: 400 }
    );
  }
}