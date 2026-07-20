interface CalloutProps {
  type?: 'info' | 'warn' | 'tip'
  title?: string
  children: React.ReactNode
}

const STYLES = {
  info: { border: '#C6F24E', bg: 'rgba(198,242,78,0.05)', label: 'INFO' },
  warn: { border: '#F4F1EA', bg: 'rgba(244,241,234,0.05)', label: 'WARNING' },
  tip: { border: '#8C8A82', bg: 'rgba(140,138,130,0.06)', label: 'TIP' },
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
        className="font-mono text-[10px] tracking-widest2 uppercase mb-2"
        style={{ color: s.border }}
      >
        {title ?? s.label}
      </div>
      <div className="text-ink/75 leading-relaxed">{children}</div>
    </div>
  )
}
