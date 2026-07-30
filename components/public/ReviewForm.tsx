"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Star, Send, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RatingInput } from "@/components/ui/rating";
import { submitReview } from "@/lib/actions/reviews";

interface ReviewFormProps {
  restaurantId: string;
  branchId?: string;
}

export function ReviewForm({ restaurantId, branchId }: ReviewFormProps) {
  const router = useRouter();
  const [step, setStep] = React.useState<"form" | "done">("form");
  const [sending, setSending] = React.useState(false);
  const [overallRating, setOverallRating] = React.useState(0);
  const [foodRating, setFoodRating] = React.useState(0);
  const [serviceRating, setServiceRating] = React.useState(0);
  const [atmosphereRating, setAtmosphereRating] = React.useState(0);
  const [cleanlinessRating, setCleanlinessRating] = React.useState(0);
  const [wouldRecommend, setWouldRecommend] = React.useState<boolean | null>(null);
  const [comment, setComment] = React.useState("");
  const [error, setError] = React.useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (overallRating === 0) {
      setError("Please select an overall rating");
      return;
    }
    setSending(true);
    setError("");
    try {
      await submitReview({
        restaurantId,
        branchId,
        overallRating,
        foodRating: foodRating || undefined,
        serviceRating: serviceRating || undefined,
        atmosphereRating: atmosphereRating || undefined,
        cleanlinessRating: cleanlinessRating || undefined,
        wouldRecommend: wouldRecommend ?? undefined,
        comment: comment.trim() || undefined,
      });
      setStep("done");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSending(false);
    }
  };

  if (step === "done") {
    return (
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-herb/20 mb-4">
          <CheckCircle className="w-7 h-7 text-herb" />
        </div>
        <h3 className="font-display text-xl text-text-primary mb-1">Review submitted</h3>
        <p className="text-sm text-gray-400">Thank you — your feedback helps this restaurant improve.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <p className="text-sm font-medium text-text-primary mb-2">Overall experience</p>
        <RatingInput value={overallRating} onValueChange={setOverallRating} size="lg" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-gray-500 mb-1.5">Food</p>
          <RatingInput value={foodRating} onValueChange={setFoodRating} size="sm" />
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1.5">Service</p>
          <RatingInput value={serviceRating} onValueChange={setServiceRating} size="sm" />
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1.5">Atmosphere</p>
          <RatingInput value={atmosphereRating} onValueChange={setAtmosphereRating} size="sm" />
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1.5">Cleanliness</p>
          <RatingInput value={cleanlinessRating} onValueChange={setCleanlinessRating} size="sm" />
        </div>
      </div>

      <div>
        <p className="text-sm font-medium text-text-primary mb-2">Would you recommend this place?</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setWouldRecommend(true)}
            className={`flex-1 h-10 rounded text-sm font-medium transition-colors ${
              wouldRecommend === true
                ? "bg-herb text-[#ffffff]"
                : "bg-gray-800 text-gray-300 hover:bg-herb/20 hover:text-herb"
            }`}
          >
            Yes
          </button>
          <button
            type="button"
            onClick={() => setWouldRecommend(false)}
            className={`flex-1 h-10 rounded text-sm font-medium transition-colors ${
              wouldRecommend === false
                ? "bg-rose text-[#ffffff]"
                : "bg-gray-800 text-gray-300 hover:bg-rose/20 hover:text-rose"
            }`}
          >
            No
          </button>
        </div>
      </div>

      <div>
        <p className="text-sm font-medium text-text-primary mb-2">Anything else? (optional)</p>
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="What stood out? What could be better?"
          rows={3}
        />
      </div>

      {error && <p className="text-xs text-rose">{error}</p>}

      <Button type="submit" variant="primary" className="w-full" disabled={sending}>
        {sending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Send className="w-4 h-4" />
        )}
        Send review
      </Button>
    </form>
  );
}
