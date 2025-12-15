interface Props {
  id: string;
}

export const OpportunityDetailPage = ({ id }: Props) => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-slate-900">
        Chi tiết gói thầu (ID: {id})
      </h1>
      <div className="mt-4 p-4 border border-dashed rounded bg-slate-50 text-slate-500">
        Nội dung chi tiết sẽ được phát triển tại đây...
      </div>
    </div>
  );
};