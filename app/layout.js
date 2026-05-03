export const metadata = {
  title: "auxtion",
  description: "auction alert app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
