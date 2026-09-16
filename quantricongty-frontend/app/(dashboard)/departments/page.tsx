"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/app/context/AppContext";
import DepartmentsView from "./components/DepartmentsView";

export default function DepartmentsPage() {
  const router = useRouter();
  const { departments, employees } = useApp();

  return (
    <DepartmentsView
      departments={departments}
      employees={employees}
      onSelectDepartment={(deptName: string) => {
        router.push(`/employees?dept=${encodeURIComponent(deptName)}`);
      }}
    />
  );
}
