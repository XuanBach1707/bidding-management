import { BiddingProjectDetailPage } from "@/pages/bidding-projects"; // <-- Kiểm tra đường dẫn import này trúng file index của FSD chưa

interface PageProps {
  params: Promise<{ id: string }>;
}

// Next.js sẽ nhận diện đây là Server Component mặc định, 
// nhưng bên trong BiddingProjectDetailPage của bạn đã có "use client" nên vẫn chạy tốt.
export default async function Page({ params }: PageProps) {
  // Chuyển tiếp params vào trang chính trong src
  return <BiddingProjectDetailPage params={params} />;
}