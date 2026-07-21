const bcrypt = require('bcryptjs');
console.time('hash12');
bcrypt.hashSync('password', 12);
console.timeEnd('hash12');
console.time('hash10');
bcrypt.hashSync('password', 10);
console.timeEnd('hash10');
