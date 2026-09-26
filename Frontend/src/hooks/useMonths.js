import { fetchMonths } from "../api/cells";
import { useAsync } from "./useAsync";

const EMPTY = [];

export function useMonths() {
  const { data, loading, error, reload } = useAsync(fetchMonths, []);
  return { months: data || EMPTY, loading, error, reload };
}
