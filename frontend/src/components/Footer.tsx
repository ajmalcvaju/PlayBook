

const Footer = () => {
  return (
    <div className="bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 py-6 shadow-lg transform transition-all duration-300">
  <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
    <span className="text-sm md:text-lg text-white font-semibold tracking-tight text-center md:text-left mb-4 md:mb-0">
      PlayBook.com
    </span>
    <span className="text-white font-semibold text-sm md:text-base tracking-tight flex flex-col md:flex-row gap-4 md:gap-8 items-center md:items-start">
      <p className="cursor-pointer hover:text-gray-300 transition-colors duration-300">
        Privacy Policy
      </p>
      <p className="cursor-pointer hover:text-gray-300 transition-colors duration-300">
        Terms of Service
      </p>
    </span>
  </div>
</div>

  );
};

export default Footer;
