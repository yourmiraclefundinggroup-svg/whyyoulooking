import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
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
  Smartphone,
  ArrowRight,
  Star,
  Lock,
  Target,
  Brain,
  DollarSign,
  Home
} from "lucide-react";

export default function LandingPage() {
  const features = [
    {
      icon: <Brain className="h-8 w-8 text-blue-600" />,
      title: "AI-Powered Credit Analysis",
      description: "Advanced AI analyzes your credit reports and generates personalized dispute letters with 94% success rate."
    },
    {
      icon: <Shield className="h-8 w-8 text-green-600" />,
      title: "Real-Time Credit Monitoring",
      description: "Direct integration with all three credit bureaus (Experian, Equifax, TransUnion) for instant updates."
    },
    {
      icon: <FileText className="h-8 w-8 text-purple-600" />,
      title: "Professional Dispute Management",
      description: "Automated dispute tracking, USPS certified mail integration, and 14-day follow-up system."
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-orange-600" />,
      title: "Credit Score Optimization",
      description: "AI-driven utilization recommendations, credit mix analysis, and score improvement predictions."
    },
    {
      icon: <MessageSquare className="h-8 w-8 text-indigo-600" />,
      title: "Secure Client Communication",
      description: "Encrypted chat system with document sharing, progress updates, and real-time notifications."
    },
    {
      icon: <Building className="h-8 w-8 text-red-600" />,
      title: "Business Credit Building",
      description: "Complete business credit profile development with funding recommendations and trade line analysis."
    }
  ];

  const integrations = [
    { name: "Plaid Banking", icon: <DollarSign className="h-5 w-5" />, status: "Ready" },
    { name: "Experian API", icon: <Shield className="h-5 w-5" />, status: "Active" },
    { name: "USPS Tracking", icon: <FileText className="h-5 w-5" />, status: "Ready" },
    { name: "OpenAI GPT-4", icon: <Brain className="h-5 w-5" />, status: "Active" },
    { name: "Stripe Payments", icon: <CreditCard className="h-5 w-5" />, status: "Ready" }
  ];

  const stats = [
    { value: "94%", label: "Dispute Success Rate" },
    { value: "156+", label: "Points Average Increase" },
    { value: "24/7", label: "Credit Monitoring" },
    { value: "48hrs", label: "Response Time" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">ScoreShift</h1>
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                Pro Platform
              </Badge>
            </div>
            <div className="flex items-center space-x-3">
              <Link href="/auth">
                <Button variant="outline">
                  <Users className="h-4 w-4 mr-2" />
                  Client Portal
                </Button>
              </Link>
              <Link href="/admin/auth">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Shield className="h-4 w-4 mr-2" />
                  Admin Portal
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <Badge className="mb-6 bg-blue-100 text-blue-700 hover:bg-blue-100">
            <Zap className="h-3 w-3 mr-1" />
            AI-Powered Credit Repair Platform
          </Badge>
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Transform Your
            <span className="text-blue-600 block">Credit Profile</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Professional credit repair platform combining AI-powered dispute generation, 
            real-time bureau monitoring, and comprehensive financial wellness tools.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/auth">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 px-8 py-4 text-lg">
                <Target className="h-5 w-5 mr-2" />
                Start Credit Repair
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
            <Link href="/admin/auth">
              <Button size="lg" variant="outline" className="px-8 py-4 text-lg">
                <Shield className="h-5 w-5 mr-2" />
                Admin Dashboard
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-blue-600">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-green-100 text-green-700 hover:bg-green-100">
              <CheckCircle className="h-3 w-3 mr-1" />
              Complete Feature Set
            </Badge>
            <h3 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need for Credit Success
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our comprehensive platform handles every aspect of credit repair and financial wellness
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="mb-4">{feature.icon}</div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-purple-100 text-purple-700 hover:bg-purple-100">
              <Zap className="h-3 w-3 mr-1" />
              Enterprise Integrations
            </Badge>
            <h3 className="text-4xl font-bold text-gray-900 mb-4">
              Powered by Industry Leaders
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Direct API integrations with trusted financial and credit services
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 max-w-4xl mx-auto">
            {integrations.map((integration, index) => (
              <Card key={index} className="text-center border-2 hover:border-blue-200 transition-colors">
                <CardContent className="pt-6">
                  <div className="mb-3 flex justify-center">{integration.icon}</div>
                  <div className="font-medium text-sm">{integration.name}</div>
                  <Badge 
                    variant={integration.status === 'Active' ? 'default' : 'secondary'}
                    className="mt-2 text-xs"
                  >
                    {integration.status}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Access */}
      <section className="py-20 px-4 bg-blue-600">
        <div className="container mx-auto">
          <div className="text-center text-white mb-12">
            <h3 className="text-4xl font-bold mb-4">Choose Your Access Level</h3>
            <p className="text-xl opacity-90">
              Secure portals designed for professionals and their clients
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="bg-white border-0 shadow-xl">
              <CardHeader className="text-center pb-4">
                <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle className="text-2xl">Client Portal</CardTitle>
                <CardDescription>
                  Secure access to your credit repair progress and tools
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    View credit reports and scores
                  </div>
                  <div className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Track dispute progress
                  </div>
                  <div className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    AI credit analysis tools
                  </div>
                  <div className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Secure document uploads
                  </div>
                  <div className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Direct communication with specialists
                  </div>
                </div>
                <Link href="/auth">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 mt-6">
                    <Home className="h-4 w-4 mr-2" />
                    Access Client Portal
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-xl">
              <CardHeader className="text-center pb-4">
                <Shield className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <CardTitle className="text-2xl">Admin Dashboard</CardTitle>
                <CardDescription>
                  Complete platform management and client oversight
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Manage all client accounts
                  </div>
                  <div className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    AI bureau response analysis
                  </div>
                  <div className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Generate dispute letters
                  </div>
                  <div className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Platform analytics and reporting
                  </div>
                  <div className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    API integration management
                  </div>
                </div>
                <Link href="/admin/auth">
                  <Button className="w-full bg-purple-600 hover:bg-purple-700 mt-6">
                    <Shield className="h-4 w-4 mr-2" />
                    Access Admin Dashboard
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Security & Trust */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <Badge className="mb-4 bg-green-100 text-green-700 hover:bg-green-100">
            <Lock className="h-3 w-3 mr-1" />
            Enterprise Security
          </Badge>
          <h3 className="text-4xl font-bold text-gray-900 mb-4">
            Bank-Level Security & Compliance
          </h3>
          <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
            Your financial data is protected with enterprise-grade security and full regulatory compliance
          </p>
          
          <div className="grid md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <Shield className="h-10 w-10 text-blue-600 mx-auto mb-4" />
              <h4 className="font-semibold mb-2">256-bit Encryption</h4>
              <p className="text-sm text-gray-600">Military-grade data protection</p>
            </div>
            <div className="text-center">
              <Lock className="h-10 w-10 text-green-600 mx-auto mb-4" />
              <h4 className="font-semibold mb-2">FCRA Compliant</h4>
              <p className="text-sm text-gray-600">Full regulatory compliance</p>
            </div>
            <div className="text-center">
              <CheckCircle className="h-10 w-10 text-purple-600 mx-auto mb-4" />
              <h4 className="font-semibold mb-2">SOC 2 Certified</h4>
              <p className="text-sm text-gray-600">Audited security controls</p>
            </div>
            <div className="text-center">
              <Smartphone className="h-10 w-10 text-orange-600 mx-auto mb-4" />
              <h4 className="font-semibold mb-2">Multi-Factor Auth</h4>
              <p className="text-sm text-gray-600">Enhanced access security</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <h4 className="text-xl font-bold">ScoreShift</h4>
            </div>
            <p className="text-gray-400 mb-6">
              Professional Credit Repair & Financial Wellness Platform
            </p>
            <div className="flex justify-center space-x-4 mb-8">
              <Link href="/auth">
                <Button variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800">
                  <Users className="h-4 w-4 mr-2" />
                  Client Portal
                </Button>
              </Link>
              <Link href="/admin/auth">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Shield className="h-4 w-4 mr-2" />
                  Admin Portal
                </Button>
              </Link>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
            <p>© 2025 ScoreShift. Professional credit repair platform with enterprise-grade security.</p>
            <p className="mt-2">
              Contact: <a href="mailto:support@scoreshift.com" className="text-blue-400 hover:underline">support@scoreshift.com</a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}