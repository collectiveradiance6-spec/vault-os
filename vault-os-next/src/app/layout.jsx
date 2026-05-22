import '../styles/globals.css';

export const metadata = {
  title: 'Vault-OS',
  description: 'Living classified operating system interface'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
