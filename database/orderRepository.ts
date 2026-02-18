import uuid from 'react-native-uuid';
import { db } from './database';

export type OrderLocal = {
  id: string;
  title: string;
  status: string;
  orderDate: string;
  deliveryDate?: string;
  notes?: string;
  modelImage?: { uri: string } | undefined; // juste le chemin stocké en DB
  fabricImage?: { uri: string } | undefined;
  clientId: string;
  reminderSent: number;
  synced: number;
};

export type MeasurementLocal = {
  id: string;
  label: string;
  value: number;
  orderId: string;
  synced: number;
};

export type OrderDetails = OrderLocal & {
  clientName: string;
  clientPhone: string;
  measurements: MeasurementLocal[];
  modelImage?: { uri: string } | null; // pour l'affichage React Native
  fabricImage?: { uri: string } | null;
};


// ===============================
// INIT TABLES
// ===============================

export const initTables = () => {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS clients (
      id TEXT PRIMARY KEY,
      name TEXT,
      phone TEXT,
      createdAt TEXT,
      synced INTEGER DEFAULT 0
    );
  `);

  db.execSync(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      title TEXT,
      status TEXT,
      orderDate TEXT,
      deliveryDate TEXT,
      notes TEXT,
      modelImage TEXT,
      fabricImage TEXT,
      clientId TEXT,
      reminderSent INTEGER DEFAULT 0,
      synced INTEGER DEFAULT 0
    );
  `);

  db.execSync(`
    CREATE TABLE IF NOT EXISTS measurements (
      id TEXT PRIMARY KEY,
      label TEXT,
      value REAL,
      orderId TEXT,
      synced INTEGER DEFAULT 0
    );
  `);

  db.execSync(`
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      orderId TEXT,
      title TEXT,
      description TEXT,
      date TEXT,
      read INTEGER DEFAULT 0
    );
  `);
};

// ===============================
// CREATE ORDER OFFLINE
// ===============================

export const createOrderOffline = (data: {
  title: string;
  client: { name: string; phone: string };
  deliveryDate: string;
  notes?: string;
  modelImage?: string;
  fabricImage?: string;
  measurements: { label: string; value: number }[];
}) => {
  const clientId = uuid.v4().toString();
  const orderId = uuid.v4().toString();
  const now = new Date().toISOString();

  const run = (sql: string, params: (string | number)[]) => db.runSync(sql, params);

  // Client
  run(
    `INSERT INTO clients (id,name,phone,createdAt,synced) VALUES (?,?,?,?,0)`,
    [clientId, data.client.name, data.client.phone, now]
  );

  // Order
  run(
    `INSERT INTO orders (id,title,status,orderDate,deliveryDate,notes,modelImage,fabricImage,clientId,reminderSent,synced)
     VALUES (?,?,?,?,?,?,?,?,?,?,0)`,
    [
      orderId,
      data.title,
      'NEW',
      now,
      data.deliveryDate,
      data.notes || '',
      data.modelImage || '',
      data.fabricImage || '',
      clientId,
      0,
    ]
  );

  // Measurements
  data.measurements.forEach((m) => {
    run(
      `INSERT INTO measurements (id,label,value,orderId,synced) VALUES (?,?,?,?,0)`,
      [uuid.v4().toString(), m.label, m.value, orderId]
    );
  });

  // Notification
  run(
    `INSERT INTO notifications (id,orderId,title,description,date,read) VALUES (?,?,?,?,?,0)`,
    [uuid.v4().toString(), orderId, 'Nouvelle commande reçue', `Commande de ${data.client.name} ajoutée.`, now]
  );
};

// ===============================
// GET ORDERS
// ===============================

export const getOrders = () => {
  return db.getAllSync(`
    SELECT o.*, c.name as clientName
    FROM orders o
    JOIN clients c ON o.clientId = c.id
    ORDER BY o.orderDate DESC
  `) as OrderDetails[];
};

export const getOrderById = (id: string): OrderDetails | null => {
  const order = db.getFirstSync(
    `
    SELECT o.*, c.name as clientName, c.phone as clientPhone
    FROM orders o
    JOIN clients c ON c.id = o.clientId
    WHERE o.id = ?
  `,
    [id]
  ) as OrderLocal & { clientName: string; clientPhone: string } | null;

  if (!order) return null;

  const measurements = db.getAllSync(
    `SELECT * FROM measurements WHERE orderId = ?`,
    [id]
  ) as MeasurementLocal[];

  return {
    ...order,
    measurements,
    modelImage: order.modelImage ? { uri: order.modelImage as any } : undefined,
    fabricImage: order.fabricImage ? { uri: order.fabricImage  as any} : undefined,
  };
};

// ===============================
// SYNC & DELETE
// ===============================

export const getUnsyncedOrders = () => db.getAllSync(`SELECT * FROM orders WHERE synced = 0`);

export const markOrderAsSynced = (id: string) => db.runSync(`UPDATE orders SET synced = 1 WHERE id = ?`, [id]);

export const deleteOrderOffline = (id: string) => {
  db.runSync(`DELETE FROM measurements WHERE orderId = ?`, [id]);
  db.runSync(`DELETE FROM orders WHERE id = ?`, [id]);
};

export const resetDatabase = () => {
  console.log("🔄 Réinitialisation de la base de données...");

  // Supprimer les tables si elles existent
  db.execSync(`DROP TABLE IF EXISTS notifications;`);
  db.execSync(`DROP TABLE IF EXISTS measurements;`);
  db.execSync(`DROP TABLE IF EXISTS orders;`);
  db.execSync(`DROP TABLE IF EXISTS clients;`);

  console.log("Toutes les tables ont été supprimées ✔️");

  // Recréer les tables avec les champs corrects
  initTables();

  console.log("Toutes les tables ont été recréées ✔️");
};
