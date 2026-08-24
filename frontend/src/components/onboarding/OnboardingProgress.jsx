const STEPS = [
  "Personal Details",
  "Business Details",
  "Business Certificate",
  "Membership",
  "Complete Membership",
];

const OnboardingProgress = ({ currentStep = 1 }) => {
  const totalSteps = STEPS.length;

  const percent = Math.round((currentStep / totalSteps) * 100);

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2 px-1">
        <span className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
          Step {currentStep} of {totalSteps}
        </span>

        <span className="text-xs font-semibold text-gray-500">
          {percent}% complete
        </span>
      </div>

      <div className="flex gap-1.5">
        {STEPS.map((step, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber <= currentStep;

          return (
            <div
              key={step}
              title={step}
              className="h-1.5 flex-1 rounded-full bg-gray-200 overflow-hidden"
            >
              {isActive && (
                <div className="h-full w-full rounded-full bg-gradient-to-r from-amber-400 to-green-500" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OnboardingProgress;
