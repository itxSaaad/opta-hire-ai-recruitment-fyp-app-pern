import { Helmet } from 'react-helmet-async';

import ComingSoon from './components/ui/ComingSoon';

function App() {
  return (
    <>
      <Helmet>
        <title>Coming Soon - OptaHire</title>
        <meta
          name="description"
          content="OptaHire is working hard to bring you an innovative recruitment platform. Stay tuned for something amazing!"
        />
      </Helmet>
      <ComingSoon />
    </>
  );
}

export default App;
