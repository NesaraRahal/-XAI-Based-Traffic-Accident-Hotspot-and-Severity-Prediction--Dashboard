import { fetchCells } from "../api/cells";
import { useAsync } from "./useAsync";

const EMPTY = [];

export function useCells(yearMonth, policeDivision) {
  const { data, loading, error, fresh, reload } = useAsync(
    fetchCellsArgs,
    [yearMonth, policeDivision || null],
    Boolean(yearMonth)
  );
  return { cells: data || EMPTY, loading, error, fresh, reload };
}

function fetchCellsArgs(yearMonth, policeDivision) {
  return fetchCells({ yearMonth, policeDivision });
}
