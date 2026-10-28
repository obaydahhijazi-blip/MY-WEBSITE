import { definePlugin } from "sanity";
import { DocumentTextIcon } from "@sanity/icons/DocumentText";
import { QuoteManager } from "./QuoteManager";

export const quotesTool=definePlugin({
  name:"obaydah-private-quotes",
  tools:[{name:"quotes",title:"عروض الأسعار",icon:DocumentTextIcon,component:QuoteManager}],
});
