import ProgressResultView from "@/modules/progress/results-view";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProgressDetailPage({ params }: PageProps) {
  const { id } = await params;

  return <ProgressResultView drillId={id} />;
}
