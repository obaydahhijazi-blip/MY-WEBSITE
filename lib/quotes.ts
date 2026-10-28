import "server-only";
import { createClient } from "next-sanity";
import { apiVersion, projectId, dataset as websiteDataset } from "@/sanity/env";

import type { CustomerQuote } from "@/lib/quotes-types";
export const calculateQuote = (q: Pick<CustomerQuote,"items"|"discount">) => {
  const subtotal = q.items.reduce((sum,i) => sum + Math.max(0,i.quantity || 0)*Math.max(0,i.unitPrice || 0),0);
  const discountValue = subtotal * Math.max(0,Math.min(100,q.discount||0)) / 100;
  return {subtotal, discountValue, total:subtotal-discountValue};
};

/** Private dataset must be separate from the public marketing-content dataset. */
export async function getSharedQuote(token: string): Promise<CustomerQuote | null> {
  const privateDataset = process.env.SANITY_QUOTES_DATASET || process.env.NEXT_PUBLIC_SANITY_QUOTES_DATASET || "";
  const apiToken = process.env.SANITY_API_READ_TOKEN || "";
  if (!projectId || !apiToken || !privateDataset || privateDataset === websiteDataset
    || !/^[a-z0-9]{48,96}$/i.test(token)) return null;
  const client = createClient({projectId,dataset:privateDataset,apiVersion,token:apiToken,useCdn:false,perspective:"published"});
  const raw = await client.fetch<CustomerQuote | null>(
    '*[_type=="customerQuote" && shareToken==$token && shareEnabled==true && status in ["sent","accepted"]][0]{_id,_type,reference,title,clientName,clientCompany,createdDate,validUntil,currency,items[]{_key,label,quantity,unitPrice},discount,notes,terms,accent,shareEnabled,shareToken,status}',
    {token},
  );
  if (!raw || !Array.isArray(raw.items) || !raw.clientName || raw.items.length > 60
    || raw.items.some(i => !Number.isFinite(i.quantity)||!Number.isFinite(i.unitPrice) ||i.quantity<0||i.unitPrice<0)) return null;
  return raw;
}
