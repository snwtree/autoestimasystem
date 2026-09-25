import type { RealtimeChannel } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

export type ClientRecord = { id: string; name: string; phone: string; email: string };
export type ProcedureRecord = { id: string; name: string; price?: number };
export type SaleRecord = { id: string; appointment_id?: string; amount: number; client: string; service: string; date: string };

export async function listClients() {
  const { data, error } = await createClient().from("clients").select("id, name, phone, email").order("name");
  if (error) throw error;
  return data as ClientRecord[];
}

export async function saveClient(client: Omit<ClientRecord, "id">, id?: string) {
  const supabase = createClient();
  const query = id
    ? supabase.from("clients").update(client).eq("id", id).select("id, name, phone, email").single()
    : supabase.from("clients").insert(client).select("id, name, phone, email").single();
  const { data, error } = await query;
  if (error) throw error;
  return data as ClientRecord;
}

export async function deleteClient(id: string) {
  const { error } = await createClient().from("clients").delete().eq("id", id);
  if (error) throw error;
}

export async function listProcedures() {
  const { data, error } = await createClient().from("procedures").select("id, name, price").order("name");
  if (error) throw error;
  return data as ProcedureRecord[];
}

export async function saveProcedure(procedure: Omit<ProcedureRecord, "id">, id?: string) {
  const supabase = createClient();
  const query = id
    ? supabase.from("procedures").update(procedure).eq("id", id).select("id, name, price").single()
    : supabase.from("procedures").insert(procedure).select("id, name, price").single();
  const { data, error } = await query;
  if (error) throw error;
  return data as ProcedureRecord;
}

export async function deleteProcedure(id: string) {
  const { error } = await createClient().from("procedures").delete().eq("id", id);
  if (error) throw error;
}

export async function listSales() {
  const { data, error } = await createClient().from("sales").select("id, appointment_id, amount, client, service, sale_date").order("sale_date", { ascending: false });
  if (error) throw error;
  return (data as Array<Omit<SaleRecord, "date"> & { sale_date: string }>).map((sale) => ({ ...sale, date: sale.sale_date }));
}

export async function saveSale(sale: Omit<SaleRecord, "id">) {
  const { data, error } = await createClient().from("sales").insert({ appointment_id: sale.appointment_id, amount: sale.amount, client: sale.client, service: sale.service, sale_date: sale.date }).select("id, appointment_id, amount, client, service, sale_date").single();
  if (error) throw error;
  const row = data as Omit<SaleRecord, "date"> & { sale_date: string };
  return { ...row, date: row.sale_date };
}

export async function deleteSale(id: string) {
  const { error } = await createClient().from("sales").delete().eq("id", id);
  if (error) throw error;
}

export async function deleteSaleByAppointmentId(appointmentId: string) {
  const { error } = await createClient().from("sales").delete().eq("appointment_id", appointmentId);
  if (error) throw error;
}

export async function clearTable(table: "clients" | "procedures" | "sales") {
  const { error } = await createClient().from(table).delete().not("id", "is", null);
  if (error) throw error;
}

export function subscribeToTable(table: "clients" | "procedures" | "sales", onChange: () => void) {
  return createClient().channel(`${table}-realtime`).on("postgres_changes", { event: "*", schema: "public", table }, onChange).subscribe();
}

export async function unsubscribeFromTable(channel: RealtimeChannel) {
  await createClient().removeChannel(channel);
}