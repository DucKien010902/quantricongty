"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useApp } from "@/app/context/AppContext";

interface PageTransitionWrapperProps {
  children: React.ReactNode;
}

export default function PageTransitionWrapper({ children }: PageTransitionWrapperProps) {
  const pathname = usePathname();
  const { isDataLoading } = useApp();
  const [isLoading, setIsLoading] = useState(true);

  // Cập nhật ref của isDataLoading để tránh lỗi Stale Closure trong các hàm setTimeout/async
  const isDataLoadingRef = useRef(isDataLoading);
  useEffect(() => {
    isDataLoadingRef.current = isDataLoading;
  }, [isDataLoading]);

  // Cuộn lên đầu trang mỗi khi chuyển route
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  // Trigger page transition effect on pathname change or route change
  useEffect(() => {
    let isMounted = true;
    const MIN_LOAD_TIME = 850; // Ít nhất 0.85s theo yêu cầu
    const MAX_LOAD_TIME = 1500; // Tối đa 1.5s bảo vệ để không bao giờ bị treo F5

    setIsLoading(true);

    // Timer bảo vệ tối đa: Sau 1.5s ép mở trang tuyệt đối
    const maxSafetyTimer = setTimeout(() => {
      if (isMounted) {
        setIsLoading(false);
      }
    }, MAX_LOAD_TIME);

    const timer = setTimeout(() => {
      if (!isMounted) return;

      const checkData = () => {
        if (!isMounted) return;
        // Đọc giá trị ref mới nhất để tránh bị kẹt do Stale Closure
        if (!isDataLoadingRef.current) {
          setIsLoading(false);
        } else {
          setTimeout(checkData, 50);
        }
      };

      checkData();
    }, MIN_LOAD_TIME);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      clearTimeout(maxSafetyTimer);
    };
  }, [pathname]);

  return (
    <div className="relative flex-1 flex flex-col w-full">
      {isLoading ? (
        /* MÀN HÌNH CHỜ CHUẨN 100% DEAD-CENTER TRONG KHUNG NỘI DUNG BÊN PHẢI */
        <div className="flex-1 flex flex-col items-center justify-center py-12 select-none animate-fade-in w-full my-auto text-center min-h-[400px]">
          {/* 3 Thanh nảy theo nhịp màu Logo Navy Đông Hải Invest (#1b365d) */}
          <div className="flex items-center justify-center gap-1.5 h-8">
            <span className="w-1.5 bg-[#1b365d] rounded-full animate-bar-pulse-1 shadow-2xs" />
            <span className="w-1.5 bg-[#1b365d] rounded-full animate-bar-pulse-2 shadow-2xs" />
            <span className="w-1.5 bg-[#1b365d] rounded-full animate-bar-pulse-3 shadow-2xs" />
          </div>
          <span className="text-[11px] font-semibold text-slate-400 mt-3 tracking-wide">
            Đang tải & xử lý dữ liệu hệ thống...
          </span>
        </div>
      ) : null}

      {/* RENDER TRANG CON NGẦM TRONG DOM (h-0 để không đẩy spinner xuống dưới nếu trang quá dài) */}
      <div
        className={
          isLoading
            ? "h-0 overflow-hidden opacity-0 pointer-events-none"
            : "flex-1 flex flex-col w-full animate-fade-in opacity-100"
        }
      >
        {children}
      </div>
    </div>
  );
}




