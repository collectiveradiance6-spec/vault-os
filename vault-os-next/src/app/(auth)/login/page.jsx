import { GlassPanel } from '@/components/ui/glass-panel';

export default function LoginPage() {
  return (
    <main className="screen">
      <div className="ambient" />
      <GlassPanel className="login-panel">
        <p className="eyebrow">Vault-OS // secure access</p>
        <h1>Authenticate Operator</h1>
        <p className="muted">TOTP and device trust are required for all operator sessions.</p>
      </GlassPanel>
    </main>
  );
}
