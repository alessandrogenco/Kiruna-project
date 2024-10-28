// HomePage.jsx
import { useNavigate } from 'react-router-dom';

function HomePage({ username }) {
  const navigate = useNavigate();

  return (
    <div className="text-center vh-100 d-flex flex-column justify-content-center align-items-center">
      <h1 className="mb-4">Benvenuto{username ? `, ${username}` : ''}!</h1>
      <div>
        <button className="btn btn-primary me-3" onClick={() => navigate('/login')}>
          Login
        </button>
        <button className="btn btn-secondary" onClick={() => navigate('/explore')}>
          Start to Explore
        </button>
      </div>
    </div>
  );
}

export default HomePage;
