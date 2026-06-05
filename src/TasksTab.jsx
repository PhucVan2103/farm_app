import React from 'react';
import { Calendar as CalendarIcon, List, Plus, Pencil, Trash2, Circle, CheckCircle2, ChevronLeft, ChevronRight, Droplet, Leaf, Scissors } from 'lucide-react';

export default function TasksTab({
  theme,
  taskViewMode,
  setTaskViewMode,
  setShowTaskModal,
  pendingTasks,
  completedTasks,
  handleDragStart,
  handleDragOver,
  handleDrop,
  handleDragEnd,
  draggedTaskId,
  openEditTaskModal,
  handleDeleteTask,
  toggleTaskStatus,
  formatCurrency,
  currentMonth,
  prevMonth,
  nextMonth,
  calendarDays,
  selectedDate,
  setSelectedDate,
  formatDate,
  selectedDateTasks
}) {
  const getCategoryIcon = (category) => {
    switch(category) {
      case 'Tưới nước': return <Droplet className="w-3.5 h-3.5 text-blue-300" />;
      case 'Bón phân': return <Leaf className="w-3.5 h-3.5 text-green-300" />;
      case 'Làm cành': return <Scissors className="w-3.5 h-3.5 text-orange-300" />;
      default: return <Circle className="w-3.5 h-3.5 text-white/50" />;
    }
  };

  return (
    <div className="p-3 h-full flex flex-col pt-4">
      <div className="flex flex-col mb-4 flex-shrink-0 gap-4">
        <div className="flex justify-between items-center px-1">
          <h2 className="text-sm font-bold text-white">Công việc</h2>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setTaskViewMode(taskViewMode === 'list' ? 'calendar' : 'list')}
              className={`w-8 h-8 rounded-full ${theme.cardGlass} flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 text-white border border-white/20`}
              title={taskViewMode === 'list' ? 'Chuyển sang xem dạng Lịch' : 'Chuyển sang xem dạng Danh sách'}
            >
              {taskViewMode === 'list' ? (
                <CalendarIcon className="w-4 h-4 text-green-300" />
              ) : (
                <List className="w-4 h-4 text-green-300" />
              )}
            </button>

            <button 
              onClick={() => setShowTaskModal(true)}
              className="w-8 h-8 rounded-full bg-white text-green-900 flex items-center justify-center shadow-lg hover:bg-green-50 transition-all duration-300 hover:scale-105 active:scale-95"
            >
              <Plus className="w-4 h-4 font-bold" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 pb-4">
        {taskViewMode === 'list' ? (
          <div className="space-y-5">
            <div>
              <h3 className={`font-semibold text-white/60 text-[9px] tracking-widest uppercase mb-3 px-1`}>Đang thực hiện</h3>
              <div className="space-y-2">
                {pendingTasks.map(task => (
                  <div 
                    key={task.id} 
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, task.id)}
                    onDragEnd={handleDragEnd}
                    className={`${theme.cardGlass} p-3 rounded-2xl flex flex-col gap-1.5 transition-all hover:bg-white/20 border ${draggedTaskId === task.id ? 'opacity-40 border-green-500 border-dashed scale-[0.98]' : 'border-transparent'} cursor-grab active:cursor-grabbing`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`${theme.itemGlass} p-2.5 rounded-xl flex-shrink-0`}>
                        {getCategoryIcon(task.category)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className={`font-semibold text-white text-[11px] mb-1`}>{task.title}</h4>
                        <div className={`text-[9px] text-white/60 flex items-center gap-1.5`}>
                          <span>{task.rows}</span>
                          <span className="w-1 h-1 rounded-full bg-white/30"></span>
                          <span className={new Date(task.date) < new Date() ? 'text-red-300 font-semibold' : ''}>{task.date}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button onClick={(e) => { e.stopPropagation(); openEditTaskModal(task); }} className="p-1.5 text-white/40 hover:text-blue-400 transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                        <button onClick={(e) => { e.stopPropagation(); handleDeleteTask(task.id); }} className="p-1.5 text-white/40 hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                        <button onClick={(e) => { e.stopPropagation(); toggleTaskStatus(task.id); }} className="flex-shrink-0 p-1.5">
                          <Circle className={`w-4 h-4 text-white/30 hover:text-green-400 transition-colors`} />
                        </button>
                      </div>
                    </div>

                    {/* Note & Labor Area */}
                    {(task.note || task.hasLabor) && (
                      <div className="border-t border-white/5 pt-1.5 mt-0.5 flex flex-col gap-1">
                        {task.note && (
                          <p className="text-[9px] text-white/50 italic leading-tight pl-1">
                            ✏️ {task.note}
                          </p>
                        )}
                        {task.hasLabor && (
                          <div className="flex items-center justify-between text-[8px] bg-black/20 px-2 py-1 rounded-lg border border-white/5">
                            <span className="text-white/60">👥 Thuê: <strong className="text-white">{task.laborCount} công</strong></span>
                            <span className="text-red-300 font-bold">-{formatCurrency(task.laborTotal)} (Đã trừ vào Thu Chi)</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className={`font-semibold text-white/60 text-[9px] tracking-widest uppercase mb-3 px-1`}>Đã hoàn thành</h3>
              <div className="space-y-2">
                {completedTasks.map(task => (
                  <div key={task.id} className={`bg-white/5 backdrop-blur-sm border border-white/10 p-3 rounded-2xl flex flex-col gap-1.5 transition-colors opacity-70`}>
                    <div className="flex items-center gap-3">
                      <div className={`bg-white/5 p-2.5 rounded-xl flex-shrink-0`}>
                        {getCategoryIcon(task.category)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className={`font-medium text-white/70 text-[11px] line-through mb-1`}>{task.title}</h4>
                        <div className={`text-[9px] text-white/50`}>Hoàn thành: {task.date}</div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button onClick={(e) => { e.stopPropagation(); openEditTaskModal(task); }} className="p-1.5 text-white/40 hover:text-blue-400 transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                        <button onClick={(e) => { e.stopPropagation(); handleDeleteTask(task.id); }} className="p-1.5 text-white/40 hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                        <button onClick={(e) => { e.stopPropagation(); toggleTaskStatus(task.id); }} className="flex-shrink-0 p-1.5">
                          <CheckCircle2 className="w-4 h-4 text-green-400" />
                        </button>
                      </div>
                    </div>

                    {/* Completed Note & Labor */}
                    {(task.note || task.hasLabor) && (
                      <div className="border-t border-white/5 pt-1.5 mt-0.5 flex flex-col gap-1">
                        {task.note && (
                          <p className="text-[9px] text-white/40 italic leading-tight pl-1">
                            ✏️ {task.note}
                          </p>
                        )}
                        {task.hasLabor && (
                          <div className="flex items-center justify-between text-[8px] bg-black/10 px-2 py-1 rounded-lg">
                            <span className="text-white/40">👥 Thuê: {task.laborCount} công</span>
                            <span className="text-white/40 line-through">-{formatCurrency(task.laborTotal)}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="pb-4">
            <div className={`${theme.cardGlass} rounded-3xl p-4 mb-4`}>
              <div className="flex justify-between items-center mb-4">
                <button onClick={prevMonth} className={`p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors`}><ChevronLeft className="w-4 h-4" /></button>
                <div className={`font-bold text-xs text-white uppercase tracking-wider`}>
                  Tháng {currentMonth.getMonth() + 1}, {currentMonth.getFullYear()}
                </div>
                <button onClick={nextMonth} className={`p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors`}><ChevronRight className="w-4 h-4" /></button>
              </div>
              
              <div className="grid grid-cols-7 mb-2">
                {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map(d => (
                  <div key={d} className={`text-center text-[9px] font-semibold text-white/60 mb-1`}>{d}</div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((item, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => item.date && setSelectedDate(new Date(item.date))}
                    className={`
                      aspect-square flex flex-col items-center justify-center rounded-xl cursor-pointer relative transition-all
                      ${!item.isCurrentMonth ? 'invisible' : ''}
                      ${item.date === formatDate(selectedDate) 
                        ? 'bg-white text-green-900 shadow-md font-bold' 
                        : (item.date === formatDate(new Date('2026-06-03')) 
                            ? 'bg-green-500/40 text-[#fff] font-bold border border-green-400/50' 
                            : `hover:bg-white/20 text-white`)}
                    `}
                  >
                    <span className="text-[11px]">{item.day}</span>
                    {item.hasTask && (
                      <span className={`w-1 h-1 rounded-full mt-1 ${item.date === formatDate(selectedDate) ? 'bg-green-600' : 'bg-green-300'}`}></span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className={`font-semibold text-[10px] text-white/80 uppercase tracking-wider mb-3 px-1`}>
                Ngày {selectedDate.getDate()}/{selectedDate.getMonth() + 1}
              </h3>
              <div className="space-y-2">
                {selectedDateTasks.length > 0 ? (
                  selectedDateTasks.map(task => (
                    <div key={task.id} className={`${theme.cardGlass} p-3 rounded-2xl flex flex-col gap-1.5`}>
                       <div className="flex items-center gap-3">
                         <div className={`${theme.itemGlass} p-2 rounded-xl flex-shrink-0`}>
                            {getCategoryIcon(task.category)}
                         </div>
                         <div className="flex-1">
                            <h4 className={`font-medium text-[11px] text-white`}>{task.title}</h4>
                            <span className={`text-[9px] text-white/60`}>{task.rows}</span>
                         </div>
                         <div className="flex items-center gap-1 flex-shrink-0">
                            <button onClick={(e) => { e.stopPropagation(); openEditTaskModal(task); }} className="p-1 text-white/40 hover:text-blue-400 transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                            <button onClick={(e) => { e.stopPropagation(); handleDeleteTask(task.id); }} className="p-1 text-white/40 hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                         </div>
                       </div>
                       
                       {/* Note & Labor in Calendar List */}
                       {(task.note || task.hasLabor) && (
                         <div className="border-t border-white/5 pt-1.5 mt-0.5 flex flex-col gap-1">
                           {task.note && (
                             <p className="text-[9px] text-white/50 italic pl-1 leading-tight">
                               ✏️ {task.note}
                             </p>
                           )}
                           {task.hasLabor && (
                             <div className="flex items-center justify-between text-[8px] bg-black/20 px-2 py-0.5 rounded-lg">
                               <span className="text-white/60">👥 Thuê: {task.laborCount} công</span>
                               <span className="text-red-300 font-bold">-{formatCurrency(task.laborTotal)}</span>
                             </div>
                           )}
                         </div>
                       )}
                    </div>
                  ))
                ) : (
                  <div className={`text-center py-8 text-white/50 text-[10px] bg-white/5 rounded-2xl border border-dashed border-white/20`}>
                    Trống lịch. Không có công việc nào.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}