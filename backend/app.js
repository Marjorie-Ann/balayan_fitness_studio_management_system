import express from "express";
import clientRoutes from './routes/clientRoutes.js';

const app = express();

app.use(express.json());

app.use('/client', clientRoutes);

try {
    const port = 3000;
    app.listen(port, () => {
        console.log(`listening to port ${port}...`);
    });
} catch (e) {
    console.log(e);
}