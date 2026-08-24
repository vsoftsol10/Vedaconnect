import logo from "../../assets/images/vedaconnect-logo.png";

const OnboardingHeader = () => {
  return (
    <div className="flex flex-col items-center mb-10">
      <img
        src={logo}
        alt="VedaConnect"
        className="w-56 h-auto object-contain"
      />

      <span className="mt-2 text-xs font-semibold tracking-[0.25em] text-green-600 uppercase">
        Founding Member Onboarding
      </span>
    </div>
  );
};

export default OnboardingHeader;
