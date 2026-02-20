import * as Notifications from 'expo-notifications';
import uuid from 'react-native-uuid';
import { db } from './database';

/* ================= TYPE ================= */

export type NotificationLocal = {
  id: string;
  orderId: string;
  title: string;
  description: string;
  date: string;
  read: number; // 0 = non lue, 1 = lue
};

/* ================= GET & MARK READ ================= */

export const getNotifications = (): NotificationLocal[] =>
  db.getAllSync(`SELECT * FROM notifications ORDER BY date DESC`);

export const markNotificationAsRead = (id: string) =>
  db.runSync(`UPDATE notifications SET read = 1 WHERE id = ?`, [id]);

/* ================= UTILS ================= */

// Vérifie si deux dates sont le même jour
const isSameDay = (d1: Date, d2: Date): boolean => {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

/* ================= DELIVERY REMINDERS ================= */

export const checkDeliveryReminders = async (): Promise<void> => {

  const now = new Date();
  const nowMs = now.getTime();
  const FIVE_DAYS_MS = 5 * 24 * 60 * 60 * 1000;

  const orders = db.getAllSync(`
    SELECT o.*, c.name as clientName
    FROM orders o
    JOIN clients c ON o.clientId = c.id
    WHERE o.status != 'livrée'
    AND o.deliveryDate IS NOT NULL
  `) as Array<{
    id: string;
    clientName: string;
    deliveryDate: string;
    lastReminderDate?: string | null;
  }>;

  for (const order of orders) {

    const deliveryTime = new Date(order.deliveryDate).getTime();
    const diff = deliveryTime - nowMs;

    // Livraison dans 5 jours max
    if (!(diff > 0 && diff <= FIVE_DAYS_MS)) continue;

    // Déjà notifié aujourd’hui ?
    if (
      order.lastReminderDate &&
      isSameDay(new Date(order.lastReminderDate), now)
    ) continue;

    // Récupération vêtements
    const items = db.getAllSync(
      `SELECT clothType FROM order_items WHERE orderId = ?`,
      [order.id]
    ) as Array<{ clothType: string }>;

    const clothList = [...new Set(items.map(i => i.clothType))].join(", ");

    const daysLeft = Math.ceil(
  (new Date(order.deliveryDate).getTime() - Date.now()) /
  (1000 * 60 * 60 * 24)
);

const formattedDate = new Date(order.deliveryDate).toLocaleDateString("fr-FR", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

const message = `⚠️ Livraison dans ${daysLeft} jour(s) : La commande de ${order.clientName} (${clothList}) doit être livrée le ${formattedDate}. Veuillez finaliser les retouches si nécessaire.`;

    // Notification immédiate
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Rappel de livraison",
        body: message,
      },
      trigger: null,
    });

    // Mise à jour date dernier rappel
    db.runSync(
      `UPDATE orders SET lastReminderDate = ? WHERE id = ?`,
      [now.toISOString(), order.id]
    );

    // Historique local
    db.runSync(
      `INSERT INTO notifications (id, orderId, title, description, date, read)
       VALUES (?,?,?,?,?,0)`,
      [
        uuid.v4().toString(),
        order.id,
        "Rappel livraison",
        message,
        now.toISOString(),
      ]
    );
  }
};