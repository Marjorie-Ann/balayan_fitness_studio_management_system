import express from "express";
import cors from "cors";
import clientRoutes from './routes/clientRoutes.js';
import trainerRoutes from './routes/trainerRoutes.js';
import "dotenv/config";
import "./config/db.js";
import adminRoutes from "./routes/adminRoutes.js";
import clientRoutes from "./routes/clientRoutes.js";

let corsOptions = {
    origin: 'http://localhost:5173'
};

// create express app
const app = express();

// to parse incoming data
app.use(express.json());
app.use(cors(corsOptions));

// test route
app.get('/', (req, res) => {
    res.json({ message: 'Balayan Fitness Studio API is running!' });
});

/* Routes implementation */
app.use('/admin', adminRoutes);
app.use('/client', clientRoutes);
app.use('/trainer', trainerRoutes);

try {
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        console.log(`listening to port ${port}...`);
    });
} catch (e) {
    console.log(e);
}