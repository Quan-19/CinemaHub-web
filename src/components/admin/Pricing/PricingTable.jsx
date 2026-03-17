import { Edit2, Trash2 } from "lucide-react";

export default function PricingTable({ data }) {
  return (
    <div className="bg-[#0d0d1a] rounded-xl border border-white/10 overflow-hidden">

      <table className="w-full text-sm">
        <thead className="text-gray-400 border-b border-white/10">
          <tr>
            <th className="p-3 text-left">Tên</th>
            <th>Loại</th>
            <th>Ghế</th>
            <th>Ngày</th>
            <th>Giờ</th>
            <th>Giá</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {data.map(item => (
            <tr key={item.id} className="border-b border-white/5 hover:bg-white/5">

              <td className="p-3">{item.name}</td>
              <td>{item.type}</td>
              <td>{item.seat}</td>
              <td>{item.day}</td>
              <td>{item.time}</td>

              <td className="text-yellow-400 font-bold">
                {item.final.toLocaleString()}₫
              </td>

              <td className="flex gap-2 justify-center">
                <Edit2 size={14} className="text-blue-400 cursor-pointer" />
                <Trash2 size={14} className="text-red-400 cursor-pointer" />
              </td>

            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}