import { useMutation, useQueryClient } from "@tanstack/react-query";
import { login as LoginApi } from "../../lib/services/apiAuth";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export function useLogin() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { mutate: login, isLoading } = useMutation({
    mutationFn: ({ email, password }) => LoginApi({ email, password }),

    onSuccess: (user) => {
      queryClient.setQueryData(["user"], user);
      toast.success("Welcome back!");
      navigate("/dashboard", { replace: true });
    },

    onError: (error) => {
      console.error("ERROR", error);
      toast.error("Privided email or password is incorrect");
      throw new Error("Error logging in");
    },
  });

  return { login, isLoading };
}
