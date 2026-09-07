import logo from "../../assets/images/vedaconnect-logo.png";

const OnboardingHeader = () => {
  return (
    <div className="mb-6 flex flex-col items-center sm:mb-10">
      <img
        src={logo}
        alt="VedaConnect"
        className="h-auto w-44 max-w-full object-contain sm:w-56"
      />

      <span className="mt-2 text-center text-[10px] font-semibold tracking-[0.18em] text-green-600 uppercase sm:text-xs sm:tracking-[0.25em]">
        Founding Member Onboarding
      </span>
    </div>
  );
};

export default OnboardingHeader;
