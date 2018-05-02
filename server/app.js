/* eslint no-console: 0 */
import express from 'express';
import dotenv from 'dotenv';
import { trimStrings, handleErrors } from './middlewares';
import apiRoutes from './routes/api';
import otherRoutes from './routes/others';

dotenv.config();

const app = express();

const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(trimStrings);
app.use(apiRoutes);
app.use(otherRoutes);
app.use(handleErrors);

app.listen(port);

console.log(`Server started on localhost:${port}`);

export default app;
