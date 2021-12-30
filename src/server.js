import express from "express";
import morgan from "morgan";
import session from "express-session";
import MongoStore from "connect-mongo";
import rootRouter from "./routers/rootRouter";
import videoRouter from "./routers/videoRouter";
import userRouter from "./routers/userRouter";
import apiRouter from "./routers/apiRouter";
import { localsMiddleware } from "./middlewares";

const app = express();
const logger = morgan("dev");

app.set("view engine", "pug");
app.set("views", process.cwd() + "/src/views");
app.use(logger);
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.DB_URL }),
  })
);
app.use(localsMiddleware);
app.use("/uploads", express.static("uploads")); // 앞에는 url, 뒤에는 폴더 이름
app.use("/static", express.static("assets")); // like this! http://localhost:4000/static/js/main.js , assets폴더 안의 파일을 불러옴
app.use("/", rootRouter);
app.use("/videos", videoRouter);
app.use("/users", userRouter);
app.use("/api", apiRouter);

export default app;