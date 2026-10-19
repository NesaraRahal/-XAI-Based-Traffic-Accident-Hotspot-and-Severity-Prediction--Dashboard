import { fetchUsers } from "../api/auth";
import { useAsync } from "./useAsync";

const EMPTY = [];

/** Account list for the admin panel (only fetched for admins). */
export function useUsers(enabled) {
  const { data, loading, error, reload } = useAsync(fetchUsers, [], enabled);
  return { users: data || EMPTY, loading, error, reload };
}
