import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getBookings } from "../../lib/services/apiBookings";
import { useSearchParams } from "react-router-dom";

export function useBookings() {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();

  // FILTER
  const filterValue = searchParams.get("status") || "all";
  const filter =
    !filterValue || filterValue === "all"
      ? null
      : { field: "status", value: filterValue };

  // SORT
  const sortByRow = searchParams.get("sortBy") || "startDate-desc";
  const [field, direction] = sortByRow.split("-");
  const sortBy = { field, direction };

  // PAGE
  const curPage = +searchParams.get("page") || 1;
  const page = { field: "page", value: curPage };
  const nextPage = { field: "page", value: curPage + 1 };
  const prevPage = { field: "page", value: curPage - 1 };

  const { data, isLoading, error } = useQuery({
    queryKey: ["bookings", filter, sortBy, page],
    queryFn: () => getBookings({ filter, sortBy, page }),
  });

  // PREFETCH
  queryClient.prefetchQuery({
    queryKey: ["bookings", filter, sortBy, nextPage],
    queryFn: () => getBookings({ filter, sortBy, page: nextPage }),
  });

  queryClient.prefetchQuery({
    queryKey: ["bookings", filter, sortBy, prevPage],
    queryFn: () => getBookings({ filter, sortBy, page: prevPage }),
  });

  const bookings = data?.bookings || [];
  const count = data?.total || 0;
  return { isLoading, error, bookings, count };
}
