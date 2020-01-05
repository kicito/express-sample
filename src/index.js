const express = require('express');
const morgan = require('morgan');

const app = express();
app.use(morgan('dev'));
app.use(express.json());

const users = require('../repo/json/users');

const port = 3000;

app.get('/', (_, res) => res.send('Hello World!'));

app.get('/users', (_, res) => {
    res.send(users);
});

app.get('/user/:id', (req, res) => {
    if (!req.params.id || isNaN(req.params.id)) {
        res.sendStatus(403);
        return;
    }
    const id = req.params.id;

    for (const user of users) {
        if (user.id == id) {
            res.send(user);
            return;
        }
    }
    res.sendStatus(500);
});

const requiredFieldCreate = [
    'name',
    'username',
    'email',
    'address.street',
    'address.suite',
    'address.city',
    'address.zipcode',
    'address.geo',
    'address.geo.lat',
    'address.geo.lng',
    'phone',
    'website',
    'company.name',
    'company.catchPhrase',
    'company.bs',
];

app.post('/user', (req, res) => {
    const newID = users.length + 1;
    if (!checkObjectKeys(req.body, requiredFieldCreate)) {
        res.sendStatus(403);
        return;
    }
    users.push({ newID, ...req.body });
    res.send({ newID, ...req.body });
});

app.put('/user', (req, res) => {
    const lookUpID = req.body.id;

    if (!checkObjectKeys(req.body, ['id', ...requiredFieldCreate])) {
        res.sendStatus(403);
        return;
    }

    users = users.map(user => {
        return user.id === lookUpID ? req.body : user;
    });

    res.send(lookUpID);
});

app.delete('/user/:id', (req, res) => {
    const lookUpID = req.body.id;

    users = users.filter(user => {
        return user.id !== lookUpID;
    });
    res.send(lookUpID);
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));

// graceful shutdown
['SIGINT', 'SIGTERM', 'SIGQUIT', 'SIGUSR2'].forEach(signal =>
    process.on(signal, () => {
        console.log('\n');
        try {
            // Do cleanup stuff
            console.log('closing webserver');
        } catch (e) {
            console.error('shutdown: ', e);
            process.exit(1);
        }
        process.exit(0);
    })
);

/**
 * checks if an object has all keys according to keys parameter
 * use dot for nested key eg. (obj, ["address.street"]) function will look for both obj.address and obj.address.street
 * @param {Object} obj
 * @param {string[]} keys
 */
function checkObjectKeys(obj, keys) {
    if (!keys || keys.length == 0) {
        return true;
    }
    const original = { ...obj };
    for (const key of keys) {
        if (key.includes('.')) {
            // check nested property
            const nestedKeys = key.split('.');
            for (const nestedKey of nestedKeys) {
                if (!obj.hasOwnProperty(nestedKey)) {
                    return false;
                }
                obj = obj[nestedKey];
            }
            obj = original;
        } else {
            if (!obj.hasOwnProperty(key)) {
                return false;
            }
        }
    }
    return true;
}
