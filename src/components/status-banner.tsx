/**
 * 데이터 상태 배너 자리 (PRD F6).
 * M5에서 소스별 최신 sync_logs를 읽어 실시간/캐시/데모 상태를 그린다.
 * 정상 상태에서는 아무것도 렌더링하지 않는다.
 */
export function StatusBanner() {
  return <div id="data-status-banner" />;
}

export type DataStatus = "live" | "cached" | "demo";

const BADGE_STYLE: Record<DataStatus, string> = {
  live: "bg-status-ok-bg text-status-ok",
  cached: "bg-status-warn-bg text-status-warn",
  demo: "bg-status-demo-bg text-status-demo",
};

const BADGE_LABEL: Record<DataStatus, string> = {
  live: "실시간",
  cached: "캐시",
  demo: "데모",
};

export function StatusBadge({ status }: { status: DataStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-medium ${BADGE_STYLE[status]}`}
    >
      {BADGE_LABEL[status]}
    </span>
  );
}
