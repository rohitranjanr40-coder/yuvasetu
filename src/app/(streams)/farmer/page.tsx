
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AreaChart, Briefcase, CloudSun, Handshake, Leaf, Milestone, Store } from "lucide-react";

const services = [
  {
    title: "Market Prices",
    description: "Track the latest prices for your crops from nearby markets.",
    icon: AreaChart,
    href: "#"
  },
  {
    title: "Farming Services",
    description: "Access services like soil testing, crop advisory, and equipment rental.",
    icon: Leaf,
    href: "#"
  },
  {
    title: "Government Schemes",
    description: "Find and apply for beneficial government schemes and subsidies.",
    icon: Briefcase,
    href: "#"
  },
  {
    title: "Weather Forecast",
    description: "Get accurate weather predictions to plan your farming activities.",
    icon: CloudSun,
    href: "#"
  },
];


export default function FarmerPage() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight font-headline">Farmer's Portal</h1>
        <p className="mt-2 text-lg text-muted-foreground">Empowering farmers with technology and information.</p>
      </div>

      <Card className="bg-primary/10 border-primary">
          <CardHeader className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                  <CardTitle className="text-primary">Welcome to the Open Market</CardTitle>
                  <CardDescription className="mt-2">
                      Connect directly with buyers, from large corporations to local vendors. Sell your produce at the best prices.
                  </CardDescription>
              </div>
              <Button asChild size="lg">
                  <Link href="/farmer/open-market">
                      <Handshake className="mr-2"/>
                      Explore the Market
                  </Link>
              </Button>
          </CardHeader>
      </Card>

      <section>
        <h2 className="text-2xl font-bold tracking-tight mb-4 font-headline text-center md:text-left">Krishi Seva (Services)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service) => (
            <Card key={service.title} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center gap-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                      <service.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{service.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{service.description}</p>
                <Button variant="link" className="px-0 mt-2">Learn More</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

    </div>
  );
}
