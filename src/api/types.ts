// Shapes mirrored from bimayantra-api responses (the ones Part 1 uses).

export interface Tokens {
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
  sessionExpiresAt: string; // ISO
}

export interface SubscriptionBanner {
  tone: 'TRIAL' | 'GRACE' | 'EXPIRED';
  messageId: string;
  message: string;
}

export interface Me {
  id: string;
  name: string;
  mobile: string;
  maskedMobile: string | null;
  role: string;
  roleLabel: string;
  accountId: string | null;
  advisorName: string | null;
  sessionId: string;
  capabilities: string[];
  readOnly: boolean;
  subscription: {
    status: string;
    plan: string | null;
    endsAt: string;
    daysLeft: number;
    banner: SubscriptionBanner | null;
  } | null;
  profile: { kycStatus: string; completionPct: number } | null;
}

export interface OtpSendResult {
  sent: boolean;
  maskedMobile: string | null;
  expiresAt: string; // ISO
  resendAfterSeconds: number;
  codeLength: number; // 6
  messageId: string;
  message: string;
}

export interface SignInResult {
  outcome: 'SIGNED_IN' | 'CREATED';
  user: Me;
  notices: { messageId: string; message: string }[];
  tokens: Tokens;
}

export type TaskTab = 'OVERDUE' | 'TODAY' | 'UPCOMING' | 'DONE' | 'CANCELLED';
export type TaskPriority = 'HIGH' | 'MEDIUM' | 'LOW';
export type TaskType =
  | 'CALL'
  | 'MEETING'
  | 'FOLLOW_UP'
  | 'COLLECT_DOCUMENTS'
  | 'RENEWAL'
  | 'OTHER'
  | null;

export interface TaskLink {
  type: 'LEAD' | 'CUSTOMER';
  id: string;
  name: string | null;
  status: string | null;
}

export interface Task {
  id: string;
  kind: 'GENERAL' | 'LEAD_FOLLOW_UP';
  title: string;
  dueAt: string; // ISO
  dueShown: string; // "DD-MM-YYYY hh:mm AM" (IST)
  status: 'OPEN' | 'DONE' | 'CANCELLED';
  notes: string | null;
  taskType: TaskType;
  priority: TaskPriority;
  overdue: boolean;
  version: number;
  doneAt: string | null;
  linked: TaskLink | null;
}

export interface TaskListResult {
  tab: TaskTab;
  tasks: Task[];
  counts: Record<TaskTab, number>;
}

// ── Dashboard widgets (GET /dashboard/*) ────────────────────────────────────
export interface LeadStatusCounts {
  total: number;
  byStatus: { NEW: number; CONTACTED: number; QUALIFIED: number; FOLLOW_UP: number; CONVERTED: number; LOST: number };
}

export interface FollowUpCard {
  id: string;
  name: string;
  at: string;
  daysLate: number;
}
export interface FollowUps {
  dueToday: number;
  overdue: number;
  firstToday: FollowUpCard | null;
  firstOverdue: FollowUpCard | null;
}

export interface LeadSource {
  code: string | null;
  label: string;
  count: number;
  percent: number;
}
export interface LeadSources {
  total: number;
  sources: LeadSource[];
}

export interface CatalogueType {
  typeId: string;
  name: string;
  products: number;
  newLast30Days: number;
}
export interface CatalogueSummary {
  total: number;
  types: CatalogueType[];
}

export interface RenewalItem {
  id: string;
  dueDate: string;
  daysLeft: number;
  customer: { id: string; name: string } | null;
  policy: { product: string | null; insurer: string | null } | null;
}
export interface RenewalsDue {
  count: number;
  cards: { due: number; inFollowUp: number; upcoming30: number; lapsedThisMonth: number };
  items: RenewalItem[];
}

export interface ActivityEvent {
  id: string;
  action: string;
  title: string;
  name: string | null;
  detail: string | null;
  at: string;
}
export interface RecentActivity {
  events: ActivityEvent[];
}

export interface AdLeadsToday {
  count: number;
  byChannel: Record<string, number>;
}

// ── Leads ────────────────────────────────────────────────────────────────────
export type LeadStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'FOLLOW_UP' | 'CONVERTED' | 'LOST';
export type Priority = 'HIGH' | 'MEDIUM' | 'LOW';

export interface LeadSummary {
  id: string;
  number: string;
  pipelineId: string;
  name: string;
  mobile: string;
  source: string;
  sourceCode: string | null;
  priority: Priority;
  status: LeadStatus;
  statusLabel: string;
  nextFollowUpAt: string | null;
  customerId: string | null;
  notes: string | null;
  interests: string[];
  campaign: string | null;
  createdAt: string;
  version: number;
  allowedMoves: LeadStatus[];
  canConvert: boolean;
}

export interface LeadContact {
  id: string;
  outcome: string;
  outcomeLabel: string;
  channel: string | null;
  channelLabel: string | null;
  note: string | null;
  at: string;
  by: string | null;
}

export interface LeadDetail extends LeadSummary {
  pipelineName: string | null;
  altMobile: string | null;
  email: string | null;
  referrer: { id: string; name: string | null } | null;
  referredBy: { id: string; number: string; name: string } | null;
  lostReason: string | null;
  lostNote: string | null;
  convertedAt: string | null;
  customer: { id: string; number: string; name: string } | null;
  createdBy: string | null;
  updatedAt: string;
  followUpTask: { id: string; dueAt: string; title: string; version: number } | null;
  contacts: LeadContact[];
}

export interface TimelineItem {
  type: 'CONTACT' | 'STATUS' | 'FOLLOW_UP' | 'TASK' | 'MESSAGE' | 'QUOTATION' | 'CALL';
  at: string;
  title: string;
  detail?: string | null;
  by?: string | null;
  channel?: string | null;
  refId?: string | null;
}

export interface Pipeline {
  id: string;
  name: string;
  position: number;
  counts: Record<LeadStatus, number>;
}

export interface LeadSourceOption {
  code: string;
  label: string;
  needs: string | null;
  campaignName: string | null;
}
export interface Reference {
  leadSourceOptions: LeadSourceOption[];
  lostReasons: string[];
  insuranceTypes: string[];
  leadStatuses: { code: LeadStatus; label: string }[];
  contactOutcomes: { code: string; label: string }[];
  priorities: Priority[];
}

export interface PageMeta {
  page: number;
  limit: number;
  total: number;
  pages?: number;
}

// ── Customers (Policy holders) ───────────────────────────────────────────────
export type CustomerStatus = 'ACTIVE' | 'INACTIVE';
export interface CustomerSummary {
  id: string;
  number: string;
  name: string;
  mobile: string;
  email: string | null;
  city: string | null;
  status: CustomerStatus;
  age: number | null;
  source: string;
  sourceCode: string | null;
  createdAt: string;
  version: number;
  familyCount?: number;
  policyCount?: number;
  personalDataConsent?: string;
}
export interface CustomerStats {
  active: number;
  inactive: number;
  familyMembers: number;
  households: number;
  policiesInForce: number;
  awaitingIssuance: number;
  consentPending: number;
}
export interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
  age: number | null;
  gender: string | null;
  mobile: string | null;
  status: string;
}
export interface CustomerDetail extends CustomerSummary {
  dob: string | null;
  gender: string | null;
  altMobile: string | null;
  preferredContact: string | null;
  address: { line1: string | null; line2: string | null; city: string | null; state: string | null; pin: string | null };
  occupation: string | null;
  notes: string | null;
  identity: { pan: string | null; aadhaar: string | null };
  referredBy: { id: string; number: string; name: string } | null;
  leads: { id: string; number: string; status: string }[];
  family: FamilyMember[];
}

// ── Quotations (loose) ───────────────────────────────────────────────────────
export type QuotationStatus = 'DRAFT' | 'READY' | 'SHARED' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED' | 'EXPIRED';
export interface QuotationRow {
  id: string;
  number?: string | null;
  status: QuotationStatus;
  customer?: { id: string; name: string; number: string } | null;
  productName?: string | null;
  insurerName?: string | null;
  premium?: number | null;
  updatedAt?: string;
}

// ── Notifications ────────────────────────────────────────────────────────────
export interface NotificationItem {
  id: string;
  title: string;
  subtitle: string | null;
  createdAt: string;
  read: boolean;
  kind: string;
  category: string;
  link: { type: string; id: string } | null;
}
export interface NotificationList {
  items: NotificationItem[];
  more: boolean;
  unread: number;
}

// ── Renewals (list row) ──────────────────────────────────────────────────────
export interface RenewalRow {
  id: string;
  status: string;
  dueDate: string;
  daysLeft: number;
  premium?: number | null;
  customer: { id: string; name: string; number: string } | null;
  policy: { product: string | null; insurer: string | null } | null;
}

// ── Policies ─────────────────────────────────────────────────────────────────
export type PolicyStatus = 'AWAITING_ISSUANCE' | 'ISSUED' | 'EXPIRED' | 'CANCELLED' | 'RENEWED';
export interface PolicyRow {
  id: string;
  customerId: string;
  customer: string;
  status: PolicyStatus;
  policyNumber: string;
  productName: string | null;
  insurer: string | null;
  endDate: string | null;
  premium: number | null;
  createdAt: string;
  renewal: { status: string; dueDate: string } | null;
}

// ── Proposals ────────────────────────────────────────────────────────────────
export type ProposalStatus = 'DRAFT' | 'SUBMITTED' | 'ISSUED' | 'DECLINED' | 'CANCELLED';
export interface ProposalRow {
  id: string;
  number: string | null;
  status: ProposalStatus;
  revision?: number;
  quotationNumber: string | null;
  customer: { id: string; name: string } | null;
  productName: string | null;
  variantName: string | null;
  insurer: string | null;
  premium: number | null;
  updatedAt: string | null;
}

export interface RenewalContact { at: string; outcome: string; note: string | null; }
export interface RenewalDetail extends RenewalRow {
  graceUntil: string | null;
  reason: string | null;
  version: number;
  contacts: RenewalContact[];
}

// ── Products (advisor catalogue) ─────────────────────────────────────────────
export interface ProductRow {
  id: string;
  kind: 'VERIFIED' | 'OWN';
  code: string;
  name: string;
  status: string;
  insurerId: string;
  typeId: string;
  insurer: string | null;
  type: string | null;
  quotable: boolean;
  renewalOnly: boolean;
  variantCount: number;
  defaultVariant: string | null;
  variants: string[];
  agentCode: string; // ACTIVE | EXPIRED | INACTIVE | MISSING
  canQuote: boolean;
}

// ── Consent ──────────────────────────────────────────────────────────────────
export interface ConsentCell { status: string; at?: string | null; }
export interface ConsentRow {
  person: { type: string; id: string; name: string; relationship: string; mobile?: string | null; email?: string | null };
  channels: Record<string, ConsentCell>;
}
export interface Consents { rows: ConsentRow[]; personalData: ConsentCell; history: any[]; }

// ── Customer documents ───────────────────────────────────────────────────────
export interface DocVersion { id: string; version: number; rev: number; status: string; label?: string | null; name?: string | null; type?: string | null; fileName?: string | null; originalName?: string | null; uploadedAt?: string | null; }
export interface DocGroup { personKey: string; personName: string; type: string; name: string | null; versions: DocVersion[]; }
export interface CustomerDocuments {
  groups: DocGroup[];
  missing: { items: string[]; message: string } | null;
}

// ── Quotation detail (view) ──────────────────────────────────────────────────
export interface QuotationRevision {
  revision: number;
  status: string;
  generatedAt?: string | null;
  sharedAt?: string | null;
  validUntil?: string | null;
  viewed?: number;
  final?: number | null;
}
export interface QuotationDetail {
  id: string;
  number: string | null;
  status: QuotationStatus;
  step?: number;
  inputs: any;
  calc: any;
  version: number;
  revisions: QuotationRevision[];
  updatedAt?: string;
  renewal?: any;
}

// ── Policy detail ────────────────────────────────────────────────────────────
export interface PolicyNominee { name: string; sharePercent?: number; relationship?: string | null; }
export interface PolicyDetail {
  id: string;
  status: PolicyStatus;
  policyNumber: string;
  productName: string | null;
  insurer: string | null;
  startDate: string | null;
  endDate: string | null;
  sumInsured: number | null;
  premium: number | null;
  frequency: string | null;
  agentCode?: string | null;
  customer: { id: string; name: string; number: string } | null;
  nominees: PolicyNominee[];
  insured?: { name: string }[];
  expectedCommission?: number | null;
  renewal: { status: string; dueDate: string } | null;
}

// ── Proposal detail ──────────────────────────────────────────────────────────
export interface ProposalReadiness {
  kyc: boolean;
  paid: { amount: number; mode: string; date: string; label: string } | null;
  problems: { field: string; message: string }[];
}
export interface ProposalDetail {
  id: string;
  number: string | null;
  status: ProposalStatus;
  customerId: string;
  revision: number;
  members: { name: string }[];
  questions: string[];
  declarations: any[];
  nominees: { name: string; share?: number; relationship?: string }[];
  version: number;
  readiness: ProposalReadiness;
}

// ── Campaigns ────────────────────────────────────────────────────────────────
export interface CampaignConnection {
  id: string;
  channel: string;
  status: string;
  name?: string | null;
  last30Days?: Record<string, number>;
}
export interface CampaignRow {
  id: string;
  kind: 'CAMPAIGN' | 'FORM';
  channel: string;
  name: string;
  status: string;
  statusReason?: string | null;
  leads: number;
  converted: number;
  today?: number;
  lastLeadAt?: string | null;
  spend?: number | null;
  currency?: string | null;
  costPerLead?: number | null;
  category?: string | null;
}
export interface CampaignLead {
  submissionId: string;
  leadId: string;
  number: string;
  name: string;
  mobile: string;
  leadStatus: string;
  linkedToExisting: boolean;
  at: string;
}
