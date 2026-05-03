export const metadata = {
  title: "경매 알림 앱",
  description: "법원경매 / 온비드 공매 알림 서비스",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body
        style={{
          margin: 0,
          padding: 0,
          background: "#f8fafc",
        }}
      >
        {children}
      </body>
    </html>
  );
}
