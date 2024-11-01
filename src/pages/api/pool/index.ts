import { NextApiRequest, NextApiResponse } from "next";
import PoolService from "@/service/PoolService";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { method } = req;

  console.log("method", method);

  switch (method) {
    case "POST": {
      const newPool = await PoolService.create(req.body);
      return res.status(201).json(newPool);
    }

    case "GET": {
      // return res.status(200).json({
      //   message: "Pool created",
      // });
      const pools = await PoolService.findAll();
      return res.status(200).json(pools);
    }

    default:
      return res.status(405).end(); // Method Not Allowed
  }
}
