import mongoose from 'mongoose';

const uri = 'mongodb+srv://DucKien:kien010902@cluster0.4l1lzw3.mongodb.net/quantricongty?retryWrites=true&w=majority&appName=Cluster0';

async function testRules() {
  console.log('=== TESTING DEPARTMENT APPROVAL RULES ===');

  // 1. Test: Ban nào chỉ duyệt ban đó
  console.log('\n--- 1. Testing "Ban nào duyệt ban đó" ---');
  // Create leave request for Uyên (Ban Công nghệ Thông tin)
  const createRes1 = await fetch('http://localhost:5002/api/approvals', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'leave',
      leaveType: 'annual',
      title: 'Đơn xin nghỉ phép kiểm thử phân quyền ban phòng',
      requesterCode: 'ĐH0015',
      requesterName: 'Lê Phương Uyên',
      department: 'Ban Công nghệ Thông tin & Chuyển đổi số',
      startDate: '2026-09-24',
      endDate: '2026-09-24',
      reason: 'Kiểm thử quy tắc duyệt ban phòng.',
    }),
  });
  const req1 = await createRes1.json();
  console.log('Created request for IT member, initial status:', req1.status);

  // Attempt to approve Stage 1 using a fake leader from another department (e.g. Ban Tài chính)
  await mongoose.connect(uri);
  await mongoose.connection.collection('employees').updateOne(
    { code: 'TEST-LEADER-FIN' },
    {
      $set: {
        code: 'TEST-LEADER-FIN',
        name: 'Trưởng Ban Tài Chính Giả Định',
        role: 'LEADER',
        positionLevel: 'Trưởng Ban',
        department: 'Ban Tài chính - Kế toán',
      }
    },
    { upsert: true }
  );

  const crossDeptRes = await fetch(`http://localhost:5002/api/approvals/${req1._id}/leader-approve`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      approverCode: 'TEST-LEADER-FIN',
      approverName: 'Trưởng Ban Tài Chính Giả Định',
      isApproved: true,
      note: 'Duyệt chéo ban',
    }),
  });

  const crossDeptResult = await crossDeptRes.json();
  console.log('Cross-department approval attempt result status:', crossDeptRes.status);
  console.log('Message:', crossDeptResult.message);
  if (crossDeptRes.status === 400 && crossDeptResult.message.includes('Ban nào chỉ duyệt ban đó')) {
    console.log('✅ PASS: Cross-department leader approval was correctly BLOCKED!');
  } else {
    throw new Error('FAILED: Cross-department approval should have been blocked!');
  }

  // Same department leader approval (Kiên)
  const sameDeptRes = await fetch(`http://localhost:5002/api/approvals/${req1._id}/leader-approve`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      approverCode: 'ĐH0050',
      approverName: 'Nguyễn Đức Kiên',
      isApproved: true,
      note: 'Duyệt đúng ban IT',
    }),
  });
  const sameDeptResult = await sameDeptRes.json();
  console.log('Same department approval status:', sameDeptRes.status, 'New status:', sameDeptResult.status);
  if (sameDeptResult.status === 'PENDING_HR') {
    console.log('✅ PASS: Same department leader approval succeeded!');
  } else {
    throw new Error('FAILED: Same department approval failed!');
  }

  // 2. Test: Trưởng phòng chỉ cần duyệt 1 cấp
  console.log('\n--- 2. Testing "Trưởng phòng chỉ cần duyệt 1 cấp" ---');
  const createRes2 = await fetch('http://localhost:5002/api/approvals', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'leave',
      leaveType: 'annual',
      title: 'Đơn xin nghỉ phép của Trưởng ban (DHI-001)',
      requesterCode: 'DHI-001',
      requesterName: 'Trần Văn Khang',
      department: 'Ban Nhân sự & Hành chính Tổng hợp',
      startDate: '2026-09-25',
      endDate: '2026-09-25',
      reason: 'Trưởng phòng nghỉ phép cá nhân.',
    }),
  });
  const req2 = await createRes2.json();
  console.log('Leader request initial status:', req2.status);
  console.log('Leader approval record:', req2.leaderApproval);
  if (req2.status === 'PENDING_HR' && req2.leaderApproval.status === 'skipped') {
    console.log('✅ PASS: Leader request bypassed Stage 1 and went directly to Stage 2 (PENDING_HR)!');
  } else {
    throw new Error(`FAILED: Expected PENDING_HR and skipped, got ${req2.status}`);
  }

  // 3. Test: Nếu phòng ban chưa có Trưởng phòng thì sao
  console.log('\n--- 3. Testing "Phòng ban khuyết Trưởng phòng" ---');
  const createRes3 = await fetch('http://localhost:5002/api/approvals', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'leave',
      leaveType: 'annual',
      title: 'Đơn xin nghỉ của nhân viên thuộc Ban chưa có Trưởng ban',
      requesterCode: 'EMP-NO-LEADER',
      requesterName: 'Nhân Viên Ban Đầu Tư',
      department: 'Ban Đầu tư & Thẩm định Dự án', // Ban này chưa có ai giữ chức Trưởng ban
      startDate: '2026-09-28',
      endDate: '2026-09-28',
      reason: 'Ban chưa có trưởng phòng xin nghỉ.',
    }),
  });
  const req3 = await createRes3.json();
  console.log('No-leader department request initial status:', req3.status);
  console.log('Leader approval note:', req3.leaderApproval.note);
  if (req3.status === 'PENDING_HR' && req3.leaderApproval.status === 'skipped') {
    console.log('✅ PASS: When department has no leader, request automatically routed to Stage 2 (PENDING_HR) without getting stuck!');
  } else {
    throw new Error(`FAILED: Expected PENDING_HR and skipped, got ${req3.status}`);
  }

  // Clean up test data
  await mongoose.connection.collection('approvals').deleteMany({
    _id: { $in: [new mongoose.Types.ObjectId(req1._id), new mongoose.Types.ObjectId(req2._id), new mongoose.Types.ObjectId(req3._id)] }
  });
  await mongoose.connection.collection('employees').deleteOne({ code: 'TEST-LEADER-FIN' });
  await mongoose.disconnect();
  console.log('\nCleaned up all test approvals and test leader.');
  console.log('\n🎉 ALL 3 BUSINESS RULES VERIFIED & PASSED 100%!');
}

testRules().catch(err => {
  console.error('❌ TEST FAILED:', err);
  process.exit(1);
});
