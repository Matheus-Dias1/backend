import express from "express";
import { authenticateToken } from "../middleware/authorization";
import { Batch } from "../models/batch";
import { decodeCursor, encodeCursor, PageInfo } from "../utils/pagination";

const router = express.Router();
router.use(authenticateToken);

const DEFAULT_PAGE_SIZE = 30;

/** Indexes batches */
router.get("/", async (req: express.Request, res: express.Response) => {
  try {
    const { afterCursor, search } = req.query;

    const cursorFilters: any = afterCursor
      ? {
          _id: {
            $lt: decodeCursor(afterCursor),
          },
        }
      : {};

    const filters = cursorFilters;
    if (search) Object.assign(filters, { number: search });

    let items = await Batch.find(filters)
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
  } catch (err) {
    console.log("UNEXPECTED ERROR:", err);
    res.sendStatus(422);
  }
});

/** Add new Batch */
router.post("/", async (req: express.Request, res: express.Response) => {
  try {
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
  } catch (err) {
    console.log("UNEXPECTED ERROR:", err);
    res.sendStatus(422);
  }
});

/** Get orders of batches */
router.get("/summary", async (req: express.Request, res: express.Response) => {
  try {
    const { afterCursor, search: searchP } = req.query;
    const cursorFilters: any = afterCursor
      ? {
          _id: {
            $lt: decodeCursor(afterCursor),
          },
        }
      : {};

    const filters = cursorFilters;
    const search = parseInt(searchP ? searchP.toString() : "");
    if (searchP && !isNaN(search)) Object.assign(filters, { number: search });

    let items = await Batch.find(filters)
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
  } catch (err) {
    console.log("UNEXPECTED ERROR:", err);
    res.sendStatus(422);
  }
});

/** Get orders for a batch */
router.get(
  "/summary/:id",
  async (req: express.Request, res: express.Response) => {
    try {
      const id = req.params.id;
      let summary = await Batch.findById(id).populate({
        path: "orders",
        model: "Order",
        select: "-batch",
        populate: {
          path: "items",
          populate: {
            path: "item",
            model: "Product",
          },
        },
      });
      res.send(summary);
    } catch (err) {
      console.log("UNEXPECTED ERROR:", err);
      res.sendStatus(422);
    }
  }
);

export default router;
