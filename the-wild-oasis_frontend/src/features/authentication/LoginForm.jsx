import { useState } from "react";
import Button from "../../lib/ui/Button";
import Form from "../../lib/ui/Form";
import FormRow from "../../lib/ui/FormRow";
import Input from "../../lib/ui/Input";
import { useLogin } from "./useLogin";
import SpinnerMini from "../../lib/ui/SpinnerMini";

function LoginForm() {
  const [email, setEmail] = useState("xiax@example.com");
  const [password, setPassword] = useState("123123");
  const { login, isLoading } = useLogin();

  function handleSubmit(e) {
    e.preventDefault();
    if (!email || !password) {
      return;
    }

    login(
      { email, password },
      {
        onSettled: () => {
          setEmail("");
          setPassword("");
        },
      }
    );
  }

  return (
    <Form onSubmit={handleSubmit}>
      <FormRow label="Email address" orientation="vertical">
        <Input
          type="email"
          id="email"
          // This makes this form better for password managers
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
        />
      </FormRow>
      <FormRow label="Password" orientation="vertical">
        <Input
          type="password"
          id="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
        />
      </FormRow>
      <FormRow orientation="vertical">
        <Button size="large">{isLoading ? <SpinnerMini /> : "Log in"}</Button>
      </FormRow>
    </Form>
  );
}

export default LoginForm;
