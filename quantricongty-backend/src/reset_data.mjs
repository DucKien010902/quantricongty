import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://DucKien:kien010902@cluster0.4l1lzw3.mongodb.net/quantricongty?retryWrites=true&w=majority&appName=Cluster0';

async function resetAllData() {
  console.log('🔌 Đang kết nối tới MongoDB...');
  await mongoose.connect(MONGO_URI);
  console.log('✅ Đã kết nối thành công!');

  const db = mongoose.connection.db;

  // 1. Xóa toàn bộ đơn phê duyệt (Approvals)
  console.log('🧹 Đang xóa toàn bộ đơn nghỉ phép & đề xuất phê duyệt...');
  const approvalRes = await db.collection('approvals').deleteMany({});
  console.log(`-> Đã xóa ${approvalRes.deletedCount} đơn phê duyệt.`);

  // 2. Xóa toàn bộ lịch công tác (Business Trips)
  console.log('🧹 Đang xóa toàn bộ đợt công tác...');
  const tripRes = await db.collection('businesstrips').deleteMany({});
  console.log(`-> Đã xóa ${tripRes.deletedCount} đợt công tác.`);

  // 3. Reset Quỹ phép nhân viên về 0 ngày đã nghỉ
  console.log('🔄 Đang reset quỹ phép năm của toàn bộ nhân viên...');
  const employees = await db.collection('employees').find({}).toArray();
  for (const emp of employees) {
    const quota = emp.annualLeaveQuota !== undefined ? emp.annualLeaveQuota : 12;
    const carried = emp.carriedOverLeave || 0;
    await db.collection('employees').updateOne(
      { _id: emp._id },
      {
        $set: {
          usedLeave: 0,
          remainingLeave: quota + carried,
        },
      },
    );
  }
  console.log(`-> Đã reset quỹ phép của ${employees.length} nhân viên (usedLeave = 0).`);

  // 4. Xóa ghi nhận nghỉ phép / công tác trên bảng chấm công
  console.log('🧹 Đang xóa dữ liệu chấm công nghỉ phép & công tác...');
  const attendanceRes = await db.collection('dailyattendances').deleteMany({
    $or: [
      { status: 'NGHI_PHEP' },
      { status: 'CONG_TAC' },
      { note: { $regex: /Nghỉ phép|Đi công tác|công tác/i } },
    ],
  });
  console.log(`-> Đã dọn dẹp ${attendanceRes.deletedCount} bản ghi chấm công nghỉ/công tác.`);

  console.log('🎉 TẤT CẢ DỮ LIỆU ĐÃ ĐƯỢC RESET SẠCH SẼ VỀ TRẠNG THÁI BAN ĐẦU!');
  await mongoose.disconnect();
  process.exit(0);
}

resetAllData().catch((err) => {
  console.error('❌ Lỗi khi reset dữ liệu:', err);
  process.exit(1);
});
