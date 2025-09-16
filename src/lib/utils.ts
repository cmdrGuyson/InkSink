import { Json } from "@/types/supabase";
import { clsx, type ClassValue } from "clsx";
import dayjs from "dayjs";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function fromJson<T>(json: Json): T {
  return JSON.parse(JSON.stringify(json)) as T;
}

export const formatDateTime = (date: string | Date) => {
  return dayjs(date).format("MMM D, h:mm A");
};
