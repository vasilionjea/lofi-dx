import './styles/style.scss';
import appService from './services/app';
import AppComponent from './components/app';

// Off we go!
const app = new AppComponent(appService);
app.start();
