// src/app/api/pool/[id].ts

import { NextApiRequest, NextApiResponse } from "next";
import PoolService from "@/service/PoolService";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { method } = req;
  const { id } = req.query;

  switch (method) {
    case "GET": {
      const pool = await PoolService.findById(Number(id));
      if (!pool) return res.status(404).json({ message: "Pool not found" });
      return res.status(200).json(pool);
    }

    case "PUT": {
      const updatedPool = await PoolService.update(Number(id), req.body);
      if (!updatedPool)
        return res.status(404).json({ message: "Pool not found" });
      return res.status(200).json(updatedPool);
    }

    case "DELETE": {
      await PoolService.delete(Number(id));
      return res.status(204).end(); // No content response
    }

    default:
      return res.status(405).end(); // Method Not Allowed
  }
}
