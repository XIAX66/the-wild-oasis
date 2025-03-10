import { HiArrowRightOnRectangle } from "react-icons/hi2";
import ButtonIcon from "../../lib/ui/ButtonIcon";
import { useLogout } from "./useLogout";
import SpinnerMini from "../../lib/ui/SpinnerMini";

function Logout() {
  const { logout, isLoading } = useLogout();

  return (
    <ButtonIcon onClick={logout} disabled={isLoading}>
      {isLoading ? <SpinnerMini /> : <HiArrowRightOnRectangle />}
    </ButtonIcon>
  );
}

export default Logout;
