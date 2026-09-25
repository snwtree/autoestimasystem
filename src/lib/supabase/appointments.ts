import type { RealtimeChannel } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

export type AppointmentStatus = "agendado" | "confirmado" | "em andamento" | "concluido";
export type AppointmentRecord = {
  id: string;
  date: string;
  time: string;
  client: string;
  service: string;
  status: AppointmentStatus;
};

type AppointmentRow = {
  id: string;
  appointment_date: string;
  appointment_time: string;
  client: string;
  service: string;
  status: AppointmentStatus;
};

function mapAppointment(row: AppointmentRow): AppointmentRecord {
  return { id: row.id, date: row.appointment_date, time: row.appointment_time.slice(0, 5), client: row.client, service: row.service, status: row.status };
}

export async function listAppointments() {
  const { data, error } = await createClient().from("appointments").select("id, appointment_date, appointment_time, client, service, status").order("appointment_date").order("appointment_time");
  if (error) throw error;
  return (data as AppointmentRow[]).map(mapAppointment);
}

export async function insertAppointment(appointment: Omit<AppointmentRecord, "id">) {
  const { data, error } = await createClient().from("appointments").insert({ appointment_date: appointment.date, appointment_time: appointment.time, client: appointment.client, service: appointment.service, status: appointment.status }).select("id, appointment_date, appointment_time, client, service, status").single();
  if (error) throw error;
  return mapAppointment(data as AppointmentRow);
}

export async function removeAppointment(id: string) {
  const { error } = await createClient().from("appointments").delete().eq("id", id);
  if (error) throw error;
}

export async function clearAppointments() {
  const { error } = await createClient().from("appointments").delete().not("id", "is", null);
  if (error) throw error;
}

export async function updateAppointmentStatus(id: string, status: AppointmentStatus) {
  const { error } = await createClient().from("appointments").update({ status }).eq("id", id);
  if (error) throw error;
}

export function subscribeToAppointments(onChange: () => void): RealtimeChannel {
  return createClient().channel("appointments-realtime").on("postgres_changes", { event: "*", schema: "public", table: "appointments" }, onChange).subscribe();
}

export async function unsubscribeFromAppointments(channel: RealtimeChannel) {
  await createClient().removeChannel(channel);
}