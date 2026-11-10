import { http } from "@/utils/http";

type Result = {
  code: number;
  data: Array<any>;
};

export const getAsyncRoutes = () => {
  return http.request<Result>("get", "/getAsyncRoutes");
};
