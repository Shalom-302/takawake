import axiosClient from "./axios-client";
import { AxiosRequestConfig } from "axios";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";


export const requester = <TData = any>(method: HttpMethod, axiosConfig?: AxiosRequestConfig) => {
    return async <TArg = any>(
        url: string,
        options?: { arg?: TArg } // 👈 optionnel maintenant
    ): Promise<TData> => {
        const arg = options?.arg;

        const methodsWithBody = ["POST", "PUT", "PATCH"];
        const response = await axiosClient.request<TData>({
            method,
            url,
            ...(methodsWithBody.includes(method) && { data: arg }),
            ...(axiosConfig || {}),
        });

        return response.data;
    };
};