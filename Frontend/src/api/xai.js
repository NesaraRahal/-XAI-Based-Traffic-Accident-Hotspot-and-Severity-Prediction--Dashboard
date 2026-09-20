import { api } from "./client";

export async function fetchXai(h3Cell, yearMonth) {
  const { data } = await api.get(`/xai/${h3Cell}`, {
    params: { year_month: yearMonth },
  });
  return data;
}