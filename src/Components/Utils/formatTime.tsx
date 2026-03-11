export const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isToday) {
    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
  }

  return date.toLocaleDateString("en-GB"); // dd/mm/yyyy
};


 export const formatLastSeen = (date: Date) => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  // If same day → show time
  if (diffDays === 0) {
    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
  }

  // If within 3 days → show relative
  if (diffDays <= 3) {
    return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  }

  // If more than 3 days → show full date
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
};

export const formatDateDivider = (dateString: string) => {
  const date = new Date(dateString);

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit"
  });
};