import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createCabin,
  deleteCabin as DeleteCabinApi,
  updateCabin,
} from "../../lib/services/apiCabins";
import toast from "react-hot-toast";

export function useDeleteCabin() {
  const queryClient = useQueryClient();

  const { isLoading: isDeleting, mutate: deleteCabin } = useMutation({
    mutationFn: (id) => DeleteCabinApi(id),
    onSuccess: () => {
      toast.success("Cabin deleted successfully");
      queryClient.invalidateQueries({
        queryKey: ["cabins"],
      });
    },
    onError: (err) => toast.error(err.message),
  });
  return { isDeleting, deleteCabin };
}

export function useCreateCabin() {
  const queryClient = useQueryClient();
  const { mutate: createCabinByMutate, isLoading: isCreating } = useMutation({
    mutationFn: createCabin,
    onSuccess: () => {
      toast.success("New cabin successfully created");

      queryClient.invalidateQueries({
        queryKey: ["cabins"],
      });
    },
    onError: () => {
      toast.error("Error creating cabin");
    },
  });

  return { isCreating, createCabinByMutate };
}

export function useUpdateCabin() {
  const queryClient = useQueryClient();

  const { mutate: updateCabinByMutate, isLoading: isUpdating } = useMutation({
    mutationFn: ({ id, newCabinData }) => updateCabin(id, newCabinData),
    onSuccess: () => {
      toast.success("Cabin successfully updated");

      queryClient.invalidateQueries({
        queryKey: ["cabins"],
      });
    },
    onError: () => {
      toast.error("Error updating cabin");
    },
  });

  return { isUpdating, updateCabinByMutate };
}
