import axios from "axios";
import { DEFALT_REQUEST_URL, DEVELOPMENT_URL_VERSION } from "../constants";
import { getCurrentUser } from "./apiAuth";

export async function getBookings({ filter, sortBy, page, last, lastStays }) {
  try {
    const queries = [];
    if (filter) queries.push(`status=${filter.value}`);
    if (sortBy) queries.push(`sortBy=${sortBy.field}-${sortBy.direction}`);
    if (page) queries.push(`page=${page.value}`);
    if (last) queries.push(`last=${last}`);
    if (lastStays) queries.push(`lastStays=${lastStays}`);
    const query = queries.join("&");
    const { access_token } = getCurrentUser();

    const {
      data: { data },
    } = await axios.get(
      `${DEFALT_REQUEST_URL}${DEVELOPMENT_URL_VERSION}/bookings${
        query ? `?${query}` : ""
      }`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    return data;
  } catch (error) {
    console.error(error);
    throw new Error("Error fetching bookings");
  }
}

export async function getBookingById(id) {
  try {
    const { access_token } = getCurrentUser();

    const {
      data: { data },
    } = await axios.get(
      `${DEFALT_REQUEST_URL}${DEVELOPMENT_URL_VERSION}/bookings/${id}`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    return data;
  } catch (error) {
    console.error(error);
    throw new Error("Error fetching booking");
  }
}

export async function updateBooking(id, booking) {
  try {
    const { access_token } = getCurrentUser();

    const {
      data: { data },
    } = await axios.patch(
      `${DEFALT_REQUEST_URL}${DEVELOPMENT_URL_VERSION}/bookings/${id}`,
      booking,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );
    return data;
  } catch (error) {
    console.error(error);
    throw new Error("Error updating booking");
  }
}

export async function deleteBooking(id) {
  const { access_token } = getCurrentUser();

  try {
    const {
      data: { data },
    } = await axios.delete(
      `${DEFALT_REQUEST_URL}${DEVELOPMENT_URL_VERSION}/bookings/${id}`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );
    return data;
  } catch (error) {
    console.error(error);
    throw new Error("Error deleting booking");
  }
}
