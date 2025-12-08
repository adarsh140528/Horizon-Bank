// frontend/src/utils/notifications.js
export const pushNotification = (notif) => {
    const stored = localStorage.getItem("notifications");
    const arr = stored ? JSON.parse(stored) : [];
  
    arr.push({
      title: notif.title,
      message: notif.message,
      time: new Date().toLocaleString(),
    });
  
    localStorage.setItem("notifications", JSON.stringify(arr));
  };
  