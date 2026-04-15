export default function StatusBar({ text, loading }) {
  if (!text) return null

  return (
    <div className="statusbar">
      {loading && <div className="sspin" />}
      <span>{text}</span>
    </div>
  )
}
