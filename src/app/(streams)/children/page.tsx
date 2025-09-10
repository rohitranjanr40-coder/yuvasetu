
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ChildrenPage() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight font-headline">For Children</h1>
        <p className="mt-2 text-lg text-muted-foreground">Fun and safe content for kids.</p>
      </div>
       <Card>
        <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground">This section is under construction. Check back later for fun content for children!</p>
        </CardContent>
      </Card>
    </div>
  );
}
