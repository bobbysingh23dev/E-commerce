// A living background: three large, blurred, slowly-drifting colour blobs.
// Sits behind all content (-z-10) and ignores pointer events.
export default function Aurora() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div
        className="aurora-blob"
        style={{
          top: "-12%",
          left: "-8%",
          width: "46vw",
          height: "46vw",
          background: "radial-gradient(circle, #8b5cf6, transparent 70%)",
          animation: "drift-a 24s ease-in-out infinite",
        }}
      />
      <div
        className="aurora-blob"
        style={{
          top: "12%",
          right: "-12%",
          width: "42vw",
          height: "42vw",
          background: "radial-gradient(circle, #6366f1, transparent 70%)",
          animation: "drift-b 28s ease-in-out infinite",
        }}
      />
      <div
        className="aurora-blob"
        style={{
          bottom: "-18%",
          left: "22%",
          width: "40vw",
          height: "40vw",
          background: "radial-gradient(circle, #a855f7, transparent 70%)",
          animation: "drift-a 32s ease-in-out infinite",
        }}
      />
    </div>
  );
}
