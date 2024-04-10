import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors ({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit: "20kb"}));
app.use(express.urlencoded({extended: true, limit: "20kb"}));
app.use(express.static("public"));
app.use(cookieParser());

//routes import
import userRouter from "./routes/user.routes.js";


//routes declaration
app.use("/api/v1/users", userRouter);


  // ballu's code to get local ip address
// app.get("/", (req,res) => {
//     res.download(`src/2160.mp4`)
// })




// http://localhost:3000/api/v1/users/register


  // ballu's code to get local ip address
// import os from "os";
// const getLocalIPv4Address = () => {
//   const ifaces = os.networkInterfaces();

//   for (const iface in ifaces) {
//     for (const details of ifaces[iface]) {
//       if (details.family === 'IPv4' && !details.internal) {
//         return details.address;
//       }
//     }
//   }
// };
// const server = app.listen(process.env.PORT, function () {
//   console.log('Server is up');
//   const host = getLocalIPv4Address();
//   console.log(`Server is running at http://${host}:${server.address().port}`);
//  // generateSitemap();
// });




export {app}