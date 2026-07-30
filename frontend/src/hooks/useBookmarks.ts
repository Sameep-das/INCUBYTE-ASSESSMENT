import { useState, useEffect } from 'react';
import { Car } from '../types/car';

const BOOKMARKS_KEY = 'user_bookmarked_cars';

export function useBookmarks() {
  const [bookmarkedCars, setBookmarkedCars] = useState<Car[]>(() => {
    try {
      const item = localStorage.getItem(BOOKMARKS_KEY);
      return item ? JSON.parse(item) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarkedCars));
    } catch (e) {
      console.error('Failed to save bookmarks to localStorage', e);
    }
  }, [bookmarkedCars]);

  const toggleBookmark = (car: Car) => {
    setBookmarkedCars((prev) => {
      const exists = prev.some((item) => item.id === car.id);
      if (exists) {
        return prev.filter((item) => item.id !== car.id);
      } else {
        return [...prev, car];
      }
    });
  };

  const isBookmarked = (carId: string) => {
    return bookmarkedCars.some((item) => item.id === carId);
  };

  return { bookmarkedCars, toggleBookmark, isBookmarked };
}
