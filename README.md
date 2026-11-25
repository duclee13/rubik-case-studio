# Rubik Case Studio

Web app tạo hình ảnh trường hợp Rubik 3×3 (OLL, COLL, PLL, ZBLL) theo **2 phong cách song song**:
1. **Florian Rounded** — Bo góc kiểu speedcube hiện đại trên nền đen.
2. **Classic Perspective** — Viền cạnh hình thang chuẩn J Perm.

## Tính năng
- Mô phỏng 3×3 đầy đủ theo hệ màu chuẩn quốc tế (**U Vàng · D Trắng · F Xanh dương · R Đỏ · B Xanh lá · L Cam**).
- Nhập công thức (tự động chạy ngược để dựng case, hỗ trợ ngoặc `(...)2`, `r l u d f b M E S x y z`) hoặc click tô màu trực tiếp từng ô.
- Xuất ảnh **PNG 32-bit RGBA nền trong suốt** (512 / 1024 / 2048 px) và **SVG vector nền trong suốt**, tối ưu cho Windows và iOS (hỗ trợ Web Share API lưu thẳng vào Photos giữ nguyên kênh alpha).
- Zero-dependency static site — deploy trực tiếp lên Vercel.
