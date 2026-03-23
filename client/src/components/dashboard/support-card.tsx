/**
 * SupportCard — "Need help?" card with messaging and call scheduling buttons.
 */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, Phone, Clock } from "lucide-react";

export function SupportCard() {
  return (
    <Card className="shadow-sm border border-slate-200">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-blue-500" />
          <CardTitle className="text-lg font-bold text-slate-900">Need Help?</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-slate-600">
          Our credit repair specialists are here to answer your questions and keep your case on track.
        </p>

        <div className="grid grid-cols-2 gap-3">
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Message Our Team
          </Button>
          <Button
            variant="outline"
            className="border-blue-200 text-blue-600 hover:bg-blue-50 font-semibold"
          >
            <Phone className="h-4 w-4 mr-2" />
            Schedule a Call
          </Button>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
          <Clock className="h-4 w-4 text-slate-400 shrink-0" />
          <p className="text-xs text-slate-600">
            Available <span className="font-semibold text-slate-800">Mon–Fri 9am–6pm ET</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
