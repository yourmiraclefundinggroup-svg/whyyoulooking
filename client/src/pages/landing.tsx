import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { motion, useInView, useAnimation } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { 
  Shield, 
  TrendingUp, 
  CreditCard, 
  FileText, 
  MessageSquare, 
  Zap,
  CheckCircle,
  Users,
  Building,
  ArrowRight,
  Star,
  Lock,
  Target,
  Brain,
  DollarSign,
  GraduationCap,
  ChevronRight,
  Sparkles,
  Moon,
  Sun
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/theme-toggle";

function AnimatedCounter({ value, suffix = "", duration = 2 }: { value: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const end = value;
      const stepTime = Math.abs(Math.floor(duration * 1000 / end));
      const timer = setInterval(() => {
        start += 1;
        setCount(start);
        if (start === end) clearInterval(timer);
      }, stepTime);
      return () => clearInterval(timer);
    }
  }, [isInView, value, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
}

function FeatureCard({ feature, index }: { feature: any; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card className="group h-full border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-white dark:bg-gray-900 hover:-translate-y-2 cursor-pointer overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <CardHeader className="relative">
          <motion.div 
            className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-4 shadow-lg"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            {feature.icon}
          </motion.div>
          <CardTitle className="text-xl text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {feature.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-gray-600 dark:text-gray-400 text-base leading-relaxed">
            {feature.description}
          </CardDescription>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function PricingCard({ plan, index }: { plan: any; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.15 }}
      className="relative"
    >
      <Card className={`relative h-full overflow-hidden transition-all duration-300 hover:shadow-2xl ${
        plan.popular 
          ? "border-2 border-blue-500 shadow-xl bg-gradient-to-b from-blue-50 to-white dark:from-blue-950/50 dark:to-gray-900 scale-105 z-10" 
          : "border border-gray-200 dark:border-gray-800 hover:-translate-y-2"
      }`}>
        {plan.popular && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500" />
        )}
        {plan.popular && (
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="absolute -top-4 left-1/2 transform -translate-x-1/2"
          >
            <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1.5 shadow-lg">
              <Star className="h-3 w-3 mr-1" /> Most Popular
            </Badge>
          </motion.div>
        )}
        <CardHeader className="text-center pb-8 pt-8">
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">{plan.name}</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400 mt-2">{plan.description}</CardDescription>
          <div className="mt-6">
            <span className="text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              ${plan.price}
            </span>
            <span className="text-gray-500 dark:text-gray-400">/month</span>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <ul className="space-y-4 mb-8">
            {plan.features.map((feature: string, featureIndex: number) => (
              <motion.li 
                key={featureIndex} 
                className="flex items-start gap-3"
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: featureIndex * 0.05 + index * 0.1 }}
              >
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-300">{feature}</span>
              </motion.li>
            ))}
          </ul>
          <Link href="/billing">
            <Button 
              className={`w-full py-6 text-base font-semibold transition-all duration-300 ${
                plan.popular 
                  ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl" 
                  : "hover:bg-blue-50 dark:hover:bg-blue-950"
              }`}
              variant={plan.popular ? "default" : "outline"}
              data-testid={`button-pricing-${plan.name.toLowerCase().replace(/\s+/g, '-')}`}
            >
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function LandingPage() {
  const { toast } = useToast();
  const heroRef = useRef(null);
  const heroInView = useInView(heroRef, { once: true });

  const features = [
    {
      icon: <Brain className="h-7 w-7 text-white" />,
      title: "AI-Powered Credit Analysis",
      description: "Advanced AI analyzes your credit reports and generates personalized dispute letters with 94% success rate."
    },
    {
      icon: <Shield className="h-7 w-7 text-white" />,
      title: "Real-Time Credit Monitoring",
      description: "Direct integration with all three credit bureaus for instant score updates and alert notifications."
    },
    {
      icon: <FileText className="h-7 w-7 text-white" />,
      title: "Professional Dispute Management",
      description: "Automated dispute tracking, USPS certified mail integration, and 14-day follow-up system."
    },
    {
      icon: <TrendingUp className="h-7 w-7 text-white" />,
      title: "Credit Score Optimization",
      description: "AI-driven utilization recommendations, credit mix analysis, and score improvement predictions."
    },
    {
      icon: <MessageSquare className="h-7 w-7 text-white" />,
      title: "Secure Client Communication",
      description: "Encrypted chat system with document sharing, progress updates, and real-time notifications."
    },
    {
      icon: <Building className="h-7 w-7 text-white" />,
      title: "Business Credit Building",
      description: "Complete business credit profile development with funding recommendations and trade line analysis."
    }
  ];

  const stats = [
    { value: 94, suffix: "%", label: "Success Rate" },
    { value: 156, suffix: "+", label: "Avg Point Increase" },
    { value: 24, suffix: "/7", label: "Monitoring" },
    { value: 48, suffix: "hrs", label: "Response Time" }
  ];

  const pricingPlans = [
    {
      name: "Pro Plan",
      price: 29,
      description: "Perfect for individuals starting their credit journey",
      features: [
        "Automated AI dispute generation",
        "1–2 negative items handled monthly",
        "Monthly credit report analysis",
        "Basic templates & resources",
        "Email support"
      ],
      popular: false
    },
    {
      name: "Elite Plan",
      price: 79,
      description: "Accelerate results with unlimited disputes",
      features: [
        "Everything in Pro",
        "Unlimited AI dispute generation",
        "Weekly credit monitoring",
        "Advanced removal tools",
        "Priority live chat support",
        "Monthly 15-min strategy call"
      ],
      popular: true
    },
    {
      name: "White Label",
      price: 399,
      description: "Run your own branded credit business",
      features: [
        "Everything in Elite",
        "Custom branding & domain",
        "Client management (50 users)",
        "Resell under your brand",
        "Dedicated account manager",
        "Wholesale vendor pricing"
      ],
      popular: false
    }
  ];

  const integrations = [
    { name: "Plaid Banking", icon: <DollarSign className="h-6 w-6" /> },
    { name: "Experian API", icon: <Shield className="h-6 w-6" /> },
    { name: "USPS Tracking", icon: <FileText className="h-6 w-6" /> },
    { name: "OpenAI GPT-4", icon: <Brain className="h-6 w-6" /> },
    { name: "Stripe", icon: <CreditCard className="h-6 w-6" /> }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 transition-colors duration-300">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-800/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <motion.div 
              className="flex items-center space-x-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                ScoreShift
              </h1>
            </motion.div>
            <motion.div 
              className="flex items-center space-x-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <ThemeToggle />
              <Link href="/login">
                <Button 
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/25 transition-all duration-300"
                  data-testid="button-login"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Login
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section ref={heroRef} className="pt-32 pb-20 px-4 overflow-hidden">
        <div className="container mx-auto text-center relative">
          {/* Animated background elements */}
          <div className="absolute inset-0 -z-10">
            <motion.div
              className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 8, repeat: Infinity }}
            />
            <motion.div
              className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
              animate={{ scale: [1.2, 1, 1.2], opacity: [0.5, 0.3, 0.5] }}
              transition={{ duration: 8, repeat: Infinity }}
            />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <Badge className="mb-6 px-4 py-2 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-950 border border-blue-200 dark:border-blue-800">
              <Sparkles className="h-3 w-3 mr-2" />
              AI-Powered Credit Repair Platform
            </Badge>
          </motion.div>

          <motion.h2 
            className="text-5xl md:text-7xl font-bold mb-6 tracking-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <span className="text-gray-900 dark:text-white">Transform Your</span>
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-purple-600 bg-clip-text text-transparent">
              Credit Profile
            </span>
          </motion.h2>

          <motion.p 
            className="text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Professional credit repair platform combining AI-powered dispute generation, 
            real-time bureau monitoring, and comprehensive financial wellness tools.
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Link href="/billing">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 px-8 py-6 text-lg shadow-xl shadow-blue-500/25 hover:shadow-2xl hover:shadow-blue-500/30 transition-all duration-300 group"
                data-testid="button-start-repair"
              >
                <Target className="h-5 w-5 mr-2" />
                Start Credit Repair
                <motion.span
                  className="ml-2"
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ChevronRight className="h-5 w-5" />
                </motion.span>
              </Button>
            </Link>
            <Link href="/login">
              <Button 
                size="lg" 
                variant="outline" 
                className="px-8 py-6 text-lg border-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300"
                data-testid="button-client-login"
              >
                <Users className="h-5 w-5 mr-2" />
                Client Login
              </Button>
            </Link>
          </motion.div>

          {/* Animated Stats */}
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 40 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {stats.map((stat, index) => (
              <motion.div 
                key={index} 
                className="relative group"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-800">
                  <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1 font-medium">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 px-4 bg-gray-50 dark:bg-gray-900/50">
        <div className="container mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge className="mb-4 px-4 py-2 bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800">
              <Zap className="h-3 w-3 mr-2" />
              Simple Pricing
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Choose Your Plan
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              All plans include AI-powered dispute tools and real-time monitoring
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto items-start">
            {pricingPlans.map((plan, index) => (
              <PricingCard key={plan.name} plan={plan} index={index} />
            ))}
          </div>

          <motion.div 
            className="text-center mt-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-600 dark:text-gray-400">
              <span className="flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-sm">
                <Lock className="h-4 w-4 text-green-500" />
                Bank-level security
              </span>
              <span className="flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-sm">
                <Shield className="h-4 w-4 text-green-500" />
                GDPR compliant
              </span>
              <span className="flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-sm">
                <MessageSquare className="h-4 w-4 text-green-500" />
                24/7 support
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Student Loan Section */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700" />
        <motion.div
          className="absolute inset-0"
          animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
          transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
          style={{
            backgroundImage: "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)",
            backgroundSize: "200% 200%"
          }}
        />
        <div className="container mx-auto relative z-10">
          <motion.div 
            className="max-w-4xl mx-auto text-center text-white"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge className="mb-6 bg-white/20 text-white hover:bg-white/20 border-white/30 backdrop-blur-sm">
              <GraduationCap className="h-3 w-3 mr-2" />
              New Feature
            </Badge>
            <h3 className="text-4xl md:text-5xl font-bold mb-6">
              Student Loan Negotiation
            </h3>
            <p className="text-xl opacity-90 mb-12 max-w-2xl mx-auto">
              AI-powered strategies to reduce payments, negotiate better terms, and optimize your repayment plan
            </p>
            
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              {[
                { icon: <Target className="h-8 w-8" />, title: "Payment Optimization", desc: "Calculate the best strategy" },
                { icon: <MessageSquare className="h-8 w-8" />, title: "Servicer Communication", desc: "Professional templates" },
                { icon: <TrendingUp className="h-8 w-8" />, title: "Progress Tracking", desc: "Monitor your savings" }
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300"
                  whileHover={{ scale: 1.05, y: -5 }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className="mb-4">{item.icon}</div>
                  <h4 className="font-semibold text-lg mb-2">{item.title}</h4>
                  <p className="text-sm opacity-80">{item.desc}</p>
                </motion.div>
              ))}
            </div>

            <Link href="/get-started">
              <Button 
                size="lg"
                className="bg-white text-blue-600 hover:bg-gray-100 font-semibold px-8 py-6 text-lg shadow-xl hover:shadow-2xl transition-all duration-300"
                data-testid="button-student-loans"
              >
                <GraduationCap className="h-5 w-5 mr-2" />
                Start Negotiation
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-4">
        <div className="container mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge className="mb-4 px-4 py-2 bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
              <CheckCircle className="h-3 w-3 mr-2" />
              Complete Feature Set
            </Badge>
            <h3 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Everything You Need
            </h3>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Our comprehensive platform handles every aspect of credit repair
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <FeatureCard key={index} feature={feature} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section className="py-24 px-4 bg-gray-50 dark:bg-gray-900/50">
        <div className="container mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Powered by Industry Leaders
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Trusted integrations with leading financial services
            </p>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-6 max-w-4xl mx-auto">
            {integrations.map((integration, index) => (
              <motion.div
                key={index}
                className="flex items-center gap-3 bg-white dark:bg-gray-800 px-6 py-4 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -2 }}
              >
                <div className="text-blue-600 dark:text-blue-400">{integration.icon}</div>
                <span className="font-medium text-gray-900 dark:text-white">{integration.name}</span>
                <Badge className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs">Active</Badge>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="container mx-auto">
          <motion.div 
            className="max-w-4xl mx-auto text-center bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 rounded-3xl p-12 md:p-16 shadow-2xl relative overflow-hidden"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <motion.div
              className="absolute inset-0 opacity-30"
              animate={{ rotate: 360 }}
              transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
              style={{
                background: "conic-gradient(from 0deg, transparent, rgba(255,255,255,0.3), transparent)"
              }}
            />
            <div className="relative z-10">
              <h3 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Ready to Transform Your Credit?
              </h3>
              <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
                Join thousands who have improved their credit scores with our AI-powered platform
              </p>
              
              <Link href="/billing">
                <Button 
                  size="lg" 
                  className="bg-white text-blue-600 hover:bg-gray-100 px-10 py-6 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300"
                  data-testid="button-get-started-cta"
                >
                  <Target className="h-5 w-5 mr-2" />
                  Get Started Today
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-gray-200 dark:border-gray-800">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-gray-900 dark:text-white">ScoreShift</span>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            © {new Date().getFullYear()} ScoreShift. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
