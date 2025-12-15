// src/entities/bidding/api/get-bidding-packages.ts
import { http } from "@/shared/api/"; // Đường dẫn tới file interceptor bạn gửi
import type { 
  GetBiddingPackagesParams, 
  BiddingPackageListResponse 
} from "../model/types";

export const getBiddingPackages = async (
  params?: GetBiddingPackagesParams
): Promise<BiddingPackageListResponse> => {
  // URL endpoint
  const url = "/bidding-packages/";
  
  // Gọi GET, truyền params
  // Interceptor sẽ lo việc mapping data response về camelCase
  return http.get<any, BiddingPackageListResponse>(url, { params });
};