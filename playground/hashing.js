const bcrypt = require('bcryptjs');

var password = 'abc123';

bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, (err, hash) => {
        console.log(hash);
    });
});

var hashedPassword = '$2a$10$/4yxv/57teBDOhkP886VcuOvlGYQoQ.74oK6gfKp5kgJjkwuARyBq';

bcrypt.compare(password, hashedPassword, (err, res) => {
    console.log(res);
})