import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles/global.css';
import './styles/home.css';
import './styles/compose.css';
import './styles/result.css';
import './styles/send.css';
import './styles/treehole.css';
import './styles/about.css';
import './styles/components.css';

createRoot(document.getElementById('root')).render(<App />);
