function ResultTable({ studentInfo, results }) {
  if (!studentInfo) return null;

  return (
    <div className="result-container">
      <h3>Thông tin sinh viên</h3>
      <div className="student-detail">
        <p><strong>Họ tên:</strong> {studentInfo.name}</p>
        <p><strong>Mã SV:</strong> {studentInfo.id}</p>
        <p><strong>Lớp:</strong> {studentInfo.className}</p>
      </div>

      <h3>Kết quả học tập</h3>
      <table className="result-table">
        <thead>
          <tr>
            <th>Học kỳ</th>
            <th>Môn học</th>
            <th>Điểm QT</th>
            <th>Điểm CK</th>
          </tr>
        </thead>
        <tbody>
          {results.length > 0 ? (
            results.map((item) => (
              <tr key={`${item.studentId}-${item.semester}-${item.subject}`}>
                <td>{item.semester}</td>
                <td>{item.subject}</td>
                <td>{item.qt}</td>
                <td>{item.ck}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" style={{ textAlign: 'center' }}>
                Chưa có dữ liệu điểm cho sinh viên này.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default ResultTable;