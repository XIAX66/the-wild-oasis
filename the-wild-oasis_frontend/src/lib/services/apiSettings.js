import axios from "axios";
import {
  DEFALT_REQUEST_URL,
  DEVELOPMENT_URL_VERSION,
} from "../constants/index";
import { getCurrentUser } from "./apiAuth";

export async function getSettings() {
  const { access_token } = getCurrentUser();

  try {
    const {
      data: { data },
    } = await axios.get(
      `${DEFALT_REQUEST_URL}${DEVELOPMENT_URL_VERSION}/settings`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );
    return data.settings[0];
  } catch (error) {
    console.error(error);
    throw new Error("Error fetching settings");
  }
}

export async function updateSetting(id, formData) {
  const { access_token } = getCurrentUser();

  try {
    const { data } = await axios.patch(
      `${DEFALT_REQUEST_URL}${DEVELOPMENT_URL_VERSION}/settings/${id}`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );
    return data;
  } catch (error) {
    throw new Error("Error updating setting");
  }
}
