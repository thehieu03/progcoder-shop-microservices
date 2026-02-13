"use client";
import React, { useState } from "react";
import Calendar, { OnChangeDateCallback } from "react-calendar";
import "react-calendar/dist/Calendar.css";

const CalendarView= () => {
  const [value, onChange] = useState<Date>(new Date());
  return (
    <div>
      <Calendar onChange={onChange as OnChangeDateCallback} value={value} />
    </div>
  );
};

export default CalendarView;
