import React from 'react';
import { useNotification } from './NotificationContext';

const Notification = () => {
    const { connected } = useNotification();

    if (!connected) return null;  // Do not render notification if connected is false

    return (
        <div className="fixed top-0 right-0 bg-green-500 text-white p-4 rounded-md shadow-lg">
            <p>Connected Successfully!</p>
        </div>
    );
};

export default Notification;
