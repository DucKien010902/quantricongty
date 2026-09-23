import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP_API_AUDIT');

  use(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();
    const { method, originalUrl, ip } = req;

    next();

    res.on('finish', () => {
      const { statusCode } = res;
      const responseTime = Date.now() - startTime;

      // Timestamp đã có sẵn trong NestJS prefix, không cần tạo thêm

      // 2. Xác định Ai là người gọi (Caller Identification)
      let caller = 'Guest';

      const headerUser =
        req.headers['x-user-name'] ||
        req.headers['x-user-code'] ||
        req.headers['x-user-email'];

      if (headerUser) {
        caller = String(headerUser);
      } else if (req.body) {
        if (req.body.author) caller = req.body.author;
        else if (req.body.requesterName) caller = req.body.requesterName;
        else if (req.body.email) caller = req.body.email;
        else if (req.body.code) caller = req.body.code;
        else if (req.body.name) caller = req.body.name;
      }

      const authHeader = req.headers['authorization'];
      if (authHeader && authHeader.startsWith('Bearer ') && caller === 'Khách / Nặc danh (Guest)') {
        try {
          const token = authHeader.split(' ')[1];
          const payloadBase64 = token.split('.')[1];
          if (payloadBase64) {
            const decodedJson = JSON.parse(Buffer.from(payloadBase64, 'base64').toString('utf8'));
            if (decodedJson.name || decodedJson.email || decodedJson.code) {
              caller = decodedJson.name || decodedJson.email || decodedJson.code;
            }
          }
        } catch {
          // ignore
        }
      }

      const clientIp = (req.headers['x-forwarded-for'] as string) || ip || '127.0.0.1';

      // 3. Mã màu ANSI rực rỡ phân biệt từng thành phần trong Terminal Log
      const reset = '\x1b[0m';
      const gray = '\x1b[90m';
      const boldWhite = '\x1b[1m\x1b[97m';
      const brightMagenta = '\x1b[95m';
      const cyan = '\x1b[36m';
      const yellow = '\x1b[33m';
      void gray; // used in coloredLogMessage

      // Màu cho HTTP Method
      let methodColor = `\x1b[1m\x1b[32m[${method}]\x1b[0m`; // GET -> Xanh lá
      if (method === 'POST') methodColor = `\x1b[1m\x1b[36m[${method}]\x1b[0m`; // POST -> Xanh Cyan
      else if (method === 'DELETE') methodColor = `\x1b[1m\x1b[31m[${method}]\x1b[0m`; // DELETE -> Đỏ rực
      else if (method === 'PUT' || method === 'PATCH') methodColor = `\x1b[1m\x1b[33m[${method}]\x1b[0m`; // PUT/PATCH -> Vàng

      // Màu cho Status Code
      let statusColor = `\x1b[92m${statusCode}\x1b[0m`; // 2xx -> Xanh lá sáng
      if (statusCode >= 500) statusColor = `\x1b[91m${statusCode}\x1b[0m`; // 5xx -> Đỏ rực
      else if (statusCode >= 400) statusColor = `\x1b[93m${statusCode}\x1b[0m`; // 4xx -> Vàng rực
      else if (statusCode >= 300) statusColor = `\x1b[96m${statusCode}\x1b[0m`; // 3xx -> Xanh cyan

      const colorUrl = `${boldWhite}${originalUrl}${reset}`;
      const colorCaller = `${brightMagenta}${caller}${reset}`;
      const colorIp = `${cyan}${clientIp}${reset}`;
      const colorTime = `${yellow}${responseTime}ms${reset}`;

      // Ghép chuỗi Log — không có timestamp vì NestJS prefix đã có sẵn
      const coloredLogMessage = `${methodColor} ${colorUrl} ${gray}|${reset} ${colorCaller} ${gray}|${reset} ${colorIp} ${gray}|${reset} ${statusColor} ${gray}|${reset} ${colorTime}`;

      if (statusCode >= 500) {
        this.logger.error(`❌ ${coloredLogMessage}`);
      } else if (statusCode >= 400) {
        this.logger.warn(`⚠️ ${coloredLogMessage}`);
      } else {
        this.logger.log(`✅ ${coloredLogMessage}`);
      }
    });
  }
}
