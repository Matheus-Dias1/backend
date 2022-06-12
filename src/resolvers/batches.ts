import express from "express";
import { authenticateToken } from "../middleware/authorization";
import { Batch } from "../models/batch";
import { decodeCursor, encodeCursor, PageInfo } from "../utils/pagination";

const router = express.Router();
router.use(authenticateToken);

const DEFAULT_PAGE_SIZE = 30;

/** Indexes batches */
router.get("/", async (req: express.Request, res: express.Response) => {
  const { afterCursor } = req.query;

  const cursorFilters: any = afterCursor
    ? {
        _id: {
          $gt: decodeCursor(afterCursor),
        },
      }
    : {};

  let items = await Batch.find(cursorFilters)
    .limit(DEFAULT_PAGE_SIZE + 1)
    .sort({ _id: -1 })
    .select(["number", "startDate", "endDate"]);

  const hasNextPage = items.length > DEFAULT_PAGE_SIZE;
  if (hasNextPage) items = items.slice(0, DEFAULT_PAGE_SIZE);

  const edges = items.map((r) => ({
    cursor: encodeCursor(r.id.toString()),
    node: r,
  }));

  const pageInfo: PageInfo = {
    endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : null,
    hasNextPage,
    startCursor: edges.length > 0 ? edges[0].cursor : null,
  };

  res.send({
    pageInfo,
    edges,
    totalCount: await Batch.countDocuments(),
  });
});

/** Add new Batch */
router.post("/", async (req: express.Request, res: express.Response) => {
  const { startDate, endDate } = req.body;

  if (!startDate || !endDate) return res.sendStatus(400);

  const nextBatch = (await Batch.countDocuments()) + 1;

  const newBatch = new Batch({
    startDate,
    endDate,
    number: nextBatch,
  });

  newBatch.save((err, batch) => {
    if (err) res.sendStatus(500);
    else res.status(201).send({ id: batch.id });
  });
});

/** Get orders of batches */
router.get("/summary", async (req: express.Request, res: express.Response) => {
  const { afterCursor } = req.query;
  const cursorFilters: any = afterCursor
    ? {
        _id: {
          $gt: decodeCursor(afterCursor),
        },
      }
    : {};

  let items = await Batch.find(cursorFilters)
    .limit(DEFAULT_PAGE_SIZE + 1)
    .sort({ _id: -1 })
    .populate({
      path: "orders",
      model: "Order",
      select: "-batch",
      populate: {
        path: "items",
        populate: {
          path: "item",
          model: "Product",
          select: "-_id",
        },
      },
    });

  const hasNextPage = items.length > DEFAULT_PAGE_SIZE;
  if (hasNextPage) items = items.slice(0, DEFAULT_PAGE_SIZE);
  const edges = items.map((r) => ({
    cursor: encodeCursor(r.id.toString()),
    node: r,
  }));
  const pageInfo: PageInfo = {
    endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : null,
    hasNextPage,
    startCursor: edges.length > 0 ? edges[0].cursor : null,
  };
  res.send({
    pageInfo,
    edges,
    totalCount: await Batch.countDocuments(),
  });
});

export default router;
