import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { getBookings } from "../../lib/services/apiBookings";

export function useRecentStays() {
  const [searchParams] = useSearchParams();

  const numDays = searchParams.get("last") || 7;

  const { isLoading, data: stays } = useQuery({
    queryFn: () => getBookings({ lastStays: numDays }),
    queryKey: ["stays", `last-${numDays}`],
  });

  return { isLoading, stays };
}
