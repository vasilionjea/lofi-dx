import './styles/style.scss';
import appService from './services/app';
import AppComponent from './components/app';

const app = new AppComponent(appService);
app.start();
