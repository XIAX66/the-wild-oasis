import axios from "axios";
import { DEFALT_REQUEST_URL, DEVELOPMENT_URL_VERSION } from "../constants";
import { getCurrentUser } from "./apiAuth";

export async function getCabins() {
  try {
    const { access_token } = getCurrentUser();
    const {
      data: { data },
    } = await axios.get(
      `${DEFALT_REQUEST_URL}${DEVELOPMENT_URL_VERSION}/cabins`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );
    return data;
  } catch (error) {
    console.error(error);
    throw new Error("Error fetching cabins");
  }
}

// 更新API调用
export async function createCabin(formData) {
  try {
    const { data } = await axios.post(
      `${DEFALT_REQUEST_URL}${DEVELOPMENT_URL_VERSION}/cabins`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return data;
  } catch (error) {
    throw new Error("Error creating cabin");
  }
}

export async function updateCabin(id, formData) {
  try {
    const { data } = await axios.put(
      `${DEFALT_REQUEST_URL}${DEVELOPMENT_URL_VERSION}/cabins/${id}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return data;
  } catch (error) {
    throw new Error("Error updating cabin");
  }
}

export async function deleteCabin(id) {
  try {
    await axios.delete(
      `${DEFALT_REQUEST_URL}${DEVELOPMENT_URL_VERSION}/cabins/${id}`
    );
  } catch (error) {
    console.error(error);
    throw new Error("Error deleting cabin");
  }
}
