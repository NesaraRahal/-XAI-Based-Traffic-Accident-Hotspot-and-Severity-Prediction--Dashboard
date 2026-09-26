import { fetchDivisions } from "../api/cells";
import { useAsync } from "./useAsync";

const EMPTY = [];

export function useDivisions() {
  const { data } = useAsync(fetchDivisions, []);
  return data || EMPTY;
}
