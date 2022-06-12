import express = require("express");
import mongoose from "mongoose";
import { Batch } from "../models/batch";
import { Order } from "../models/order";
import { decodeCursor, encodeCursor, PageInfo } from "../utils/pagination";

const router = express.Router();

const DEFAULT_PAGE_SIZE = 30;

/** Indexes orders */
router.get("/", async (req: express.Request, res: express.Response) => {
  const { search: pSearch, afterCursor } = req.query;

  const searchQuery = pSearch ? parseInt(pSearch.toString(), 10) : undefined;
  const searchFilter = Object.assign(
    { archived: false },
    searchQuery ? { batch: searchQuery } : {}
  );

  const cursorFilters: any = afterCursor
    ? {
        _id: {
          $gt: decodeCursor(afterCursor),
        },
      }
    : {};

  let items = await Order.find({
    $and: [cursorFilters, searchFilter],
  })
    .limit(DEFAULT_PAGE_SIZE + 1)
    .populate({
      path: "items",
      populate: {
        path: "item",
        model: "Product",
        select: "-_id",
      },
    })
    .sort({ _id: -1 });

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
    totalCount: await Order.countDocuments(searchFilter),
  });
});

/** Add new Order */
router.post("/", async (req: express.Request, res: express.Response) => {
  const { client, batch, deliverAt, items } = req.body;

  if (!client || !batch || !deliverAt || !items) return res.sendStatus(400);
  items.forEach((item: any) => {
    item.item = new mongoose.Types.ObjectId(item.item);
  });

  const newOrder = new Order({
    client,
    deliverAt,
    items,
    batch,
    createdAt: new Date(),
    archived: false,
  });

  newOrder.save(async (err, order) => {
    if (err) return res.sendStatus(500);
    await Batch.findByIdAndUpdate(batch, { $push: { orders: order.id } });
    res.status(201).send({ id: order.id });
  });
});

/** Updated a Order */
router.put("/:id", async (req: express.Request, res: express.Response) => {
  const id = req.params.id;
  const { client, batch, deliverAt, items } = req.body;

  const update = {
    $set: Object.assign(
      {},
      client ? { client } : null,
      batch ? { batch } : null,
      deliverAt ? { deliverAt } : null,
      items ? { items } : null
    ),
  };
  if (Object.keys(update.$set).length > 0) {
    await Order.updateOne({ _id: new mongoose.Types.ObjectId(id) }, update);
    return res.sendStatus(200);
  }

  res.sendStatus(400);
});

/** Archives a Order */
router.delete("/:id", async (req: express.Request, res: express.Response) => {
  const id = req.params.id;

  await Order.updateOne(
    { _id: new mongoose.Types.ObjectId(id) },
    { $set: { archived: true } }
  );

  res.sendStatus(200);
});

export default router;
