import httpStatus from "http-status";
import { authenticate, generateAccessToken, registerUser } from "./AuthController";
import { Request, Response } from "express";

const daysToMilliseconds = function (days: number): number {
  return days * 24 * 60 * 60 * 1000;
}

const options = {
  path: "/api/v1/refresh",
  maxAge: daysToMilliseconds(90), // this cookie is permanent, and expires after 90 days have elapsed. 
  httpOnly: true,
  secure: false, // if true cookies will only be sent over TLS(https) connections.
  signed: false
}


export default [
  {
    path: "/auth/health",
    method: "get",
    handler: [
      (req: Request, res: Response) => {
        res.status(httpStatus.OK).send({ status: 'OK' })
      },
    ]
  },
  {
    path: "/auth/signup",
    method: "post",
    handler: [
      async (req: Request, res: Response) => {
        const { email, password } = req.body;

        let { accessToken, refreshToken } = await registerUser(email, password);
       
        res.
          cookie("refreshToken", refreshToken, options).
          status(httpStatus.OK).
          send({ auth: true, accessToken });
      },
    ],
  },
  {
    path: "/auth/signin",
    method: "post",
    handler: [
      async (req: Request, res: Response) => {
        const { email, password } = req.body
        let { accessToken, refreshToken } = await authenticate(email, password);

        res.
          cookie("refreshToken", refreshToken, options).
          status(httpStatus.OK).
          send({ auth: true, accessToken });
      },
    ],
  },
  {
    path: "/auth/refresh/token",
    method: "get",
    handler: [
      async (req: Request, res: Response) => {
        const { refreshToken } = req.cookies
        let accessToken = generateAccessToken(refreshToken);

        res.
          status(httpStatus.OK).
          send({ auth: true, accessToken });
      },
    ],
  },
]