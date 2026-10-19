import { EmptyPanel, PageHeader } from "@/components/page-header";

export default function BudgetPage() {
  return (
    <>
      <PageHeader title="예산 트래커" description="지출을 입력하면 잔액과 분기 보고가 바로 맞춰집니다." />
      <EmptyPanel>데이터 연동 전입니다. (M3에서 구현)</EmptyPanel>
    </>
  );
}
