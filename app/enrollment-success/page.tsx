import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import Link from "next/link";

export default function EnrollmentSuccessPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <div className="text-center space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>

        <h1 className="text-3xl font-bold tracking-tight">Thank You!</h1>

        <div className="space-y-4 text-muted-foreground">
          <p>
            Your payment proof has been successfully submitted and is being reviewed by our team.
          </p>
          <p>
            We'll verify your payment and send you an email with further instructions to complete your enrollment.
          </p>
          <p>
            If you have any questions, please contact our support team at
            <a href="mailto:info@al-shahid.com" className="text-primary hover:underline">
              {' '}info@al-shahid.com
            </a>.
          </p>
        </div>

        <div className="pt-6">
          <Button asChild>
            <Link href="/">
              Return to Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
