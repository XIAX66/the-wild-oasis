import { useMutation, useQueryClient } from "@tanstack/react-query";
import { signup as SignupApi } from "../../lib/services/apiAuth";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export function useSignup() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { mutate: signup, isLoading } = useMutation({
    mutationFn: ({ name, email, password, passwordConfirm }) =>
      SignupApi({ name, email, password, passwordConfirm }),

    onSuccess: (user) => {
      queryClient.setQueryData(["user"], user);
      toast.success("Account created successfully");
      navigate("/dashboard", { replace: true });
    },

    onError: (error) => {
      console.error("ERROR", error);
      toast.error("Privided email or password is incorrect");
      throw new Error("Error logging in");
    },
  });

  return { signup, isLoading };
}
