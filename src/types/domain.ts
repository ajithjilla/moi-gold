export type Role = "ADMIN" | "AFFILIATE" | "USER";
export type Plan = "BASIC" | "PRO" | "ENTERPRISE";
export type AffiliateStatus = "ACTIVE" | "PENDING" | "EXPIRED" | "SUSPENDED";
export type EventType =
  | "WEDDING"
  | "ENGAGEMENT"
  | "EAR"
  | "CRADLE"
  | "HOUSEWARMING"
  | "BIRTHDAY"
  | "OTHER";
export type EventStatus = "UPCOMING" | "ACTIVE" | "COMPLETED" | "CANCELLED";
export type PaymentMethod = "CASH" | "GPAY" | "PHONEPE" | "PAYTM" | "NEFT" | "CHEQUE" | "OTHER";

export type Denoms = Partial<Record<string, number>>;

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  role: Role;
  active?: boolean;
  created_at?: string;
  affiliate?: AffiliateSummary | null;
}

export interface AffiliateSummary {
  id: string;
  plan: Plan;
  status: AffiliateStatus;
  revenue: number;
}

export interface Affiliate {
  id: string;
  user_id?: string;
  plan: Plan;
  status: AffiliateStatus;
  revenue: number;
  join_date: string;
  notes?: string | null;
  user?: Pick<User, "id" | "name" | "phone" | "email" | "active">;
  _count?: {
    events?: number;
  };
}

export interface EventWriter {
  id: string;
  event_id: string;
  user_id: string;
  assigned_by?: string;
  assigned_at?: string;
  user?: Pick<User, "id" | "name" | "phone" | "email">;
}

export interface Event {
  id: string;
  name: string;
  type: EventType;
  date: string;
  venue: string;
  owner_name: string;
  owner_phone: string;
  owner_email?: string | null;
  affiliate_id?: string;
  status: EventStatus;
  writer_access_enabled?: boolean;
  share_token?: string;
  share_enabled?: boolean;
  created_at?: string;
  updated_at?: string;
  affiliate?: Affiliate;
  affiliate_name?: string | null;
  writers?: EventWriter[];
  _count?: {
    moi_entries?: number;
    writers?: number;
  };
}

export interface MoiEntry {
  id: string;
  event_id: string;
  giver_name: string;
  amount: number;
  phone?: string | null;
  address?: string | null;
  relation?: string | null;
  method: PaymentMethod;
  note?: string | null;
  voided: boolean;
  voided_at?: string | null;
  voided_by_id?: string | null;
  denoms?: Denoms | null;
  written_by_id?: string | null;
  written_by?: Pick<User, "id" | "name" | "phone"> | null;
  created_at: string;
  updated_at?: string;
}

export interface MoiEntryPayload {
  giver_name: string;
  amount: number;
  phone?: string | null;
  address?: string | null;
  relation?: string | null;
  method: PaymentMethod;
  note?: string | null;
  denoms?: Denoms | null;
}

export interface AdminStats {
  affiliates: number;
  activeAffiliates: number;
  events: number;
  activeEvents: number;
  moiEntries: number;
  totalMoi: number;
  totalRevenue: number;
  writers: number;
}

export interface RevenuePoint {
  month: string;
  amount: number;
}

export interface AuditLog {
  id: string;
  action: string;
  entity: string;
  entity_id?: string | null;
  metadata?: unknown;
  ip?: string | null;
  created_at: string;
  actor?: Pick<User, "id" | "name" | "role"> | null;
}

export interface Settlement {
  event: Event;
  grandTotal: number;
  cashTotal: number;
  digitalTotal: number;
  cashCount: number;
  digitalCount: number;
  totalEntries: number;
  methodBreakdown: Record<string, { count: number; total: number }>;
  denomBreakdown: Record<string, number>;
}

export interface EventReport {
  event: Event;
  entries: MoiEntry[];
  summary: {
    totalEntries: number;
    voidedEntries: number;
    totalAmount: number;
    generatedAt: string;
  };
}

export interface WriterStats {
  total: number;
  count: number;
}

export interface PublicSettings {
  app_name?: string;
  brand_title?: string;
  brand_subtitle?: string;
  support_email?: string;
  welcome_message_ta?: string;
  footer_note?: string;
  [key: string]: string | undefined;
}

export interface PlanInfo {
  id: Plan;
  name: string;
  price: number;
  currency: string;
  period: string;
  featured?: boolean;
  features: string[];
}

export interface SharedEventResponse {
  event: Pick<Event, "id" | "name" | "type" | "date" | "venue" | "owner_name" | "status" | "affiliate_name">;
  summary: {
    total: number;
    count: number;
  };
  entries: Array<
    Pick<MoiEntry, "id" | "giver_name" | "amount" | "phone" | "relation" | "method" | "note" | "created_at">
  >;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ValidationIssue {
  path: string;
  message: string;
  code: string;
}
