import { Helmet } from 'react-helmet-async';
function App() {
  return (
    <>
      <Helmet>
        <title>OptaHire - Revolutionizing Talent Acquisition</title>
        <meta
          name="description"
          content="OptaHire is a recruitment platform that helps you find the best job for you."
        />
      </Helmet>
      <section className="bg-gray-100 text-gray-800 min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full p-4 bg-white rounded-lg shadow-lg">
          <h1 className="text-2xl font-semibold mb-4">Hello, Tailwind CSS!</h1>
          <p className="text-gray-600">
            This is a simple Tailwind CSS template.
          </p>
        </div>
      </section>
    </>
  );
}

export default App;
