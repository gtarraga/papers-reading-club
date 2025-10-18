import { Card } from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="min-h-screen bg-stone-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="h-10 bg-stone-200 rounded animate-pulse w-1/3 mb-8" />

        <Card className="p-6 border-blue-500">
          <div className="h-6 bg-blue-200 rounded animate-pulse w-1/2 mb-4" />
          <div className="space-y-4">
            <div className="h-10 bg-stone-200 rounded animate-pulse" />
            <div className="h-10 bg-stone-200 rounded animate-pulse" />
            <div className="h-10 bg-stone-200 rounded animate-pulse" />
          </div>
        </Card>
      </div>
    </div>
  );
}
