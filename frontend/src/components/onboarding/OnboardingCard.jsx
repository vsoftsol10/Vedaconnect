const OnboardingCard = ({ children }) => {
  return (
    <div className="w-full bg-white border border-gray-100 rounded-2xl shadow-sm p-8 sm:p-10 lg:p-12">
      {children}
    </div>
  );
};

export default OnboardingCard;
