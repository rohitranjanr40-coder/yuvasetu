import { Card, CardContent } from "@/components/ui/card";

export function AdPlaceholder() {
  return (
    <Card className="bg-muted border-dashed">
      <CardContent className="p-4">
        <div className="flex items-center justify-center h-48 rounded-lg">
          <p className="text-sm text-muted-foreground">Advertisement</p>
        </div>
      </CardContent>
    </Card>
  );
}
