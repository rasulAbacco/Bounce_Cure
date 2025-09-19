import { useNotificationContext } from "./NotificationContext";

function NotificationList() {
  const { allNotifications, deleteNotification, clearAllNotifications } = useNotificationContext();

  return (
    <div>
      <button onClick={clearAllNotifications}>Clear All</button>
      {allNotifications.map((n) => (
        <div key={n.id} style={{ display: "flex", justifyContent: "space-between" }}>
          <span>{n.message}</span>
          <button onClick={() => deleteNotification(n.id)}>❌ Delete</button>
        </div>
      ))}
    </div>
  );
}

export default NotificationList;
