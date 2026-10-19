import { EmptyPanel, PageHeader } from "@/components/page-header";

export default function DashboardPage() {
  return (
    <>
      <PageHeader title="대시보드" description="오늘 챙길 일과 예산 상태를 한 화면에서 확인합니다." />
      <EmptyPanel>데이터 연동 전입니다. (M6에서 구현)</EmptyPanel>
    </>
  );
}
