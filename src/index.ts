import express from "express";
import SubjectRouter from "./routes/subject";
import cors from "cors";


const app = express();
const port = 8000;

app.use(cors({
	origin: process.env.FRONTEND_URL,
	methods: ["GET", "POST", "PUT", "DELETE"],
	credentials: true,
}));
app.use(express.json());

app.use('/api/subjects',SubjectRouter)

app.get("/", (_request, response) => {
	response.send("Classroom API is running.");
});

app.listen(port, () => {
	console.log(`Server running at http://localhost:${port}`);
});
