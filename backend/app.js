import express from "express";
import cors from "cors";
import clientRoutes from './routes/clientRoutes.js';
import trainerRoutes from './routes/trainerRoutes.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/client', clientRoutes);
app.use('/trainer', trainerRoutes);

try {
    const port = 3000;
    app.listen(port, () => {
        console.log(`listening to port ${port}...`);
    });
} catch (e) {
    console.log(e);
}