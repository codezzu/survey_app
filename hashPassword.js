const bcrypt = require('bcryptjs');

const password = '1995Onur_';
const hashedPassword = bcrypt.hashSync(password, 10);
console.log(hashedPassword);
