import { http } from '@/shared/api'; // Import instance của bạn
import { BiddingResultSummary, BiddingResultFull } from '../model/types';

export const biddingResultApi = {
  getSummary: async (hsmtId: number): Promise<BiddingResultSummary> => {
    // Axios response interceptor sẽ trả về data đã camelCase
    return await http.get(`/bidding-packages/${hsmtId}/result-summary`);
  },

  getFull: async (hsmtId: number): Promise<BiddingResultFull> => {
    return await http.get(`/bidding-packages/${hsmtId}/result-full`);
  }
};