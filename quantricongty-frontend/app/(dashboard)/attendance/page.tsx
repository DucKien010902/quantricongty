"use client";

import React from "react";
import { useApp } from "@/app/context/AppContext";
import AttendanceView from "./components/AttendanceView";

export default function AttendancePage() {
  const { employees, departments, currentUser } = useApp();

  return (
    <AttendanceView
      employees={employees}
      departments={departments}
      currentUser={currentUser}
    />
  );
}
