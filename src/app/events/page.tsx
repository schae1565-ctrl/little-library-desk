import { EmptyPanel, PageHeader } from "@/components/page-header";

export default function EventsPage() {
  return (
    <>
      <PageHeader title="행사 칸반" description="기획 → 준비 → 진행 → 완료 단계로 행사를 관리합니다." />
      <EmptyPanel>데이터 연동 전입니다. (M4에서 구현)</EmptyPanel>
    </>
  );
}
