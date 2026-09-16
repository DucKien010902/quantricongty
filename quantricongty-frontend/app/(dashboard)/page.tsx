"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/app/context/AppContext";
import DashboardView from "./components/DashboardView";

export default function DashboardPage() {
  const router = useRouter();
  const { employees, departments, company } = useApp();

  return (
    <DashboardView
      employees={employees}
      departments={departments}
      company={company}
      onGoToEmployees={() => router.push("/employees")}
      onGoToDepartments={() => router.push("/departments")}
    />
  );
}
