import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateSetting } from "../../lib/services/apiSettings";
import toast from "react-hot-toast";

export function useUpdateSetting() {
  const queryClient = useQueryClient();

  const { isLoading: isUpdating, mutate: updateSettingByMutate } = useMutation({
    mutationFn: ({ id, newSettingData }) => {
      updateSetting(id, newSettingData);
    },
    onSuccess: () => {
      toast.success("Setting updated successfully");
      queryClient.invalidateQueries({
        queryKey: ["settings"],
      });
    },
    onError: (err) => toast.error(err.message),
  });
  return { isUpdating, updateSettingByMutate };
}
