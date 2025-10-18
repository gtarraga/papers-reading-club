import { Card } from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="min-h-screen bg-stone-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Status Banner Skeleton */}
        <Card className="p-6 border-black">
          <div className="h-6 bg-stone-200 rounded animate-pulse w-1/2 mb-4" />
          <div className="h-8 bg-stone-200 rounded animate-pulse w-3/4" />
        </Card>

        {/* Content Skeleton */}
        <Card className="p-6 border-black">
          <div className="h-8 bg-stone-200 rounded animate-pulse w-1/3 mb-6" />
          <div className="space-y-4">
            <div className="h-4 bg-stone-200 rounded animate-pulse" />
            <div className="h-4 bg-stone-200 rounded animate-pulse" />
            <div className="h-4 bg-stone-200 rounded animate-pulse w-5/6" />
          </div>
        </Card>
      </div>
    </div>
  );
}
