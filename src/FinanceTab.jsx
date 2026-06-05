import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { BarChart3, Plus, Wallet, ArrowUpRight, ArrowDownRight, Search, X, TrendingUp, Pencil, Trash2 } from 'lucide-react';

export default function FinanceTab({
  theme,
  financeStats,
  displayMonthStr,
  formatCurrency,
  setShowFinanceStatsModal,
  openAddFinanceModal,
  selectedHistoryMonth,
  setSelectedHistoryMonth,
  availableHistoryMonths,
  selectedFinanceType,
  setSelectedFinanceType,
  financeSearchQuery,
  setFinanceSearchQuery,
  displayFinances,
  openEditFinanceModal,
  handleDeleteFinance
}) {
  const doughnutData = React.useMemo(() => ({
    labels: ['Tổng Thu', 'Tổng Chi'],
    datasets: [
      {
        data: [financeStats.thu, financeStats.chi],
        backgroundColor: ['rgba(74, 222, 128, 0.8)', 'rgba(248, 113, 113, 0.8)'],
        borderColor: ['rgba(74, 222, 128, 1)', 'rgba(248, 113, 113, 1)'],
        borderWidth: 0,
        hoverOffset: 4
      },
    ],
  }), [financeStats.thu, financeStats.chi]);

  const doughnutOptions = React.useMemo(() => ({
    cutout: '75%',
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: function(context) {
            return ` ${context.label}: ${formatCurrency(context.parsed)}`;
          }
        }
      }
    }
  }), [formatCurrency]);

  return (
    <div className="p-3 h-full flex flex-col pt-4">
      <div className="flex justify-between items-center mb-5 flex-shrink-0 px-1">
        <h2 className={`text-sm font-bold text-white`}>Sổ Thu Chi</h2>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowFinanceStatsModal(true)}
            className="bg-white/10 text-white rounded-full p-2 hover:bg-white/20 transition-colors shadow-lg"
            title="Thống kê"
          >
            <BarChart3 className="w-4 h-4" />
          </button>
          <button 
            onClick={openAddFinanceModal}
            className="bg-white text-green-900 rounded-full shadow-lg hover:bg-green-50 transition-colors flex items-center gap-1.5 px-3 py-2"
          >
            <Plus className="w-3.5 h-3.5" /> <span className="text-[10px] font-bold">Giao dịch</span>
          </button>
        </div>
      </div>

      <div className={`${theme.cardGlassActive} rounded-3xl p-5 mb-5 flex-shrink-0 relative overflow-hidden`}>
         <div className="absolute -top-10 -right-10 w-32 h-32 bg-green-400/20 rounded-full blur-2xl"></div>
         <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-400/20 rounded-full blur-2xl"></div>
         
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-4">
            <div>
              <div className="text-white/80 font-medium mb-1 text-[10px] uppercase tracking-wider">Số dư {displayMonthStr}</div>
              <div className="text-3xl font-light tracking-tighter text-white">{formatCurrency(financeStats.balance)}</div>
            </div>
            <div className="w-[72px] h-[72px] shrink-0 relative drop-shadow-xl">
               {(financeStats.thu > 0 || financeStats.chi > 0) ? (
                 <Doughnut data={doughnutData} options={doughnutOptions} />
               ) : (
                 <div className="w-full h-full rounded-full border-[4px] border-white/10 flex items-center justify-center">
                    <Wallet className="w-6 h-6 text-white/20" />
                 </div>
               )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/20">
            <div>
              <div className="text-white/60 text-[9px] flex items-center gap-1 mb-1 uppercase tracking-wider font-semibold"><ArrowUpRight className="w-3 h-3 text-green-400" /> Thu</div>
              <div className="font-semibold text-xs text-white">{formatCurrency(financeStats.thu)}</div>
            </div>
            <div>
              <div className="text-white/60 text-[9px] flex items-center gap-1 mb-1 uppercase tracking-wider font-semibold"><ArrowDownRight className="w-3 h-3 text-red-400" /> Chi</div>
              <div className="font-semibold text-xs text-white">{formatCurrency(financeStats.chi)}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 pb-4">
        <div className="flex justify-between items-center mb-3 px-1">
          <h3 className={`font-semibold text-white/60 text-[9px] tracking-widest uppercase`}>Lịch sử giao dịch</h3>
          <select 
            className="bg-white/10 text-white text-[9px] px-2 py-1 rounded-lg border border-white/20 outline-none focus:border-green-400 appearance-none cursor-pointer"
            value={selectedHistoryMonth}
            onChange={(e) => setSelectedHistoryMonth(e.target.value)}
          >
            <option value="all" className="bg-slate-900 text-white">Tất cả các tháng</option>
            {availableHistoryMonths.map(month => {
              const [year, m] = month.split('-');
              return <option key={month} value={month} className="bg-slate-900 text-white">Tháng {m}/{year}</option>;
            })}
          </select>
        </div>
        
        {/* Bộ lọc Thu / Chi */}
        <div className="flex bg-black/20 p-1 rounded-xl mb-3 border border-white/5 mx-1">
          <button 
            onClick={() => setSelectedFinanceType('all')} 
            className={`flex-1 text-[10px] py-1.5 rounded-lg transition-all ${selectedFinanceType === 'all' ? 'bg-white/20 text-white font-bold shadow-sm' : 'text-white/50 hover:text-white'}`}
          >Tất cả</button>
          <button 
            onClick={() => setSelectedFinanceType('thu')} 
            className={`flex-1 text-[10px] py-1.5 rounded-lg transition-all ${selectedFinanceType === 'thu' ? 'bg-green-500/30 text-green-300 font-bold shadow-sm' : 'text-white/50 hover:text-white'}`}
          >Chỉ Thu</button>
          <button 
            onClick={() => setSelectedFinanceType('chi')} 
            className={`flex-1 text-[10px] py-1.5 rounded-lg transition-all ${selectedFinanceType === 'chi' ? 'bg-red-500/30 text-red-300 font-bold shadow-sm' : 'text-white/50 hover:text-white'}`}
          >Chỉ Chi</button>
        </div>

        {/* Thanh tìm kiếm giao dịch */}
        <div className={`flex items-center p-2 rounded-xl mb-3 mx-1 ${theme.inputGlass} focus-within:ring-1 focus-within:ring-green-400/50 transition-all`}>
          <Search className="w-3.5 h-3.5 text-white/50 ml-1 mr-2 shrink-0" />
          <input 
            type="text" 
            placeholder="Tìm kiếm theo ghi chú..." 
            className="bg-transparent border-none outline-none text-[10px] text-white w-full placeholder:text-white/40 focus:ring-0"
            value={financeSearchQuery}
            onChange={(e) => setFinanceSearchQuery(e.target.value)}
          />
          {financeSearchQuery && (
            <button onClick={() => setFinanceSearchQuery('')} className="p-1 hover:bg-white/10 rounded-full transition-colors shrink-0">
              <X className="w-3 h-3 text-white/50 hover:text-white" />
            </button>
          )}
        </div>

        <div className="space-y-2">
          {displayFinances.length > 0 ? (
            displayFinances.map(item => (
              <div key={item.id} className={`${theme.cardGlass} p-3 rounded-2xl flex items-center justify-between transition-colors hover:bg-white/20`}>
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`p-2.5 rounded-xl flex-shrink-0 ${item.type === 'thu' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                    {item.type === 'thu' ? <TrendingUp className="w-4 h-4" /> : <Wallet className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0">
                    <div className={`font-semibold text-white text-[11px] truncate mb-1`}>{item.note}</div>
                    <div className={`text-[9px] text-white/60`}>{item.date} • {item.category}</div>
                  </div>
                </div>
                <div className="flex flex-col items-end flex-shrink-0">
                  <div className={`font-bold text-[11px] whitespace-nowrap ml-2 mb-1 ${item.type === 'thu' ? 'text-green-300' : 'text-red-300'}`}>
                    {item.type === 'thu' ? '+' : '-'}{formatCurrency(item.amount)}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => openEditFinanceModal(item)} className="text-white/40 hover:text-blue-400 transition-colors"><Pencil className="w-3 h-3" /></button>
                    <button onClick={() => handleDeleteFinance(item.id)} className="text-white/40 hover:text-red-400 transition-colors"><Trash2 className="w-3 h-3" /></button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-white/40 text-[10px] bg-white/5 rounded-2xl border border-dashed border-white/10">
              Không tìm thấy giao dịch nào.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}