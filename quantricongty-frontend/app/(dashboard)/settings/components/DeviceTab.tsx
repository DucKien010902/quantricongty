"use client";
import { API_URL } from "@/app/config/api";

import React, { useState, useEffect } from "react";
import {
  Cpu,
  Wifi,
  KeyRound,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

interface DeviceTabProps {
  showToast: (msg: string) => void;
}

export default function DeviceTab({ showToast }: DeviceTabProps) {
  const [deviceIp, setDeviceIp] = useState(process.env.NEXT_PUBLIC_DEVICE_IP || "222.252.30.194");
  const [devicePort, setDevicePort] = useState(Number(process.env.NEXT_PUBLIC_DEVICE_PORT) || 4370);
  const [deviceCommKey, setDeviceCommKey] = useState(Number(process.env.NEXT_PUBLIC_DEVICE_COMM_KEY) || 0);
  const [pingStatus, setPingStatus] = useState<"idle" | "testing" | "success" | "error">("idle");
  const [pingMessage, setPingMessage] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);

  // Load device configuration from backend if available
  useEffect(() => {
    fetch(`${API_URL}/attendance/device/config`)
      .then((res) => (res.ok ? res.json() : null))
      .then((cfg) => {
        if (cfg && cfg.ip) setDeviceIp(cfg.ip);
        if (cfg && cfg.port) setDevicePort(Number(cfg.port));
        if (cfg && cfg.commKey !== undefined) setDeviceCommKey(Number(cfg.commKey));
      })
      .catch(() => { });
  }, []);

  // Test connection to Attendance Machine
  const handleTestConnection = async () => {
    setPingStatus("testing");
    setPingMessage(`Đang kiểm tra kết nối TCP tới thiết bị (${deviceIp}:${devicePort})...`);
    try {
      const res = await fetch(`${API_URL}/attendance/device/test-connection`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ip: deviceIp, port: Number(devicePort), commKey: Number(deviceCommKey) }),
      });
      const data = await res.json();
      if (data.success) {
        setPingStatus("success");
        setPingMessage(data.message || "Kết nối thành công!");
      } else {
        setPingStatus("error");
        setPingMessage(data.message || "Không thể kết nối (Timeout).");
      }
    } catch (err: any) {
      setPingStatus("error");
      setPingMessage("Lỗi gửi yêu cầu: " + err.message);
    }
  };

  // Sync attendance logs
  const handleSyncDevice = async () => {
    setIsSyncing(true);
    setPingStatus("idle");
    setPingMessage("");
    try {
      const res = await fetch(`${API_URL}/attendance/device/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ip: deviceIp, port: Number(devicePort), commKey: Number(deviceCommKey) }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message);
      } else {
        alert(data.message);
      }
    } catch (err: any) {
      alert("Lỗi khi đồng bộ: " + err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="bg-slate-50/50 rounded-2xl border border-slate-200/70 p-5 space-y-5">
      <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
        <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-[#1b365d]" />
          Máy Chấm Công (TCP/IP)
        </h2>
        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          TCP Socket
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center gap-1">
            <Wifi className="w-3.5 h-3.5 text-slate-400" />
            Địa chỉ IP (WAN / LAN)
          </label>
          <input
            type="text"
            value={deviceIp}
            onChange={(e) => setDeviceIp(e.target.value)}
            placeholder="222.252.30.194"
            className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1b365d] font-mono text-slate-800 font-semibold"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Cổng TCP
          </label>
          <input
            type="number"
            value={devicePort}
            onChange={(e) => setDevicePort(Number(e.target.value))}
            placeholder="4370"
            className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1b365d] font-mono text-slate-800 font-semibold"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center gap-1">
            <KeyRound className="w-3.5 h-3.5 text-slate-400" />
            Mật mã máy (CommKey)
          </label>
          <input
            type="number"
            value={deviceCommKey}
            onChange={(e) => setDeviceCommKey(Number(e.target.value))}
            placeholder="123456"
            className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1b365d] font-mono text-slate-800 font-semibold"
          />
        </div>
      </div>

      {/* Feedback message */}
      {pingStatus !== "idle" && (
        <div
          className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${pingStatus === "testing"
              ? "bg-blue-50/70 border-blue-200 text-blue-800"
              : pingStatus === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-rose-50 border-rose-200 text-rose-800"
            }`}
        >
          {pingStatus === "testing" && <RefreshCw className="w-3.5 h-3.5 animate-spin shrink-0 text-blue-600" />}
          {pingStatus === "success" && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
          {pingStatus === "error" && <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />}
          <span className="font-medium">{pingMessage}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">
        <button
          type="button"
          onClick={handleTestConnection}
          disabled={pingStatus === "testing"}
          className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium shadow-xs transition-all disabled:opacity-50 cursor-pointer"
        >
          <Wifi className="w-3.5 h-3.5 text-slate-500" />
          <span>Kiểm tra kết nối</span>
        </button>

        <button
          type="button"
          onClick={handleSyncDevice}
          disabled={isSyncing}
          className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#1b365d] hover:bg-[#152a4a] text-white text-xs font-medium shadow-xs transition-all disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
          <span>{isSyncing ? "Đang đồng bộ..." : "Đồng bộ dữ liệu quẹt thẻ"}</span>
        </button>
      </div>
    </div>
  );
}
