import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AttendanceLog, AttendanceLogDocument } from '../../schemas/attendance-log.schema.js';
import { DailyAttendance, DailyAttendanceDocument, DailyStatus } from '../../schemas/daily-attendance.schema.js';
import { AttendanceDevice, AttendanceDeviceDocument } from '../../schemas/attendance-device.schema.js';
import { Holiday, HolidayDocument } from '../../schemas/holiday.schema.js';
import { AttendanceConfig, AttendanceConfigDocument } from '../../schemas/attendance-config.schema.js';
import { Employee, EmployeeDocument } from '../../schemas/employee.schema.js';
import * as xlsx from 'xlsx';

@Injectable()
export class AttendanceService {
  private readonly logger = new Logger(AttendanceService.name);

  constructor(
    @InjectModel(AttendanceLog.name) private logModel: Model<AttendanceLogDocument>,
    @InjectModel(DailyAttendance.name) private dailyModel: Model<DailyAttendanceDocument>,
    @InjectModel(AttendanceDevice.name) private deviceModel: Model<AttendanceDeviceDocument>,
    @InjectModel(Holiday.name) private holidayModel: Model<HolidayDocument>,
    @InjectModel(AttendanceConfig.name) private configModel: Model<AttendanceConfigDocument>,
    @InjectModel(Employee.name) private employeeModel: Model<EmployeeDocument>,
  ) {}

  /**
   * Helper: Parse multi-format Date and Time
   * Format 1: 07/09/2026 17:09 A9P9 (DD/MM/YYYY HH:mm [machine_code])
   * Format 2: 9/3/2026 8:01:05 AM (M/D/YYYY h:mm:ss AM/PM)
   * Format 3: Excel serial number e.g. 46268.3340277778
   * Format 4: Standard ISO/Vietnamese strings
   */
  parseAttendanceDateTime(val: any): { date: string; time: string; timestamp: string } | null {
    if (val === null || val === undefined || val === '') return null;

    let d: Date | null = null;

    // Case 1: Excel serial date number
    if (typeof val === 'number') {
      // Excel epoch 1899-12-30
      const excelEpoch = new Date(Date.UTC(1899, 11, 30));
      const totalMs = Math.round(val * 86400 * 1000);
      d = new Date(excelEpoch.getTime() + totalMs);
      const year = d.getUTCFullYear();
      const month = String(d.getUTCMonth() + 1).padStart(2, '0');
      const day = String(d.getUTCDate()).padStart(2, '0');
      const hour = String(d.getUTCHours()).padStart(2, '0');
      const minute = String(d.getUTCMinutes()).padStart(2, '0');
      const second = String(d.getUTCSeconds()).padStart(2, '0');
      const date = `${year}-${month}-${day}`;
      const time = `${hour}:${minute}:${second}`;
      return { date, time, timestamp: `${date} ${time}` };
    }

    if (val instanceof Date) {
      d = val;
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const hour = String(d.getHours()).padStart(2, '0');
      const minute = String(d.getMinutes()).padStart(2, '0');
      const second = String(d.getSeconds()).padStart(2, '0');
      const date = `${year}-${month}-${day}`;
      const time = `${hour}:${minute}:${second}`;
      return { date, time, timestamp: `${date} ${time}` };
    }

    const str = String(val).trim();

    // Regex check for strings:
    // Support: "07/09/2026 17:09 A9P9", "07/09/2026 17:09:00", "9/3/2026 8:01:05 AM", "2026-09-07 17:09:00"
    const generalRegex = /^(\d{1,4})[\/\-](\d{1,2})[\/\-](\d{1,4})\s+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM|SA|CH)?(?:\s+[A-Za-z0-9_]+)?$/i;
    const match = str.match(generalRegex);

    if (match) {
      const p1 = parseInt(match[1], 10);
      const p2 = parseInt(match[2], 10);
      const p3 = parseInt(match[3], 10);
      let hour = parseInt(match[4], 10);
      const min = parseInt(match[5], 10);
      const sec = match[6] ? parseInt(match[6], 10) : 0;
      const meridian = match[7] ? match[7].toUpperCase() : null;

      // Handle 12-hour AM/PM or SA/CH
      if (meridian) {
        if ((meridian === 'PM' || meridian === 'CH') && hour < 12) {
          hour += 12;
        } else if ((meridian === 'AM' || meridian === 'SA') && hour === 12) {
          hour = 0;
        }
      }

      let year: number;
      let month: number;
      let day: number;

      if (p1 > 1000) {
        // YYYY-MM-DD
        year = p1;
        month = p2;
        day = p3;
      } else {
        // Year is p3
        year = p3;
        // Distinguish DD/MM vs MM/DD:
        if (p1 > 12) {
          // Definitely DD/MM/YYYY (e.g. 25/09/2026)
          day = p1;
          month = p2;
        } else if (p2 > 12) {
          // Definitely MM/DD/YYYY (e.g. 09/25/2026)
          month = p1;
          day = p2;
        } else {
          // Ambiguous (both <= 12, e.g. 07/09/2026 or 9/3/2026)
          if (meridian) {
            // Excel exports with AM/PM almost always use US locale M/D/YYYY (e.g. 9/3/2026 8:01:05 AM -> Month 9, Day 3)
            month = p1;
            day = p2;
          } else {
            // Standard Vietnamese / Ronald Jack / ZKTeco export uses DD/MM/YYYY (e.g. 07/09/2026 17:09 A9P9 -> Day 7, Month 9)
            day = p1;
            month = p2;
          }
        }
      }

      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const timeStr = `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
      return {
        date: dateStr,
        time: timeStr,
        timestamp: `${dateStr} ${timeStr}`,
      };
    }

    // Fallback try standard Date parsing
    const parsed = new Date(str);
    if (!isNaN(parsed.getTime())) {
      const year = parsed.getFullYear();
      const month = String(parsed.getMonth() + 1).padStart(2, '0');
      const day = String(parsed.getDate()).padStart(2, '0');
      const hour = String(parsed.getHours()).padStart(2, '0');
      const minute = String(parsed.getMinutes()).padStart(2, '0');
      const second = String(parsed.getSeconds()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      const timeStr = `${hour}:${minute}:${second}`;
      return { date: dateStr, time: timeStr, timestamp: `${dateStr} ${timeStr}` };
    }

    return null;
  }

  /**
   * Helper: Convert HH:mm:ss to seconds of day
   */
  timeToSeconds(timeStr: string): number {
    if (!timeStr) return 0;
    const parts = timeStr.split(':').map((p) => parseInt(p, 10) || 0);
    return parts[0] * 3600 + (parts[1] || 0) * 60 + (parts[2] || 0);
  }

  /**
   * Core Rules Engine: Evaluates a single employee day based on punches and holidays
   * Implements section 5 of CHAMCONG_WEB_SPECIFICATION.md
   */
  async evaluateDailyPunch(
    userId: string,
    name: string,
    department: string,
    dateStr: string,
    dayLogs: AttendanceLog[],
    holidayMap: Map<string, string>,
    config?: any,
  ): Promise<Partial<DailyAttendance>> {
    const d = new Date(dateStr);
    const dayOfWeek = d.getDay(); // 0: CN, 1: T2, ..., 6: T7
    const weekdays = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const weekdayName = weekdays[dayOfWeek];

    // 1. Holiday Check
    if (holidayMap.has(dateStr)) {
      return {
        userId,
        name,
        department,
        date: dateStr,
        weekday: weekdayName,
        firstIn: '',
        lastOut: '',
        punchCount: dayLogs.length,
        status: DailyStatus.NGHI_LE,
        workHours: 0,
        workTimeText: '0h',
        missingMinutes: 0,
        overtimeMinutes: 0,
        workCredit: 1.0,
        note: holidayMap.get(dateStr) || 'Nghỉ Lễ',
      };
    }

    // 2. Weekly Off-Days Check (Mặc định: 0=CN, 6=T7)
    const offDayNumbers = (config?.weeklyOffDays ?? '0,6')
      .split(',')
      .map((s: string) => parseInt(s.trim(), 10))
      .filter((n: number) => !isNaN(n));
    const isWeeklyOff = offDayNumbers.includes(dayOfWeek);

    if (isWeeklyOff && dayLogs.length === 0) {
      return {
        userId,
        name,
        department,
        date: dateStr,
        weekday: weekdayName,
        firstIn: '',
        lastOut: '',
        punchCount: 0,
        status: DailyStatus.CUOI_TUAN,
        workHours: 0,
        workTimeText: '0h',
        missingMinutes: 0,
        overtimeMinutes: 0,
        workCredit: 0.0,
        note: 'Nghỉ hàng tuần',
      };
    }


    // 3. Punch count evaluation
    const sortedLogs = [...dayLogs].sort((a, b) => a.time.localeCompare(b.time));
    const punchCount = sortedLogs.length;

    // Parse dynamic shift parameters from config
    const shiftInStr = config?.shiftTimeIn || '08:00';
    const shiftOutStr = config?.shiftTimeOut || '17:00';
    const standardInSec = this.timeToSeconds(shiftInStr);
    const standardOutSec = this.timeToSeconds(shiftOutStr);
    const lunchBreakHours = config?.lunchBreakHours ?? 1.0;
    const lunchSec = Math.round(lunchBreakHours * 3600);
    const workRequiredHours = config?.workRequiredHours ?? 8.0;
    const workRequiredSec = Math.round(workRequiredHours * 3600);
    const maxLateFlexMinutes = config?.maxLateFlexMinutes ?? 60; // Tối đa muộn 60p được bù giờ
    const flexLimitSec = standardInSec + maxLateFlexMinutes * 60;
    const minHoursFullDay = config?.minHoursFullDay ?? 8.0;
    const minHoursHalfDay = config?.minHoursHalfDay ?? 4.0;
    const lunchStartSec = this.timeToSeconds(config?.lunchTimeStart || '12:00');

    if (punchCount === 0) {
      return {
        userId,
        name,
        department,
        date: dateStr,
        weekday: weekdayName,
        firstIn: '',
        lastOut: '',
        punchCount: 0,
        status: DailyStatus.MISS,
        workHours: 0,
        workTimeText: '0h',
        missingMinutes: Math.round(workRequiredHours * 60),
        overtimeMinutes: 0,
        workCredit: 0.0,
        note: 'Vắng mặt',
      };
    }

    if (punchCount === 1) {
      const punchTime = sortedLogs[0].time;
      const punchSec = this.timeToSeconds(punchTime);

      if (punchSec < lunchStartSec) {
        // Quên quẹt ra
        return {
          userId,
          name,
          department,
          date: dateStr,
          weekday: weekdayName,
          firstIn: punchTime,
          lastOut: '',
          punchCount: 1,
          status: DailyStatus.THIEU_GIO_RA,
          workHours: 0,
          workTimeText: '0h',
          missingMinutes: Math.round(workRequiredHours * 30),
          overtimeMinutes: 0,
          workCredit: 0.0,
          note: 'Quên quẹt ra',
        };
      } else {
        // Quên quẹt vào
        return {
          userId,
          name,
          department,
          date: dateStr,
          weekday: weekdayName,
          firstIn: '',
          lastOut: punchTime,
          punchCount: 1,
          status: DailyStatus.THIEU_GIO_VAO,
          workHours: 0,
          workTimeText: '0h',
          missingMinutes: Math.round(workRequiredHours * 30),
          overtimeMinutes: 0,
          workCredit: 0.0,
          note: 'Quên quẹt vào',
        };
      }
    }

    // punchCount >= 2
    const firstIn = sortedLogs[0].time;
    const lastOut = sortedLogs[sortedLogs.length - 1].time;
    const firstInSec = this.timeToSeconds(firstIn);
    const lastOutSec = this.timeToSeconds(lastOut);

    const spanSec = Math.max(0, lastOutSec - firstInSec);
    const workSec = Math.max(0, spanSec - lunchSec);
    const workHours = Math.round((workSec / 3600) * 10) / 10;
    const workH = Math.floor(workSec / 3600);
    const workM = Math.floor((workSec % 3600) / 60);
    const workTimeText = workSec > 0 ? `${workH}h ${String(workM).padStart(2, '0')}p` : '0h';

    let status = DailyStatus.DU_CONG;
    let workCredit = 1.0;
    let missingMinutes = 0;
    let overtimeMinutes = 0;
    let note = 'Đủ công';

    if (firstInSec <= flexLimitSec) {
      // Trường hợp A: Vào trong khoảng cho phép bù giờ linh hoạt (<= flexLimitSec, ví dụ 09:00)
      let requiredOutSec = standardOutSec;
      if (firstInSec > standardInSec) {
        // Vào sau giờ chuẩn -> Cần ở lại bù đủ số giờ làm việc + nghỉ trưa
        requiredOutSec = firstInSec + workRequiredSec + lunchSec;
      }

      if (lastOutSec < standardOutSec) {
        // Về sớm trước giờ ca chuẩn
        missingMinutes = Math.ceil((requiredOutSec - lastOutSec) / 60);
        status = DailyStatus.THIEU_PHUT;
        workCredit = workHours >= minHoursHalfDay ? 0.5 : 0.0;
        note = `Về sớm ${missingMinutes} phút (trước ${shiftOutStr})${workCredit === 0.5 ? ' - 0.5 công' : ''}`;
      } else if (lastOutSec < requiredOutSec) {
        // Về sau giờ ca chuẩn nhưng chưa bù đủ giờ làm
        missingMinutes = Math.ceil((requiredOutSec - lastOutSec) / 60);
        status = DailyStatus.THIEU_PHUT;
        workCredit = workHours >= minHoursHalfDay ? 0.5 : 0.0;
        note = `Thiếu ${missingMinutes} phút (chưa bù đủ ${workRequiredHours}h)${workCredit === 0.5 ? ' - 0.5 công' : ''}`;
      } else {
        // Đủ công
        status = DailyStatus.DU_CONG;
        workCredit = 1.0;
        missingMinutes = 0;
        const otSec = lastOutSec - requiredOutSec;
        if (otSec >= 30 * 60) {
          const otH = Math.floor(otSec / 3600);
          const otM = Math.floor((otSec % 3600) / 60);
          overtimeMinutes = Math.floor(otSec / 60);
          note = `Làm thêm ${otH > 0 ? otH + 'h ' : ''}${otM}p`;
        } else {
          note = 'Đủ công';
        }
      }
    } else {
      // Trường hợp B: Vào quá muộn (sau flexLimitSec, ví dụ sau 9h)
      const lateMin = Math.ceil((firstInSec - flexLimitSec) / 60);
      const reqOutAfterLate = flexLimitSec + workRequiredSec + lunchSec;
      let earlyMin = 0;
      if (lastOutSec < reqOutAfterLate) {
        earlyMin = Math.ceil((reqOutAfterLate - lastOutSec) / 60);
      }
      missingMinutes = lateMin + earlyMin;
      status = DailyStatus.THIEU_PHUT;
      workCredit = workHours >= minHoursHalfDay ? 0.5 : 0.0;
      const flexH = Math.floor(flexLimitSec / 3600);
      const flexM = Math.floor((flexLimitSec % 3600) / 60);
      const flexLimitStr = flexM > 0 ? `${flexH}h${String(flexM).padStart(2, '0')}` : `${flexH}h`;
      note = `Vào muộn sau ${flexLimitStr} (${lateMin}p)${earlyMin > 0 ? ` + về sớm (${earlyMin}p)` : ''}${workCredit === 0.5 ? ' - 0.5 công' : ''}`;
    }


    return {
      userId,
      name,
      department,
      date: dateStr,
      weekday: weekdayName,
      firstIn,
      lastOut,
      punchCount,
      status,
      workHours,
      workTimeText,
      missingMinutes,
      overtimeMinutes,
      workCredit,
      note,
    };
  }

  /**
   * Recalculate daily attendance for given dates or entire month
   */
  async recalculateDays(dates: string[]): Promise<void> {
    if (!dates || dates.length === 0) return;

    // 1. Fetch holidays
    const holidays = await this.holidayModel.find().lean();
    const holidayMap = new Map<string, string>();
    holidays.forEach((h) => holidayMap.set(h.date, h.name));

    // 2. Fetch all employees
    const employees = await this.employeeModel.find().lean();
    
    // "mỗi user phải có thêm 1 trường là mã chấm công để khi tải từ máy hoặc nhập excel thì còn biết mà map vào ai chứ, ko có thì ko hiển thị"
    const targetEmployees = (employees as any[]).filter(
      (e: any) => e.attendanceCode && String(e.attendanceCode).trim() !== ''
    );

    const config = await this.getAttendanceConfig();

    for (const dateStr of dates) {
      // Clean up records for users who have no attendanceCode
      await this.dailyModel.deleteMany({
        date: dateStr,
        userId: { $nin: targetEmployees.map((e: any) => e.code) },
      });

      // Fetch logs on this date
      const logs = await this.logModel.find({ date: dateStr }).lean();

      for (const emp of targetEmployees) {
        const attCode = String(emp.attendanceCode).trim();
        // Match logs for this employee by emp.code or by attendanceCode
        const userLogs = logs.filter(
          (l: any) =>
            l.userId === emp.code ||
            l.userId === attCode ||
            l.attendanceCode === attCode
        );

        const existingRecord = await this.dailyModel.findOne({ userId: emp.code, date: dateStr }).lean();
        if (
          existingRecord &&
          ((existingRecord as any).status === DailyStatus.NGHI_PHEP ||
           (existingRecord as any).status === DailyStatus.CONG_TAC) &&
          userLogs.length === 0
        ) {
          // Giữ nguyên bản ghi nghỉ phép hoặc đi công tác đã được phê duyệt hợp lệ
          continue;
        }

        const evaluated = await this.evaluateDailyPunch(
          emp.code,
          emp.name,
          emp.department || 'Nhân sự',
          dateStr,
          userLogs,
          holidayMap,
          config,
        );

        await this.dailyModel.updateOne(
          { userId: emp.code, date: dateStr },
          { $set: evaluated },
          { upsert: true },
        );
      }
    }

  }

  /**
   * Import Excel attendance file (offline backup importer)
   * Supports:
   * - 07/09/2026 17:09 A9P9
   * - 9/3/2026 8:01:05 AM
   * - Excel Serial Numbers
   */
  async importExcel(buffer: Buffer): Promise<{ total: number; inserted: number; skipped: number; dates: string[] }> {
    const workbook = xlsx.read(buffer, { type: 'buffer', cellDates: false });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rows = xlsx.utils.sheet_to_json<any>(worksheet, { header: 1 });

    if (rows.length < 2) {
      return { total: 0, inserted: 0, skipped: 0, dates: [] };
    }

    // 1. Detect header row
    let headerRowIdx = -1;
    let colUserId = -1;
    let colName = -1;
    let colDateTime = -1;
    let colDate = -1;
    let colTime = -1;
    let colDept = -1;

    for (let r = 0; r < Math.min(rows.length, 10); r++) {
      const row = rows[r];
      if (!Array.isArray(row)) continue;

      for (let c = 0; c < row.length; c++) {
        const val = String(row[c] || '').toLowerCase().trim();
        if (val.match(/^(no\.?|uid|user\s*id|mã\s*(nv|nhân\s*viên))$/i)) colUserId = c;
        if (val.match(/^(name|họ\s*tên|họ\s*và\s*tên|employee\s*name)$/i)) colName = c;
        if (val.match(/^(date\s*\/?\s*time|ngày\s*giờ|thời\s*gian|datetime)$/i)) colDateTime = c;
        if (val.match(/^(date|ngày)$/i)) colDate = c;
        if (val.match(/^(time|giờ)$/i)) colTime = c;
        if (val.match(/^(department|phòng\s*ban|bộ\s*phận)$/i)) colDept = c;
      }

      if (colUserId !== -1 && (colDateTime !== -1 || (colDate !== -1 && colTime !== -1))) {
        headerRowIdx = r;
        break;
      }
    }

    // Fallback if no explicit headers found
    if (headerRowIdx === -1) {
      headerRowIdx = 0;
      colUserId = 0;
      colName = 1;
      colDateTime = 2;
    }

    const affectedDates = new Set<string>();
    let total = 0;
    let inserted = 0;
    let skipped = 0;

    const employees = await this.employeeModel.find().lean();
    const rawLogsToInsert: any[] = [];

    for (let r = headerRowIdx + 1; r < rows.length; r++) {
      const row = rows[r];
      if (!row || row.length === 0) continue;

      let uid = String(row[colUserId] || '').trim();
      if (!uid) continue;
      // Remove trailing .0 from excel floats (e.g. 3.0 -> 3)
      if (uid.endsWith('.0')) uid = uid.slice(0, -2);

      // Match employee by attendanceCode or code
      const matchedEmp = (employees as any[]).find((e: any) =>
        (e.attendanceCode && String(e.attendanceCode).trim() === uid) ||
        (e.code && String(e.code).trim() === uid)
      );

      const finalUserId = matchedEmp ? matchedEmp.code : '';
      const finalName = matchedEmp ? matchedEmp.name : 'Chưa gán';

      let dateStr = '';
      let timeStr = '';
      let timestampStr = '';

      if (colDateTime !== -1 && row[colDateTime] !== undefined) {
        const parsed = this.parseAttendanceDateTime(row[colDateTime]);
        if (parsed) {
          dateStr = parsed.date;
          timeStr = parsed.time;
          timestampStr = parsed.timestamp;
        }
      } else if (colDate !== -1 && colTime !== -1 && row[colDate] !== undefined) {
        const combined = `${row[colDate]} ${row[colTime]}`;
        const parsed = this.parseAttendanceDateTime(combined);
        if (parsed) {
          dateStr = parsed.date;
          timeStr = parsed.time;
          timestampStr = parsed.timestamp;
        }
      }

      if (!dateStr || !timeStr || !timestampStr) continue;

      total++;
      affectedDates.add(dateStr);

      rawLogsToInsert.push({
        userId: finalUserId,
        attendanceCode: uid,
        name: finalName,
        timestamp: timestampStr,
        date: dateStr,
        time: timeStr,
        punch: 0,
        status: 0,
        source: 'excel',
      });
    }

    // Bulk insert with duplicate skipping
    for (const item of rawLogsToInsert) {
      try {
        const res = await this.logModel.updateOne(
          { userId: item.userId, timestamp: item.timestamp },
          { $setOnInsert: item },
          { upsert: true },
        );
        if (res.upsertedCount > 0) {
          inserted++;
        } else {
          skipped++;
        }
      } catch (e) {
        skipped++;
      }
    }

    // Recalculate evaluated days for all affected dates
    const dateArray = Array.from(affectedDates);
    await this.recalculateDays(dateArray);

    return {
      total,
      inserted,
      skipped,
      dates: dateArray,
    };
  }

  /**
   * Direct machine connection & sync via TCP Port 4370
   * Uses node-zklib with try/finally safety pattern
   */
  async syncFromDevice(ip?: string, port?: number, commKey?: number): Promise<{ success: boolean; message: string; recordCount?: number }> {
    const targetIp = ip || '192.168.1.201';
    const targetPort = port || 4370;
    const targetCommKey = commKey !== undefined && commKey !== 0 ? Number(commKey) : 123456;

    let zkInstance: any = null;
    try {
      // Dynamic import to avoid crash if native deps fail
      // @ts-ignore
      const ZKLibModule = await import('node-zklib');
      const ZKLib = ZKLibModule.default || ZKLibModule;
      zkInstance = new ZKLib(targetIp, targetPort, 15000, 4000, targetCommKey);

      this.logger.log(`Connecting to attendance device at ${targetIp}:${targetPort} with CommKey: ${targetCommKey}...`);
      await zkInstance.createSocket();

      // Lock device keyboard/screen while reading per spec
      try {
        await zkInstance.disableDevice();
      } catch (err: any) {
        this.logger.warn(`Could not disable device screen: ${err?.message}`);
      }

      // Read users and attendance logs
      const logs = await zkInstance.getAttendances();
      this.logger.log(`Received ${logs?.data?.length || 0} logs from device.`);

      const affectedDates = new Set<string>();
      let newCount = 0;

      const employees = await this.employeeModel.find().lean();

      if (logs && logs.data && Array.isArray(logs.data)) {
        for (const item of logs.data) {
          const uid = String(item.deviceUserId || item.userId || '').trim();
          const recordTime = item.recordTime;
          const parsed = this.parseAttendanceDateTime(recordTime);
          if (!uid || !parsed) continue;

          // Check if any employee currently has this attendanceCode
          const matchedEmp = (employees as any[]).find((e: any) =>
            e.attendanceCode && String(e.attendanceCode).trim() === uid
          );

          // Always save all raw logs! If employee not assigned yet, explicitly mark as unmapped ('Chưa gán')
          const finalUserId = matchedEmp ? matchedEmp.code : '';
          const finalName = matchedEmp ? matchedEmp.name : 'Chưa gán';

          if (matchedEmp) {
            affectedDates.add(parsed.date);
          }

          const res = await this.logModel.updateOne(
            { attendanceCode: uid, timestamp: parsed.timestamp },
            {
              $setOnInsert: {
                userId: finalUserId,
                attendanceCode: uid,
                name: finalName,
                timestamp: parsed.timestamp,
                date: parsed.date,
                time: parsed.time,
                punch: item.punch || 0,
                status: item.status || 0,
                source: 'device',
                deviceIp: targetIp,
              },
            },
            { upsert: true },
          );
          if (res.upsertedCount > 0) newCount++;
        }
      }

      // Recalculate evaluated days for mapped employees
      if (affectedDates.size > 0) {
        await this.recalculateDays(Array.from(affectedDates));
      }

      // Update device info
      await this.deviceModel.updateOne(
        { ip: targetIp },
        {
          $set: {
            ip: targetIp,
            port: targetPort,
            status: 'online',
            lastSyncAt: new Date(),
            lastRecordCount: logs?.data?.length || 0,
          },
        },
        { upsert: true },
      );

      return {
        success: true,
        message: `Đồng bộ thành công ${logs?.data?.length || 0} bản ghi từ máy chấm công (${newCount} mới).`,
        recordCount: logs?.data?.length || 0,
      };
    } catch (error: any) {
      this.logger.error(`Error connecting to device ${targetIp}:${targetPort}: ${error.message}`);
      return {
        success: false,
        message: `Không thể kết nối đến máy chấm công (${targetIp}:${targetPort}): ${error.message || 'Hết thời gian chờ (Timeout)'}. Hãy đảm bảo máy tính và máy chấm công cùng mạng LAN.`,
      };
    } finally {
      // Mandatory cleanup in finally block per spec
      if (zkInstance) {
        try {
          await zkInstance.enableDevice();
        } catch (e) {}
        try {
          await zkInstance.disconnect();
        } catch (e) {}
      }
    }
  }

  /**
   * Auto-map unmapped raw logs to employees who now have attendanceCode set,
   * and recalculate evaluated attendance days.
   */
  async autoSyncMappedEmployees(): Promise<void> {
    const employees = await this.employeeModel.find().lean();
    const targetEmployees = (employees as any[]).filter(
      (e: any) => e.attendanceCode && String(e.attendanceCode).trim() !== ''
    );

    const affectedDates = new Set<string>();
    const mappedAttCodes = new Set<string>();

    for (const emp of targetEmployees) {
      const attCode = String(emp.attendanceCode).trim();
      mappedAttCodes.add(attCode);
      const unmappedLogs = await this.logModel.find({
        attendanceCode: attCode,
        userId: { $ne: emp.code },
      }).lean();

      if (unmappedLogs.length > 0) {
        unmappedLogs.forEach((l: any) => affectedDates.add(l.date));
        await this.logModel.updateMany(
          { attendanceCode: attCode },
          { $set: { userId: emp.code, name: emp.name } }
        );
      }
    }

    // Reset logs whose attendanceCode does not belong to any mapped employee
    const validCodes = Array.from(mappedAttCodes);
    await this.logModel.updateMany(
      {
        attendanceCode: { $nin: validCodes },
        $or: [
          { userId: { $ne: '' } },
          { name: { $ne: 'Chưa gán' } }
        ]
      },
      {
        $set: {
          userId: '',
          name: 'Chưa gán'
        }
      }
    );

    if (affectedDates.size > 0) {
      await this.recalculateDays(Array.from(affectedDates));
    }
  }

  /**
   * Test connection ping to IP/Port
   */
  async testConnection(ip: string, port: number, commKey?: number): Promise<{ success: boolean; message: string }> {
    const targetCommKey = commKey !== undefined && commKey !== 0 ? Number(commKey) : 123456;
    let zk: any = null;
    try {
      // @ts-ignore
      const ZKLibModule = await import('node-zklib');
      const ZKLib = ZKLibModule.default || ZKLibModule;
      zk = new ZKLib(ip, port, 4000, 4000, targetCommKey);
      await zk.createSocket();
      await zk.disconnect();
      return { success: true, message: `Kết nối thành công tới ${ip}:${port} (Mật mã: ${targetCommKey})!` };
    } catch (e: any) {
      return {
        success: false,
        message: `Không thể kết nối tới ${ip}:${port}: ${e?.message || 'Hết thời gian chờ (Timeout)'}. Hãy đảm bảo máy tính và máy chấm công cùng mạng LAN.`
      };
    } finally {
      if (zk) {
        try { await zk.disconnect(); } catch (err) {}
      }
    }
  }

  /**
   * Query Tab 1: Daily Attendance records with filters
   * - Chỉ hiện dữ liệu tới ngày hiện muộn nhất được kéo về (không hiện ngày tương lai)
   * - Tự động bổ sung các ngày Thứ 7, Chủ Nhật (Nghỉ cuối tuần) để bảng liền mạch không bị đứt ngày
   */
  async getDailyAttendance(month?: string, userId?: string, department?: string): Promise<any[]> {
    await this.autoSyncMappedEmployees();

    const targetMonth = month || '2026-09';
    const employees = await this.employeeModel.find().lean();
    const targetEmployees = (employees as any[]).filter(
      (e: any) => e.attendanceCode && String(e.attendanceCode).trim() !== ''
    );
    const validCodes = targetEmployees.map((e: any) => e.code);

    // 1. Xác định ngày muộn nhất có dữ liệu (hoặc ngày hôm nay)
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const currentMonthStr = `${yyyy}-${mm}`;
    const todayStr = `${yyyy}-${mm}-${dd}`;

    let maxDateForMonth = '';
    if (targetMonth < currentMonthStr) {
      const [y, m] = targetMonth.split('-').map(Number);
      const lastDay = new Date(y, m, 0).getDate();
      maxDateForMonth = `${targetMonth}-${String(lastDay).padStart(2, '0')}`;
    } else if (targetMonth === currentMonthStr) {
      const latestLog = await this.logModel
        .findOne({ date: { $regex: `^${targetMonth}` } })
        .sort({ date: -1 })
        .lean();
      const latestDaily = await this.dailyModel
        .findOne({ date: { $regex: `^${targetMonth}` }, punchCount: { $gt: 0 } })
        .sort({ date: -1 })
        .lean();

      const candidateDates = [latestLog?.date, latestDaily?.date, todayStr].filter(Boolean) as string[];
      candidateDates.sort().reverse();
      const candidate = candidateDates[0] || todayStr;
      // Không vượt quá ngày hôm nay nếu kéo log tương lai
      maxDateForMonth = candidate <= todayStr ? candidate : todayStr;
    } else {
      return [];
    }

    const filter: any = {};
    filter.date = { $regex: `^${targetMonth}`, $lte: maxDateForMonth };
    filter.userId = { $in: validCodes };

    if (userId && userId !== 'ALL') {
      filter.userId = userId;
    }
    if (department && department !== 'ALL') {
      filter.department = department;
    }

    const dbRecords = await this.dailyModel.find(filter).lean();

    // 2. Tra cứu ngày lễ / sự kiện được thiết lập trong Cài Đặt
    const holidays = await this.holidayModel
      .find({ date: { $regex: `^${targetMonth}` } })
      .lean();
    const holidayMap = new Map<string, any>();
    for (const h of holidays) {
      holidayMap.set(h.date, h);
    }

    // Lọc danh sách nhân sự cần tổng hợp
    let empsToProcess = targetEmployees;
    if (userId && userId !== 'ALL') {
      empsToProcess = empsToProcess.filter((e: any) => e.code === userId);
    }
    if (department && department !== 'ALL') {
      empsToProcess = empsToProcess.filter((e: any) => e.department === department);
    }

    const recordMap = new Map<string, any>();
    for (const r of dbRecords) {
      recordMap.set(`${r.userId}_${r.date}`, r);
    }

    const weekdays = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const [yearNum, monthNum] = targetMonth.split('-').map(Number);
    const maxDayNum = parseInt(maxDateForMonth.split('-')[2], 10);

    const finalRows: any[] = [];

    for (let d = 1; d <= maxDayNum; d++) {
      const dayStr = String(d).padStart(2, '0');
      const dateStr = `${targetMonth}-${dayStr}`;
      const dateObj = new Date(yearNum, monthNum - 1, d);
      const dow = dateObj.getDay();
      const weekdayName = weekdays[dow];
      const isWeekend = dow === 0 || dow === 6;
      const holiday = holidayMap.get(dateStr);

      for (const emp of empsToProcess) {
        const key = `${emp.code}_${dateStr}`;
        const existing = recordMap.get(key);

        if (existing) {
          // Nếu ngày này được cài đặt là ngày nghỉ lễ nhưng bản ghi cũ chưa cập nhật thành NGHI_LE
          if (holiday && existing.status !== DailyStatus.NGHI_LE && (!existing.punchCount || existing.punchCount === 0)) {
            finalRows.push({
              ...existing,
              status: DailyStatus.NGHI_LE,
              workCredit: 1.0,
              missingMinutes: 0,
              note: holiday.name || 'Nghỉ Lễ Quốc Khánh',
              weekday: existing.weekday || weekdayName,
            });
          } else {
            finalRows.push({
              ...existing,
              weekday: existing.weekday || weekdayName,
            });
          }
        } else if (holiday) {
          // Ngày nghỉ Lễ/Tết được thiết lập trong Cài Đặt (Hưởng nguyên lương 1.0 công)
          finalRows.push({
            userId: emp.code,
            name: emp.name,
            department: emp.department || '',
            date: dateStr,
            weekday: weekdayName,
            firstIn: '',
            lastOut: '',
            punchCount: 0,
            status: DailyStatus.NGHI_LE,
            workHours: 0,
            workTimeText: '0h',
            missingMinutes: 0,
            overtimeMinutes: 0,
            workCredit: 1.0,
            note: holiday.name || 'Nghỉ Lễ Quốc Khánh',
          });
        } else if (isWeekend) {
          // Bổ sung dòng Thứ 7 / Chủ Nhật (Nghỉ cuối tuần) để không bị đứt ngày
          finalRows.push({
            userId: emp.code,
            name: emp.name,
            department: emp.department || '',
            date: dateStr,
            weekday: weekdayName,
            firstIn: '',
            lastOut: '',
            punchCount: 0,
            status: DailyStatus.CUOI_TUAN,
            workHours: 0,
            workTimeText: '0h',
            missingMinutes: 0,
            overtimeMinutes: 0,
            workCredit: 0.0,
            note: 'Nghỉ cuối tuần',
          });
        } else {
          // Ngày trong tuần không có quẹt thẻ
          finalRows.push({
            userId: emp.code,
            name: emp.name,
            department: emp.department || '',
            date: dateStr,
            weekday: weekdayName,
            firstIn: '',
            lastOut: '',
            punchCount: 0,
            status: DailyStatus.MISS,
            workHours: 0,
            workTimeText: '0h',
            missingMinutes: 480,
            overtimeMinutes: 0,
            workCredit: 0.0,
            note: 'Vắng mặt',
          });
        }
      }
    }

    // Sắp xếp ngày mới nhất lên đầu, tiếp đến là mã nhân viên
    finalRows.sort((a, b) => {
      if (a.date !== b.date) {
        return b.date.localeCompare(a.date);
      }
      return (a.userId || '').localeCompare(b.userId || '');
    });

    return finalRows;
  }

  /**
   * Query Tab 2: Monthly Summary Table
   * Implements section 6 of CHAMCONG_WEB_SPECIFICATION.md
   */
  async getMonthlySummary(month?: string, userId?: string, department?: string): Promise<any> {
    await this.autoSyncMappedEmployees();

    const targetMonth = month || '2026-09';
    const [yearStr, monthStr] = targetMonth.split('-');
    const year = parseInt(yearStr, 10);
    const monthNum = parseInt(monthStr, 10);

    // 1. Fetch active shift and days off config
    const config = await this.getAttendanceConfig();
    const offDayNumbers = (config?.weeklyOffDays ?? '0,6')
      .split(',')
      .map((s: string) => parseInt(s.trim(), 10))
      .filter((n: number) => !isNaN(n));

    // Calculate standard working days in month
    const totalDays = new Date(year, monthNum, 0).getDate();
    const holidays = await this.holidayModel.find({ date: { $regex: `^${targetMonth}` } }).lean();
    const holidayDates = new Set(holidays.map((h) => h.date));

    let standardDays = 0;
    let weekendDays = 0;
    let holidayDays = 0;

    for (let day = 1; day <= totalDays; day++) {
      const dateStr = `${year}-${String(monthNum).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const d = new Date(dateStr);
      const dow = d.getDay();
      const isOffDay = offDayNumbers.includes(dow);
      if (isOffDay) {
        weekendDays++;
      } else if (holidayDates.has(dateStr)) {
        holidayDays++;
      } else {
        standardDays++;
      }
    }

    // 2. Fetch all daily records for this month
    const dailyFilter: any = { date: { $regex: `^${targetMonth}` } };
    if (userId && userId !== 'ALL') {
      dailyFilter.userId = userId;
    }
    if (department && department !== 'ALL') {
      dailyFilter.department = department;
    }

    const dailyRecords = await this.dailyModel
      .find(dailyFilter)
      .lean();

    // Group by userId
    const userStats = new Map<string, {
      userId: string;
      attendanceCode: string;
      name: string;
      department: string;
      workCredit: number;
      leaveCredit: number;
      tripCredit: number;
      workingDays: number;
      missingMinutes: number;
      overtimeMinutes: number;
      missDays: number;
      holidayDays: number;
    }>();

    // ONLY employees who have attendanceCode are counted in monthly summary!
    const employees = await this.employeeModel.find().lean();
    let targetEmployees = (employees as any[]).filter(
      (e: any) => e.attendanceCode && String(e.attendanceCode).trim() !== ''
    );
    if (userId && userId !== 'ALL') {
      targetEmployees = targetEmployees.filter(
        (e: any) => e.code === userId || e.attendanceCode === userId
      );
    }
    if (department && department !== 'ALL') {
      targetEmployees = targetEmployees.filter((e: any) => e.department === department);
    }

    for (const emp of targetEmployees) {
      userStats.set(emp.code, {
        userId: emp.code,
        attendanceCode: emp.attendanceCode || '',
        name: emp.name,
        department: emp.department || 'Nhân sự',
        workCredit: 0,
        leaveCredit: 0,
        tripCredit: 0,
        workingDays: 0,
        missingMinutes: 0,
        overtimeMinutes: 0,
        missDays: 0,
        holidayDays: 0,
      });
    }

    for (const record of dailyRecords) {
      let stat = userStats.get(record.userId);
      if (!stat) {
        // Skip unmapped / old records
        continue;
      }

      if (record.status === DailyStatus.NGHI_PHEP) {
        stat.leaveCredit += record.workCredit || 0;
      } else if (record.status === DailyStatus.CONG_TAC) {
        stat.tripCredit += record.workCredit || 0;
      } else if (record.status === DailyStatus.NGHI_LE || record.status === DailyStatus.CUOI_TUAN) {
        // Ngày lễ / cuối tuần đã được trừ khỏi Chuẩn công tháng (standardDays), không cộng dồn vào công đi làm
        if (record.status === DailyStatus.NGHI_LE) stat.holidayDays++;
      } else {
        stat.workCredit += record.workCredit || 0;
        if (record.workCredit > 0) stat.workingDays++;
      }

      stat.missingMinutes += record.missingMinutes || 0;
      stat.overtimeMinutes += record.overtimeMinutes || 0;
      if (record.status === DailyStatus.MISS) stat.missDays++;
    }

    // Format list
    const summaryList = Array.from(userStats.values())
      .sort((a, b) => a.userId.localeCompare(b.userId, undefined, { numeric: true }))
      .map((item, index) => {
        const congDiLam = Math.round(item.workCredit * 10) / 10;
        const congTac = Math.round((item.tripCredit || 0) * 10) / 10;
        const congPhep = Math.round((item.leaveCredit || 0) * 10) / 10;
        const tongCong = Math.round((congDiLam + congTac + congPhep) * 10) / 10;

        return {
          stt: index + 1,
          userId: item.userId,
          attendanceCode: item.attendanceCode,
          name: item.name,
          department: item.department,
          congDiLam,
          congTac,
          congPhep,
          tongCong,
          chuanThang: standardDays,
          missingMinutes: item.missingMinutes,
          overtimeMinutes: item.overtimeMinutes,
          missDays: item.missDays,
          ghiChu: tongCong >= standardDays ? 'Đủ chuẩn' : `Thiếu ${(standardDays - tongCong).toFixed(1)} công`,
        };
      });

    return {
      month: targetMonth,
      standardDays,
      weekendDays,
      holidayDays,
      totalEmployees: summaryList.length,
      data: summaryList,
    };
  }

  /**
   * Query Tab 3: Raw Logs from attendance machines / Excel
   */
  async getRawLogs(month?: string, userId?: string, page = 1, limit = 100): Promise<any> {
    await this.autoSyncMappedEmployees();

    const filter: any = {};
    if (month && month !== 'ALL') {
      filter.date = { $regex: `^${month}` };
    }
    if (userId && userId !== 'ALL') {
      const emp = await this.employeeModel.findOne({
        $or: [{ code: userId }, { attendanceCode: userId }]
      }).lean();
      if (emp) {
        filter.$or = [
          { userId: emp.code },
          { attendanceCode: emp.attendanceCode },
          { userId: userId }
        ];
      } else {
        filter.userId = userId;
      }
    }

    const total = await this.logModel.countDocuments(filter);
    const logs = await this.logModel
      .find(filter)
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return {
      total,
      page,
      limit,
      logs,
    };
  }

  /**
   * Seed realistic attendance data for September 2026
   */
  async seedSeptemberAttendance(): Promise<{ count: number }> {
    const existing = await this.logModel.countDocuments({ date: { $regex: '^2026-09' } });
    if (existing > 0) {
      this.logger.log(`September 2026 already has ${existing} attendance logs.`);
      // Run recalculation to ensure consistency
      const distinctDates = await this.logModel.distinct('date', { date: { $regex: '^2026-09' } });
      await this.recalculateDays(distinctDates);
      return { count: existing };
    }

    this.logger.log('Seeding September 2026 attendance data...');

    // Seed holiday: 2026-09-02 (Quốc Khánh)
    await this.holidayModel.updateOne(
      { date: '2026-09-02' },
      { $set: { date: '2026-09-02', name: 'Nghỉ Lễ Quốc Khánh' } },
      { upsert: true },
    );

    // Get employees
    let employees = await this.employeeModel.find().lean();
    if (employees.length === 0) {
      return { count: 0 };
    }

    const logsToInsert: any[] = [];
    // Dates from Sept 1st to Sept 14th, 2026
    const sampleDates = [
      '2026-09-01', // T3
      '2026-09-02', // T4 (Lễ)
      '2026-09-03', // T5
      '2026-09-04', // T6
      '2026-09-07', // T2
      '2026-09-08', // T3
      '2026-09-09', // T4
      '2026-09-10', // T5
      '2026-09-11', // T6
      '2026-09-14', // T2
    ];

    for (const dateStr of sampleDates) {
      if (dateStr === '2026-09-02') continue; // Lễ

      (employees as any[]).forEach((emp, index) => {
        const uid = emp.code;
        const name = emp.name;

        // Variations to test rules:
        // Index 0: Chuẩn 07:55 - 17:15 (Đủ công)
        // Index 1: Flex in 08:30 - 17:35 (Đủ công flex)
        // Index 2: Flex in 08:45 - 17:20 (Thiếu phút flex vì chưa bù đủ)
        // Index 3: Late > 09:00: 09:20 - 18:05 (Thiếu phút vào muộn)
        // Index 4: Quên quẹt ra: 08:05
        // Index 5: Quên quẹt vào: 17:05
        // Index 6: Vắng mặt

        if (index % 7 === 0) {
          // Standard on time
          logsToInsert.push({
            userId: uid,
            name,
            timestamp: `${dateStr} 07:55:12`,
            date: dateStr,
            time: '07:55:12',
            punch: 0,
            status: 0,
            source: 'device',
          });
          logsToInsert.push({
            userId: uid,
            name,
            timestamp: `${dateStr} 17:15:30`,
            date: dateStr,
            time: '17:15:30',
            punch: 0,
            status: 1,
            source: 'device',
          });
        } else if (index % 7 === 1) {
          // Flex in (8:30 - 17:35)
          logsToInsert.push({
            userId: uid,
            name,
            timestamp: `${dateStr} 08:30:00`,
            date: dateStr,
            time: '08:30:00',
            punch: 1,
            status: 0,
            source: 'device',
          });
          logsToInsert.push({
            userId: uid,
            name,
            timestamp: `${dateStr} 17:35:10`,
            date: dateStr,
            time: '17:35:10',
            punch: 1,
            status: 1,
            source: 'device',
          });
        } else if (index % 7 === 2) {
          // Flex in but left early (8:45 - 17:20)
          logsToInsert.push({
            userId: uid,
            name,
            timestamp: `${dateStr} 08:45:00`,
            date: dateStr,
            time: '08:45:00',
            punch: 0,
            status: 0,
            source: 'device',
          });
          logsToInsert.push({
            userId: uid,
            name,
            timestamp: `${dateStr} 17:20:00`,
            date: dateStr,
            time: '17:20:00',
            punch: 0,
            status: 1,
            source: 'device',
          });
        } else if (index % 7 === 3) {
          // In > 9am (09:20 - 18:00)
          logsToInsert.push({
            userId: uid,
            name,
            timestamp: `${dateStr} 09:20:00`,
            date: dateStr,
            time: '09:20:00',
            punch: 2,
            status: 0,
            source: 'excel',
          });
          logsToInsert.push({
            userId: uid,
            name,
            timestamp: `${dateStr} 18:05:00`,
            date: dateStr,
            time: '18:05:00',
            punch: 2,
            status: 1,
            source: 'excel',
          });
        } else if (index % 7 === 4) {
          // Forgot punch out
          logsToInsert.push({
            userId: uid,
            name,
            timestamp: `${dateStr} 08:02:15`,
            date: dateStr,
            time: '08:02:15',
            punch: 0,
            status: 0,
            source: 'device',
          });
        } else if (index % 7 === 5) {
          // Forgot punch in
          logsToInsert.push({
            userId: uid,
            name,
            timestamp: `${dateStr} 17:08:40`,
            date: dateStr,
            time: '17:08:40',
            punch: 0,
            status: 1,
            source: 'device',
          });
        }
        // index % 7 === 6: Miss
      });
    }

    for (const log of logsToInsert) {
      await this.logModel.updateOne(
        { userId: log.userId, timestamp: log.timestamp },
        { $setOnInsert: log },
        { upsert: true },
      );
    }

    // Recalculate
    await this.recalculateDays(sampleDates);
    return { count: logsToInsert.length };
  }

  /**
   * Clear all attendance logs and daily evaluated records (Reset to empty)
   */
  async clearAllAttendance(): Promise<{ success: boolean; message: string }> {
    await this.logModel.deleteMany({});
    await this.dailyModel.deleteMany({});
    this.logger.log('Cleared all attendance logs and daily attendance records.');
    return { success: true, message: 'Đã xóa toàn bộ dữ liệu chấm công. Cơ sở dữ liệu hiện đã sạch 100%.' };
  }

  /**
   * Device configuration management
   */
  async getDeviceConfig(): Promise<any> {
    let dev = await this.deviceModel.findOne().lean();
    if (!dev) {
      dev = await this.deviceModel.create({
        name: 'Máy chấm công Ronald Jack / ZKTeco',
        ip: '192.168.1.201',
        port: 4370,
        commKey: 0,
        timeout: 5,
        status: 'Chưa kết nối',
      });
    }
    return dev;
  }

  async saveDeviceConfig(body: any): Promise<any> {
    return this.deviceModel.findOneAndUpdate(
      {},
      { $set: body },
      { upsert: true, new: true },
    );
  }

  /**
   * Attendance Shift & Days Off Config
   */
  async getAttendanceConfig(): Promise<any> {
    let config = await this.configModel.findOne().lean();
    if (!config) {
      config = await this.configModel.create({
        shiftTimeIn: '08:00',
        shiftTimeOut: '17:00',
        lunchTimeStart: '12:00',
        lunchTimeEnd: '13:00',
        lunchBreakHours: 1.0,
        workRequiredHours: 8.0,
        maxLateFlexMinutes: 60,
        graceMinutes: 15,
        minHoursFullDay: 8.0,
        minHoursHalfDay: 4.0,
        flexLatestIn: '09:00',
        weeklyOffDays: '0,6', // 0=Chủ Nhật, 6=Thứ Bảy
      });
    }
    return config;

  }

  async saveAttendanceConfig(body: any): Promise<any> {
    const config = await this.configModel.findOneAndUpdate(
      {},
      { $set: body },
      { upsert: true, new: true },
    );

    // Tự động tính toán lại tất cả các ngày phát sinh dữ liệu chấm công theo cấu hình mới
    try {
      const dailyDates = await this.dailyModel.distinct('date');
      const logDates = await this.logModel.distinct('date');
      const allDates = Array.from(new Set([...dailyDates, ...logDates])).filter(Boolean);
      if (allDates && allDates.length > 0) {
        await this.recalculateDays(allDates);
      }
    } catch (e) {
      this.logger.warn(`Could not recalculate days after saving config: ${e}`);
    }

    return config;
  }

  /**
   * Holidays management (Ngày lễ & Ngày nghỉ riêng lẻ)
   */
  async getHolidays(): Promise<Holiday[]> {
    return this.holidayModel.find().sort({ date: 1 }).lean();
  }

  async createHoliday(body: { date: string; name: string; type?: string; isPaid?: boolean }): Promise<Holiday> {
    const res = await this.holidayModel.findOneAndUpdate(
      { date: body.date },
      { $set: body },
      { upsert: true, new: true },
    );
    // Recalculate that date
    await this.recalculateDays([body.date]);
    return res;
  }

  async deleteHoliday(id: string): Promise<any> {
    const doc = await this.holidayModel.findByIdAndDelete(id);
    if (doc) {
      await this.recalculateDays([doc.date]);
    }
    return { success: true };
  }
}

