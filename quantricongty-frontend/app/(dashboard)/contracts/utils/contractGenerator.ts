import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";

/**
 * Tự động sửa lỗi hiển thị ký tự tiếng Việt do Multer/mã hóa sai (Latin1 -> UTF8)
 */
export function fixVietnameseEncoding(str: string): string {
  if (!str) return "";
  if (str.includes("Ã") || str.includes("≡") || str.includes("Â") || str.includes("Ã¡") || str.includes("Ä")) {
    try {
      return Buffer.from(str, "latin1").toString("utf8");
    } catch (e) {
      return str;
    }
  }
  return str;
}

/**
 * Đọc số tiền sang chữ tiếng Việt chuẩn xác
 */
export function numberToVietnameseWords(n: number): string {
  if (isNaN(n) || n === 0) return "Không đồng";

  const defaultNumbers = [" không", " một", " hai", " ba", " bốn", " năm", " sáu", " bảy", " tám", " chín"];
  const units = ["", " nghìn", " triệu", " tỷ", " nghìn tỷ", " triệu tỷ"];

  function readThreeDigits(threeDigits: number, showZeroHundred: boolean): string {
    let hundred = Math.floor(threeDigits / 100);
    let ten = Math.floor((threeDigits % 100) / 10);
    let unit = threeDigits % 10;
    let result = "";

    if (hundred > 0 || showZeroHundred) {
      result += defaultNumbers[hundred] + " trăm";
    }

    if (ten > 1) {
      result += defaultNumbers[ten] + " mươi";
      if (unit === 1) result += " mốt";
      else if (unit === 5) result += " lăm";
      else if (unit > 0) result += defaultNumbers[unit];
    } else if (ten === 1) {
      result += " mười";
      if (unit === 5) result += " lăm";
      else if (unit > 0) result += defaultNumbers[unit];
    } else if (showZeroHundred && unit > 0) {
      result += " linh" + defaultNumbers[unit];
    } else if (unit > 0) {
      result += defaultNumbers[unit];
    }

    return result;
  }

  let sNumber = Math.abs(Math.round(n)).toString();
  let groups: number[] = [];
  while (sNumber.length > 0) {
    let chunk = sNumber.slice(-3);
    groups.push(parseInt(chunk, 10));
    sNumber = sNumber.slice(0, -3);
  }

  let words = "";
  for (let i = groups.length - 1; i >= 0; i--) {
    let groupVal = groups[i];
    if (groupVal > 0) {
      let isShowZero = i < groups.length - 1 && groupVal < 100;
      let readGroup = readThreeDigits(groupVal, isShowZero);
      words += readGroup + units[i];
    }
  }

  words = words.trim();
  if (words.length > 0) {
    words = words.charAt(0).toUpperCase() + words.slice(1) + " đồng chẵn";
  }
  return words;
}

/**
 * Custom parser hỗ trợ thẻ có dấu chấm (dot-notation) như {{employee.fullName}}, {{contract.salary}}
 * và tự động chuyển null/undefined thành rỗng thay vì ném lỗi
 */
function createSmartParser() {
  return function (tag: string) {
    const cleanTag = tag.trim();
    return {
      get(scope: any) {
        if (cleanTag === ".") return scope;
        if (!scope) return "";

        // 1. Kiểm tra key trực tiếp
        if (scope[cleanTag] !== undefined && scope[cleanTag] !== null) {
          return scope[cleanTag];
        }

        // 2. Phân giải đường dẫn phân cấp (vd: employee.fullName)
        const parts = cleanTag.split(".");
        let current = scope;
        for (const part of parts) {
          if (current == null) return "";
          current = current[part];
        }
        return current !== undefined && current !== null ? current : "";
      },
    };
  };
}

/**
 * Trộn dữ liệu vào tệp Word .docx sử dụng docxtemplater & pizzip
 */
export function generateContractDocx(
  templateBuffer: ArrayBuffer,
  data: Record<string, any>
): Blob {
  try {
    const zip = new PizZip(templateBuffer);

    // Tự động kiểm tra xem file Word dùng cặp thẻ kép {{...}} hay thẻ đơn {...}
    const docXml = zip.files["word/document.xml"]?.asText() || "";
    const isDoubleBraces = docXml.includes("{{");

    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      delimiters: isDoubleBraces
        ? { start: "{{", end: "}}" }
        : { start: "{", end: "}" },
      parser: createSmartParser(),
      nullGetter: () => "",
    });

    // Render file docx với các trường data
    doc.render(data);

    const out = doc.getZip().generate({
      type: "blob",
      mimeType:
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });

    return out;
  } catch (error: any) {
    console.error("Docxtemplater Error:", error);
    if (error?.properties?.errors) {
      console.error("Chi tiết lỗi cú pháp mẫu Word:", error.properties.errors);
      const detailedMessages = error.properties.errors
        .map((e: any) => e.explanation || e.message)
        .join("; ");
      throw new Error(`Lỗi cú pháp trong file mẫu Word: ${detailedMessages}`);
    }
    throw new Error(
      error?.message ||
        "Không thể sinh tệp Word từ biểu mẫu. Vui lòng kiểm tra lại cấu trúc thẻ {{}} trong file mẫu!"
    );
  }
}

/**
 * Tự động tải file blob về máy người dùng
 */
export function downloadFile(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}
