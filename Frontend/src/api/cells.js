import { api } from "./client";

export async function fetchCells({ yearMonth, policeDivision } = {}) {
  const params = {};
  if (yearMonth) params.year_month = yearMonth;
  if (policeDivision) params.police_division = policeDivision;
  const { data } = await api.get("/cells", { params });
  return data;
}

export async function fetchCellDetails(h3Cell, yearMonth) {
  const { data } = await api.get(`/cells/${h3Cell}`, {
    params: { year_month: yearMonth },
  });
  return data;
}

export async function fetchMonths() {
  const { data } = await api.get("/cells/months");
  return data;
}

export async function fetchDivisions() {
  const { data } = await api.get("/cells/divisions");
  return data;
}