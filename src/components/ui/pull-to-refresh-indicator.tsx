import { Loader2 } from 'lucide-react'

interface PullToRefreshIndicatorProps {
  isRefreshing: boolean
  indicatorRef: React.RefObject<HTMLDivElement>
}

export function PullToRefreshIndicator({
  isRefreshing,
  indicatorRef,
}: PullToRefreshIndicatorProps) {
  return (
    <div
      ref={indicatorRef}
      className="fixed top-0 left-0 right-0 flex justify-center items-center pointer-events-none z-50 transition-all duration-200"
      style={{
        transform: 'translateY(0)',
        opacity: 0,
      }}
    >
      <div className="bg-background border border-border rounded-full p-3 shadow-lg mt-4">
        <Loader2
          className={`h-6 w-6 text-emerald-500 ${
            isRefreshing ? 'animate-spin' : ''
          }`}
        />
      </div>
    </div>
  )
}
