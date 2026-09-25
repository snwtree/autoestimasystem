function requiredServerEnv(name: "NEXT_PUBLIC_SUPABASE_URL" | "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY") {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function getSupabaseServerConfig() {
  const url = requiredServerEnv("NEXT_PUBLIC_SUPABASE_URL");
  const key = requiredServerEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");

  try {
    new URL(url);
  } catch {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL must be a valid URL");
  }

  return { url, key };
}