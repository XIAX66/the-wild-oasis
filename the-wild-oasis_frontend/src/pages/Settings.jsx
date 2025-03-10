import UpdateSettingsForm from "../features/settings/UpdateSettingsForm";
import Heading from "../lib/ui/Heading";
import Row from "../lib/ui/Row";

function Settings() {
  return (
    <Row>
      <Heading as="h1">Update hotel settings</Heading>
      <UpdateSettingsForm />
    </Row>
  );
}

export default Settings;
