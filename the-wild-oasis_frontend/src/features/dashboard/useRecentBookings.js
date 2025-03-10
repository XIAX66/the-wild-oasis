import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { getBookings } from "../../lib/services/apiBookings";

export function useRecentBookings() {
  const [searchParams] = useSearchParams();

  const numDays = searchParams.get("last") || 7;

  const { isLoading, data: bookings } = useQuery({
    queryFn: () => getBookings({ last: numDays }),
    queryKey: ["bookings", `last-${numDays}`],
  });

  return { isLoading, bookings, numDays };
}
