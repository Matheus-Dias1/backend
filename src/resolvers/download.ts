import express from "express";
import { authenticateToken } from "../middleware/authorization";
import { Workbook } from "exceljs";

const router = express.Router();
router.use(authenticateToken);

/** Indexes batches */
router.post("/", async (req: express.Request, res: express.Response) => {
  const data: {
    id?: string | undefined;
    item: string;
    amount: number;
    unit: string;
  }[] = req.body.data;
  const batch = req.body.batch;

  const wb = new Workbook();
  wb.properties.date1904 = true;
  wb.calcProperties.fullCalcOnLoad = true;

  const sheet = wb.addWorksheet(batch);

  const columns = [
    { name: "Item", width: 40, font: { color: { rgb: "FFF" } } },
    { name: "Unidade", width: 15 },
    { name: "Quantidade", width: 20 },
    { name: "Estoque", width: 20 },
    { name: "Faltante", width: 20 },
  ];

  const rows = data.map((x, i) => [
    x.item,
    x.unit,
    x.amount,
    0,
    { formula: `C${i + 2}-D${i + 2}` },
  ]);
  rows.push([]);

  sheet.addTable({
    name: batch,
    ref: "A1",
    style: {
      theme: "TableStyleLight8",
      showRowStripes: true,
    },
    columns,
    rows,
  });

  sheet.getRow(1).font = {
    color: { argb: "#ffffff" },
    size: 12,
    bold: true,
  };

  sheet.getColumn(1).width = 40;
  sheet.getColumn(2).width = 15;
  sheet.getColumn(3).width = 20;
  sheet.getColumn(4).width = 20;
  sheet.getColumn(5).width = 20;

  const buffer = await wb.xlsx.writeBuffer();

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader("Content-Disposition", "attachment; filename=records.xlsx");

  res.send(buffer);
});

export default router;
