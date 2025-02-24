import Logo from '../../assets/images/logo.png';

export default function HeroSection() {
  return (
    <section className="relative h-screen flex items-center justify-center pt-20 px-6 sm:px-10">
      <div className="absolute inset-0 bg-cover bg-center z-0 animate-fadeIn">
        <img
          src={Logo}
          alt="OptaHire Logo"
          className="h-full w-full object-cover opacity-50"
        />
      </div>
      <div className="relative z-10 text-center dark:text-dark-text text-light-text animate-fadeIn">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold drop-shadow-lg">
          Simplifying Hiring with{' '}
          <span className="text-light-secondary dark:text-dark-secondary">
            OptaHire
          </span>
        </h1>
        <h2 className="text-light-text dark:text-dark-text text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold drop-shadow-lg">
          The Ultimate Hiring Platform
        </h2>
        <p className="text-light-text dark:text-dark-text text-lg sm:text-xl md:text-2xl mt-4 drop-shadow-md mx-auto max-w-2xl">
          Empowering recruiters to connect, interview, and select candidates
          seamlessly.
        </p>
        <a
          href="#for-recruiters"
          className="inline-block mt-8 sm:mt-10 text-lg bg-light-primary dark:bg-dark-primary text-light-background dark:text-dark-background px-8 py-4 rounded-lg shadow-lg transform transition-transform hover:scale-110 hover:shadow-2xl duration-300 ease-in-out"
        >
          Get Started
        </a>
      </div>
    </section>
  );
}
