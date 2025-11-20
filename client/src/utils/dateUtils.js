// Format timestamp for message display (shows time or date depending on when message was sent)
export const formatMessageTime = (timestamp) => {
    if (!timestamp) return 'Just now';

    const messageDate = new Date(timestamp * 1000);
    const now = new Date();

    // Check if same day by comparing date strings
    const isToday = messageDate.toDateString() === now.toDateString();

    // Check if yesterday
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = messageDate.toDateString() === yesterday.toDateString();

    // Calculate difference in days
    const diffMs = now - messageDate;
    const diffDays = Math.floor(diffMs / 86400000);

    // If message is from today, show time only
    if (isToday) {
        return messageDate.toLocaleTimeString('es-AR', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    }

    // If message is from yesterday
    if (isYesterday) {
        return 'Ayer ' + messageDate.toLocaleTimeString('es-AR', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    }

    // If message is from this week (last 7 days)
    if (diffDays < 7) {
        const dayName = messageDate.toLocaleDateString('es-AR', { weekday: 'short' });
        const time = messageDate.toLocaleTimeString('es-AR', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
        return `${dayName} ${time}`;
    }

    // If message is older, show date and time
    return messageDate.toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    }) + ' ' + messageDate.toLocaleTimeString('es-AR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
};

// Format timestamp for chat list (more compact)
export const formatChatTime = (timestamp) => {
    if (!timestamp) return 'Ahora';

    const messageDate = new Date(timestamp * 1000);
    const now = new Date();

    // Check if same day
    const isToday = messageDate.toDateString() === now.toDateString();

    // Check if yesterday
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = messageDate.toDateString() === yesterday.toDateString();

    const diffMs = now - messageDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffDays = Math.floor(diffMs / 86400000);

    // Less than 1 minute
    if (diffMins < 1) {
        return 'Ahora';
    }

    // Less than 1 hour
    if (diffMins < 60) {
        return `${diffMins}m`;
    }

    // If today, show time
    if (isToday) {
        return messageDate.toLocaleTimeString('es-AR', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    }

    // Yesterday
    if (isYesterday) {
        return 'Ayer';
    }

    // This week
    if (diffDays < 7) {
        return messageDate.toLocaleDateString('es-AR', { weekday: 'short' });
    }

    // Older
    return messageDate.toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit'
    });
};
