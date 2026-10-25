import { definePlugin } from "sanity";
import { BarChartIcon } from "@sanity/icons/BarChart";
import { StatsTool } from "./StatsTool";

export const statsTool = definePlugin({
  name: "obaydah-stats",
  tools: [{ name: "stats", title: "الإحصائيات", icon: BarChartIcon, component: StatsTool }],
});
