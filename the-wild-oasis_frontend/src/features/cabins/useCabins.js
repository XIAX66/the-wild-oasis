import { useQuery } from "@tanstack/react-query";
import { getCabins } from "../../lib/services/apiCabins";

export function useCabins() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["cabins"],
    queryFn: getCabins,
  });

  return { isLoading, error, data };
}
