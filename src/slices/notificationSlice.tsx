import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface NotificationItem {
  type: string;
  message: string;
  senderId?: string;
   profileImage?: {
    url: string;
    publicId: string;
  };
}

interface NotificationState {
  liveNotifications: NotificationItem[];
}


const initialState: NotificationState = {
  liveNotifications: []
};

const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
 addNotification: (state, action: PayloadAction<NotificationItem>) => {

  const exists = state.liveNotifications.some(
    n =>
      n.type === action.payload.type &&
      n.senderId === action.payload.senderId
  );

  if (!exists) {
    state.liveNotifications.unshift(action.payload);
  }
},

    clearNotifications: (state) => {
      state.liveNotifications = [];
    },
  removeNotificationBySenderId: (state, action: PayloadAction<string>) => {

  state.liveNotifications =
    state.liveNotifications.filter(
      n => n.senderId !== action.payload
    );

}
  }
});

export const { addNotification, clearNotifications, removeNotificationBySenderId } = notificationSlice.actions;
export default notificationSlice.reducer;
