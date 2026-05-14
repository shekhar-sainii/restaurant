import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { addNotification } from '../redux/slices/notificationSlice';
import socket from '../services/socket';

/**
 * Registers service worker, requests push permission,
 * and listens to socket events to create in-app + native notifications.
 * Only active for ADMIN, KITCHEN, DELIVERY roles.
 */
const useNotifications = (role) => {
  const dispatch = useDispatch();
  const swReg = useRef(null);

  // Register service worker
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('/sw.js').then(reg => {
      swReg.current = reg;
    }).catch(() => {});
  }, []);

  // Request notification permission
  useEffect(() => {
    if (!role || role === 'USER') return;
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, [role]);

  // Fire a native browser/device notification
  const fireNative = (title, body, url = '/admin/order-mgmt') => {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    // Use service worker notification if available (works on mobile)
    if (swReg.current) {
      swReg.current.showNotification(title, {
        body,
        icon: '/vite.svg',
        badge: '/vite.svg',
        tag: 'pk-order',
        renotify: true,
        vibrate: [200, 100, 200],
        data: { url },
      });
    } else {
      new Notification(title, { body, icon: '/vite.svg' });
    }
  };

  // Socket listeners
  useEffect(() => {
    if (!role || role === 'USER') return;

    const handleNewOrder = (order) => {
      const title = '🍕 New Order!';
      const body  = `#${order.orderNumber} · ${order.items?.length} item(s) · ₹${order.totalAmount}`;

      dispatch(addNotification({
        title,
        body,
        type: 'new_order',
        orderId: order._id,
        orderNumber: order.orderNumber,
      }));

      fireNative(title, body, '/admin/order-mgmt');
    };

    const handleOrderUpdate = (order) => {
      // Only notify for meaningful status changes
      const notifyStatuses = ['PREPARING', 'READY', 'DELIVERED', 'CANCELLED'];
      if (!notifyStatuses.includes(order.orderStatus)) return;

      const statusLabels = {
        PREPARING: 'Being Prepared 🔥',
        READY: 'Ready for Pickup ✅',
        DELIVERED: 'Delivered 🎉',
        CANCELLED: 'Cancelled ❌',
      };

      const title = `Order ${statusLabels[order.orderStatus]}`;
      const body  = `#${order.orderNumber} · ₹${order.totalAmount}`;

      dispatch(addNotification({
        title,
        body,
        type: 'order_update',
        orderId: order._id,
        orderNumber: order.orderNumber,
        status: order.orderStatus,
      }));

      // Only fire native for ADMIN on status updates
      if (role === 'ADMIN') {
        fireNative(title, body, '/admin/order-mgmt');
      }
    };

    socket.on('order:new',     handleNewOrder);
    socket.on('order:updated', handleOrderUpdate);

    return () => {
      socket.off('order:new',     handleNewOrder);
      socket.off('order:updated', handleOrderUpdate);
    };
  }, [role, dispatch]);
};

export default useNotifications;
