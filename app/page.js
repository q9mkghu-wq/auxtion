import Link from "next/link";

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(180deg, #eff6ff 0%, #ffffff 50%, #f8fafc 100%)",
        padding: "24px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "720px",
          background: "#ffffff",
          border: "1px solid #e5e7eb",
          borderRadius: "24px",
          padding: "36px 28px",
          boxShadow: "0 20px 50px rgba(15, 23, 42, 0.08)",
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "inline-block",
            padding: "8px 14px",
            borderRadius: "999px",
            background: "#dbeafe",
            color: "#1d4ed8",
            fontWeight: 700,
            fontSize: "13px",
            marginBottom: "18px",
          }}
        >
          AUXTION
        </div>

        <h1
          style={{
            margin: 0,
            fontSize: "36px",
            lineHeight: 1.25,
            color: "#0f172a",
            fontWeight: 800,
          }}
        >
          법원경매 데이터를
          <br />
          바로 확인해보세요
        </h1>

        <p
          style={{
            marginTop: "14px",
            marginBottom: "28px",
            fontSize: "16px",
            lineHeight: 1.7,
            color: "#475569",
          }}
        >
          지역 검색과 페이지 이동이 되는
          법원경매 테스트 화면으로 바로 들어갈 수 있어요.
        </p>

        <div
          style={{
            display: "flex",
            gap: "12px",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <Link
            href="/court"
            style={{
              textDecoration: "none",
              border: "none",
              background: "#2563eb",
              color: "#ffffff",
              padding: "14px 20px",
              borderRadius: "12px",
              fontWeight: 700,
              display: "inline-block",
            }}
          >
            법원경매 보기
          </Link>

          <Link
            href="/profile"
            style={{
              textDecoration: "none",
              background: "#f8fafc",
              color: "#0f172a",
              padding: "14px 20px",
              borderRadius: "12px",
              fontWeight: 700,
              border: "1px solid #cbd5e1",
              display: "inline-block",
            }}
          >
            내 프로필
          </Link>
        </div>
      </div>
    </main>
  );
}
