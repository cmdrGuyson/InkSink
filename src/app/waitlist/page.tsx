"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  WaitlistService,
  WaitlistServiceError,
} from "@/services/waitlist.service";

export default function WaitlistPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contentType: "",
    platforms: "",
    painPoints: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Map form data to database schema
      const waitlistData = {
        name: formData.name,
        email: formData.email,
        question_content: formData.contentType,
        question_places: formData.platforms,
        question_pains: formData.painPoints,
      };

      await WaitlistService.addWaitlistEntry(waitlistData);

      setIsSubmitted(true);
    } catch (error) {
      if (error instanceof WaitlistServiceError) {
        // Handle unique constraint error for duplicate email
        if (error.code === "23505") {
          setError(
            "You have already applied for access with this email address."
          );
        } else {
          setError(error.message);
        }
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      name: "",
      email: "",
      contentType: "",
      platforms: "",
      painPoints: "",
    });
    setIsSubmitted(false);
    setError(null);

    // Navigate back to home page
    router.push("/");
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="text-2xl ">Thank You</CardTitle>
            <CardDescription>
              Your access request has been submitted. We&apos;ll review your
              application and get back to you soon!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleReset} className="w-full">
              Go back home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold font-mono">InkSink</h1>
          <h2 className="text-2xl font-bold text-gray-500 mb-4">
            Request Access
          </h2>
        </div>

        {/* Form */}
        <Card className="shadow-xl">
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Display */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-base font-medium">
                  Full Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  required
                  className="h-12"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-base font-medium">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                  className="h-12"
                />
              </div>

              <Separator />

              {/* Content Type */}
              <div className="space-y-2">
                <Label htmlFor="contentType" className="text-base font-medium">
                  What type of content do you create?
                </Label>
                <Textarea
                  id="contentType"
                  placeholder="Tell us about the content you write - e.g., thought leadership posts, educational content, product announcements, personal stories, etc."
                  value={formData.contentType}
                  onChange={(e) =>
                    handleInputChange("contentType", e.target.value)
                  }
                  required
                  className="min-h-[100px] resize-none"
                />
              </div>

              {/* Writing Platforms */}
              <div className="space-y-2">
                <Label htmlFor="platforms" className="text-base font-medium">
                  Where do you write your content?
                </Label>
                <Textarea
                  id="platforms"
                  placeholder="Tell us where you publish your content - e.g., LinkedIn, Twitter, Facebook, Blog, Instagram, Newsletter, Medium, Substack, YouTube, or any other platforms you use."
                  value={formData.platforms}
                  onChange={(e) =>
                    handleInputChange("platforms", e.target.value)
                  }
                  required
                  className="min-h-[100px] resize-none"
                />
                <p className="text-sm text-gray-500">
                  Describe all the platforms where you regularly publish content
                </p>
              </div>

              {/* Pain Points */}
              <div className="space-y-2">
                <Label htmlFor="painPoints" className="text-base font-medium">
                  What are your biggest challenges when creating content?
                </Label>
                <Textarea
                  id="painPoints"
                  placeholder="Share the main pain points you face - e.g., writer's block, time constraints, maintaining consistency, finding the right tone, etc."
                  value={formData.painPoints}
                  onChange={(e) =>
                    handleInputChange("painPoints", e.target.value)
                  }
                  required
                  className="min-h-[100px] resize-none"
                />
              </div>

              <Separator />

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 text-lg font-medium"
              >
                {isSubmitting ? "Submitting Request..." : "Request Access"}
              </Button>

              <p className="text-sm text-gray-500 text-center">
                We&apos;ll review your application and get back to you soon :)
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
