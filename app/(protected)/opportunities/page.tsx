import { OpportunityDetailPage } from "@/pages/opportunity-detail";

interface PageProps {
  params: {
    id: string;
  };
}

export default function Page({ params }: PageProps) {
  return <OpportunityDetailPage id={params.id} />;
}