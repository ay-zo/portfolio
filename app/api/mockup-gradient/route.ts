// app/api/mockup-gradient/route.ts

import { NextRequest } from "next/server";
import { generateMockupGradient } from "@/app/lib/generate-mockup-gradient";

export async function GET(req: NextRequest) {
  const image = req.nextUrl.searchParams.get("image");

  if (!image) {
    return Response.json({ error: "Missing image" }, { status: 400 });
  }

  const [from, to] = await generateMockupGradient(image);

  return Response.json({ from, to });
}
