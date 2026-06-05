import React from 'react';
import { 
  Bell, Moon, Sun, Settings, MapPin, CloudSun, CloudMoon, 
  Wind, Droplet, Leaf, Calendar as CalendarIcon, Lightbulb, 
  BarChart3, Wallet, CheckCircle2, CloudRain, Cloud 
} from 'lucide-react';

export default function HomeTab({
  themeMode,
  theme,
  customAvatar,
  userName,
  setShowSettingsModal,
  setShowNotifications,
  upcomingNotifications,
  handleThemeToggle,
  weather,
  forecast7Days,
  currentMonthTaskStats,
  currentMonthExpenseStats,
  formatCurrency
}) {
  const renderWeatherIcon = (type, className) => {
    switch(type) {
      case 'sun': return <Sun className={`${className} text-yellow-300`} />;
      case 'rain': return <CloudRain className={`${className} text-blue-300`} />;
      case 'cloud': return <Cloud className={`${className} text-white/90`} />;
      default: return themeMode === 'light' ? <CloudSun className={`${className} text-yellow-100`} /> : <Moon className={`${className} text-indigo-300`} />;
    }
  };

  return (
    <div className="p-3 space-y-4 pt-4">
      {/* Top Header */}
      <div className="flex justify-between items-center px-2 mb-3 mt-1">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-lg border border-white/10 shrink-0 overflow-hidden cursor-pointer hover:ring-2 hover:ring-green-400/50 transition-all" onClick={() => setShowSettingsModal(true)} title="Đổi ảnh đại diện">
               {customAvatar ? (
                 <img src={customAvatar} alt="Avatar" className="w-full h-full object-cover" />
               ) : (
                 <span className="text-[#fff] font-bold text-sm shadow-sm">{userName ? userName.charAt(0).toUpperCase() : '👤'}</span>
               )}
            </div>
           <div className="flex flex-col">
              <span className="text-[10px] text-white/60 font-medium mb-0.5 uppercase tracking-wider">Xin chào,</span>
              <span className="text-base font-bold text-white flex items-center gap-1.5 leading-none">
                {userName || 'Chủ vườn'} <span className="text-sm">👋</span>
              </span>
           </div>
        </div>
        <div className="flex gap-2.5">
           <button 
              onClick={() => setShowNotifications(true)}
              className={`relative w-9 h-9 rounded-full ${theme.cardGlass} flex items-center justify-center hover:bg-white/20 transition-colors`}
              title="Thông báo"
           >
              <Bell className="w-4 h-4 text-white" />
              {upcomingNotifications.length > 0 && (
                <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-slate-900"></span>
              )}
           </button>
           <button 
              onClick={handleThemeToggle}
              className={`w-9 h-9 rounded-full ${theme.cardGlass} flex items-center justify-center hover:bg-white/20 transition-colors`}
              title={themeMode === 'light' ? 'Chuyển sang chế độ tối' : 'Chuyển sang chế độ sáng'}
           >{themeMode === 'light' ? <Moon className="w-4 h-4 text-white" /> : <Sun className="w-4 h-4 text-yellow-300" />}</button>
           <button 
              onClick={() => setShowSettingsModal(true)}
              className={`w-9 h-9 rounded-full ${theme.cardGlass} flex items-center justify-center hover:bg-white/20 transition-colors`}
              title="Cài đặt"
           >
              <Settings className="w-4 h-4 text-white" />
           </button>
        </div>
      </div>

      {/* Cụm Thông tin: Thời tiết & Diện tích vườn */}
      <div className="grid grid-cols-2 gap-3 px-1">
        {/* Weather Widget Glass */}
        <div className={`rounded-[24px] p-4 flex flex-col justify-between transition-all ${theme.cardGlass}`}>
          <div className="flex items-center gap-1.5 text-[10px] text-white/80 mb-3">
            <MapPin className="w-3.5 h-3.5 text-red-400" />
            <span className="font-medium truncate">{weather.location}</span>
          </div>
          <div className="flex items-center justify-between my-1">
            <div className="flex flex-col">
              <div className="text-3xl font-light text-white tracking-tighter relative inline-block">
                 {weather.temp}<span className="text-lg absolute top-0 text-white/60">°</span>
              </div>
              <div className="text-[10px] font-medium text-white/80 mt-1 uppercase tracking-wider">{themeMode === 'light' ? 'Nắng nhẹ' : 'Quang mây'}</div>
            </div>
            {themeMode === 'light' ? <CloudSun className="w-10 h-10 drop-shadow-lg text-yellow-300" /> : <CloudMoon className="w-10 h-10 drop-shadow-lg text-indigo-300" />}
          </div>
          
          <div className={`mt-4 pt-3 border-t border-white/10 flex justify-between text-[10px] font-medium text-white/90`}>
              <div className="flex items-center gap-1.5">
                <Wind className="w-3.5 h-3.5 text-blue-300" /> <span>{weather.windSpeed} km/h</span>
              </div>
               <div className="flex items-center gap-1.5">
                <Droplet className="w-3.5 h-3.5 text-blue-300" /> <span>{weather.humidity}%</span>
              </div>
          </div>
        </div>

        {/* Header Stats Glass */}
        <div className={`rounded-[24px] p-4 relative overflow-hidden flex flex-col justify-between transition-colors ${theme.cardGlassActive}`}>
          <div className="absolute -bottom-6 -right-4 p-1 opacity-20">
            <Leaf className="w-24 h-24 text-white" />
          </div>
          <div className="relative z-10 mb-2">
            <div className="flex items-center gap-1.5 text-[10px] font-medium text-white/90 mb-2">
               <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                 <Leaf className="w-3 h-3 text-white" />
               </div>
               Tổng diện tích
            </div>
            <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70 tracking-tight">
              1,100 <span className="text-[10px] font-normal text-white/60">cây</span>
            </div>
          </div>
          
          <div className="flex gap-2 relative z-10 mt-auto pt-3 border-t border-white/10">
             <div className="flex-1 flex flex-col items-center">
                <span className="text-white/60 text-[9px] font-medium uppercase tracking-wider mb-0.5">Hàng</span>
                <span className="font-bold text-sm text-white">63</span>
             </div>
             <div className="w-[1px] bg-white/20 my-1"></div>
             <div className="flex-1 flex flex-col items-center">
                <span className="text-white/60 text-[9px] font-medium uppercase tracking-wider mb-0.5">Cây/hàng</span>
                <span className="font-bold text-sm text-white">14</span>
             </div>
          </div>
        </div>
      </div>

      {/* 7-Day Forecast Glass */}
      <div className="px-1">
        <div className={`rounded-[24px] p-4 overflow-hidden transition-all duration-300 ${theme.cardGlass}`}>
          <div className="flex items-center justify-between mb-4">
             <h3 className={`text-xs font-bold text-white flex items-center gap-1.5`}>
               <CalendarIcon className="w-4 h-4 text-blue-300" />
               Dự báo 7 ngày tới
             </h3>
          </div>
          <div className="flex justify-between items-center gap-1 w-full pb-1">
            {forecast7Days.map((day, idx) => (
              <div key={idx} className={`flex-1 flex flex-col items-center justify-center py-2.5 px-0.5 rounded-[14px] transition-colors ${idx === 0 ? 'bg-white/25 border border-white/30 shadow-sm' : theme.itemGlass} `}>
                <span className={`text-[9px] font-medium mb-1.5 ${idx === 0 ? 'text-white font-bold' : 'text-white/70'}`}>{day.day}</span>
                {renderWeatherIcon(day.icon, "w-4 h-4 mb-1.5 drop-shadow-sm")}
                <span className={`text-[10px] font-bold text-white`}>{day.temp}°</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lời khuyên nông vụ Glass */}
      <div className="px-1">
        <div className={`p-4 rounded-[24px] ${theme.cardGlass} border-l-[6px] border-l-yellow-400 relative overflow-hidden`}>
          <div className="absolute -right-4 -top-4 opacity-10">
             <Lightbulb className="w-20 h-20 text-yellow-400" />
          </div>
          <div className="flex gap-3 items-start relative z-10">
            <div className={`bg-gradient-to-br from-yellow-300 to-yellow-500 p-2.5 rounded-full shadow-[0_0_15px_rgba(253,224,71,0.4)] shrink-0 animate-pulse`}>
              <Lightbulb className="w-4 h-4 text-yellow-950" />
            </div>
            <div className={`text-[11px] leading-relaxed text-white/90`}>
              <span className={`font-bold text-yellow-400 block mb-1 text-xs uppercase tracking-wider`}>Gợi ý nông vụ</span>
              Dự báo có mưa rào nhẹ vào Thứ 4 và Thứ 5. Khuyến nghị <strong className="text-white">ngưng tưới nước</strong>. Tiến hành <strong className="text-white">bón phân NPK</strong> đón mưa để rễ hấp thụ tốt nhất.
            </div>
          </div>
        </div>
      </div>

      {/* Báo cáo nhanh (Swipeable Carousel) */}
      <div className="px-1 mt-2">
        <h3 className={`text-xs font-bold text-white flex items-center gap-1.5 mb-3`}>
          <BarChart3 className="w-4 h-4 text-blue-300" />
          Báo cáo tháng {currentMonthTaskStats.month}
        </h3>
        <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-none snap-x snap-mandatory">
          
          {/* Thẻ 1: Tiến độ công việc */}
          <div className={`min-w-[88%] snap-center shrink-0 ${theme.cardGlass} p-4 rounded-[24px] border border-white/5 flex flex-col justify-between`}>
            <div>
              <div className="flex justify-between items-end mb-3">
                <span className="text-[10px] font-medium text-white/60 uppercase tracking-wider">Tiến độ công việc</span>
                <div className="flex items-center gap-2">
                   <span className="text-[10px] text-white/50">{currentMonthTaskStats.completed}/{currentMonthTaskStats.total} xong</span>
                   <span className="text-xs font-bold text-green-400">{currentMonthTaskStats.rate}%</span>
                </div>
              </div>
              <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden shadow-inner mb-3">
                <div 
                  className="bg-gradient-to-r from-green-500 to-emerald-400 h-full rounded-full transition-all duration-1000 ease-out" 
                  style={{ width: `${currentMonthTaskStats.rate}%` }}
                ></div>
              </div>
            </div>
            {currentMonthTaskStats.totalLaborDays > 0 ? (
              <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
                 <div className="flex justify-between items-center">
                   <span className="text-[9px] text-white/60 uppercase tracking-wider font-medium flex items-center gap-1.5">👷‍♂️ Nhân công</span>
                   <span className="text-[10px] font-bold text-yellow-300 bg-yellow-400/10 px-2 py-0.5 rounded border border-yellow-400/20">{currentMonthTaskStats.totalLaborDays} công</span>
                 </div>
                 <div className="flex justify-between items-center bg-black/20 p-2 rounded-xl border border-white/5 mt-0.5">
                    <div className="flex flex-col">
                      <span className="text-[8px] text-white/50 uppercase tracking-wider mb-0.5">Đã trả</span>
                      <span className="text-[10px] font-bold text-green-400">{formatCurrency(currentMonthTaskStats.paidLaborCost)}</span>
                    </div>
                    <div className="w-[1px] h-6 bg-white/10"></div>
                    <div className="flex flex-col items-end">
                      <span className="text-[8px] text-white/50 uppercase tracking-wider mb-0.5">Còn nợ</span>
                      <span className="text-[10px] font-bold text-red-400">{formatCurrency(currentMonthTaskStats.unpaidLaborCost)}</span>
                    </div>
                 </div>
              </div>
            ) : (
              <div className="pt-2 text-[9px] text-white/40 italic text-center">Không phát sinh thuê mướn</div>
            )}
          </div>
          
          {/* Thẻ 2: Tổng Chi Phí Dự Tính */}
          <div className={`min-w-[88%] snap-center shrink-0 ${theme.cardGlass} p-4 rounded-[24px] border border-red-500/10 bg-gradient-to-br from-red-500/5 to-transparent flex flex-col justify-between`}>
             <div className="flex justify-between items-start mb-4">
               <span className="text-[10px] font-bold text-white/80 uppercase tracking-wider flex items-center gap-1.5">
                 <Wallet className="w-4 h-4 text-red-400" /> 
                 Tổng chi dự kiến
               </span>
               <span className="text-sm font-bold text-red-400 bg-red-500/10 px-2 py-1 rounded-lg border border-red-500/20">
                 {formatCurrency(currentMonthExpenseStats.total)}
               </span>
             </div>
             
             <div className="flex justify-between items-center bg-black/20 p-3 rounded-xl border border-white/5">
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] text-white/50 uppercase tracking-wider">Đã chi (Thực tế)</span>
                  <span className="text-[11px] font-bold text-white">{formatCurrency(currentMonthExpenseStats.actual)}</span>
                </div>
                <div className="w-[1px] h-8 bg-white/10"></div>
                <div className="flex flex-col gap-1 items-end">
                  <span className="text-[9px] text-white/50 uppercase tracking-wider">Sẽ chi (Nợ)</span>
                  <span className="text-[11px] font-bold text-yellow-300">{formatCurrency(currentMonthExpenseStats.pending)}</span>
                </div>
             </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}