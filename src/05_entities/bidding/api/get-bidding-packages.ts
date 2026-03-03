import { http } from "@/shared/api/";
import type { 
  GetBiddingPackagesParams, 
  BiddingPackageListResponse 
} from "../model/types";

export const getBiddingPackages = async (
  params?: GetBiddingPackagesParams
): Promise<BiddingPackageListResponse> => {
  const url = "/bidding-packages/";
  return http.get<any, BiddingPackageListResponse>(url, { params });
};

export const getPendingReviewPackages = async (
  params?: GetBiddingPackagesParams
): Promise<BiddingPackageListResponse> => {
  const url = "/bidding-packages/status/pending-review";
  return http.get<any, BiddingPackageListResponse>(url, { params });
};