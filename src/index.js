const express = require('express');
const app = express();

const port = 3000;

app.get('/', (req, res) => res.send('Hello World!'));

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

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
