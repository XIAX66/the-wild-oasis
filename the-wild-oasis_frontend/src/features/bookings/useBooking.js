import { useQuery } from "@tanstack/react-query";
import { getBookingById } from "../../lib/services/apiBookings";
import { useParams } from "react-router-dom";

export function useBooking() {
  const { bookingId } = useParams();

  const { data, isLoading, error } = useQuery({
    queryKey: ["booking", bookingId],
    queryFn: () => getBookingById(bookingId),
    retry: false,
  });

  const booking = data?.booking;

  return { isLoading, error, booking };
}
