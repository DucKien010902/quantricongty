"use client";

import React from "react";
import { Server, X, Wifi, RefreshCw, Sparkles } from "lucide-react";
import Modal from "@/app/components/ui/Modal";

interface DeviceSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  deviceIp: string;
  setDeviceIp: (ip: string) => void;
  devicePort: number;
  setDevicePort: (p: number) => void;
  deviceCommKey: number;
  setDeviceCommKey: (k: number) => void;
  pingStatus: "idle" | "testing" | "success" | "error";
  pingMessage: string;
  isSyncing: boolean;
  syncFeedback: string | null;
  onTestConnection: () => void;
  onSyncDevice: () => void;
  onSeedData: () => void;
}

export default function DeviceSyncModal({
  isOpen,
  onClose,
  deviceIp,
  setDeviceIp,
  devicePort,
  setDevicePort,
  deviceCommKey,
  setDeviceCommKey,
  pingStatus,
  pingMessage,
  isSyncing,
  syncFeedback,
  onTestConnection,
  onSyncDevice,
  onSeedData,
}: DeviceSyncModalProps) {
  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      hideHeader
      className="p-0 overflow-hidden"
    >
      <div className="flex flex-col h-full overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-[#1b365d] text-white">
          <div className="flex items-center gap-2.5">
            <Server className="w-5 h-5 text-blue-200" />
            <div>
              <h3 className="text-base font-bold">Kết Nối Máy Chấm Công</h3>
              <p className="text-xs text-slate-300">TCP Socket • ZK Teco Protocol</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {/* IP / Port Form */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Địa chỉ IP Máy (WAN / LAN)
              </label>
              <input
                type="text"
                value={deviceIp}
                onChange={(e) => setDeviceIp(e.target.value)}
                placeholder="222.252.30.194"
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1b365d] font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Cổng (Port)
              </label>
              <input
                type="number"
                value={devicePort}
                onChange={(e) => setDevicePort(Number(e.target.value))}
                placeholder="4370"
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1b365d] font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Mật Mã Kết Nối (Comm Key)
            </label>
            <input
              type="number"
              value={deviceCommKey}
              onChange={(e) => setDeviceCommKey(Number(e.target.value))}
              placeholder="123456"
              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1b365d] font-mono"
            />
          </div>

          {/* Ping Feedback */}
          {pingStatus !== "idle" && (
            <div
              className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${pingStatus === "testing"
                  ? "bg-slate-100 text-slate-700"
                  : pingStatus === "success"
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : "bg-rose-50 text-rose-800 border border-rose-200"
                }`}
            >
              <Wifi className={`w-4 h-4 ${pingStatus === "testing" ? "animate-pulse" : ""}`} />
              <span>{pingMessage}</span>
            </div>
          )}

          {/* Sync Feedback */}
          {syncFeedback && (
            <div
              className={`p-3 rounded-xl border text-xs font-medium ${syncFeedback.includes("thành công")
                  ? "bg-emerald-50 text-emerald-900 border-emerald-200"
                  : "bg-rose-50 text-rose-900 border-rose-200"
                }`}
            >
              {syncFeedback}
            </div>
          )}

          {/* Actions */}
          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={onTestConnection}
              disabled={pingStatus === "testing"}
              className="flex-1 px-4 py-2.5 text-xs font-bold rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Kiểm Tra Kết Nối
            </button>

            <button
              type="button"
              onClick={onSyncDevice}
              disabled={isSyncing}
              className="flex-1 px-4 py-2.5 text-xs font-bold rounded-xl bg-[#1b365d] hover:bg-[#152a4a] text-white shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
              <span>{isSyncing ? "Đang kéo..." : "Bắt Đầu Đồng Bộ"}</span>
            </button>
          </div>

          {/* Fallback Simulation Button */}
          <div className="pt-3 border-t border-slate-100 text-center">
            <button
              type="button"
              onClick={onSeedData}
              disabled={isSyncing}
              className="text-[11.5px] font-semibold text-slate-500 hover:text-[#1b365d] inline-flex items-center gap-1 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              <span>Nạp lại dữ liệu chấm công mẫu kiểm thử (Tháng 9/2026)</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
