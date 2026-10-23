import { DrillResultsView } from "@/modules/speak/results-view";

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = await params;

  return <DrillResultsView jobId={jobId} />;
}
