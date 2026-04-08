1) Component quản lý state: App.
2) App dùng useState để quản lý: studentId, results, isLoading, error (và studentInfo).
3) SearchForm chỉ giữ inputValue nội bộ để người dùng nhập mã SV.
4) Khi nhấn nút "Tra cứu", SearchForm gọi onSearch() -> App cập nhật studentId.
5) useEffect trong App được kích hoạt mỗi lần studentId (hoặc lượt tra cứu) thay đổi.
6) useEffect đặt trạng thái "Đang tải..." và mô phỏng gọi dữ liệu bằng setTimeout().
7) Sau đó fetch 2 file JSON trong public/: /sinhvien.json và /results.json.
8) Nếu tìm thấy, hiển thị thông tin SV + bảng điểm; nếu không, hiển thị thông báo lỗi.
