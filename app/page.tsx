import { PlanExpiredBanner } from "@/components/plan-expired-banner"
import { PricingCard } from "@/components/pricing-card"

export default function HostingPricingPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10 md:py-14">
      <section className="mx-auto max-w-3xl text-center">
        <h1 className="text-balance text-3xl font-semibold md:text-4xl">Next.js Hosting Plans</h1>
        <p className="mt-3 text-muted-foreground">Reliable, scalable hosting tailored for Next.js applications.</p>
      </section>

      <div className="mt-6">
        <PlanExpiredBanner />
      </div>

      <section className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        <PricingCard
          title="Starter"
          price={499}
          features={["Next.js SSR & ISR", "1 vCPU burst", "10 GB bandwidth", "Basic analytics", "Email support"]}
          cta="Renew with Starter"
        />
        <PricingCard
          title="Growth"
          price={899}
          highlight
          features={["Priority regions", "2 vCPU", "100 GB bandwidth", "Advanced analytics", "Priority support"]}
          cta="Renew with Growth"
        />
        <PricingCard
          title="Pro"
          price={1299}
          features={[
            "Global edge network",
            "4 vCPU",
            "Unlimited bandwidth fair-use",
            "Custom domains & SSL",
            "24/7 support",
          ]}
          cta="Renew with Pro"
        />
      </section>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Prices shown per month. Upgrade or downgrade anytime.
      </p>
    </main>
  )
}
