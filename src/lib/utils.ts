import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// Utility to combine Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Convert date to "time ago" string
export function formatDate(dateString: string): string {
  const currentDate = new Date();
  const inputDate = new Date(dateString);
  const timeDifference = currentDate.getTime() - inputDate.getTime();
  const secondsDifference = Math.floor(timeDifference / 1000);

  if (secondsDifference < 60) {
    return `${secondsDifference} ${secondsDifference === 1 ? "second" : "seconds"} ago`;
  } else if (secondsDifference < 3600) {
    const minutes = Math.floor(secondsDifference / 60);
    return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
  } else if (secondsDifference < 86400) {
    const hours = Math.floor(secondsDifference / 3600);
    return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  } else if (secondsDifference < 604800) {
    const days = Math.floor(secondsDifference / 86400);
    return `${days} ${days === 1 ? "day" : "days"} ago`;
  } else if (secondsDifference < 2592000) {
    const weeks = Math.floor(secondsDifference / 604800);
    return `${weeks} ${weeks === 1 ? "week" : "weeks"} ago`;
  } else if (secondsDifference < 31536000) {
    const months = Math.floor(secondsDifference / 2592000);
    return `${months} ${months === 1 ? "month" : "months"} ago`;
  } else {
    const years = Math.floor(secondsDifference / 31536000);
    return `${years} ${years === 1 ? "year" : "years"} ago`;
  }
}


