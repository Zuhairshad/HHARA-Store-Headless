export type CarrierKey = "quiqup" | "naqel" | "dhl" | "unknown";

export type LiveStatusState =
  | "pending"
  | "picked_up"
  | "in_transit"
  | "out_for_delivery"
  | "delivered"
  | "exception"
  | "unknown";

export type LiveStatusEvent = {
  at: string;
  description: string;
  location?: string;
};

export type LiveStatus = {
  carrier: CarrierKey;
  state: LiveStatusState;
  description: string;
  updatedAt: string | null;
  estimatedDelivery: string | null;
  events: LiveStatusEvent[];
};
