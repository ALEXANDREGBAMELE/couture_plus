import uuid from 'react-native-uuid';
import { db } from './database';

// export type OrderItemLocal = {
//   id: string;
//   clothType: string;
//   modelImage?: string | null;
//   fabricImage?: string | null;
//   orderId: string;
// };

// export type MeasurementLocal = {
//   id: string;
//   label: string;
//   value: number;
//   orderItemId: string;
// };

// export type OrderDetails = {
//   id: string;
//   status: string;
//   orderDate: string;
//   deliveryDate?: string;
//   notes?: string;
//   clientName: string;
//   clientPhone: string;
//   orderItems: {
//     id: string;
//     clothType: string;
//     modelImage?: { uri: string };
//     fabricImage?: { uri: string };
//     measurements: MeasurementLocal[];
//   }[];
// };

export type OrderItemLocal = {
  id: string;
  clothType: string;
  modelImage?: string | null;
  fabricImage?: string | null;
  orderId: string;
};


export type MeasurementLocal = {
  id: string;
  label: string;
  value: number;
  orderItemId: string;
};

export type OrderDetails = {
  id: string;
  status: "new" | "progress" | "done";
  orderDate: string;
  deliveryDate?: string | null;
  notes?: string | null;
  clientName: string;
  clientPhone: string;

  orderItems: {
    id: string;
    clothType: string;
    modelImage?: string | null;
    fabricImage?: string | null;
    measurements: MeasurementLocal[];
  }[];
};

export type OrderStatus =
  | "new"
  | "in_progress"
  | "delivered";
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
    status TEXT,
    orderDate TEXT,
    deliveryDate TEXT,
    notes TEXT,
    clientId TEXT,
    reminderSent INTEGER DEFAULT 0,
    lastReminderDate TEXT,
    synced INTEGER DEFAULT 0
  );
`);

  db.execSync(`
    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      clothType TEXT,
      modelImage TEXT,
      fabricImage TEXT,
      orderId TEXT
    );
  `);

  db.execSync(`
    CREATE TABLE IF NOT EXISTS measurements (
      id TEXT PRIMARY KEY,
      label TEXT,
      value REAL,
      orderItemId TEXT
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
  client: { name: string; phone: string };
  deliveryDate: string;
  status: string;
  orderDate: string;
  notes?: string;
  orderItems: {
    clothType: string;
    modelImage?: string;
    fabricImage?: string;
    measurements: { label: string; value: number }[];
  }[];
}) => {

  const clientId = uuid.v4().toString();
  const orderId = uuid.v4().toString();
  const now = new Date().toISOString();

  const run = (sql: string, params: (string | number)[]) =>
    db.runSync(sql, params);

  // CLIENT
  run(
    `INSERT INTO clients (id,name,phone,createdAt,synced) VALUES (?,?,?,?,0)`,
    [clientId, data.client.name, data.client.phone, now]
  );

  // ORDER
  run(
    `INSERT INTO orders (id,status,orderDate,deliveryDate,notes,clientId,reminderSent,synced)
     VALUES (?,?,?,?,?,?,0,0)`,
    [
      orderId,
      data.status,
      data.orderDate || now,
      data.deliveryDate,
      data.notes || "",
      clientId,
    ]
  );

  // ORDER ITEMS
  data.orderItems.forEach(item => {

    const itemId = uuid.v4().toString();

    run(
      `INSERT INTO order_items (id,clothType,modelImage,fabricImage,orderId)
       VALUES (?,?,?,?,?)`,
      [
        itemId,
        item.clothType,
        item.modelImage || "",
        item.fabricImage || "",
        orderId,
      ]
    );

    // MEASUREMENTS
    item.measurements.forEach(m => {
      run(
        `INSERT INTO measurements (id,label,value,orderItemId)
         VALUES (?,?,?,?)`,
        [
          uuid.v4().toString(),
          m.label,
          m.value,
          itemId,
        ]
      );
    });

  });
};


// ===============================
// GET ORDERS
// ===============================

export const getOrders = (): OrderDetails[] => {

  const orders = db.getAllSync(`
    SELECT o.*, c.name as clientName, c.phone as clientPhone
    FROM orders o
    JOIN clients c ON o.clientId = c.id
    ORDER BY o.orderDate DESC
  `) as any[];

  return orders.map(order => {

    const items = db.getAllSync(
      `SELECT * FROM order_items WHERE orderId = ?`,
      [order.id]
    ) as any[];

    const orderItems = items.map(item => {

      const measurements = db.getAllSync(
        `SELECT * FROM measurements WHERE orderItemId = ?`,
        [item.id]
      ) as MeasurementLocal[];

      return {
        id: item.id,
        clothType: item.clothType,
        modelImage: item.modelImage || null,
        fabricImage: item.fabricImage || null,
        measurements: measurements || [],
      };
    });

    return {
      ...order,
      status: order.status.toLowerCase(), // sécurise NEW -> new
      orderItems: orderItems || [],
    };
  });
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
  ) as any;

  if (!order) return null;

  const items = db.getAllSync(
    `SELECT * FROM order_items WHERE orderId = ?`,
    [id]
  ) as any[];

  const orderItems = items.map(item => {

    const measurements = db.getAllSync(
      `SELECT * FROM measurements WHERE orderItemId = ?`,
      [item.id]
    ) as MeasurementLocal[];

    return {
      id: item.id,
      clothType: item.clothType,
      modelImage: item.modelImage || null,
      fabricImage: item.fabricImage || null,
      measurements: measurements || [],
    };
  });

  return {
    ...order,
    status: order.status.toLowerCase(),
    orderItems: orderItems || [],
  };
};


// ===============================
// SYNC & DELETE
// ===============================

export const getUnsyncedOrders = () => db.getAllSync(`SELECT * FROM orders WHERE synced = 0`);

export const markOrderAsSynced = (id: string) => db.runSync(`UPDATE orders SET synced = 1 WHERE id = ?`, [id]);

export const deleteOrderOffline = (id: string) => {
  const items = db.getAllSync(
    `SELECT id FROM order_items WHERE orderId = ?`,
    [id]
  ) as any[];

  items.forEach(item => {
    db.runSync(
      `DELETE FROM measurements WHERE orderItemId = ?`,
      [item.id]
    );
  });

  db.runSync(`DELETE FROM order_items WHERE orderId = ?`, [id]);
  db.runSync(`DELETE FROM orders WHERE id = ?`, [id]);
};

export const markOrderAsDelivered = (id: string): void => {
  try {
    db.runSync(`UPDATE orders SET status = ? WHERE id = ?`, ["delivered", id]);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la commande :", error);
    throw error;
  }
};

export const resetDatabase = () => {
  console.log("🔄 Réinitialisation de la base de données...");

  // Supprimer les tables si elles existent
  db.execSync(`DROP TABLE IF EXISTS notifications;`);
  db.execSync(`DROP TABLE IF EXISTS measurements;`);
  db.execSync(`DROP TABLE IF EXISTS orders;`);
  db.execSync(`DROP TABLE IF EXISTS clients;`);


};
