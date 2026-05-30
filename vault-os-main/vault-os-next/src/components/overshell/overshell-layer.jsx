export function OvershellLayer() {
  return (
    <div className="overshell" aria-hidden="true">
      <div className="overshell__entity" />
      <div className="overshell__rail overshell__rail--top" />
      <div className="overshell__rail overshell__rail--bottom" />
      <div className="overshell__corner overshell__corner--tl" />
      <div className="overshell__corner overshell__corner--tr" />
      <div className="overshell__corner overshell__corner--bl" />
      <div className="overshell__corner overshell__corner--br" />
    </div>
  );
}
