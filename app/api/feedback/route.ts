/* POST /api/feedback — лайк/дизлайк оценки блюда в Supabase (таблица feedback). */

interface FeedbackBody {
  deviceId?: string;
  kind?: "up" | "down";
  meal?: string;
  kcal?: number;
  coach?: string;
}

export async function POST(req: Request) {
  let body: FeedbackBody;
  try {
    body = await req.json();
  } catch {
    return Response.json({ saved: false }, { status: 400 });
  }
  if (body.kind !== "up" && body.kind !== "down") {
    return Response.json({ saved: false }, { status: 400 });
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return Response.json({ saved: false });

  try {
    const res = await fetch(`${url}/rest/v1/feedback`, {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify([
        {
          device_id: body.deviceId ?? null,
          kind: body.kind,
          meal_name: body.meal ?? null,
          kcal: typeof body.kcal === "number" ? Math.round(body.kcal) : null,
          coach: body.coach ?? null,
        },
      ]),
    });
    return Response.json({ saved: res.ok });
  } catch {
    return Response.json({ saved: false });
  }
}
