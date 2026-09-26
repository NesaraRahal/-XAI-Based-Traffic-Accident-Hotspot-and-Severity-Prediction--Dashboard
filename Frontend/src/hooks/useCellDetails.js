import { fetchCellDetails } from "../api/cells";
import { useAsync } from "./useAsync";

export function useCellDetails(h3Cell, yearMonth) {
  const { data, loading, error, fresh, reload } = useAsync(
    fetchCellDetails,
    [h3Cell, yearMonth],
    Boolean(h3Cell && yearMonth)
  );
  return { details: fresh ? data : null, loading, error, reload };
}
