import './styles/style.scss';
import appService from './services/app';
import App from './app';

const app = new App(appService);
app.start();
