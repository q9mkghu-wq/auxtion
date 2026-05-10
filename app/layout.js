import Link from "next/link";

export const metadata = {
  title: "경매 알림 앱",
  description: "법원경매 / 온비드 공매 알림 서비스",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body style={{ margin: 0, padding: 0, background: "#f8fafc" }}>
        <nav style={{
          background: "#fff", borderBottom: "1px solid #eee",
          padding: "0 24px", height: 52, display: "flex",
          alignItems: "center", gap: 24, position: "sticky", top: 0, zIndex: 100
        }}>
          <Link href="/" style={{ fontWeight: 700, fontSize: 16, color: "#1976D2", textDecoration: "none" }}>
            🏠 경매알림
          </Link>
          <Link href="/court" style={{ fontSize: 14, color: "#444", textDecoration: "none" }}>
            법원경매
          </Link>
          <Link href="/alert" style={{ fontSize: 14, color: "#444", textDecoration: "none" }}>
            🔔 알림설정
          </Link>
        </nav>
        {children}
      </body>
    </html>
  );
}
