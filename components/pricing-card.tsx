import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

type PricingCardProps = {
  title: string
  price: number
  period?: string
  features: string[]
  cta?: string
  highlight?: boolean
}

export function PricingCard({
  title,
  price,
  period = "mo",
  features,
  cta = "Choose plan",
  highlight = false,
}: PricingCardProps) {
  return (
    <Card
      className={[
        "h-full border bg-card text-card-foreground transition-shadow",
        highlight ? "ring-2 ring-primary" : "hover:shadow-md",
      ].join(" ")}
      aria-label={`${title} plan at ${price} per ${period}`}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-pretty">{title}</CardTitle>
          {highlight ? (
            <span className="rounded-full bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground">
              Popular
            </span>
          ) : null}
        </div>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-3xl font-semibold leading-none">{price}</span>
          <span className="text-sm text-muted-foreground">/{period}</span>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="grid gap-2 text-sm">
          {features.map((f) => (
            <li key={f} className="text-muted-foreground">
              • {f}
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button className="w-full" aria-label={`${cta} - ${title}`}>
          {cta}
        </Button>
      </CardFooter>
    </Card>
  )
}
