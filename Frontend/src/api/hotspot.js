import { api } from "./client";

export async function fetchHotspots({ yearMonth, policeDivision, limit } = {}) {
  const params = {};
  if (yearMonth) params.year_month = yearMonth;
  if (policeDivision) params.police_division = policeDivision;
  if (limit) params.limit = limit;
  const { data } = await api.get("/hotspots", { params });
  return data;
}