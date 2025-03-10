import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateBooking } from "../../lib/services/apiBookings";
import { toast } from "react-hot-toast";
import { bookingIdToName } from "../../utils/helpers";

export function useCheckout() {
  const queryClient = useQueryClient();

  const { mutate: checkout, isLoading: isCheckingOut } = useMutation({
    mutationFn: (bookingId) =>
      updateBooking(bookingId, {
        status: "checked-out",
      }),

    onSuccess: (data) => {
      const booking = data?.booking;
      toast.success(
        `Booking ${bookingIdToName(booking._id)} successfully checked out`
      );
      queryClient.invalidateQueries({ active: true });
    },

    onError: () => toast.error("There was an error while checking out"),
  });

  return { checkout, isCheckingOut };
}
