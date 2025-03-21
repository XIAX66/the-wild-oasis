import styled from "styled-components";

import DurationChart from "./DurationChart";
import SalesChart from "./SalesChart";
import Stats from "./Stats";
import TodayActivity from "../check-in-out/TodayActivity";
import { useRecentBookings } from "./useRecentBookings";
import Spinner from "../../lib/ui/Spinner";
import { useRecentStays } from "./useRecentStays";
import { useCabins } from "../cabins/useCabins";

const StyledDashboardLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  grid-template-rows: auto 34rem auto;
  gap: 2.4rem;
`;

/*
We need to distinguish between two types of data here:
1) BOOKINGS: the actual sales. For example, in the last 30 days, the hotel might have sold 10 bookings online, but these guests might only arrive and check in in the far future (or not, as booking also happen on-site)
2) STAYS: the actual check-in of guests arriving for their bookings. We can identify stays by their startDate, together with a status of either 'checked-in' (for current stays) or 'checked-out' (for past stays)
*/

function DashboardLayout() {
  const { isLoading: isLoading1, bookings, numDays } = useRecentBookings();
  const { isLoading: isLoading2, stays } = useRecentStays();
  const { isLoading: isLoading3, data } = useCabins();
  if (isLoading1 || isLoading2 || isLoading3) return <Spinner />;
  console.log("bookings", bookings.bookings);
  console.log("stays", stays.bookings);
  console.log("cabins", data.cabins);

  return (
    <StyledDashboardLayout>
      <Stats
        bookings={bookings.bookings}
        confirmedStays={stays.bookings.filter(
          (stay) =>
            stay.status === "checked-in" || stay.status === "checked-out"
        )}
        numDays={numDays}
        cabinCount={data.cabins.length}
      />

      <TodayActivity />
      <DurationChart
        confirmedStays={stays.bookings.filter(
          (stay) =>
            stay.status === "checked-in" || stay.status === "checked-out"
        )}
      />
      <SalesChart bookings={bookings.bookings} numDays={numDays} />
    </StyledDashboardLayout>
  );
}

export default DashboardLayout;
