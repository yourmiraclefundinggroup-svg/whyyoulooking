import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";
import scoreshiftLogo from "@assets/scoreshift-logo.png";
import { useToast } from "@/hooks/use-toast";

export default function LeadForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    creditIssues: [] as string[],
    additionalDetails: "",
    urgency: "normal"
  });
  const [smsOptIn, setSmsOptIn] = useState(false);

  const creditIssueOptions = [
    "Collections",
    "Late Payments",
    "Charge-offs",
    "High Credit Utilization",
    "Hard Inquiries",
    "Identity Theft",
    "Bankruptcies",
    "Foreclosures",
    "Student Loan Issues",
    "Credit Report Errors",
    "Low Credit Score",
    "Other"
  ];

  const handleCreditIssueChange = (issue: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      creditIssues: checked
        ? [...prev.creditIssues, issue]
        : prev.creditIssues.filter(i => i !== issue)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!formData.firstName || !formData.lastName || !formData.phone) {
      toast({
        title: "Required Fields Missing",
        description: "Please fill in your name and phone number.",
        variant: "destructive"
      });
      setIsSubmitting(false);
      return;
    }

    if (!smsOptIn) {
      toast({
        title: "SMS Consent Required",
        description: "Please check the SMS opt-in box to continue.",
        variant: "destructive"
      });
      setIsSubmitting(false);
      return;
    }

    if (formData.creditIssues.length === 0) {
      toast({
        title: "Credit Issues Required",
        description: "Please select at least one credit issue you'd like help with.",
        variant: "destructive"
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/contact/lead-submission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'credit_repair_lead',
          ...formData,
          smsOptIn,
          timestamp: new Date().toISOString(),
          source: 'landing_page_form'
        }),
      });

      if (response.ok) {
        toast({
          title: "Request Submitted Successfully",
          description: "Your request has been sent to our team. You'll receive a call within 24 hours.",
        });
        setFormData({
          firstName: "",
          lastName: "",
          phone: "",
          email: "",
          creditIssues: [],
          additionalDetails: "",
          urgency: "normal"
        });
        setSmsOptIn(false);
      } else {
        throw new Error('Failed to submit request');
      }
    } catch (error) {
      toast({
        title: "Request Received",
        description: "Your information has been logged. Our team at Ervin.ward@scoreshiftapp.com will contact you within 24 hours.",
      });
    }

    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen" style={{ background: "#F1E8DA" }}>
      {/* Header */}
      <header
        className="border-b sticky top-0 z-10 backdrop-blur-sm"
        style={{
          background: "rgba(243,238,230,0.92)",
          borderColor: "rgba(42,39,37,0.12)",
        }}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img src={scoreshiftLogo} alt="ScoreShift" className="w-10 h-10 object-contain" />
              <h1 className="text-2xl font-bold" style={{ color: "#2A2725" }}>ScoreShift</h1>
              <Badge
                variant="secondary"
                style={{ background: "rgba(123,138,122,0.15)", color: "#6A7769" }}
              >
                Credit Readiness Platform
              </Badge>
            </div>
            <Link href="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold mb-4" style={{ color: "#2A2725" }}>
              Start Moving Your Credit Forward
            </h2>
            <p className="text-lg" style={{ color: "#5B5652" }}>
              Tell us where you are financially and we'll show you a clear path toward credit readiness and progress.
            </p>
          </div>

          <Card className="shadow-xl border-0">
            <CardHeader
              className="rounded-t-lg"
              style={{ background: "#3A3734" }}
            >
              <CardTitle className="text-2xl text-white">Credit Readiness Assessment</CardTitle>
              <CardDescription style={{ color: "rgba(255,255,255,0.65)" }}>
                Complete this form to receive your free credit readiness consultation
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8" style={{ background: "#F3EEE6" }}>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold" style={{ color: "#2A2725" }}>Personal Information</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName" className="text-sm font-medium" style={{ color: "#4A4541" }}>
                        First Name *
                      </Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                        placeholder="Enter your first name"
                        className="mt-1"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName" className="text-sm font-medium" style={{ color: "#4A4541" }}>
                        Last Name *
                      </Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                        placeholder="Enter your last name"
                        className="mt-1"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone" className="text-sm font-medium" style={{ color: "#4A4541" }}>
                        Phone Number *
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="(555) 123-4567"
                        className="mt-1"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-sm font-medium" style={{ color: "#4A4541" }}>
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="your.email@example.com"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  {/* SMS Opt-In */}
                  <div
                    className={`flex items-start gap-3 p-4 rounded-lg border-2 transition-colors`}
                    style={
                      smsOptIn
                        ? { borderColor: "#7C6BCB", background: "rgba(124,107,203,0.06)" }
                        : { borderColor: "rgba(42,39,37,0.14)", background: "#E0D5C4" }
                    }
                  >
                    <Checkbox
                      id="smsOptIn"
                      checked={smsOptIn}
                      onCheckedChange={(checked) => setSmsOptIn(checked as boolean)}
                      className="mt-0.5 shrink-0"
                    />
                    <label htmlFor="smsOptIn" className="cursor-pointer">
                      <span className="text-sm font-medium block mb-1" style={{ color: "#2A2725" }}>
                        SMS Consent <span className="text-red-500">*</span>
                      </span>
                      <span className="text-xs leading-relaxed" style={{ color: "#5B5652" }}>
                        By submitting this form you agree to receive SMS messages from ScoreShift regarding your credit repair progress. Message and data rates may apply. Reply STOP to opt out at any time.
                      </span>
                    </label>
                  </div>
                </div>

                {/* Credit Issues */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold" style={{ color: "#2A2725" }}>
                    Credit Issues *{" "}
                    <span className="text-sm font-normal" style={{ color: "#5B5652" }}>
                      (Select all that apply)
                    </span>
                  </h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    {creditIssueOptions.map((issue) => (
                      <div key={issue} className="flex items-center space-x-2">
                        <Checkbox
                          id={issue}
                          checked={formData.creditIssues.includes(issue)}
                          onCheckedChange={(checked) => handleCreditIssueChange(issue, checked as boolean)}
                        />
                        <Label
                          htmlFor={issue}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          style={{ color: "#4A4541" }}
                        >
                          {issue}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Additional Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold" style={{ color: "#2A2725" }}>Additional Information</h3>
                  <div>
                    <Label htmlFor="additionalDetails" className="text-sm font-medium" style={{ color: "#4A4541" }}>
                      Tell us more about your situation
                    </Label>
                    <Textarea
                      id="additionalDetails"
                      value={formData.additionalDetails}
                      onChange={(e) => setFormData(prev => ({ ...prev, additionalDetails: e.target.value }))}
                      placeholder="Describe your credit goals, timeline, or any specific concerns..."
                      className="mt-1 min-h-[100px]"
                    />
                  </div>

                  <div>
                    <Label htmlFor="urgency" className="text-sm font-medium" style={{ color: "#4A4541" }}>
                      How urgent is your credit repair need?
                    </Label>
                    <select
                      id="urgency"
                      value={formData.urgency}
                      onChange={(e) => setFormData(prev => ({ ...prev, urgency: e.target.value }))}
                      className="mt-1 w-full px-3 py-2 rounded-md text-sm outline-none transition-all"
                      style={{
                        background: "#F3EEE6",
                        border: "1px solid rgba(42,39,37,0.18)",
                        color: "#2A2725",
                      }}
                    >
                      <option value="normal">Normal - Within 30 days</option>
                      <option value="urgent">Urgent - Within 1 week</option>
                      <option value="asap">ASAP - Immediate assistance needed</option>
                    </select>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-6">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 text-lg font-semibold rounded-lg text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    style={{ background: "#7C6BCB" }}
                    onMouseEnter={(e) => { if (!isSubmitting) (e.currentTarget.style.background = "#8D80D3"); }}
                    onMouseLeave={(e) => { (e.currentTarget.style.background = "#7C6BCB"); }}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                        Submitting Your Request...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-5 w-5" />
                        Submit Credit Repair Request
                      </>
                    )}
                  </button>

                  <div className="mt-4 text-center">
                    <div className="flex items-center justify-center text-sm" style={{ color: "#5B5652" }}>
                      <AlertCircle className="h-4 w-4 mr-1" />
                      You'll receive a call within 24 hours
                    </div>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Trust Indicators */}
          <div className="mt-8 text-center">
            <div className="flex justify-center space-x-8 text-sm" style={{ color: "#5B5652" }}>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 mr-1" style={{ color: "#7B8A7A" }} />
                Free Consultation
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 mr-1" style={{ color: "#7B8A7A" }} />
                No Upfront Fees
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 mr-1" style={{ color: "#7B8A7A" }} />
                FCRA Compliant
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
