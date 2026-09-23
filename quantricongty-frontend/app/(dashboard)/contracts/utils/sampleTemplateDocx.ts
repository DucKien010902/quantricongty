import PizZip from "pizzip";

/**
 * Tạo tệp mẫu Word .docx chuẩn có gắn sẵn toàn bộ các thẻ {{...}}
 */
export function createSampleContractDocx(): Blob {
  const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`;

  const rels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;

  // Helper tạo paragraph
  const p = (text: string, bold = false, center = false, size = 26) => `
    <w:p>
      <w:pPr>
        ${center ? '<w:jc w:val="center"/>' : ""}
        <w:spacing w:after="120" w:line="276" w:lineRule="auto"/>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/>
          ${bold ? "<w:b/>" : ""}
          <w:sz w:val="${size}"/>
          <w:szCs w:val="${size}"/>
        </w:rPr>
        <w:t xml:space="preserve">${escapeXml(text)}</w:t>
      </w:r>
    </w:p>`;

  const escapeXml = (unsafe: string) => {
    return unsafe.replace(/[<>&'"]/g, (c) => {
      switch (c) {
        case "<": return "&lt;";
        case ">": return "&gt;";
        case "&": return "&amp;";
        case "'": return "&apos;";
        case '"': return "&quot;";
        default: return c;
      }
    });
  };

  const docXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    ${p("CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM", true, true, 26)}
    ${p("Độc lập - Tự do - Hạnh phúc", true, true, 26)}
    ${p("---------------------------------", false, true, 22)}
    ${p("", false, false, 20)}
    ${p("HỢP ĐỒNG LAO ĐỘNG", true, true, 34)}
    ${p("Số: {{contract.code}}", true, true, 24)}
    ${p("", false, false, 20)}
    ${p("Hôm nay, ngày {{contract.signDay}} tháng {{contract.signMonth}} năm {{contract.signYear}}, tại {{company.address}}, chúng tôi gồm có:", false, false, 26)}
    ${p("", false, false, 20)}
    ${p("BÊN A - NGƯỜI SỬ DỤNG LAO ĐỘNG (CÔNG TY):", true, false, 26)}
    ${p("Tên doanh nghiệp: {{company.name}}", false, false, 26)}
    ${p("Địa chỉ trụ sở: {{company.address}}", false, false, 26)}
    ${p("Số điện thoại: {{company.phone}}", false, false, 26)}
    ${p("Mã số thuế: {{company.taxCode}}", false, false, 26)}
    ${p("Người đại diện: {{company.representative}}", true, false, 26)}
    ${p("Chức vụ: {{company.representativePosition}}", true, false, 26)}
    ${p("(sau đây gọi tắt là “Công ty” hoặc “Người sử dụng lao động”)", false, false, 24)}
    ${p("", false, false, 20)}
    ${p("BÊN B - NGƯỜI LAO ĐỘNG:", true, false, 26)}
    ${p("Và một bên là Ông/Bà: {{employee.fullName}}", true, false, 26)}
    ${p("Giới tính: {{employee.gender}}        Ngày sinh: {{employee.dob}}", false, false, 26)}
    ${p("Quốc tịch: {{employee.country}}", false, false, 26)}
    ${p("Số CMND/CCCD/Hộ chiếu: {{employee.identityCard}}", false, false, 26)}
    ${p("Cấp ngày: {{employee.identityDate}}        Tại: {{employee.identityPlace}}", false, false, 26)}
    ${p("Hộ khẩu thường trú: {{employee.address}}", false, false, 26)}
    ${p("Chỗ ở hiện tại: {{employee.currentAddress}}", false, false, 26)}
    ${p("Số điện thoại: {{employee.workPhone}}        Email: {{employee.email}}", false, false, 26)}
    ${p("(sau đây gọi tắt là “Người lao động”)", false, false, 24)}
    ${p("", false, false, 20)}
    ${p("Hai bên cùng thỏa thuận và thống nhất ký kết Hợp đồng lao động với các điều khoản sau:", false, false, 26)}
    ${p("", false, false, 20)}
    ${p("ĐIỀU 1: THỜI HẠN VÀ CÔNG VIỆC HỢP ĐỒNG", true, false, 26)}
    ${p("- Loại hợp đồng: {{contract.type}}", false, false, 26)}
    ${p("- Thời hạn hợp đồng: {{contract.duration}}", false, false, 26)}
    ${p("- Hiệu lực từ ngày {{contract.startDate}} đến hết ngày {{contract.endDate}}.", false, false, 26)}
    ${p("- Địa điểm làm việc: {{contract.workLocation}}", false, false, 26)}
    ${p("- Chức danh chuyên môn: {{employee.position}}", false, false, 26)}
    ${p("- Phòng ban trực thuộc: {{employee.department}}", false, false, 26)}
    ${p("- Thời giờ làm việc: {{contract.workTime}}", false, false, 26)}
    ${p("", false, false, 20)}
    ${p("ĐIỀU 2: CHẾ ĐỘ TIỀN LƯƠNG VÀ ĐÃI NGỘ", true, false, 26)}
    ${p("- Mức lương chính thức: {{contract.salary}} (Bằng chữ: {{contract.salaryInWords}}).", false, false, 26)}
    ${p("- Mức lương trong thời gian thử việc: {{contract.probationSalary}}.", false, false, 26)}
    ${p("- Hình thức trả lương: Chuyển khoản qua số tài khoản: {{employee.bankAccount}} tại {{employee.bankName}}.", false, false, 26)}
    ${p("", false, false, 20)}
    ${p("ĐIỀU 3: ĐIỀU KHOẢN THI HÀNH", true, false, 26)}
    ${p("Hợp đồng này được lập thành 02 (hai) bản có giá trị pháp lý như nhau, mỗi bên giữ 01 bản để thực hiện.", false, false, 26)}
    ${p("", false, false, 30)}
    ${p("        ĐẠI DIỆN BÊN A                                                  NGƯỜI LAO ĐỘNG (BÊN B)", true, false, 26)}
    ${p("    (Ký, ghi rõ họ tên và đóng dấu)                                     (Ký, ghi rõ họ tên)", false, false, 22)}
    ${p("", false, false, 60)}
    ${p("", false, false, 60)}
    ${p("    {{company.representative}}                                          {{employee.fullName}}", true, false, 26)}
  </w:body>
</w:document>`;

  const zip = new PizZip();
  zip.file("[Content_Types].xml", contentTypes);
  zip.file("_rels/.rels", rels);
  zip.folder("word")?.file("document.xml", docXml);

  return zip.generate({
    type: "blob",
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });
}
