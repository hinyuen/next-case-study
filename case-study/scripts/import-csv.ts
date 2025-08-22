import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';

// Path to SQLite DB and CSV file
const dbPath = path.join(process.cwd(), 'sqlite.db');
const csvPath = path.join(process.cwd(), 'data_case_study_q325.csv');

// Open DB
const db = new Database(dbPath);

// Table schema based on OrderRow type
const createTableSQL = `
CREATE TABLE IF NOT EXISTS orders (
  orderPublicId TEXT PRIMARY KEY,
  platformPublicId TEXT,
  customerName TEXT,
  customerEmail TEXT,
  destinationCountryCode TEXT,
  destinationCountry TEXT,
  orderStatus INTEGER,
  createdAt TEXT,
  paidAt TEXT,
  shippedAt TEXT,
  lastMileAvailableAt TEXT,
  shippingService TEXT,
  trackNumberMasked TEXT,
  lastMileCarrier TEXT,
  lastMileTrackingMasked TEXT,
  infoReceivedAt TEXT,
  inTransitAt TEXT,
  outForDeliveryAt TEXT,
  deliveredAt TEXT,
  failedAttemptAt TEXT,
  exceptionAt TEXT,
  expiredAt TEXT,
  availableForPickupAt TEXT
);
`;
db.exec(createTableSQL);

// Prepare insert statement for all columns
const insert = db.prepare(`
  INSERT OR REPLACE INTO orders (
    orderPublicId, platformPublicId, customerName, customerEmail, destinationCountryCode, destinationCountry, orderStatus, createdAt, paidAt, shippedAt, lastMileAvailableAt, shippingService, trackNumberMasked, lastMileCarrier, lastMileTrackingMasked, infoReceivedAt, inTransitAt, outForDeliveryAt, deliveredAt, failedAttemptAt, exceptionAt, expiredAt, availableForPickupAt
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

// Define a type for the CSV row
export type OrderRow = {
    orderPublicId: string;
    platformPublicId: string;
    customerName: string;
    customerEmail: string;
    destinationCountryCode: string;
    destinationCountry: string;
    orderStatus: number;
    createdAt: string;
    paidAt: string;
    shippedAt: string;
    lastMileAvailableAt: string;
    shippingService: string;
    trackNumberMasked: string;
    lastMileCarrier?: string;
    lastMileTrackingMasked?: string;
    infoReceivedAt: string;
    inTransitAt: string;
    outForDeliveryAt: string;
    deliveredAt: string;
    failedAttemptAt?: string;
    exceptionAt?: string;
    expiredAt?: string;
    availableForPickupAt?: string;
};

const rows: OrderRow[] = [];
fs.createReadStream(csvPath)
  .pipe(csv())
  .on('data', (row: OrderRow) => rows.push(row))
  .on('end', () => {
    db.transaction(() => {
      for (const row of rows) {
        insert.run(
          row.orderPublicId,
          row.platformPublicId,
          row.customerName,
          row.customerEmail,
          row.destinationCountryCode,
          row.destinationCountry,
          row.orderStatus,
          row.createdAt,
          row.paidAt,
          row.shippedAt,
          row.lastMileAvailableAt,
          row.shippingService,
          row.trackNumberMasked,
          row.lastMileCarrier ?? null,
          row.lastMileTrackingMasked ?? null,
          row.infoReceivedAt,
          row.inTransitAt,
          row.outForDeliveryAt,
          row.deliveredAt,
          row.failedAttemptAt ?? null,
          row.exceptionAt ?? null,
          row.expiredAt ?? null,
          row.availableForPickupAt ?? null
        );
      }
    })();
    console.log(`Imported ${rows.length} rows.`);
    db.close();
  });
