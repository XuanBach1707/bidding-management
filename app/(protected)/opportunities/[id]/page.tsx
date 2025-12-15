import { OpportunityDetailPage } from "@/pages/opportunity-detail"; // <-- Kiểm tra đường dẫn import này trúng file index của FSD chưa

// Next.js 15/16 yêu cầu params là Promise
interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  // BẮT BUỘC: Phải await params trước khi lấy id
  const { id } = await params;

  // Truyền ID xuống cho UI xử lý
  return <OpportunityDetailPage id={id} />;
}