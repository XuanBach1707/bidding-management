import { Metadata } from 'next';
import { BiddingChatPage } from '@/pages/bidding-chat';

export const metadata: Metadata = {
  title: 'Trợ lý AI Đấu Thầu | Smart Bidding',
  description: 'Tra cứu thông tin đấu thầu nhanh chóng với trợ lý ảo AI.',
};

export default function Page() {
  return <BiddingChatPage />;
}