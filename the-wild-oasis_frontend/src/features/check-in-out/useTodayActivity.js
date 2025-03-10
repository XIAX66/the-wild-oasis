import { useQuery } from "@tanstack/react-query";
import { getBookings } from "../../lib/services/apiBookings";

export function useTodayActivity() {
  const numDays = 0;

  const { isLoading, data: activities } = useQuery({
    queryFn: () => getBookings({ lastStays: numDays }),
    queryKey: ["today-activity"],
  });

  return { activities, isLoading };
}
