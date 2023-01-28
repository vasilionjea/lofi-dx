import './styles/style.scss';
import AppService from './services/app';
import AppComponent from './components/app';

// Off we go!
const app = new AppComponent(new AppService());
app.start();
