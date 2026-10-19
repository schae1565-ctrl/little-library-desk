import { EmptyPanel, PageHeader } from "@/components/page-header";

export default function SettingsPage() {
  return (
    <>
      <PageHeader title="설정" description="도서관 정보, 총예산, 카테고리, 키워드, 운영위원 명단을 관리합니다." />
      <EmptyPanel>데이터 연동 전입니다. (M2 이후 구현)</EmptyPanel>
    </>
  );
}
