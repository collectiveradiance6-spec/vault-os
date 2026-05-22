export function OvershellLayer() {
  return (
    <div className="overshell" aria-hidden="true">
      <div className="overshell__entity" />
      <div className="overshell__rail overshell__rail--top" />
      <div className="overshell__rail overshell__rail--bottom" />
    </div>
  );
}
