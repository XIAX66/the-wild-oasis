import { getCurrentUser } from "../../lib/services/apiAuth";

export function useUser() {
  return getCurrentUser();
}
