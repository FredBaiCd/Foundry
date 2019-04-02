import CoreAuth from './core/Auth';
import SelectWrapper from './components/SelectWrapper';

export default class Auth extends CoreAuth {
  selectWrapCallback($selectEl) {
    new SelectWrapper($selectEl);
  }
}
