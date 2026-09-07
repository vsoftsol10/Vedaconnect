const OnboardingCard = ({ children }) => {
  return (
    <div className="w-full rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-10 lg:p-12">
      {children}
    </div>
  );
};

export default OnboardingCard;
