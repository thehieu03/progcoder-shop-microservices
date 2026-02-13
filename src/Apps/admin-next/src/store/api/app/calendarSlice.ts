import { apiSlice } from "../apiSlice";
import type { CalendarEvent } from "@/shared/types/store.types";

export interface Category {
  id: string;
  name: string;
  color?: string;
}

export const calendarApi = apiSlice.injectEndpoints({
  tagTypes: ["events"],
  endpoints: (builder) => ({
    getCategories: builder.query<Category[], void>({
      query: () => "/categories",
    }),
    getCalendarEvents: builder.query<CalendarEvent[], void>({
      query: () => "/calendarEvents",
      providesTags: ["events"],
    }),
    createCalendarEvent: builder.mutation<CalendarEvent, Omit<CalendarEvent, 'id'>>({
      query: (event) => ({
        url: "/calendarEvents",
        method: "POST",
        body: event,
      }),
      invalidatesTags: ["events"],
    }),
    editCalendarEvent: builder.mutation<CalendarEvent, { id: string; event: Partial<CalendarEvent> }>({
      query: ({ id, event }) => ({
        url: `/calendarEvents/${id}`,
        method: "PUT",
        body: { id, ...event },
      }),
      invalidatesTags: ["events"],
    }),
    deleteCalendarEvent: builder.mutation<void, string>({
      query: (id) => ({
        url: `/calendarEvents/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["events"],
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useGetCalendarEventsQuery,
  useCreateCalendarEventMutation,
  useEditCalendarEventMutation,
  useDeleteCalendarEventMutation,
} = calendarApi;
