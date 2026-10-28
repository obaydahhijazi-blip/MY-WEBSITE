/** Shared structure for admin-only quotations and the private public-renderer gateway. */
export type QuoteLine = { _key: string; label: string; quantity: number; unitPrice: number };
export type CustomerQuote = {
  _id: string; _type: "customerQuote"; reference: string; title: string; clientName: string;
  clientCompany?: string; createdDate: string; validUntil?: string; currency: "USD"|"SYP"|"EUR";
  items: QuoteLine[]; discount: number; notes?: string; terms?: string; accent?: string;
  expired?: boolean; shareEnabled: boolean; shareToken: string; status: "draft"|"sent"|"accepted"|"revoked";
};
