import '../styles/globals.css';
import { OvershellLayer } from '../components/overshell/overshell-layer';

export const metadata = { title: 'Vault OS', description: 'Secure Admin Runtime' };

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="dark">
      <body>
        <OvershellLayer />
        {children}
      </body>
    </html>
  );
}
