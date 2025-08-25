// TODO: Replace with MongoDB-based activity intake service

export type ActivityEvent = {
  source: "fuel_card" | "telematics" | "ev_charging" | "spend" | "odometer" | "manual";
  event_date?: string; // ISO
  mileage_miles?: number;
  fuel_volume_gal?: number;
  energy_kwh?: number;
  spend_usd?: number;
  odometer_miles?: number;
  location?: any;
  receipt_url?: string;
  input_snapshot?: any;
  hash?: string;
};

export async function ingestActivity(params: {
  orgId?: string;
  loanId?: string; // loans.id (uuid)
  loanExternalId?: string; // loans.loan_id (text)
  vin?: string; // resolve via loan_external_refs
  events: ActivityEvent[];
}) {
  const { data, error } = await supabase.functions.invoke("ingest-activity", {
    body: {
      org_id: params.orgId,
      loan_id: params.loanId,
      loan_external_id: params.loanExternalId,
      vin: params.vin,
      events: params.events,
    },
  });

  if (error) throw error;
  return data as {
    inserted: number;
    updated_periods: number;
    results: Array<{ period_start: string; totals: any; pcaf_option: string | null }>;
  };
}
