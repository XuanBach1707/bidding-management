import { OpportunityDetailPage } from "@/pages/opportunity-detail";

interface PageProps {
  params: {
    id: string;
  };
}

export default function Page({ params }: PageProps) {
  // Pass ID xuống cho Page thực tế xử lý
  return <OpportunityDetailPage id={params.id} />;
}