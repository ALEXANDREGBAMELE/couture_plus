import * as Notifications from 'expo-notifications';
import uuid from 'react-native-uuid';
import { db } from './database';
import { OrderDetails } from './orderRepository';

export type NotificationLocal = {
  id: string;
  orderId: string;
  title: string;
  description: string;
  date: string;
  read: number;
};

// ===============================
// GET & MARK READ
// ===============================

export const getNotifications = (): NotificationLocal[] =>
  db.getAllSync(`SELECT * FROM notifications ORDER BY date DESC`);

export const markNotificationAsRead = (id: string) =>
  db.runSync(`UPDATE notifications SET read = 1 WHERE id = ?`, [id]);

// ===============================
// DELIVERY REMINDERS
// ===============================

export const checkDeliveryReminders = async () => {
  const now = new Date().getTime();
  const orders: OrderDetails[] = db.getAllSync(`
    SELECT o.*, c.name as clientName
    FROM orders o
    JOIN clients c ON o.clientId = c.id
    WHERE o.status != 'done' AND o.reminderSent = 0
  `);

  for (const order of orders) {
    if (!order.deliveryDate) continue;

    const deliveryTime = new Date(order.deliveryDate).getTime();
    const fiveDaysBefore = deliveryTime - 5 * 24 * 60 * 60 * 1000;

    if (now >= fiveDaysBefore) {
      // envoyer la notification
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `Rappel: Livraison prochaine`,
          body: `Commande "${order.title}" pour ${order.clientName} sera bientôt livrée`,
        },
        trigger: null,
      });

      // mettre à jour reminderSent
      db.runSync(`UPDATE orders SET reminderSent = 1 WHERE id = ?`, [order.id]);

      // ajouter dans table notifications
      db.runSync(
        `INSERT INTO notifications (id, orderId, title, description, date, read)
         VALUES (?,?,?,?,?,0)`,
        [
          uuid.v4().toString(),
          order.id,
          'Rappel livraison',
          `Commande "${order.title}" pour ${order.clientName} sera bientôt livrée`,
          new Date().toISOString(),
        ]
      );
    }
  }
};
