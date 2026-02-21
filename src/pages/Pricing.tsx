import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { ArrowRight, Check, Sparkles, Star } from "lucide-react";

const plans = [
    {
        name: "Free",
        price: "$0",
        period: "forever",
        description: "Perfect for testing the waters and getting started.",
        features: [
            "10 AI questions per day",
            "Standard difficulty levels",
            "Basic performance tracking",
            "Community support",
            "Mobile responsive access",
        ],
        cta: "Get Started",
        variant: "outline",
        popular: false,
    },
    {
        name: "Sponge Plus",
        price: "$9.99",
        period: "per month",
        description: "Ideal for intensive short-term prep before test day.",
        features: [
            "Unlimited AI-generated questions",
            "Adaptive difficulty scaling",
            "In-depth AI explanations",
            "Detailed category analytics",
            "Priority email support",
        ],
        cta: "Go Plus",
        variant: "default",
        popular: true,
        highlight: "Most Popular",
    },
    {
        name: "Sponge Pro",
        price: "$19.99",
        period: "per 3 months",
        description: "Our best value plan for long-term score improvement.",
        features: [
            "Everything in Sponge Plus",
            "Full-length timed mock exams",
            "Personalized 'Weak Spot' focus AI",
            "Score improvement guarantee",
            "Early access to new features",
        ],
        cta: "Go Pro",
        variant: "outline",
        popular: false,
    },
];

const Pricing = () => {
    return (
        <div className="min-h-screen bg-brand-bg flex flex-col">
            <Navbar />

            <main className="flex-grow">
                <div className="py-24 sm:py-32">
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">
                        <div className="mx-auto max-w-4xl text-center mb-16">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                            >
                                <p className="mt-2 text-4xl font-bold tracking-tight text-brand-black sm:text-5xl">
                                    Invest in your <span className="text-brand-blue">future</span>
                                </p>
                                <motion.p
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: 0.1 }}
                                    className="mt-6 text-lg leading-8 text-brand-grey font-medium"
                                >
                                    Choose your plan.
                                </motion.p>
                            </motion.div>
                        </div>

                        <div className="isolate grid grid-cols-1 gap-y-12 gap-x-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 xl:gap-x-8 pt-4">
                            {plans.map((plan, index) => (
                                <motion.div
                                    key={plan.name}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
                                    className={`flex flex-col ${plan.popular ? "lg:-mt-4 lg:mb-4" : ""}`}
                                >
                                    <Card
                                        className={`flex flex-col justify-between h-full relative transition-all duration-300 hover:shadow-xl rounded-3xl bg-white ${
                                            plan.popular
                                                ? "border-2 border-brand-blue shadow-lg shadow-brand-blue/10 z-10 scale-105"
                                                : "border border-brand-border hover:border-brand-blue/50"
                                        }`}
                                    >
                                        {plan.highlight && (
                                            <Badge
                                                className={`absolute -top-4 left-1/2 -translate-x-1/2 text-white px-4 py-1.5 rounded-full border-none shadow-lg gap-1.5 ${plan.popular ? "bg-brand-blue hover:bg-brand-blue" : "bg-brand-black hover:bg-brand-black"}`}
                                            >
                                                {plan.popular && <Star className="h-3.5 w-3.5 fill-current" />}
                                                {plan.highlight}
                                            </Badge>
                                        )}

                                        <CardHeader className="pt-8">
                                            <CardTitle className="flex items-center justify-between">
                                                <span className="text-xl font-bold text-brand-black">{plan.name}</span>
                                                {plan.popular && <Sparkles className="h-5 w-5 text-brand-blue" />}
                                            </CardTitle>
                                            <CardDescription className="min-h-[50px] mt-2 text-brand-grey">
                                                {plan.description}
                                            </CardDescription>
                                        </CardHeader>

                                        <CardContent className="grid gap-4">
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-4xl font-bold tracking-tight text-brand-black">{plan.price}</span>
                                                {plan.period && (
                                                    <span className="text-sm font-semibold leading-6 text-brand-grey">
                                                        / {plan.period.replace("per ", "")}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="space-y-3 mt-4">
                                                {plan.features.map(feature => (
                                                    <div key={feature} className="flex gap-3 items-start">
                                                        <Check
                                                            className="h-5 w-5 flex-none text-brand-blue"
                                                            aria-hidden="true"
                                                        />
                                                        <span className="text-sm text-brand-grey leading-5">
                                                            {feature}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>

                                        <CardFooter className="pt-8 mt-auto">
                                            <Button
                                                className={`w-full rounded-2xl ${plan.popular ? "bg-brand-blue hover:bg-brand-blue/90" : ""}`}
                                                variant={plan.popular ? "default" : "outline"}
                                                size="lg"
                                            >
                                                {plan.cta}
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Pricing;
