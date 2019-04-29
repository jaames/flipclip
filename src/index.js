import { App } from './components/App';
import { render } from 'react-dom';
import ReactGA from 'react-ga';

if (process.env.NODE_ENV === 'production') {
  ReactGA.initialize('UA-52026208-6');
  ReactGA.set({anonymizeIp: true});
  ReactGA.pageview(window.location.pathname + window.location.search);
}

render(<App/>, document.getElementById('app'));