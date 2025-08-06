import cors from "cors";

export function setupCors(app) {
  app.use(cors({
    origin: "http://localhost:5173", // Update if your frontend runs elsewhere
    credentials: true,
  }));
}
