import nod from 'nod-validate';

// Hook our SCSS framework form field status classes into the nod validation system before use
nod.classes.errorClass = 'alert-error';
nod.classes.successClass = 'alert-success';
nod.classes.errorMessageClass = 'alert-info';

export default nod;
