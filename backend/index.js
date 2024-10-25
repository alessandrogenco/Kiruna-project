import cors from'cors';
import express from 'express';

const app = express();
const PORT = 3001;

app.use(express.json());

const corsOptions = {
    origin: ["http://localhost:3000", "http://localhost:3002", "http://localhost:3003", "http://localhost:3004", "http://localhost:3005"],
    optionsSuccessStatus: 200,
    credentials: true
  };
  app.use(cors(corsOptions));
  

/* ACTIVATING THE SERVER */
let server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });

export { app, server }