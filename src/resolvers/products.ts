import express = require("express");
import mongoose from "mongoose";
import slugify from "slugify";
import { Product } from "../models/product";
import { decodeCursor, encodeCursor, PageInfo } from "../utils/pagination";

const router = express.Router();

const DEFAULT_PAGE_SIZE = 30;

/** Indexes products */
router.get("/", async (req: express.Request, res: express.Response) => {
  const { search: pSearch, afterCursor } = req.query;

  const searchQuery = pSearch ? slugify(pSearch.toString()) : undefined;
  const searchFilter = Object.assign(
    { archived: false },
    searchQuery ? { description: new RegExp(searchQuery, "i") } : {}
  );

  console.log(searchFilter);
  const cursorFilters: any = afterCursor
    ? {
        _id: {
          $gt: decodeCursor(afterCursor),
        },
      }
    : {};

  let items = await Product.find({
    $and: [cursorFilters, searchFilter],
  }).limit(DEFAULT_PAGE_SIZE + 1);

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
    totalCount: await Product.countDocuments(searchFilter),
  });
});

/** Add new product */
router.post("/", async (req: express.Request, res: express.Response) => {
  const description: string = req.body.description;
  const deafultMeasurementUnit: string = req.body.deafultMeasurementUnit;
  const conversions: {
    measurementUnit: string;
    oneDefaultEquals: number;
  }[] = req.body.conversions;

  if (!description || !deafultMeasurementUnit || !conversions)
    return res.sendStatus(400);

  const newProduct = new Product({
    description,
    deafultMeasurementUnit,
    conversions,
    archived: false,
  });

  newProduct.save((err, prod) => {
    if (err) res.sendStatus(500);
    else res.status(201).send({ id: prod.id });
  });
});

/** Updated a product */
router.put("/:id", async (req: express.Request, res: express.Response) => {
  const id = req.params.id;
  const { description, deafultMeasurementUnit, conversions } = req.body;

  const update = {
    $set: Object.assign(
      {},
      description ? { description } : null,
      deafultMeasurementUnit ? { deafultMeasurementUnit } : null,
      conversions ? { conversions } : null
    ),
  };
  if (Object.keys(update.$set).length > 0) {
    await Product.updateOne({ _id: new mongoose.Types.ObjectId(id) }, update);
    res.sendStatus(200);
  }

  res.sendStatus(400);
});

/** Archives a product */
router.delete("/:id", async (req: express.Request, res: express.Response) => {
  const id = req.params.id;

  await Product.updateOne(
    { _id: new mongoose.Types.ObjectId(id) },
    { $set: { archived: true } }
  );

  res.sendStatus(200);
});

export default router;
