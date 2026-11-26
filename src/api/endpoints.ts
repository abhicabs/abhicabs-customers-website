import { http, p } from './client';
import type {
  Me,
  OtpSendResult,
  SignInResult,
  Task,
  TaskListResult,
  TaskTab,
  LeadStatusCounts,
  FollowUps,
  LeadSources,
  CatalogueSummary,
  RenewalsDue,
  RecentActivity,
  AdLeadsToday,
  LeadSummary,
  LeadDetail,
  TimelineItem,
  Pipeline,
  Reference,
  LeadStatus,
  Priority,
  PageMeta,
  CustomerSummary,
  CustomerDetail,
  CustomerStats,
  QuotationRow,
  NotificationList,
  RenewalRow,
  RenewalDetail,
  PolicyRow,
  ProposalRow,
  ProductRow,
  ProposalDetail,
  Consents,
  CustomerDocuments,
  CampaignConnection,
  CampaignRow,
  CampaignLead,
  QuotationDetail,
  PolicyDetail,
} from './types';

export const auth = {
  loginOtp: (body: { mobile: string }) => http.post<OtpSendResult>('/auth/login/otp', body),
  loginVerify: (body: { mobile: string; code: string }, opts?: { idempotencyKey?: string }) =>
    http.post<SignInResult>('/auth/login/verify', body, opts),
  registerOtp: (body: { name: string; mobile: string; email?: string; termsAccepted: true }) =>
    http.post<OtpSendResult>('/auth/register/otp', body),
  registerVerify: (body: { mobile: string; code: string }, opts?: { idempotencyKey?: string }) =>
    http.post<SignInResult>('/auth/register/verify', body, opts),
  refresh: () => http.post('/auth/refresh', {}),
  logout: () => http.post('/auth/logout', {}),
  me: () => http.get<Me>('/auth/me'),
};

export const tasks = {
  list: (tab: TaskTab, opts?: { signal?: AbortSignal }) => http.get<TaskListResult>('/tasks', { tab }, opts),
  create: (body: { title: string; dueDate: string; dueTime: string; taskType?: string; priority?: string; linkedType?: 'LEAD' | 'CUSTOMER'; linkedId?: string; notes?: string }, opts?: { idempotencyKey?: string }) =>
    http.post<Task>('/tasks', body, opts),
  edit: (id: string, body: { version: number; title?: string; dueDate?: string; dueTime?: string; notes?: string; taskType?: string; priority?: string }) => http.patch<Task>(p`/tasks/${id}`, body),
  reschedule: (id: string, body: { version: number; preset?: string; dueDate?: string; dueTime?: string }, o?: { idempotencyKey?: string }) => http.post<Task>(p`/tasks/${id}/reschedule`, body, o),
  done: (id: string, version: number) => http.post<Task>(p`/tasks/${id}/done`, { version }),
  reopen: (id: string, version: number) => http.post<Task>(p`/tasks/${id}/reopen`, { version }),
};

// One call per widget (P-08): a failure in one never blanks the whole dashboard.
export const dashboard = {
  leadStatusCounts: (opts?: { signal?: AbortSignal }) => http.get<LeadStatusCounts>('/dashboard/lead-status-counts', undefined, opts),
  followUps: (opts?: { signal?: AbortSignal }) => http.get<FollowUps>('/dashboard/follow-ups', undefined, opts),
  leadSources: (opts?: { signal?: AbortSignal }) => http.get<LeadSources>('/dashboard/lead-sources', undefined, opts),
  catalogueSummary: (opts?: { signal?: AbortSignal }) => http.get<CatalogueSummary>('/dashboard/catalogue-summary', undefined, opts),
  renewalsDue: (opts?: { signal?: AbortSignal }) => http.get<RenewalsDue>('/dashboard/renewals-due', undefined, opts),
  recentActivity: (opts?: { signal?: AbortSignal }) => http.get<RecentActivity>('/dashboard/recent-activity', undefined, opts),
  adLeadsToday: (opts?: { signal?: AbortSignal }) => http.get<AdLeadsToday>('/dashboard/ad-leads-today', undefined, opts),
};

export interface CreateLeadBody {
  pipelineId: string;
  name: string;
  mobile: string;
  altMobile?: string;
  email?: string;
  source: string; // source code
  campaign?: string;
  interests?: string[];
  priority?: Priority;
  nextFollowUpAt?: string;
  notes?: string;
  confirm?: string[];
}

export interface ChangeStatusBody {
  version: number;
  status: Exclude<LeadStatus, 'CONVERTED'>;
  nextFollowUpAt?: string;
  lostReason?: string;
  note?: string;
}

export const leads = {
  keepWithdrawal: (id: string, version: number, o?: { idempotencyKey?: string }) => http.post<any>(p`/leads/${id}/withdrawal/keep`, { version }, o),
  remove: (id: string, body: { version: number; reason?: string }, o?: { idempotencyKey?: string }) => http.post<any>(p`/leads/${id}/remove`, body, o),
  update: (id: string, body: { version: number; name?: string; mobile?: string; altMobile?: string; email?: string; source?: string; campaign?: string; priority?: string; notes?: string }, o?: { idempotencyKey?: string }) => http.patch<any>(p`/leads/${id}`, body, o),
  contact: (id: string, body: { outcome: string; channel?: string; note?: string }, o?: { idempotencyKey?: string }) => http.post<any>(p`/leads/${id}/contacts`, body, o),
  convert: (id: string, body: { version: number; mode: 'CREATE' | 'LINK'; customerId?: string; customer?: any; confirm?: any }, o?: { idempotencyKey?: string }) => http.post<any>(p`/leads/${id}/convert`, body, o),
  list: (query: Record<string, string | number | undefined>, opts?: { signal?: AbortSignal }) =>
    http.get<LeadSummary[]>('/leads', query, opts),
  get: (id: string, opts?: { signal?: AbortSignal }) => http.get<LeadDetail>(p`/leads/${id}`, undefined, opts),
  timeline: (id: string, types?: string, opts?: { signal?: AbortSignal }) =>
    http.get<TimelineItem[]>(p`/leads/${id}/timeline`, types ? { types } : undefined, opts),
  create: (body: CreateLeadBody, opts?: { idempotencyKey?: string }) => http.post<LeadSummary>('/leads', body, opts),
  changeStatus: (id: string, body: ChangeStatusBody, opts?: { idempotencyKey?: string }) =>
    http.post<LeadSummary>(p`/leads/${id}/status`, body, opts),
  logContact: (id: string, body: { outcome: string; channel?: string; note?: string }, opts?: { idempotencyKey?: string }) =>
    http.post(p`/leads/${id}/contacts`, body, opts),
  duplicateCheck: (query: { mobile: string; name?: string; excludeId?: string }) =>
    http.get<{ exact: { id: string; number: string; name: string } | null; sameMobile: any[]; customers: any[] }>('/leads/duplicate-check', query),
};

export const pipelines = {
  list: (opts?: { signal?: AbortSignal }) => http.get<Pipeline[]>('/pipelines', undefined, opts),
};

export const reference = {
  get: (opts?: { signal?: AbortSignal }) => http.get<Reference>('/reference', undefined, opts),
};

export const customers = {
  vehicles: (id: string, opts?: { signal?: AbortSignal }) => http.get<any>(p`/customers/${id}/vehicles`, undefined, opts),
  addVehicle: (id: string, body: { registration: string; vehicleType: string; make: string; model: string; year: number; fuel: string; rcFileId: string; photos?: { slot: string; fileId: string }[] }, o?: { idempotencyKey?: string }) => http.post<any>(p`/customers/${id}/vehicles`, body, o),
  link: (id: string, body: { linkedCustomerId: string; relationship: string }, o?: { idempotencyKey?: string }) => http.post<any>(p`/customers/${id}/links`, body, o),
  update: (id: string, body: any, o?: { idempotencyKey?: string }) => http.patch<any>(p`/customers/${id}`, body, o),
  deactivate: (id: string, body: { version: number; reason?: string; note?: string }, o?: { idempotencyKey?: string }) => http.post<any>(p`/customers/${id}/deactivate`, body, o),
  create: (body: { name: string; mobile: string; dob?: string; gender?: string; email?: string; city?: string; personalDataConsent?: boolean }, o?: { idempotencyKey?: string }) => http.post<any>('/customers', body, o),
  list: (query: Record<string, string | number | undefined>, opts?: { signal?: AbortSignal }) =>
    http.get<CustomerSummary[]>('/customers', query, opts),
  get: (id: string, opts?: { signal?: AbortSignal }) => http.get<CustomerDetail>(p`/customers/${id}`, undefined, opts),
  stats: (opts?: { signal?: AbortSignal }) => http.get<CustomerStats>('/customers/stats', undefined, opts),
  consents: (id: string, opts?: { signal?: AbortSignal }) => http.get<Consents>(p`/customers/${id}/consents`, undefined, opts),
  recordConsent: (id: string, body: { personType: 'CUSTOMER' | 'FAMILY'; personId: string; channel?: string; channels?: string[]; action: 'GIVE' | 'WITHDRAW'; howGiven?: string; declaration?: boolean; reason?: string; note?: string }, o?: { idempotencyKey?: string }) => http.post<any>(p`/customers/${id}/consents`, body, o),
  addFamily: (id: string, body: { name: string; relationship: string; dob?: string; gender?: string; mobile?: string; email?: string }, o?: { idempotencyKey?: string }) => http.post<any>(p`/customers/${id}/family`, body, o),
  updateFamily: (id: string, memberId: string, body: { version: number; name: string; relationship: string; dob?: string; gender?: string; mobile?: string; email?: string }) => http.patch<any>(p`/customers/${id}/family/${memberId}`, body),
  setDefaultNominee: (id: string, body: { version: number; nominee: { name: string; relationship: string; dob: string } }) => http.put<any>(p`/customers/${id}/default-nominee`, body),
  documents: (id: string, opts?: { signal?: AbortSignal }) => http.get<CustomerDocuments>(p`/customers/${id}/documents`, undefined, opts),
  addDocument: (id: string, body: { personKey: string; type: string; name?: string; fileId: string }, opts?: { idempotencyKey?: string }) =>
    http.post(p`/customers/${id}/documents`, { customerId: id, ...body }, opts),
  activity: (id: string, opts?: { signal?: AbortSignal }) => http.get<any>(p`/customers/${id}/activity`, undefined, opts),
};

export const documents = {
  list: (query: Record<string, string | undefined>, opts?: { signal?: AbortSignal }) => http.get<any>('/documents', query, opts),
  get: (docId: string, opts?: { signal?: AbortSignal }) => http.get<any>(p`/documents/${docId}`, undefined, opts),
  changeLabel: (docId: string, body: { rev: number; label: string }) => http.patch<any>(p`/documents/${docId}/label`, body),
  confirm: (docId: string, body: { rev: number; values: Record<string, unknown> }, o?: { idempotencyKey?: string }) => http.post<any>(p`/documents/${docId}/confirm`, body, o),
};

export const payments = {
  fail: (id: string, body?: any) => http.post<any>(p`/payments/${id}/fail`, body ?? {}),
  expire: (id: string, body?: any) => http.post<any>(p`/payments/${id}/expire`, body ?? {}),
};
export const quotations = {
  list: (query: Record<string, string | number | undefined>, opts?: { signal?: AbortSignal }) =>
    http.get<QuotationRow[]>('/quotations', query, opts),
  get: (id: string, opts?: { signal?: AbortSignal }) => http.get<QuotationDetail>(p`/quotations/${id}`, undefined, opts),
  share: (id: string, channel: 'EMAIL' | 'WHATSAPP' | 'LINK' | 'DOWNLOAD', opts?: { idempotencyKey?: string }) =>
    http.post(p`/quotations/${id}/share`, { channel }, opts),
  choices: (query?: { typeId?: string; insurerId?: string }, opts?: { signal?: AbortSignal }) =>
    http.get<{ types: { id: string; name: string }[]; insurers: { id: string; name: string }[]; products: any[] }>('/quotations/choices', query as any, opts),
  start: (customerId: string, opts?: { idempotencyKey?: string }) => http.post<QuotationDetail>('/quotations', { customerId }, opts),
  save: (id: string, body: { version: number; step: number; inputs: any }) => http.patch<QuotationDetail>(p`/quotations/${id}`, body),
  calculate: (id: string) => http.post<QuotationDetail>(p`/quotations/${id}/calculate`, {}),
  generate: (id: string, opts?: { idempotencyKey?: string }) => http.post<QuotationDetail>(p`/quotations/${id}/generate`, {}, opts),
  recordPayment: (id: string, body: { mode: string; amount: number; paymentDate: string; reference?: string; declaration: boolean }, opts?: { idempotencyKey?: string }) =>
    http.post(p`/quotations/${id}/payments`, body, opts),
};

export const notifications = {
  count: () => http.get<{ unread: number }>('/notifications/count'),
  list: (filter?: string, opts?: { signal?: AbortSignal }) =>
    http.get<NotificationList>('/notifications', filter && filter !== 'ALL' ? { filter } : undefined, opts),
  readAll: () => http.post('/notifications/read-all', {}),
  open: (id: string) => http.post(p`/notifications/${id}/open`, {}),
};

export const renewals = {
  list: (query: Record<string, string | undefined>, opts?: { signal?: AbortSignal }) =>
    http.get<RenewalRow[]>('/renewals', query, opts),
  get: (id: string, opts?: { signal?: AbortSignal }) => http.get<RenewalDetail>(p`/renewals/${id}`, undefined, opts),
  contact: (id: string, body: { version: number; outcome: string; note?: string }, o?: { idempotencyKey?: string }) => http.post<any>(p`/renewals/${id}/contact`, body, o),
  notRenewing: (id: string, body: { version: number; reason: string; note?: string }, o?: { idempotencyKey?: string }) => http.post<any>(p`/renewals/${id}/not-renewing`, body, o),
  pause: (id: string, body: { version: number }, o?: { idempotencyKey?: string }) => http.post<any>(p`/renewals/${id}/pause`, body, o),
  resume: (id: string, body: { version: number }, o?: { idempotencyKey?: string }) => http.post<any>(p`/renewals/${id}/resume`, body, o),
  renewalQuotation: (id: string, body: { mode?: string; typedRenewalPremium?: number; insurerId?: string; productId?: string; variantId?: string; people?: string[]; sumInsured?: number }, o?: { idempotencyKey?: string }) => http.post<any>(p`/renewals/${id}/renewal-quotation`, body, o),
};

export const policies = {
  recordExisting: (body: any, o?: { idempotencyKey?: string }) => http.post<any>('/policies/existing', body, o),
  setNominees: (id: string, body: any) => http.put<any>(p`/policies/${id}/nominees`, body),
  correct: (id: string, body: any, o?: { idempotencyKey?: string }) => http.post<any>(p`/policies/${id}/correct`, body, o),
  cancel: (id: string, body: { version: number; reason?: string; cancelDate?: string }, o?: { idempotencyKey?: string }) => http.post<any>(p`/policies/${id}/cancel`, body, o),
  list: (query: Record<string, string | undefined>, opts?: { signal?: AbortSignal }) =>
    http.get<PolicyRow[]>('/policies', query, opts),
  get: (id: string, opts?: { signal?: AbortSignal }) => http.get<PolicyDetail>(p`/policies/${id}`, undefined, opts),
  issue: (id: string, body: { version: number; policyNumber: string; issueDate: string; startDate: string; endDate: string; frequency: string; sumInsured: number; premium: number }, opts?: { idempotencyKey?: string }) =>
    http.post<PolicyDetail>(p`/policies/${id}/issue`, body, opts),
};

export const proposals = {
  list: (opts?: { signal?: AbortSignal }) => http.get<ProposalRow[]>('/proposals', undefined, opts),
  get: (id: string, opts?: { signal?: AbortSignal }) => http.get<ProposalDetail>(p`/proposals/${id}`, undefined, opts),
  submit: (id: string, version: number, opts?: { idempotencyKey?: string }) => http.post<ProposalDetail>(p`/proposals/${id}/submit`, { version }, opts),
};

export const products = {
  list: (query: Record<string, string | undefined>, opts?: { signal?: AbortSignal }) =>
    http.get<ProductRow[]>('/products', query, opts),
  get: (id: string, opts?: { signal?: AbortSignal }) => http.get<any>(p`/products/${id}`, undefined, opts),
  featureTable: (query: { typeId: string; source?: string }, opts?: { signal?: AbortSignal }) => http.get<any>('/catalogue/feature-table', query, opts),
  commercials: (id: string, opts?: { signal?: AbortSignal }) => http.get<any>(p`/products/${id}/commercials`, undefined, opts),
  saveCommercials: (id: string, body: { commissionPercent?: number; notes?: string }) => http.put<any>(p`/products/${id}/commercials`, body),
  correctableFields: (id: string, opts?: { signal?: AbortSignal }) => http.get<any>(p`/products/${id}/corrections/fields`, undefined, opts),
  suggestCorrection: (id: string, body: { field: string; proposedValue: string; reason: string }, o?: { idempotencyKey?: string }) => http.post<any>(p`/products/${id}/corrections`, body, o),
  addPrice: (id: string, body: { effectiveFrom: string; taxPercent: number; csv?: string; sourceNote?: string }, o?: { idempotencyKey?: string }) => http.post<any>(p`/products/${id}/prices`, body, o),
  prices: (id: string, opts?: { signal?: AbortSignal }) => http.get<any>(p`/products/${id}/prices`, undefined, opts),
  startReading: (body: { typeId: string; fileId: string; insurerId?: string; ignoreCategoryCheck?: boolean }, o?: { idempotencyKey?: string }) => http.post<any>('/my-products/brochure-reading', body, o),
  reading: (id: string, opts?: { signal?: AbortSignal }) => http.get<any>(p`/my-products/brochure-reading/${id}`, undefined, opts),
  readingDecisions: (id: string, body: { decisions: { key: string; decision: 'ACCEPT' | 'EDIT'; value?: string }[] }) => http.put<any>(p`/my-products/brochure-reading/${id}/decisions`, body),
  readingAcceptHigh: (id: string) => http.post<any>(p`/my-products/brochure-reading/${id}/accept-high`, {}),
  readingResult: (id: string) => http.post<any>(p`/my-products/brochure-reading/${id}/result`, {}),
  readingRetry: (id: string) => http.post<any>(p`/my-products/brochure-reading/${id}/retry`, {}),
  ownCreate: (body: { insurerId: string; typeId: string; code: string; data: any; variants?: { name: string }[] }, opts?: { idempotencyKey?: string }) =>
    http.post<any>('/products', body, opts),
};

export const campaigns = {
  syncNow: (id: string) => http.post<any>(p`/campaigns/connections/${id}/sync-now`, {}),
  sources: (id: string, opts?: { signal?: AbortSignal }) => http.get<any>(p`/campaigns/connections/${id}/sources`, undefined, opts),
  saveSources: (id: string, body: { ids: string[] }) => http.put<any>(p`/campaigns/connections/${id}/sources`, body),
  forms: (query: { connectionId?: string }, opts?: { signal?: AbortSignal }) => http.get<any>('/campaigns/forms', query, opts),
  saveForm: (formId: string, body: { campaignName?: string; pipelineId?: string | null; active?: boolean; fieldMap?: Record<string, string> }) => http.put<any>(p`/campaigns/forms/${formId}`, body),
  connect: (body: { channel: 'WEBSITE' | 'GOOGLE'; name: string; contactPageUrl?: string; campaignIds?: string[]; formIds?: string[] }, o?: { idempotencyKey?: string }) => http.post<any>('/campaigns/connections', body, o),
  oauthStart: (channel: string, body?: { connectionId?: string }) => http.post<any>(p`/campaigns/oauth/${channel}/start`, body ?? {}),
  connections: (opts?: { signal?: AbortSignal }) => http.get<CampaignConnection[]>('/campaigns/connections', undefined, opts),
  list: (query: Record<string, string | undefined>, opts?: { signal?: AbortSignal }) => http.get<CampaignRow[]>('/campaigns', query, opts),
  get: (id: string, opts?: { signal?: AbortSignal }) => http.get<any>(p`/campaigns/${id}`, undefined, opts),
  leads: (id: string, opts?: { signal?: AbortSignal }) => http.get<CampaignLead[]>(p`/campaigns/${id}/leads`, undefined, opts),
  leadAnswers: (leadId: string, opts?: { signal?: AbortSignal }) => http.get<any>(p`/campaigns/leads/${leadId}/answers`, undefined, opts),
};

export const bestfit = {
  options: (customerId: string, typeId: string, opts?: { signal?: AbortSignal }) => http.get<any>(p`/customers/${customerId}/best-fit/options`, { typeId }, opts),
  rank: (customerId: string, body: { typeId: string; people: string[]; budget: number; priority: string; sumInsured: number }, o?: { idempotencyKey?: string }) =>
    http.post<any>(p`/customers/${customerId}/best-fit`, body, o),
};

export const communications = {
  cancel: (id: string, o?: { idempotencyKey?: string }) => http.post<any>(p`/communications/${id}/cancel`, {}, o),
  list: (query: { tab?: string }, opts?: { signal?: AbortSignal }) => http.get<any>('/communications', query, opts),
  get: (id: string, opts?: { signal?: AbortSignal }) => http.get<any>(p`/communications/${id}`, undefined, opts),
};

export const wallet = {
  get: (opts?: { signal?: AbortSignal }) => http.get<any>('/wallet', undefined, opts),
};
export const supportAccess = {
  staff: (opts?: { signal?: AbortSignal }) => http.get<any>('/support-grants/staff', undefined, opts),
  give: (body: any, o?: { idempotencyKey?: string }) => http.post<any>('/support-grants', body, o),
  end: (id: string, body?: any) => http.post<any>(p`/support-grants/${id}/end`, body ?? {}),
  list: (opts?: { signal?: AbortSignal }) => http.get<any>('/support-grants', undefined, opts),
};
export const exportsApi = {
  request: (body: any, o?: { idempotencyKey?: string }) => http.post<any>('/exports', body, o),
  list: (opts?: { signal?: AbortSignal }) => http.get<any>('/exports', undefined, opts),
};

export const myInsurers = {
  available: (opts?: { signal?: AbortSignal }) => http.get<any>('/my-insurers/available', undefined, opts),
  add: (body: any, o?: { idempotencyKey?: string }) => http.post<any>('/my-insurers', body, o),
  deactivate: (id: string, body: { reason?: string }) => http.post<any>(p`/my-insurers/${id}/deactivate`, body),
  activate: (id: string) => http.post<any>(p`/my-insurers/${id}/activate`, {}),
  list: (opts?: { signal?: AbortSignal }) => http.get<any>('/insurers', undefined, opts),
};
export const assistants = {
  list: (opts?: { signal?: AbortSignal }) => http.get<any>('/assistants', undefined, opts),
};
export const referrers = {
  create: (body: any, o?: { idempotencyKey?: string }) => http.post<any>('/referrers', body, o),
  disable: (id: string, body?: any) => http.post<any>(p`/referrers/${id}/disable`, body ?? {}),
  enable: (id: string) => http.post<any>(p`/referrers/${id}/enable`, {}),
  newLink: (id: string) => http.post<any>(p`/referrers/${id}/new-link`, {}),
  list: (opts?: { signal?: AbortSignal }) => http.get<any>('/referrers', undefined, opts),
};

export const kyc = {
  get: (opts?: { signal?: AbortSignal }) => http.get<any>('/kyc', undefined, opts),
  submit: (body: { version: number; pan: string; nameOnPan: string; panFileId: string; licenceFileId: string; declaration: boolean }, o?: { idempotencyKey?: string }) => http.put<any>('/kyc', body, o),
};

export const sessions = {
  list: (opts?: { signal?: AbortSignal }) => http.get<any>('/auth/sessions', undefined, opts),
  end: (id: string) => http.del(p`/auth/sessions/${id}`),
};

export const audit = {
  list: (opts?: { signal?: AbortSignal }) => http.get<any>('/audit', undefined, opts),
};

export const comparisons = {
  list: (opts?: { signal?: AbortSignal }) => http.get<any>('/comparisons', undefined, opts),
  start: (customerId: string, o?: { idempotencyKey?: string }) => http.post<any>('/comparisons', { customerId }, o),
  get: (id: string, opts?: { signal?: AbortSignal }) => http.get<any>(p`/comparisons/${id}`, undefined, opts),
  save: (id: string, body: { version: number; inputs?: any; options?: any[]; recommendedProductId?: string | null; recommendedReason?: string }) => http.put<any>(p`/comparisons/${id}`, body),
  preview: (id: string) => http.post<any>(p`/comparisons/${id}/preview`, {}),
  generate: (id: string, o?: { idempotencyKey?: string }) => http.post<any>(p`/comparisons/${id}/generate`, {}, o),
  share: (id: string, channel: string, o?: { idempotencyKey?: string }) => http.post(p`/comparisons/${id}/share`, { channel }, o),
  choose: (id: string, body: { version: number; productId: string; variantId?: string | null }, o?: { idempotencyKey?: string }) => http.post<any>(p`/comparisons/${id}/choose`, body, o),
  createQuotation: (id: string, body: { productId: string; variantId?: string }, o?: { idempotencyKey?: string }) => http.post<any>(p`/comparisons/${id}/create-quotation`, body, o),
};

export const admin = {
  acceptCorrection: (id: string) => http.post<any>(p`/admin/corrections/${id}/accept`, {}),
  rejectCorrection: (id: string, body: { reason: string }) => http.post<any>(p`/admin/corrections/${id}/reject`, body),
  resolveFlag: (id: string, body?: any) => http.post<any>(p`/admin/agent-code-flags/${id}/resolve`, body ?? {}),
  dashboard: (opts?: { signal?: AbortSignal }) => http.get<any>('/admin/dashboard', undefined, opts),
  approvals: (query: Record<string, string | undefined>, opts?: { signal?: AbortSignal }) => http.get<any>('/admin/approvals', query, opts),
  accounts: (query: Record<string, string | undefined>, opts?: { signal?: AbortSignal }) => http.get<any>('/admin/accounts', query, opts),
  account: (id: string, opts?: { signal?: AbortSignal }) => http.get<any>(p`/admin/accounts/${id}`, undefined, opts),
  approve: (id: string, body: { version: number }, o?: { idempotencyKey?: string }) => http.post<any>(p`/admin/approvals/${id}/approve`, body, o),
  reject: (id: string, body: { version: number; reason: string }, o?: { idempotencyKey?: string }) => http.post<any>(p`/admin/approvals/${id}/reject`, body, o),
  accountKyc: (id: string, opts?: { signal?: AbortSignal }) => http.get<any>(p`/admin/accounts/${id}/kyc`, undefined, opts),
  kycDecision: (accountId: string, body: { decision: 'VERIFY' | 'REJECT'; reason?: string }, o?: { idempotencyKey?: string }) => http.post<any>(p`/kyc/${accountId}/decision`, body, o),
  products: (query: Record<string, string | undefined>, opts?: { signal?: AbortSignal }) => http.get<any>('/admin/products', query, opts),
  product: (id: string, opts?: { signal?: AbortSignal }) => http.get<any>(p`/admin/products/${id}`, undefined, opts),
  templates: (query: Record<string, string | undefined>, opts?: { signal?: AbortSignal }) => http.get<any>('/admin/comms/templates', query, opts),
  flags: (opts?: { signal?: AbortSignal }) => http.get<any>('/admin/agent-code-flags', undefined, opts),
  corrections: (query: Record<string, string | undefined>, opts?: { signal?: AbortSignal }) => http.get<any>('/admin/corrections', query, opts),
  suspend: (id: string, body: { reason: string }, o?: { idempotencyKey?: string }) => http.post<any>(p`/admin/accounts/${id}/suspend`, body, o),
  offlinePayment: (id: string, body: { plan: string; cycle: string; amount: number; reference: string; startDate?: string }, o?: { idempotencyKey?: string }) => http.post<any>(p`/admin/accounts/${id}/offline-payment`, body, o),
  staff: (opts?: { signal?: AbortSignal }) => http.get<any>('/admin/staff', undefined, opts),
  config: (opts?: { signal?: AbortSignal }) => http.get<any>('/admin/config', undefined, opts),
  supportGrants: (opts?: { signal?: AbortSignal }) => http.get<any>('/admin/support-grants', undefined, opts),
};

export const integrations = {
  list: (opts?: { signal?: AbortSignal }) => http.get<any>('/integrations', undefined, opts),
  connect: (provider: string, body: any) => http.put<any>(p`/integrations/${provider}`, body),
  test: (provider: string) => http.post<any>(p`/integrations/${provider}/test`, {}),
  disconnect: (provider: string) => http.del(p`/integrations/${provider}`),
};
export const greetings = {
  get: (opts?: { signal?: AbortSignal }) => http.get<any>('/greetings', undefined, opts),
  save: (body: { on: boolean; templates?: Record<string, string>; excluded?: string[] }) => http.put<any>('/greetings', body),
};
export const messageRules = {
  list: (opts?: { signal?: AbortSignal }) => http.get<any>('/message-rules', undefined, opts),
  save: (trigger: string, body: any) => http.put<any>(p`/message-rules/${trigger}`, body),
};

export const profile = {
  get: (opts?: { signal?: AbortSignal }) => http.get<any>('/profile', undefined, opts),
  save: (section: string, body: any) => http.put<any>(p`/profile/${section}`, body),
};

export const search = {
  query: (q: string, type?: string, opts?: { signal?: AbortSignal }) => http.get<any>('/search', { q, type }, opts),
};

export const api = { payments, auth, tasks, dashboard, leads, pipelines, reference, customers, quotations, notifications, renewals, policies, proposals, products, campaigns, bestfit, profile, comparisons, integrations, messageRules, greetings, admin, kyc, sessions, audit, myInsurers, assistants, referrers, wallet, supportAccess, exportsApi, communications, documents, search };
