import { toast } from "react-toastify";
import { DataResponseType } from "../types/api-response.type";
import http from "../utils/https";

export const ApiService = <T>(endpoint: string) => {
  const getListData = <G>(
    page: number | string,
    pageSize: number | string,
    keySearch: string = "",
    valueSearch: string = "",
    keySearchSecond: string = "",
    valueSearchSecond: string = "",
    signal?: AbortSignal
  ) =>
    http
      .get<DataResponseType<G>>(endpoint, {
        params: {
          page,
          pageSize,
          [keySearch]: valueSearch,
          [keySearchSecond]: valueSearchSecond,
        },
        signal,
      })
      .then((response) => response.data.data);

  const getDetailData = (id: number | string) =>
    http
      .get<DataResponseType<T>>(`${endpoint}/${id}`)
      .then((response) => response.data.data);

  const addData = (value: Omit<T, "id">) =>
    http
      .post<DataResponseType<T>>(endpoint, value)
      .then((response) => response.data.data)
      .catch((error) => {
        toast.error(error.response.data.message);
        return null as T;
      });

  const updateData = (value: T) =>
    http
      .put<DataResponseType<T>>(endpoint, value)
      .then((response) => response.data.data)
      .catch((error) => {
        toast.error(error.response.data.message);
        return null as T;
      });

  const deleteData = (id: number | string) =>
    http.delete<{}>(`${endpoint}/${id}`).then((response) => response.data);

  return { getListData, getDetailData, addData, updateData, deleteData };
};
