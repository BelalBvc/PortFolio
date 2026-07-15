interface CalloutProps {
  type?: 'info' | 'warn' | 'tip'
  title?: string
  children: React.ReactNode
}

const STYLES = {
  info: { border: '#00E5FF', bg: 'rgba(0,229,255,0.06)', label: 'INFO' },
  warn: { border: '#FF2D95', bg: 'rgba(255,45,149,0.06)', label: 'WARNING' },
  tip: { border: '#00FF88', bg: 'rgba(0,255,136,0.06)', label: 'TIP' },
}

export default function Callout({
  type = 'info',
  title,
  children,
}: CalloutProps) {
  const s = STYLES[type]
  return (
    <div
      className="my-6 rounded-xl p-5 border-l-2"
      style={{ borderColor: s.border, background: s.bg }}
    >
      <div
        className="font-mono text-xs tracking-widest uppercase mb-2"
        style={{ color: s.border }}
      >
        {title ?? s.label}
      </div>
      <div className="text-text/85 leading-relaxed">{children}</div>
    </div>
  )
}