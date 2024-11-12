import { Helmet } from 'react-helmet-async';
import { FaHome } from 'react-icons/fa';
import { Link } from 'react-router-dom';

export default function NotFoundScreen() {
  return (
    <>
      <Helmet>
        <title>404 - Page Not Found</title>
        <meta
          name="description"
          content="The page you are looking for might have been removed, had its name changed, or is temporarily unavailable."
        />
      </Helmet>
      <main className="relative flex flex-col items-center justify-center min-h-screen text-center px-4 sm:px-6 lg:px-8">
        <h1 className="absolute leading-3 text-[50vw] md:text-[20vw] sm:text-[30vw] font-extrabold text-primary opacity-10 flex items-center justify-center animate-pulse">
          404
        </h1>

        <div className="relative w-full max-w-xl z-10 flex flex-col items-center justify-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-darkText mb-4">
            Page Not Found
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-darkText opacity-80 mb-8">
            The page you are looking for might have been removed, had its name
            changed, or is temporarily unavailable.
          </p>

          <Link
            to="/"
            className="flex items-center space-x-2 text-base sm:text-lg md:text-xl font-medium text-primary hover:underline underline-offset-4 transition duration-300 ease-in-out transform hover:scale-105"
          >
            <FaHome />
            <span>Go to Home</span>
          </Link>
        </div>
      </main>
    </>
  );
}
