import './styles/style.scss';
import App from './app';
import { add } from './utils';

const app = new App();
app.start();
console.log(`add: ${add(1, 2, 3, 4, 5)}`);
