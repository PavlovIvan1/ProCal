/* POST /api/meals — лог приёмов пищи в Supabase (таблица meals).
 * Пишет сервисным ключом с сервера; если env не задан — тихо ноу-оп. */

interface MealBody {
  deviceId?: string;
  name?: string;
  kcal?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

export async function POST(req: Request) {
  let body: MealBody;
  try {
    body = await req.json();
  } catch {
    return Response.json({ saved: false }, { status: 400 });
  }
  if (!body.name || typeof body.kcal !== "number") {
    return Response.json({ saved: false }, { status: 400 });
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return Response.json({ saved: false });

  try {
    const res = await fetch(`${url}/rest/v1/meals`, {
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
          name: body.name,
          kcal: Math.round(body.kcal),
          protein: Math.round(body.protein ?? 0),
          carbs: Math.round(body.carbs ?? 0),
          fat: Math.round(body.fat ?? 0),
        },
      ]),
    });
    return Response.json({ saved: res.ok });
  } catch {
    return Response.json({ saved: false });
  }
}
