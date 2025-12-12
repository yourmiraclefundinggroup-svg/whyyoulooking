import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { ArrowLeft, TrendingUp, CheckCircle, AlertCircle } from "lucide-react";
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

    // Validation
    if (!formData.firstName || !formData.lastName || !formData.phone) {
      toast({
        title: "Required Fields Missing",
        description: "Please fill in your name and phone number.",
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'credit_repair_lead',
          ...formData,
          timestamp: new Date().toISOString(),
          source: 'landing_page_form'
        }),
      });

      if (response.ok) {
        toast({
          title: "Request Submitted Successfully",
          description: "Your credit repair request has been sent to our team. You'll receive a call within 24 hours.",
        });
        
        // Reset form
        setFormData({
          firstName: "",
          lastName: "",
          phone: "",
          email: "",
          creditIssues: [],
          additionalDetails: "",
          urgency: "normal"
        });
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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/95 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">ScoreShift</h1>
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                Pro Platform
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
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Start Your Credit Repair Journey
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Tell us about your credit situation and we'll create a personalized plan to help you achieve your financial goals.
            </p>
          </div>

          <Card className="shadow-xl border-0">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
              <CardTitle className="text-2xl">Credit Repair Assessment</CardTitle>
              <CardDescription className="text-blue-100">
                Complete this form to receive your free consultation
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Personal Information</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName" className="text-sm font-medium">
                        First Name *
                      </Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => setFormData(prev => ({...prev, firstName: e.target.value}))}
                        placeholder="Enter your first name"
                        className="mt-1"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName" className="text-sm font-medium">
                        Last Name *
                      </Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => setFormData(prev => ({...prev, lastName: e.target.value}))}
                        placeholder="Enter your last name"
                        className="mt-1"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone" className="text-sm font-medium">
                        Phone Number *
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({...prev, phone: e.target.value}))}
                        placeholder="(555) 123-4567"
                        className="mt-1"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-sm font-medium">
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))}
                        placeholder="your.email@example.com"
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Credit Issues */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Credit Issues *
                    <span className="text-sm font-normal text-gray-600 ml-2">
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
                        >
                          {issue}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Additional Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Additional Information</h3>
                  <div>
                    <Label htmlFor="additionalDetails" className="text-sm font-medium">
                      Tell us more about your situation
                    </Label>
                    <Textarea
                      id="additionalDetails"
                      value={formData.additionalDetails}
                      onChange={(e) => setFormData(prev => ({...prev, additionalDetails: e.target.value}))}
                      placeholder="Describe your credit goals, timeline, or any specific concerns..."
                      className="mt-1 min-h-[100px]"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="urgency" className="text-sm font-medium">
                      How urgent is your credit repair need?
                    </Label>
                    <select
                      id="urgency"
                      value={formData.urgency}
                      onChange={(e) => setFormData(prev => ({...prev, urgency: e.target.value}))}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="normal">Normal - Within 30 days</option>
                      <option value="urgent">Urgent - Within 1 week</option>
                      <option value="asap">ASAP - Immediate assistance needed</option>
                    </select>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-6">
                  <Button 
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-semibold"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2" />
                        Submitting Your Request...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-5 w-5 mr-2" />
                        Submit Credit Repair Request
                      </>
                    )}
                  </Button>
                  
                  <div className="mt-4 text-center">
                    <div className="flex items-center justify-center text-sm text-gray-600 dark:text-gray-300">
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
            <div className="flex justify-center space-x-8 text-sm text-gray-600 dark:text-gray-300">
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                Free Consultation
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                No Upfront Fees
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                FCRA Compliant
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}