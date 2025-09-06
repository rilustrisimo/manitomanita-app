'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, ArrowLeft, Users, Gift, DollarSign, Sparkles, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { LoadingOverlay, LoadingButton } from '@/components/ui/loading';
import { createGroup } from '@/app/actions/create-group';

export default function NewGroupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [groupName, setGroupName] = useState('');
  const [exchangeDate, setExchangeDate] = useState<Date | undefined>();
  const [spendingMinimum, setSpendingMinimum] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Get today's date for minimum date validation
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Form validation
  const isStep1Valid = groupName.trim().length >= 3;
  const isStep2Valid = exchangeDate && exchangeDate >= today;
  const isStep3Valid = spendingMinimum && Number(spendingMinimum) > 0;
  const isFormValid = isStep1Valid && isStep2Valid && isStep3Valid;

  const handleCreateGroup = async (formData: FormData) => {
    if (!isFormValid) {
      toast({
        variant: "destructive",
        title: "Please complete all fields",
        description: "Make sure all information is filled out correctly.",
      });
      return;
    }

    setIsCreating(true);
    
    try {
      const actionFormData = new FormData();
      actionFormData.append('groupName', groupName);
      actionFormData.append('exchangeDate', exchangeDate!.toISOString().split('T')[0]);
      actionFormData.append('spendingMinimum', spendingMinimum);

      const newGroupId = await createGroup(actionFormData);
      
      toast({
        title: "🎉 Group Created Successfully!",
        description: `"${groupName}" is ready for members to join.`,
      });

      router.push(`/groups/${newGroupId}`);
      
    } catch (error) {
      console.error('Group creation error:', error);
      toast({
        variant: "destructive",
        title: "Unable to create group",
        description: error instanceof Error ? error.message : "Please try again in a moment.",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent/5 via-white to-accent/10">
      <LoadingOverlay 
        isLoading={isCreating} 
        message="✨ Creating your magical gift exchange group..."
      >
        {/* Header */}
        <div className="relative overflow-hidden bg-white/80 backdrop-blur-xl border-b border-gray-200/50">
          <div className="absolute inset-0 bg-gradient-to-r from-accent/5 to-primary/5"></div>
          <div className="relative max-w-4xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <Link 
                href="/dashboard" 
                className="flex items-center gap-3 text-gray-600 hover:text-gray-900 transition-all duration-200 group"
              >
                <div className="p-2 rounded-full bg-gray-100 group-hover:bg-accent/10 transition-colors">
                  <ArrowLeft className="w-4 h-4" />
                </div>
                <span className="font-medium">Back to Dashboard</span>
              </Link>
              <div className="text-sm text-gray-500 bg-accent/10 px-3 py-1.5 rounded-full">
                Step {currentStep} of 3
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-2xl mx-auto px-6 py-12">
          {/* Progress Indicator */}
          <div className="mb-12">
            <div className="flex items-center justify-center space-x-8">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-all duration-300",
                    step < currentStep ? "bg-accent text-white" :
                    step === currentStep ? "bg-primary text-white shadow-lg shadow-primary/30" :
                    "bg-gray-200 text-gray-400"
                  )}>
                    {step < currentStep ? <CheckCircle2 className="w-6 h-6" /> : step}
                  </div>
                  {step < 3 && (
                    <div className={cn(
                      "w-16 h-1 mx-4 rounded-full transition-all duration-300",
                      step < currentStep ? "bg-accent" : "bg-gray-200"
                    )} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-200/50 overflow-hidden">
            <form action={handleCreateGroup}>
              {/* Step 1: Group Name */}
              {currentStep === 1 && (
                <div className="p-8 space-y-8">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mx-auto">
                      <Users className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                      Name Your Group
                    </h1>
                    <p className="text-gray-600 text-lg max-w-md mx-auto">
                      Choose a memorable name that captures the spirit of your gift exchange
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="group-name" className="text-base font-medium text-gray-700">
                      Group Name
                    </Label>
                    <Input
                      id="group-name"
                      name="groupName"
                      placeholder="e.g., Holiday Office Party 2025"
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      className="h-14 text-lg rounded-2xl border-2 border-gray-200 focus:border-accent focus:ring-0 transition-all duration-200"
                      required
                    />
                    {groupName.length > 0 && groupName.length < 3 && (
                      <p className="text-sm text-amber-600 flex items-center gap-2">
                        <span className="w-1 h-1 bg-amber-600 rounded-full"></span>
                        Name should be at least 3 characters
                      </p>
                    )}
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button
                      type="button"
                      onClick={nextStep}
                      disabled={!isStep1Valid}
                      className="h-12 px-8 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold rounded-2xl shadow-lg shadow-accent/30 hover:shadow-accent/40 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Continue
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2: Exchange Date */}
              {currentStep === 2 && (
                <div className="p-8 space-y-8">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-accent to-primary rounded-2xl flex items-center justify-center mx-auto">
                      <CalendarIcon className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
                      When's the Big Day?
                    </h1>
                    <p className="text-gray-600 text-lg max-w-md mx-auto">
                      Pick the perfect date for your gift exchange celebration
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="exchange-date" className="text-base font-medium text-gray-700">
                      Exchange Date
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full h-14 justify-start text-left font-normal rounded-2xl border-2 border-gray-200 hover:border-accent transition-all duration-200",
                            !exchangeDate && "text-gray-400"
                          )}
                          type="button"
                        >
                          <CalendarIcon className="mr-3 h-5 w-5" />
                          {exchangeDate ? format(exchangeDate, "EEEE, MMMM do, yyyy") : "Select a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 border-0 shadow-xl rounded-2xl" align="center">
                        <Calendar
                          mode="single"
                          selected={exchangeDate}
                          onSelect={setExchangeDate}
                          disabled={(date) => date < today}
                          initialFocus
                          className="rounded-2xl border-0"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button
                      type="button"
                      onClick={prevStep}
                      variant="outline"
                      className="h-12 px-8 rounded-2xl border-2 border-gray-300 hover:border-gray-400 transition-all duration-200"
                    >
                      Back
                    </Button>
                    <Button
                      type="button"
                      onClick={nextStep}
                      disabled={!isStep2Valid}
                      className="h-12 px-8 bg-gradient-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90 text-white font-semibold rounded-2xl shadow-lg shadow-accent/30 hover:shadow-accent/40 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Continue
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Spending Amount */}
              {currentStep === 3 && (
                <div className="p-8 space-y-8">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-accent to-primary rounded-2xl flex items-center justify-center mx-auto">
                      <DollarSign className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
                      Set the Budget
                    </h1>
                    <p className="text-gray-600 text-lg max-w-md mx-auto">
                      What's the minimum spending amount for gifts?
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="spending-minimum" className="text-base font-medium text-gray-700">
                      Minimum Spending Amount (₱)
                    </Label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg font-semibold">
                        ₱
                      </div>
                      <Input
                        id="spending-minimum"
                        name="spendingMinimum"
                        type="number"
                        placeholder="1000"
                        value={spendingMinimum}
                        onChange={(e) => setSpendingMinimum(e.target.value)}
                        min="1"
                        step="1"
                        className="h-14 pl-12 text-lg rounded-2xl border-2 border-gray-200 focus:border-accent focus:ring-0 transition-all duration-200"
                        required
                      />
                    </div>
                    {spendingMinimum && Number(spendingMinimum) <= 0 && (
                      <p className="text-sm text-amber-600 flex items-center gap-2">
                        <span className="w-1 h-1 bg-amber-600 rounded-full"></span>
                        Please enter a valid amount
                      </p>
                    )}
                  </div>

                  {/* Summary Card */}
                  {isFormValid && (
                    <div className="bg-gradient-to-br from-accent/10 to-primary/10 rounded-2xl p-6 border border-accent/20">
                      <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-accent" />
                        Group Summary
                      </h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Group Name:</span>
                          <span className="font-medium text-gray-800">{groupName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Exchange Date:</span>
                          <span className="font-medium text-gray-800">
                            {exchangeDate ? format(exchangeDate, "MMM do, yyyy") : ""}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Minimum Budget:</span>
                          <span className="font-medium text-gray-800">₱{spendingMinimum}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between pt-4">
                    <Button
                      type="button"
                      onClick={prevStep}
                      variant="outline"
                      disabled={isCreating}
                      className="h-12 px-8 rounded-2xl border-2 border-gray-300 hover:border-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Back
                    </Button>
                    <LoadingButton
                      type="submit"
                      isLoading={isCreating}
                      loadingText="Creating your group..."
                      disabled={!isFormValid || isCreating}
                      className="h-12 px-8 bg-gradient-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90 text-white font-semibold rounded-2xl shadow-lg shadow-accent/30 hover:shadow-accent/40 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {!isCreating && <Gift className="w-5 h-5 mr-2" />}
                      Create Group
                    </LoadingButton>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Helper Text */}
          <div className="text-center mt-8">
            <p className="text-gray-500 text-sm">
              You'll be able to invite members and customize settings after creating the group
            </p>
          </div>
        </div>
      </LoadingOverlay>
    </div>
  );
}
