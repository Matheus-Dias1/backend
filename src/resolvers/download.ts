import express from "express";
import { authenticateToken } from "../middleware/authorization";
import { Workbook } from "exceljs";

const router = express.Router();
router.use(authenticateToken);

/** Generates general sheet */
router.post("/general", async (req: express.Request, res: express.Response) => {
  try {
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
  } catch (err) {
    console.log("UNEXPECTED ERROR:", err);
    res.sendStatus(422);
  }
});

/** Generates orders sheet */
router.post("/orders", async (req: express.Request, res: express.Response) => {
  try {
    const data: {
      client: string;
      deliverAt: string;
      items: {
        id: string;
        name: string;
        amount: number;
        unit: string;
      }[];
    }[] = req.body.data;
    const batch = req.body.batch;

    const wb = new Workbook();
    wb.properties.date1904 = true;
    wb.calcProperties.fullCalcOnLoad = true;

    const sheet = wb.addWorksheet(batch);

    const columns = [
      { name: "Item", width: 40, font: { color: { rgb: "FFF" } } },
      { name: "Quantidade", width: 20 },
      { name: "Unidade", width: 15 },
    ];
    data.forEach((client) => {
      const date = client.deliverAt ? new Date(client.deliverAt).toLocaleDateString('pt-BR') : '';
      const nameRow = sheet.addRow([`${client.client} - ${date}`]);
      nameRow.font = {
        size: 14,
        bold: true,
      };
      // sheet.addRow("teste");
      const currRow = sheet.rowCount;

      const rows = client.items.map((x, i) => [x.name, x.amount, x.unit]);

      rows.push([]);

      sheet.addTable({
        name: client.client,
        ref: `A${currRow + 1}`,
        columns,
        rows,
      });

      const headerRow = sheet.rowCount - rows.length;
      const header = sheet.getRow(headerRow)

      header.font = {
        size: 12,
        bold: true,
        color: {argb: 'ffffff'}
      };

      for (let i = headerRow; i <= headerRow - 1 + rows.length; i+=1) {
        [`A${i}`, `B${i}`, `C${i}`].forEach(cell => {
          const sCell = sheet.getCell(cell);
          if (i === headerRow) {
            sCell.fill = {
              type: 'pattern',
              pattern:'solid',
              fgColor:{argb: '3d85c6' }
          }
          } else {
            sCell.fill = {
                type: 'pattern',
                pattern:'solid',
                fgColor:{argb: i % 2 ? 'dbe5f1' : 'b8cce4' }
            }
          }
        })
      }
    });

    sheet.getColumn(1).width = 40;
    sheet.getColumn(2).width = 20;
    sheet.getColumn(3).width = 15;
    const buffer = await wb.xlsx.writeBuffer();

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=records.xlsx");

    res.send(buffer);
  } catch (err) {
    console.log("UNEXPECTED ERROR:", err);
    res.sendStatus(422);
  }
});

export default router;
