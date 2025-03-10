import { useCabins } from "./useCabins";
import Spinner from "../../lib/ui/Spinner";
import CabinRow from "./CabinRow";
import Table from "../../lib/ui/Table";
import Menus from "../../lib/ui/Menus";
import { useSearchParams } from "react-router-dom";
import Empty from "../../lib/ui/Empty";

function CabinTable() {
  const { isLoading, data } = useCabins();
  const [searchParams] = useSearchParams();

  const cabins = data?.cabins;

  if (isLoading) return <Spinner />;
  if (!cabins.length) return <Empty resourceName="cabins" />;

  // 1) Filter
  const filterValue = searchParams.get("discount") || "all";

  let filterdCabins;
  if (filterValue === "all") filterdCabins = cabins;
  if (filterValue === "no-discount")
    filterdCabins = cabins.filter((cabin) => cabin.discount === 0);
  if (filterValue === "with-discount")
    filterdCabins = cabins.filter((cabin) => cabin.discount > 0);

  // 2) Sort
  const sortBy = searchParams.get("sortBy") || "name-asc";
  const [field, direction] = sortBy.split("-");
  const sortedCabins = filterdCabins.sort((a, b) =>
    direction === "asc" ? a[field] - b[field] : b[field] - a[field]
  );

  return (
    <Menus>
      <Table columns="0.6fr 1.8fr 2.2fr 1fr 1fr 1fr">
        <Table.Header>
          <div></div>
          <div>Cabin</div>
          <div>Capacity</div>
          <div>Price</div>
          <div>Discount</div>
          <div></div>
        </Table.Header>
        <Table.Body
          data={sortedCabins}
          render={(cabin) => <CabinRow key={cabin._id} cabin={cabin} />}
        />
      </Table>
    </Menus>
  );
}

// We could create yet another layer of abstraction on top of this. We could call this component just <Results>, like: Results({data, count, isLoading, columns, rowComponent}). Then <CabinTable> and ALL other tables would simply call that.
// BUT, creating more abstractions also has a cost! More things to remember, more complex codebase to understand. Sometimes it's okay to just copy and paste instead of creating abstractions

export default CabinTable;
