import { EmptyPanel, PageHeader } from "@/components/page-header";

export default function GrantsPage() {
  return (
    <>
      <PageHeader title="지원사업 알림" description="작은도서관 관련 지원사업 공고를 자동으로 모아 보여줍니다." />
      <EmptyPanel>데이터 연동 전입니다. (M5·M6에서 구현)</EmptyPanel>
    </>
  );
}
