import { useEffect, useState } from "react";
import { fetchDivisions } from "../api/cells";

export function useDivisions() {
  const [divisions, setDivisions] = useState([]);
  useEffect(() => {
    fetchDivisions().then(setDivisions).catch(() => setDivisions([]));
  }, []);
  return divisions;
}