// src/entities/bidding/api/get-files.ts
import { http } from "@/shared/api/"; // Đường dẫn tới file interceptor bạn gửi
import type { BiddingPackageFilesResponse } from "../model/types";

export const getBiddingPackageFiles = async (
  hsmtId: number | string
): Promise<BiddingPackageFilesResponse> => {
  return http.get<any, BiddingPackageFilesResponse>(`/bidding-packages/${hsmtId}/files`);
};