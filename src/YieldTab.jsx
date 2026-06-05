import React from 'react';
import { Scale, BarChart3, Plus, Wallet, Package, Pencil, Trash2 } from 'lucide-react';

export default function YieldTab({
  theme,
  selectedYieldYear,
  setSelectedYieldYear,
  availableYieldYears,
  setShowYieldStatsModal,
  openAddYieldModal,
  openEditYieldModal,
  handleDeleteYield,
  totalYield,
  estimatedRevenue,
  formatCurrency,
  filteredYields,
  totalSoldKg,
  remainingYield
}) {
  return (
    <div className="p-3 h-full flex flex-col pt-4">
      <div className="flex justify-between items-center mb-5 flex-shrink-0 px-1">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          Sản Lượng
          <select 
            className="bg-white/10 text-white text-[9px] px-2 py-1 rounded-lg border border-white/20 outline-none focus:border-orange-400 appearance-none cursor-pointer"
            value={selectedYieldYear}
            onChange={(e) => setSelectedYieldYear(e.target.value)}
          >
            <option value="all" className="bg-slate-900 text-white">Tất cả vụ mùa</option>
            {availableYieldYears.map(year => (
              <option key={year} value={year} className="bg-slate-900 text-white">Vụ mùa {year}</option>
            ))}
          </select>
        </h2>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowYieldStatsModal(true)}
            className="bg-white/10 text-white rounded-full p-2 hover:bg-white/20 transition-colors shadow-lg"
            title="So sánh sản lượng"
          >
            <BarChart3 className="w-4 h-4" />
          </button>
          <button 
            onClick={openAddYieldModal}
            className="bg-white text-orange-900 rounded-full shadow-lg hover:bg-orange-50 transition-colors flex items-center gap-1.5 px-3 py-2"
          >
            <Plus className="w-3.5 h-3.5" /> <span className="text-[10px] font-bold">Thêm mẻ thu</span>
          </button>
        </div>
      </div>

      <div className={`${theme.cardGlassActive} border-orange-500/20 rounded-3xl p-5 mb-5 flex-shrink-0 relative overflow-hidden`}>
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-500/20 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-yellow-500/20 rounded-full blur-2xl"></div>
         
        <div className="relative z-10 flex flex-col gap-4">
          <div className="grid grid-cols-3 gap-2 text-center border-b border-white/10 pb-3">
            <div>
              <div className="text-white/70 font-medium mb-1 text-[9px] uppercase tracking-wider">Tổng Thu</div>
              <div className="text-lg font-bold tracking-tighter text-white">{totalYield.toLocaleString('vi-VN')} <span className="text-xs font-medium text-white/60">kg</span></div>
            </div>
            <div>
              <div className="text-white/70 font-medium mb-1 text-[9px] uppercase tracking-wider">Đã Bán</div>
              <div className="text-lg font-bold tracking-tighter text-yellow-300">{totalSoldKg.toLocaleString('vi-VN')} <span className="text-xs font-medium text-yellow-300/60">kg</span></div>
            </div>
            <div>
              <div className="text-white/70 font-medium mb-1 text-[9px] uppercase tracking-wider">Tồn Kho</div>
              <div className="text-lg font-bold tracking-tighter text-green-300">{remainingYield.toLocaleString('vi-VN')} <span className="text-xs font-medium text-green-300/60">kg</span></div>
            </div>
          </div>
          
          <div className="pt-1 flex justify-between items-end">
             <div>
               <div className="text-white/60 font-medium mb-1 text-[9px] uppercase tracking-wider flex items-center gap-1.5">
                 <Wallet className="w-3 h-3 text-yellow-400" /> Doanh thu ước tính
               </div>
               <div className="text-lg font-bold text-yellow-400 tracking-tight">{formatCurrency(estimatedRevenue)}</div>
             </div>
             <div className="text-[8px] text-white/40 text-right max-w-[110px] leading-tight italic">
               *Ước tính theo giá tại thời điểm nhập
             </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 pb-4">
        <h3 className={`font-semibold text-white/60 text-[9px] tracking-widest uppercase mb-3 px-1`}>Lịch sử thu hoạch</h3>
        <div className="space-y-2">
          {filteredYields.length > 0 ? (
            filteredYields.map(item => (
              <div key={item.id} className={`${theme.cardGlass} p-3 rounded-2xl flex items-center justify-between transition-colors hover:bg-white/20`}>
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2.5 rounded-xl flex-shrink-0 bg-orange-500/20 text-orange-300">
                    <Package className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className={`font-semibold text-white text-[11px] truncate mb-1`}>{item.note || `Thu hoạch ${item.type}`}</div>
                    <div className={`text-[9px] text-white/60`}>{item.date} • {item.type} ({item.price?.toLocaleString('vi-VN')}đ/kg)</div>
                  </div>
                </div>
                <div className="flex flex-col items-end flex-shrink-0">
                  <div className="flex flex-col items-end whitespace-nowrap ml-2 mb-1">
                    <span className="font-bold text-[11px] text-orange-300">+{item.weight.toLocaleString('vi-VN')} kg</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => openEditYieldModal(item)} className="text-white/40 hover:text-blue-400 transition-colors"><Pencil className="w-3 h-3" /></button>
                    <button onClick={() => handleDeleteYield(item.id)} className="text-white/40 hover:text-red-400 transition-colors"><Trash2 className="w-3 h-3" /></button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-white/40 text-[10px] bg-white/5 rounded-2xl border border-dashed border-white/10">
              Không có dữ liệu thu hoạch cho vụ mùa này.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}