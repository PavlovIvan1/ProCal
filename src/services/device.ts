/* Анонимный идентификатор устройства — чтобы логировать приёмы пищи и оценки
 * без авторизации. Когда появятся аккаунты, заменим на userId. */

export function deviceId(): string {
  try {
    let id = localStorage.getItem("pcal-device");
    if (!id) {
      id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `dev-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      localStorage.setItem("pcal-device", id);
    }
    return id;
  } catch {
    return "unknown";
  }
}
