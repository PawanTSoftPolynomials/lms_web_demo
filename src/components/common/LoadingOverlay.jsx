export default function LoadingOverlay() {
  return (
    <div className="
      fixed inset-0
      bg-black/50
      backdrop-blur-sm
      z-50
      flex
      items-center
      justify-center
    ">
      <div className="
        h-12 w-12
        border-4
        border-orange-500
        border-t-transparent
        rounded-full
        animate-spin
      " />
    </div>
  );
}