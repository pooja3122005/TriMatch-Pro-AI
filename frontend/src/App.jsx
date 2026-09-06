import { useState } from 'react';
import LandingPage from './pages/LandingPage';
import PatientLogin from './pages/PatientLogin';
import ResearcherLogin from './pages/ResearcherLogin';
import PatientHome from './pages/PatientHome';
import UploadLab from './pages/UploadLab';
import ConsentPage from './pages/ConsentPage';
import ResearcherDashboard from './pages/ResearcherDashboard';
import Phase1Dashboard from './pages/Phase1Dashboard';

// Simple client-side router: page is a string key, params is an optional object.
// On first load we check URL search params so that links opened in a new tab
// (e.g. the researcher consent link: /?page=consent&patient=X&trial=Y) work.
export default function App() {
  const [page, setPage] = useState(() => {
    const sp = new URLSearchParams(window.location.search);
    return sp.get('page') || 'landing';
  });
  const [params, setParams] = useState(() => {
    const sp = new URLSearchParams(window.location.search);
    const out = {};
    sp.forEach((v, k) => { if (k !== 'page') out[k] = v; });
    return out;
  });

  const navigate = (target, newParams = {}) => {
    setParams(newParams);
    setPage(target);
    // Clear the URL query string so refreshing doesn't re-apply old params
    window.history.replaceState({}, '', window.location.pathname);
    window.scrollTo(0, 0);
  };

  const props = { navigate, params };

  switch (page) {
    case 'landing':          return <LandingPage {...props} />;
    case 'patient-login':    return <PatientLogin {...props} />;
    case 'researcher-login': return <ResearcherLogin {...props} />;
    case 'patient-home':     return <PatientHome {...props} />;
    case 'upload-lab':       return <UploadLab {...props} />;
    case 'consent':          return <ConsentPage {...props} />;
    case 'researcher':       return <ResearcherDashboard {...props} />;
    case 'phase1':           return <Phase1Dashboard {...props} />;
    default:                 return <LandingPage {...props} />;
  }
}

