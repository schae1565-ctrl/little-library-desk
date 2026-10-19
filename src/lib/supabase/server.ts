import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export const DB_SCHEMA = "little_library";

let client: SupabaseClient | null = null;

/**
 * 서버 전용 Supabase 클라이언트 (서비스 키 사용).
 * 브라우저에서는 DB에 직접 접근하지 않고, 모든 읽기·쓰기가 서버를 거친다.
 */
export function db(): SupabaseClient {
  if (client) return client;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 환경변수가 필요합니다.");
  }
  client = createClient(url, key, {
    db: { schema: DB_SCHEMA },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}

export function isDemoMode(): boolean {
  return process.env.DEMO_MODE === "true";
}

/** DEMO_MODE에서는 쓰기를 막는다. */
export function assertWritable(): void {
  if (isDemoMode()) {
    throw new Error("데모 모드에서는 저장할 수 없습니다.");
  }
}
