import React, { useState, useMemo, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { 
  Home, 
  BookOpen, 
  CalendarCheck, 
  Wallet, 
  Plus, 
  ArrowUpRight, 
  ArrowDownRight, 
  Droplet, 
  Scissors, 
  Leaf, 
  CheckCircle2, 
  Circle,
  TrendingUp,
  TrendingDown,
  X,
  CloudSun,
  Wind,
  MapPin,
  CloudRain,
  Cloud,
  Lightbulb,
  Moon,
  CloudMoon,
  Sun,
  List,
  Calendar as CalendarIcon,
  Settings,
  Bell,
  Search,
  PlayCircle,
  Sparkles,
  Loader2,
  ExternalLink,
  BookOpenCheck,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Scale,
  Package,
  LogOut,
  Send,
  Pencil,
  Trash2
} from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { messaging } from './firebase';
import { getToken, onMessage } from 'firebase/messaging';
import toast, { Toaster } from 'react-hot-toast';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import { db } from "./firebase";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

// Dữ liệu dự báo thời tiết 7 ngày tại Chư Prông, Gia Lai
const FORECAST_7_DAYS = [
  { day: 'T.Hai', temp: 28, icon: 'sun' },
  { day: 'T.Ba', temp: 27, icon: 'cloud' },
  { day: 'T.Tư', temp: 25, icon: 'rain' },
  { day: 'T.Năm', temp: 24, icon: 'rain' },
  { day: 'T.Sáu', temp: 26, icon: 'cloud' },
  { day: 'T.Bảy', temp: 27, icon: 'sun' },
  { day: 'C.Nhật', temp: 28, icon: 'sun' },
];

const INITIAL_TASKS = [
  { 
    id: 1, 
    title: 'Tưới nước đợt 1', 
    category: 'Tưới nước', 
    date: '2026-06-03', 
    status: 'pending', 
    rows: 'Hàng 1-10',
    note: 'Tưới béc xòe kỹ quanh gốc, kiểm tra áp lực đường ống nước.',
    hasLabor: false,
    laborCount: 0,
    laborPrice: 0,
    laborTotal: 0
  },
  { 
    id: 2, 
    title: 'Bón phân NPK đón mưa', 
    category: 'Bón phân', 
    date: '2026-06-05', 
    status: 'pending', 
    rows: 'Hàng 11-40',
    note: 'Rải đều phân theo mép tán lá để đón đợt mưa lớn vào Thứ 5.',
    hasLabor: true,
    laborCount: 3,
    laborPrice: 220000,
    laborTotal: 660000
  },
  { 
    id: 3, 
    title: 'Làm cành tăm, chồi vượt', 
    category: 'Làm cành', 
    date: '2026-06-01', 
    status: 'completed', 
    rows: 'Hàng 41-63',
    note: 'Tập trung cắt tỉa cành khuất sáng, bẻ chồi vượt mọc thẳng từ thân chính.',
    hasLabor: true,
    laborCount: 5,
    laborPrice: 240000,
    laborTotal: 1200000
  }
];

const INITIAL_FINANCES = [
  { id: 101, type: 'chi', amount: 3500000, note: 'Mua phân bón NPK lân xanh', date: '2026-06-01', category: 'Vật tư' },
  { id: 102, type: 'chi', amount: 1200000, note: 'Tiền công: Làm cành tăm, chồi vượt', date: '2026-06-01', category: 'Nhân công' },
  { id: 103, type: 'chi', amount: 660000, note: 'Tiền công: Bón phân NPK đón mưa', date: '2026-06-05', category: 'Nhân công' },
  { id: 104, type: 'thu', amount: 15000000, note: 'Bán cà phê đợt cuối kho', date: '2026-05-28', category: 'Bán hàng' },
];

const INITIAL_YIELDS = [
  { id: 1, date: '2025-11-15', weight: 2500, type: 'Cà phê tươi', note: 'Thu hoạch đợt 1', price: 22000 },
  { id: 2, date: '2025-11-28', weight: 4200, type: 'Cà phê tươi', note: 'Thu hoạch đợt 2', price: 22500 },
  { id: 3, date: '2025-12-10', weight: 1800, type: 'Cà phê tươi', note: 'Thu hoạch vét', price: 21000 },
];

const INITIAL_ARTICLES = [
  {
    id: 1,
    title: 'Kỹ thuật bón phân NPK mùa mưa',
    category: 'Dinh dưỡng',
    readTime: '5 phút',
    type: 'article',
    excerpt: 'Mùa mưa là thời điểm vàng để cà phê hấp thụ dinh dưỡng. Tìm hiểu tỷ lệ NPK chuẩn để rễ phát triển mạnh, chống rụng trái non.',
    imageUrl: 'https://images.unsplash.com/photo-1518779907297-f04bf4479e0f?q=80&w=400&auto=format&fit=crop'
  },
  {
    id: 2,
    title: 'Nhận biết & Phòng trừ rệp sáp',
    category: 'Phòng bệnh',
    readTime: '3 phút',
    type: 'video',
    excerpt: 'Rệp sáp hại rễ và cành có thể làm chết cây non. Hướng dẫn sử dụng thuốc sinh học an toàn và hiệu quả.',
    imageUrl: 'https://images.unsplash.com/photo-1596144805727-9c0b1154c4ff?q=80&w=400&auto=format&fit=crop'
  }
];

const LIGHT_THEME = {
  appWrapper: 'bg-gradient-to-br from-slate-50 via-gray-100 to-zinc-200 light-mode-active', 
  cardGlass: 'bg-[rgba(255,255,255,0.6)] backdrop-blur-xl border border-[rgba(255,255,255,0.4)] shadow-[0_8px_30px_0_rgba(0,0,0,0.05)]',
  cardGlassActive: 'bg-gradient-to-br from-[rgba(255,255,255,0.8)] to-[rgba(255,255,255,0.4)] backdrop-blur-xl border border-[rgba(255,255,255,0.5)] shadow-[0_8px_30px_0_rgba(0,0,0,0.1)]',
  itemGlass: 'bg-[rgba(255,255,255,0.4)] backdrop-blur-md border border-[rgba(255,255,255,0.2)]',
  textMain: 'text-slate-800',
  textMuted: 'text-slate-600',
  textHighlight: 'text-green-600',
  bottomNavGlass: 'bg-[rgba(255,255,255,0.8)] backdrop-blur-xl border border-[rgba(255,255,255,0.5)] shadow-2xl rounded-full',
  navActive: 'bg-slate-800 text-[#fff] rounded-full',
  navInactive: 'text-slate-400 hover:text-slate-800',
  modalGlass: 'bg-slate-50/95 backdrop-blur-2xl border-t border-slate-200 text-slate-800',
  inputGlass: 'bg-black/5 border-black/10 text-slate-800 placeholder:text-slate-400 focus:border-green-500 focus:bg-[rgba(255,255,255,0.5)]',
};

const DARK_THEME = {
  appWrapper: 'bg-gradient-to-br from-[#0c1424] via-[#112233] to-[#0c1424]', 
  cardGlass: 'bg-slate-900/65 backdrop-blur-xl border border-white/10 shadow-[0_12px_40px_0_rgba(0,0,0,0.3)]',
  cardGlassActive: 'bg-gradient-to-br from-green-950/50 to-slate-900/60 backdrop-blur-xl border border-green-500/20 shadow-[0_12px_40px_0_rgba(0,0,0,0.4)]',
  itemGlass: 'bg-black/30 backdrop-blur-md border border-white/5',
  textMain: 'text-white',
  textMuted: 'text-white/60',
  textHighlight: 'text-green-300',
  bottomNavGlass: 'bg-slate-950/80 backdrop-blur-xl border border-white/10 shadow-2xl rounded-full',
  navActive: 'bg-white text-slate-950 rounded-full',
  navInactive: 'text-white/50 hover:text-white',
  modalGlass: 'bg-[#0f172a]/95 backdrop-blur-2xl border-t border-white/10 text-white',
  inputGlass: 'bg-black/40 border-white/10 text-white placeholder:text-white/30 focus:border-green-500 focus:bg-black/60',
};

// Các hàm helper tĩnh trợ giúp xử lý ngày tháng
const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();
const formatDate = (date) => {
  const d = new Date(date);
  const month = '' + (d.getMonth() + 1);
  const day = '' + d.getDate();
  const year = d.getFullYear();
  return [year, month.padStart(2, '0'), day.padStart(2, '0')].join('-');
};

// Helper mới để tính thời gian tương đối cho thông báo
const getNotificationRelativeTime = (dateString) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const parts = dateString.split('-').map(p => parseInt(p, 10));
    const taskDate = new Date(parts[0], parts[1] - 1, parts[2]);

    const diffTime = taskDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return `Quá hạn ${-diffDays} ngày`;
    if (diffDays === 0) return 'Hôm nay';
    if (diffDays === 1) return 'Ngày mai';
    return `Trong ${diffDays} ngày`;
};

function Dashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('home');
  
  const [tasks, setTasks] = useState([]);
  const [finances, setFinances] = useState([]);
  const [yields, setYields] = useState([]);
  const [articles, setArticles] = useState(INITIAL_ARTICLES);

  // States cho tìm kiếm AI Gemini
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [aiResponse, setAiResponse] = useState(null);
  const [aiError, setAiError] = useState('');
  const [suggestedQuestions] = useState([
    'Phòng trừ rệp sáp hại rễ cà phê mùa khô',
    'Kỹ thuật bón lân cho cà phê Gia Lai',
    'Cách tỉa cành chồi vượt cà phê vối Robusta'
  ]);

  // View state cho Công việc (Danh sách / Lịch)
  const [taskViewMode, setTaskViewMode] = useState('list');
  const [selectedDate, setSelectedDate] = useState(new Date('2026-06-03'));
  const [currentMonth, setCurrentMonth] = useState(new Date('2026-06-03'));

  // Modals state
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showFinanceModal, setShowFinanceModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showFinanceStatsModal, setShowFinanceStatsModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showYieldModal, setShowYieldModal] = useState(false);
  const [showYieldStatsModal, setShowYieldStatsModal] = useState(false);
  const [selectedStatsYear, setSelectedStatsYear] = useState(2026);
  const [selectedHistoryMonth, setSelectedHistoryMonth] = useState('all');
  const [selectedFinanceType, setSelectedFinanceType] = useState('all');
  const [financeSearchQuery, setFinanceSearchQuery] = useState('');
  const [selectedYieldYear, setSelectedYieldYear] = useState('all');

  // State cho Drag & Drop
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingFinanceId, setEditingFinanceId] = useState(null);

  // State cho Giao diện & Ảnh nền
  const [themeMode, setThemeMode] = useState(() => localStorage.getItem('farmAppTheme') || 'light');
  const [customBg, setCustomBg] = useState(() => localStorage.getItem('farmAppCustomBg') || null);
  const fileInputRef = useRef(null);
  const [customAvatar, setCustomAvatar] = useState(() => localStorage.getItem('farmAppCustomAvatar') || null);
  const avatarInputRef = useRef(null);
  const [userName, setUserName] = useState(() => localStorage.getItem('farmAppUserName') || 'Chủ vườn Ân');
  const [fcmToken, setFcmToken] = useState(() => localStorage.getItem('farmAppFcmToken') || '');

  // Form states
  const [newTask, setNewTask] = useState({ 
    title: '', 
    category: 'Tưới nước', 
    date: '', 
    rows: '', 
    note: '',
    hasLabor: false,
    laborCount: '',
    laborPrice: ''
  });
  const [newFinance, setNewFinance] = useState({ type: 'chi', amount: '', note: '', date: '', category: 'Vật tư' });
  const [newYield, setNewYield] = useState({ date: '', weight: '', type: 'Cà phê tươi', note: '', price: 22000 });

  const theme = themeMode === 'light' ? LIGHT_THEME : DARK_THEME;
  const backgroundUrl = customBg || (themeMode === 'light' 
    ? '' 
    : 'https://images.unsplash.com/photo-1596547609652-9fc5d8d428ce?q=80&w=600&auto=format&fit=crop');

  useEffect(() => {
    const qTasks = query(collection(db, "tasks"), orderBy("createdAt", "desc"));
    const unsubTasks = onSnapshot(qTasks, (snapshot) => {
      setTasks(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    });

    const qFinances = query(collection(db, "finances"), orderBy("createdAt", "desc"));
    const unsubFinances = onSnapshot(qFinances, (snapshot) => {
      setFinances(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    });

    const qYields = query(collection(db, "yields"), orderBy("createdAt", "desc"));
    const unsubYields = onSnapshot(qYields, (snapshot) => {
      setYields(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    });

    return () => {
      unsubTasks();
      unsubFinances();
      unsubYields();
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('farmAppTheme', themeMode);
  }, [themeMode]);

  useEffect(() => {
    if (customBg) {
      localStorage.setItem('farmAppCustomBg', customBg);
    } else {
      localStorage.removeItem('farmAppCustomBg');
    }
  }, [customBg]);

  useEffect(() => {
    if (customAvatar) {
      localStorage.setItem('farmAppCustomAvatar', customAvatar);
    } else {
      localStorage.removeItem('farmAppCustomAvatar');
    }
  }, [customAvatar]);

  useEffect(() => {
    // Tự động dọn dẹp các Service Worker cũ độc lập có thể gây hiển thị 2 thông báo
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (let reg of registrations) {
          if (reg.active && reg.active.scriptURL && reg.active.scriptURL.endsWith('/firebase-messaging-sw.js')) {
            reg.unregister();
          }
        }
      });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('farmAppUserName', userName);
  }, [userName]);

  const handleThemeToggle = () => {
    setThemeMode(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleBgChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setCustomBg(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setCustomAvatar(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const requestNotificationPermission = async () => {
    // Kiểm tra đặc thù cho iOS (Apple bắt buộc phải Add to Home Screen mới cho nhận Push)
    const isIos = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
    const isInStandaloneMode = ('standalone' in window.navigator) && (window.navigator.standalone);

    if (isIos && !isInStandaloneMode) {
      alert("📱 CHÚ Ý DÀNH CHO IPHONE/IPAD:\n\nApple yêu cầu bạn phải cài đặt ứng dụng trước khi bật thông báo.\n\nVui lòng nhấn nút [Chia sẻ] ở thanh dưới cùng của Safari -> Chọn [Thêm vào MH chính] (Add to Home Screen).\n\nSau đó hãy mở Nông Trại App từ màn hình chính điện thoại và thử lại nhé!");
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        // Lấy Service Worker mặc định của ứng dụng (đã được cấu hình gộp chung với Firebase)
        const swRegistration = await navigator.serviceWorker.ready;

        const token = await getToken(messaging, { 
          vapidKey: 'BOigFAMP3C4-1MfaO1lZB-OZiEx9LlyRQDPzj6_2O6VfMFqwA2282SDBQtHiFqXOWVQRGVsHqfpeRAzKt6kYMgY',
          serviceWorkerRegistration: swRegistration
        });

        if (token) {
          console.log('FCM Token của thiết bị:', token);
          setFcmToken(token);
          localStorage.setItem('farmAppFcmToken', token);
          try {
            await navigator.clipboard.writeText(token);
            toast.success('Đã bật thông báo! Token đã được copy vào bộ nhớ đệm.', { duration: 4000 });
          } catch (err) {
            toast.success('Đã bật thông báo đẩy thành công!');
          }
        }
      } else {
        toast.error('Bạn đã từ chối quyền gửi thông báo.');
      }
    } catch (error) {
      console.error('Lỗi khi xin quyền thông báo:', error);
      toast.error('Lỗi xin quyền: ' + error.message);
    }
  };

  // Hàm hiển thị Popup Toast thông báo đẹp mắt
  const showCustomToast = (payload) => {
    toast.custom(
      (t) => (
        <div
          className={`max-w-sm w-full bg-slate-900 shadow-2xl rounded-2xl pointer-events-auto flex border border-green-500/30 ${
            t.visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
          } transition-all duration-300 z-[9999]`}
        >
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                <div className="w-10 h-10 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center text-lg">🔔</div>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-[13px] font-bold text-green-400">{payload.notification?.title || 'Thông báo mới'}</p>
                <p className="mt-1 text-[11px] text-white/80 leading-relaxed">{payload.notification?.body || ''}</p>
              </div>
            </div>
          </div>
          <div className="flex border-l border-white/10">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="w-full h-full border border-transparent rounded-none rounded-r-2xl px-4 flex items-center justify-center text-[11px] font-bold text-white/40 hover:text-white hover:bg-white/5 transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      ),
      { duration: 5000, position: 'top-center' }
    );
  };

  useEffect(() => {
    if (!messaging) return;
    
    // 1. Lắng nghe chuẩn của Firebase (Hoạt động tốt trên PC/Android)
    const unsubscribe = onMessage(messaging, (payload) => showCustomToast(payload));

    // 2. Lắng nghe tin nhắn từ Service Worker (Bản vá lỗi không hiện Toast trên iOS)
    const handleServiceWorkerMessage = (event) => {
      if (event.data && event.data.type === 'FOREGROUND_PUSH') showCustomToast(event.data.payload);
    };
    if ('serviceWorker' in navigator) navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);

    return () => {
      unsubscribe();
      if ('serviceWorker' in navigator) navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
    };
  }, []);

  const handleLogout = () => {
    const confirmLogout = window.confirm("Bạn có chắc chắn muốn đăng xuất khỏi tài khoản?");
    if (confirmLogout) {
      // TODO: Thêm logic đăng xuất sau này tại đây
      // Ví dụ: localStorage.removeItem('authToken'); window.location.href = '/login';
      alert("Chức năng Đăng nhập/Đăng xuất sẽ được hoàn thiện trong phiên bản tới!");
    }
  };

  const [weather] = useState({
    temp: 28,
    humidity: 65,
    windSpeed: 12,
    location: 'Hoàng Ân, Chư Prông'
  });

  const closeTaskModal = () => {
    setShowTaskModal(false);
    setEditingTaskId(null);
    setNewTask({ title: '', category: 'Tưới nước', date: '', rows: '', note: '', hasLabor: false, laborCount: '', laborPrice: '' });
  };

  const openAddTaskModal = () => {
    setEditingTaskId(null);
    setNewTask({ title: '', category: 'Tưới nước', date: '', rows: '', note: '', hasLabor: false, laborCount: '', laborPrice: '' });
    setShowTaskModal(true);
  };

  const openEditTaskModal = (task) => {
    setEditingTaskId(task.id);
    setNewTask({
      title: task.title,
      category: task.category,
      date: task.date,
      rows: task.rows,
      note: task.note || '',
      hasLabor: task.hasLabor,
      laborCount: task.laborCount || '',
      laborPrice: task.laborPrice || ''
    });
    setShowTaskModal(true);
  };

  const handleDeleteTask = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa công việc này?")) {
      await deleteDoc(doc(db, "tasks", id));
      toast.success("Đã xóa công việc!");
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTask.title || !newTask.date) return;

    let laborTotalCost = 0;

    if (newTask.hasLabor && newTask.laborCount && newTask.laborPrice) {
      laborTotalCost = parseFloat(newTask.laborCount) * parseFloat(newTask.laborPrice);
    }
      
    if (editingTaskId) {
      await updateDoc(doc(db, "tasks", editingTaskId), {
        title: newTask.title,
        category: newTask.category,
        date: newTask.date,
        rows: newTask.rows || 'Toàn vườn',
        note: newTask.note,
        hasLabor: newTask.hasLabor,
        laborCount: newTask.hasLabor ? parseFloat(newTask.laborCount) : 0,
        laborPrice: newTask.hasLabor ? parseFloat(newTask.laborPrice) : 0,
        laborTotal: laborTotalCost
      });
      toast.success('Đã cập nhật công việc!');
    } else {
      if (newTask.hasLabor && newTask.laborCount && newTask.laborPrice) {
        const newExpense = {
          type: 'chi',
          amount: laborTotalCost,
          note: `Tiền công: ${newTask.title}`,
          date: newTask.date,
          category: 'Nhân công',
          createdAt: Date.now()
        };
        await addDoc(collection(db, "finances"), newExpense);
      }

      const createdTask = {
        title: newTask.title,
        category: newTask.category,
        date: newTask.date,
        rows: newTask.rows || 'Toàn vườn',
        status: 'pending',
        note: newTask.note,
        hasLabor: newTask.hasLabor,
        laborCount: newTask.hasLabor ? parseFloat(newTask.laborCount) : 0,
        laborPrice: newTask.hasLabor ? parseFloat(newTask.laborPrice) : 0,
        laborTotal: laborTotalCost,
        createdAt: Date.now()
      };
      await addDoc(collection(db, "tasks"), createdTask);
      toast.success('Đã thêm công việc mới!');
    }
    
    closeTaskModal();
  };

  const closeFinanceModal = () => {
    setShowFinanceModal(false);
    setEditingFinanceId(null);
    setNewFinance({ type: 'chi', amount: '', note: '', date: '', category: 'Vật tư' });
  };

  const openAddFinanceModal = () => {
    setEditingFinanceId(null);
    setNewFinance({ type: 'chi', amount: '', note: '', date: '', category: 'Vật tư' });
    setShowFinanceModal(true);
  };

  const openEditFinanceModal = (finance) => {
    setEditingFinanceId(finance.id);
    setNewFinance({
      type: finance.type,
      amount: finance.amount,
      note: finance.note,
      date: finance.date,
      category: finance.category
    });
    setShowFinanceModal(true);
  };

  const handleDeleteFinance = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa giao dịch này?")) {
      await deleteDoc(doc(db, "finances", id));
      toast.success("Đã xóa giao dịch!");
    }
  };

  const handleAddFinance = async (e) => {
    e.preventDefault();
    if (!newFinance.amount || !newFinance.date) return;
    
    try {
      if (editingFinanceId) {
        await updateDoc(doc(db, "finances", editingFinanceId), {
          ...newFinance, amount: parseFloat(newFinance.amount)
        });
        toast.success('Đã cập nhật giao dịch!');
      } else {
        await addDoc(collection(db, "finances"), {
          ...newFinance, amount: parseFloat(newFinance.amount), createdAt: Date.now()
        });
        toast.success('Đã lưu giao dịch!');
      }
      closeFinanceModal();
    } catch (error) {
      console.error("Lỗi khi lưu Giao dịch:", error);
      toast.error("Không thể lưu: " + error.message);
    }
  };

  const handleAddYield = async (e) => {
    e.preventDefault();
    if (!newYield.weight || !newYield.date || !newYield.price) return;
    try {
      await addDoc(collection(db, "yields"), {
        ...newYield, weight: parseFloat(newYield.weight), price: parseFloat(newYield.price), createdAt: Date.now()
      });
      setShowYieldModal(false);
      toast.success('Đã lưu mẻ thu hoạch!');
      setNewYield({ date: '', weight: '', type: 'Cà phê tươi', note: '', price: 22000 });
    } catch (error) {
      console.error("Lỗi khi lưu Mẻ thu hoạch:", error);
      toast.error("Không thể lưu: " + error.message);
    }
  };

  const toggleTaskStatus = async (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      const newStatus = task.status === 'pending' ? 'completed' : 'pending';
      await updateDoc(doc(db, "tasks", taskId), { status: newStatus });
      if (newStatus === 'completed') toast.success('Đã hoàn thành công việc!');
    }
  };

  // Các hàm xử lý Kéo Thả (Drag & Drop)
  const handleDragStart = (e, id) => {
    setDraggedTaskId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // Bắt buộc phải có để cho phép thả (drop)
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetId) => {
    e.preventDefault();
    if (!draggedTaskId || draggedTaskId === targetId) return;

    const originalTasks = [...tasks];
    const draggedIdx = originalTasks.findIndex(t => t.id === draggedTaskId);
    const targetIdx = originalTasks.findIndex(t => t.id === targetId);

    if (draggedIdx === -1 || targetIdx === -1) return;

    const [draggedItem] = originalTasks.splice(draggedIdx, 1);
    originalTasks.splice(targetIdx, 0, draggedItem);

    setTasks(originalTasks);
    setDraggedTaskId(null);
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
  };

  // Tự động lấy danh sách các năm có giao dịch
  const availableYears = useMemo(() => {
    const years = finances.map(f => new Date(f.date).getFullYear());
    const uniqueYears = Array.from(new Set([new Date().getFullYear(), ...years]));
    return uniqueYears.sort((a, b) => b - a); // Sắp xếp năm giảm dần
  }, [finances]);

  // Tự động lấy danh sách các tháng có giao dịch cho bộ lọc
  const availableHistoryMonths = useMemo(() => {
    const months = finances.map(f => f.date.substring(0, 7)); // Cắt lấy "YYYY-MM"
    const uniqueMonths = Array.from(new Set(months));
    return uniqueMonths.sort((a, b) => b.localeCompare(a)); // Sắp xếp giảm dần
  }, [finances]);

  // Lọc danh sách giao dịch theo tháng được chọn (Dùng để tính Tổng Số Dư)
  const monthFilteredFinances = useMemo(() => {
    if (selectedHistoryMonth === 'all') return finances;
    return finances.filter(f => f.date.startsWith(selectedHistoryMonth));
  }, [finances, selectedHistoryMonth]);

  // Lọc tiếp theo loại Thu/Chi và Từ khóa tìm kiếm để hiển thị chi tiết danh sách bên dưới
  const displayFinances = useMemo(() => {
    let filtered = monthFilteredFinances;
    if (selectedFinanceType !== 'all') {
      filtered = filtered.filter(f => f.type === selectedFinanceType);
    }
    if (financeSearchQuery.trim() !== '') {
      const lowerQuery = financeSearchQuery.toLowerCase();
      filtered = filtered.filter(f => f.note.toLowerCase().includes(lowerQuery));
    }
    return filtered;
  }, [monthFilteredFinances, selectedFinanceType, financeSearchQuery]);

  // Tạo nhãn hiển thị động cho tiêu đề Số dư
  const displayMonthStr = useMemo(() => {
    if (selectedHistoryMonth === 'all') return 'Tổng cộng';
    const [year, month] = selectedHistoryMonth.split('-');
    return `tháng ${month}/${year}`;
  }, [selectedHistoryMonth]);

  // Tính toán lại Số dư dựa trên danh sách giao dịch đã được lọc theo tháng
  const financeStats = useMemo(() => {
    let totalThu = 0;
    let totalChi = 0;
    monthFilteredFinances.forEach(f => {
      if (f.type === 'thu') totalThu += f.amount;
      else totalChi += f.amount;
    });
    return { thu: totalThu, chi: totalChi, balance: totalThu - totalChi };
  }, [monthFilteredFinances]);

  const monthlyStats = useMemo(() => {
    const stats = [];
    // Lấy 12 tháng của năm được chọn từ dropdown
    const year = selectedStatsYear;
    for (let i = 0; i < 12; i++) {
      const d = new Date(year, i, 1);
      const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      stats.push({ month: monthStr, label: `Tháng ${i + 1}`, thu: 0, chi: 0 });
    }

    finances.forEach(f => {
      const fMonth = f.date.substring(0, 7);
      const stat = stats.find(s => s.month === fMonth);
      if (stat) {
        if (f.type === 'thu') stat.thu += f.amount;
        else stat.chi += f.amount;
      }
    });
    return stats;
  }, [finances, selectedStatsYear]);

  const maxChartAmount = Math.max(...monthlyStats.flatMap(s => [s.thu, s.chi]), 1000000); // Tỷ lệ thấp nhất là 1 triệu

  // Tính toán tổng Thu, Chi và Lợi nhuận của cả năm
  const yearlyTotalThu = monthlyStats.reduce((sum, stat) => sum + stat.thu, 0);
  const yearlyTotalChi = monthlyStats.reduce((sum, stat) => sum + stat.chi, 0);
  const yearlyProfit = yearlyTotalThu - yearlyTotalChi;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const getCategoryIcon = (category) => {
    switch(category) {
      case 'Tưới nước': return <Droplet className="w-3.5 h-3.5 text-blue-300" />;
      case 'Bón phân': return <Leaf className="w-3.5 h-3.5 text-green-300" />;
      case 'Làm cành': return <Scissors className="w-3.5 h-3.5 text-orange-300" />;
      default: return <Circle className="w-3.5 h-3.5 text-white/50" />;
    }
  };

  const renderWeatherIcon = (type, className) => {
    switch(type) {
      case 'sun': return <Sun className={`${className} text-yellow-300`} />;
      case 'rain': return <CloudRain className={`${className} text-blue-300`} />;
      case 'cloud': return <Cloud className={`${className} text-white/90`} />;
      default: return themeMode === 'light' ? <CloudSun className={`${className} text-yellow-100`} /> : <Moon className={`${className} text-indigo-300`} />;
    }
  };

  // Memoize để tối ưu hiệu suất render thay vì tính toán lại mỗi lần chuyển tab/nhập form
  const pendingTasks = useMemo(() => tasks.filter(t => t.status === 'pending'), [tasks]);
  
  // Chỉ lấy các công việc đã hoàn thành trong vòng 30 ngày trở lại đây (cho dạng danh sách)
  const completedTasks = useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thresholdString = formatDate(thirtyDaysAgo);
    return tasks.filter(t => t.status === 'completed' && t.date >= thresholdString);
  }, [tasks]);
  
  // Tính toán thống kê và tỷ lệ hoàn thành công việc của tháng hiện tại
  const currentMonthTaskStats = useMemo(() => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonthNum = today.getMonth();

    const tasksThisMonth = tasks.filter(t => {
      if (!t.date) return false;
      const d = new Date(t.date);
      return d.getFullYear() === currentYear && d.getMonth() === currentMonthNum;
    });

    const total = tasksThisMonth.length;
    const completed = tasksThisMonth.filter(t => t.status === 'completed').length;
    const rate = total === 0 ? 0 : Math.round((completed / total) * 100);
    const totalLaborDays = tasksThisMonth.reduce((sum, t) => sum + (t.hasLabor ? (Number(t.laborCount) || 0) : 0), 0);
    const paidLaborCost = tasksThisMonth.reduce((sum, t) => sum + (t.hasLabor && t.status === 'completed' ? (Number(t.laborTotal) || 0) : 0), 0);
    const unpaidLaborCost = tasksThisMonth.reduce((sum, t) => sum + (t.hasLabor && t.status === 'pending' ? (Number(t.laborTotal) || 0) : 0), 0);

    return { total, completed, rate, month: currentMonthNum + 1, totalLaborDays, paidLaborCost, unpaidLaborCost };
  }, [tasks]);

  // Tính toán thống kê tổng chi phí dự kiến trong tháng hiện tại
  const currentMonthExpenseStats = useMemo(() => {
    const today = new Date();
    const currentMonthPrefix = formatDate(today).substring(0, 7);
    
    // Tổng TẤT CẢ các khoản chi dự kiến trong tháng này (bao gồm cả vật tư tự nhập và tiền công tự động sinh ra)
    const totalChi = finances
      .filter(f => f.type === 'chi' && f.date.startsWith(currentMonthPrefix))
      .reduce((sum, f) => sum + f.amount, 0);
      
    // Tổng tiền công còn nợ (của các công việc trong tháng chưa được tick hoàn thành)
    const pendingLaborCost = tasks
      .filter(t => t.hasLabor && t.status === 'pending' && t.date.startsWith(currentMonthPrefix))
      .reduce((sum, t) => sum + (Number(t.laborTotal) || 0), 0);
      
    // Tiền đã chi thực tế = Tổng các khoản - Phần tiền công chưa thanh toán
    const actualChi = Math.max(0, totalChi - pendingLaborCost);
      
    return { actual: actualChi, pending: pendingLaborCost, total: totalChi, month: today.getMonth() + 1 };
  }, [finances, tasks]);

  // Lọc và tính toán cho phần Sản Lượng
  const availableYieldYears = useMemo(() => {
    const years = yields.map(y => new Date(y.date).getFullYear());
    const uniqueYears = Array.from(new Set(years));
    return uniqueYears.sort((a, b) => b - a); // Giảm dần
  }, [yields]);

  const filteredYields = useMemo(() => {
    if (selectedYieldYear === 'all') return yields;
    return yields.filter(y => new Date(y.date).getFullYear().toString() === selectedYieldYear.toString());
  }, [yields, selectedYieldYear]);

  const totalYield = useMemo(() => filteredYields.reduce((sum, item) => sum + item.weight, 0), [filteredYields]);

  // Tự động tính Doanh thu ước tính dựa trên giá thị trường tham khảo của từng phân loại
  const estimatedRevenue = useMemo(() => {
    return filteredYields.reduce((sum, item) => {
      return sum + (item.weight * (item.price || 0));
    }, 0);
  }, [filteredYields]);

  // So sánh sản lượng các năm (Data cho biểu đồ cột)
  const yearlyYieldStats = useMemo(() => {
    const stats = {};
    yields.forEach(y => {
      const year = new Date(y.date).getFullYear();
      if (!stats[year]) stats[year] = 0;
      stats[year] += y.weight;
    });
    return Object.keys(stats).sort().map(year => ({
      year,
      weight: stats[year]
    }));
  }, [yields]);

  // Tính toán xu hướng (Tăng/Giảm) so với năm liền kề trước đó
  const yieldTrend = useMemo(() => {
    if (yearlyYieldStats.length < 2) return null; // Phải có ít nhất 2 năm để so sánh
    
    const current = yearlyYieldStats[yearlyYieldStats.length - 1]; // Năm mới nhất
    const previous = yearlyYieldStats[yearlyYieldStats.length - 2]; // Năm kế trước
    
    if (previous.weight === 0) return null; // Tránh lỗi chia cho 0
    
    const diff = current.weight - previous.weight;
    const percent = (Math.abs(diff) / previous.weight) * 100;
    
    return {
      isPositive: diff >= 0,
      percent: percent.toFixed(1),
      currentYear: current.year,
      prevYear: previous.year
    };
  }, [yearlyYieldStats]);

  const formattedSelectedDate = useMemo(() => formatDate(selectedDate), [selectedDate]);
  const selectedDateTasks = useMemo(() => tasks.filter(t => t.date === formattedSelectedDate), [tasks, formattedSelectedDate]);

  // Logic mới để tạo thông báo cho các công việc sắp tới
  const upcomingNotifications = useMemo(() => {
    const today = new Date();
    const twoDaysLater = new Date();
    twoDaysLater.setDate(today.getDate() + 2);

    const todayString = formatDate(today);
    const twoDaysLaterString = formatDate(twoDaysLater);

    return pendingTasks
      .filter(task => task.date >= todayString && task.date <= twoDaysLaterString)
      .sort((a, b) => new Date(a.date) - new Date(b.date)); // Sắp xếp cho ngày gần nhất lên đầu
  }, [pendingTasks]);

  // Tự động tính toán thứ trong tuần cho 7 ngày tới dựa vào ngày hiện tại
  const forecast7Days = useMemo(() => {
    const daysOfWeek = ['CN', 'T.2', 'T.3', 'T.4', 'T.5', 'T.6', 'T.7'];
    const today = new Date().getDay();
    return FORECAST_7_DAYS.map((forecast, idx) => ({
      ...forecast,
      day: idx === 0 ? 'H.nay' : daysOfWeek[(today + idx) % 7]
    }));
  }, []);

  const calendarDays = useMemo(() => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push({ day: null, isCurrentMonth: false });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const dateString = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const hasTask = tasks.some(t => t.date === dateString);
      days.push({ day: i, isCurrentMonth: true, date: dateString, hasTask });
    }

    return days;
  }, [currentMonth, tasks]);

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleAiSearch = async (queryToSearch) => {
    const query = queryToSearch || searchQuery;
    if (!query.trim()) return;

    setIsLoadingAi(true);
    setAiError('');
    setAiResponse(null);

    const systemPrompt = "Bạn là một chuyên gia khuyến nông và kỹ sư nông nghiệp chuyên về thâm canh cây cà phê vối (Robusta) tại Chư Prông, Gia Lai. Hãy trả lời câu hỏi của người nông dân một cách rất thực tế, ngắn gọn, dễ hiểu, sử dụng gạch đầu dòng rõ ràng. Cố gắng sử dụng thông tin khí hậu Tây Nguyên để hướng dẫn.";
    const userQuery = `Hãy hướng dẫn kỹ thuật chăm sóc cà phê hoặc giải đáp thắc mắc sau: "${query}". Cung cấp câu trả lời có cấu trúc rõ ràng với các bước hành động cụ thể.`;
    
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;

    const payload = {
      contents: [{ parts: [{ text: userQuery }] }],
      tools: [{ "google_search": {} }], 
      systemInstruction: {
        parts: [{ text: systemPrompt }]
      },
    };

    let attempts = 0;
    const maxAttempts = 3;
    let delay = 1000;

    const executeFetch = async () => {
      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          throw new Error(`Lỗi kết nối AI: ${response.status}`);
        }

        const result = await response.json();
        const candidate = result.candidates?.[0];

        if (candidate && candidate.content?.parts?.[0]?.text) {
          const text = candidate.content.parts[0].text;
          
          let sources = [];
          const groundingMetadata = candidate.groundingMetadata;
          if (groundingMetadata && groundingMetadata.groundingAttributions) {
            sources = groundingMetadata.groundingAttributions
              .map(attr => ({
                uri: attr.web?.uri,
                title: attr.web?.title,
              }))
              .filter(source => source.uri && source.title);
          }

          setAiResponse({ text, sources });
        } else {
          setAiError("Không thể giải mã dữ liệu từ chuyên gia AI. Thử lại sau.");
        }
      } catch (err) {
        if (attempts < maxAttempts - 1) {
          attempts++;
          await new Promise(res => setTimeout(res, delay));
          delay *= 2;
          return executeFetch();
        } else {
          setAiError("Lỗi kết nối đến Trợ lý AI. Vui lòng kiểm tra lại mạng.");
          console.error(err);
        }
      } finally {
        setIsLoadingAi(false);
      }
    };

    await executeFetch();
  };

  const renderFormattedAiText = (text) => {
    if (!text) return null;
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      const cleanLine = line.trim();
      if (!cleanLine) return <div key={idx} className="h-2" />;

      if (cleanLine.startsWith('###') || cleanLine.startsWith('##') || cleanLine.startsWith('#')) {
        const titleText = cleanLine.replace(/^[#\s]+/, '');
        return (
          <h4 key={idx} className="text-xs font-bold text-green-300 mt-3 mb-1.5 uppercase tracking-wider flex items-center gap-1">
            <BookOpenCheck className="w-3.5 h-3.5 text-green-400" />
            {titleText}
          </h4>
        );
      }

      if (cleanLine.startsWith('-') || cleanLine.startsWith('*')) {
        const bulletText = cleanLine.replace(/^[-*\s]+/, '');
        return (
          <div key={idx} className="flex items-start gap-2 my-1 text-[10px] text-white/90 leading-relaxed">
            <span className="text-green-400 mt-1 shrink-0">🌿</span>
            <span>{parseBoldText(bulletText)}</span>
          </div>
        );
      }

      return (
        <p key={idx} className="text-[10px] text-white/80 leading-relaxed my-1">
          {parseBoldText(cleanLine)}
        </p>
      );
    });
  };

  const parseBoldText = (text) => {
    const parts = text.split(/\*\*([\s\S]*?)\*\*/g);
    return parts.map((part, i) => i % 2 === 1 ? <strong key={i} className="text-white font-bold">{part}</strong> : part);
  };

  const renderSettingsModal = () => (
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className={`relative w-full max-w-[320px] ${theme.cardGlass} rounded-3xl p-5 shadow-2xl border border-white/20 flex flex-col`}>
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
            <Settings className="w-4 h-4 text-blue-300" />
            Cài đặt
          </h3>
          <button onClick={() => setShowSettingsModal(false)} className="bg-white/10 p-1.5 rounded-full hover:bg-white/20 transition-colors">
            <X className="w-4 h-4 text-white" />
          </button>
        </div>
        <div className="space-y-3">
            {/* Cài đặt Ảnh Nền */}
            <div className="space-y-2">
              <label className="block text-[10px] font-medium text-white/70 uppercase tracking-wider">Ảnh nền</label>
              <input type="file" ref={fileInputRef} onChange={handleBgChange} accept="image/*" className="hidden" />
              <div className="flex gap-2">
                <button onClick={() => fileInputRef.current.click()} className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold py-2.5 rounded-xl transition-colors text-[10px]">Tải lên</button>
                {customBg && <button onClick={() => { setCustomBg(null); toast.success('Đã xóa ảnh nền'); }} className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 font-bold py-2.5 rounded-xl transition-colors text-[10px]">Xóa nền</button>}
              </div>
            </div>
            
            {/* Cài đặt Ảnh Đại Diện */}
            <div className="space-y-2 pt-3 border-t border-white/10">
              <label className="block text-[10px] font-medium text-white/70 uppercase tracking-wider">Ảnh đại diện</label>
              <input type="file" ref={avatarInputRef} onChange={handleAvatarChange} accept="image/*" className="hidden" />
              <div className="flex gap-2">
                <button onClick={() => avatarInputRef.current.click()} className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold py-2.5 rounded-xl transition-colors text-[10px]">Tải lên</button>
                {customAvatar && <button onClick={() => { setCustomAvatar(null); toast.success('Đã xóa ảnh đại diện'); }} className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 font-bold py-2.5 rounded-xl transition-colors text-[10px]">Xóa ảnh</button>}
              </div>
            </div>
            
            {/* Cài đặt Tên hiển thị */}
            <div className="space-y-2 pt-3 border-t border-white/10">
              <label className="block text-[10px] font-medium text-white/70 uppercase tracking-wider">Tên hiển thị</label>
              <input 
                type="text" 
                placeholder="Nhập tên của bạn..."
                className={`w-full rounded-xl p-2.5 ${theme.inputGlass} outline-none text-[11px]`}
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
              />
            </div>

            {/* Nút Bật thông báo đẩy */}
            <div className="pt-4 mt-2 border-t border-white/10">
              {fcmToken ? (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-green-500 flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> Đã bật thông báo đẩy</span>
                    <button onClick={requestNotificationPermission} className="text-[9px] text-blue-400 hover:text-blue-300 underline">Cấp lại Token</button>
                  </div>
                  <div className="flex gap-2">
                    <input type="text" readOnly value={fcmToken} className={`flex-1 rounded-lg p-2 ${theme.inputGlass} outline-none text-[8px] text-white/50 truncate`} />
                    <button onClick={() => { navigator.clipboard.writeText(fcmToken); toast.success('Đã copy Token!'); }} className="bg-white/10 hover:bg-white/20 text-white rounded-lg px-3 text-[10px] font-bold transition-colors">Copy</button>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={requestNotificationPermission}
                  className="w-full flex items-center justify-center gap-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400 font-bold py-3 rounded-xl transition-colors text-[11px]"
                >
                  <Bell className="w-4 h-4" /> Bật thông báo đẩy (Push)
                </button>
              )}
            </div>
            
            {/* Nút Đăng xuất */}
            <div className="pt-4 mt-2 border-t border-white/10">
              <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 font-bold py-3 rounded-xl transition-colors text-[11px]"
              >
                <LogOut className="w-4 h-4" /> Đăng xuất
              </button>
            </div>
        </div>
      </div>
    </div>
  );

  const renderNotificationsPanel = () => (
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className={`relative w-full max-w-[320px] max-h-[80%] ${theme.cardGlass} rounded-3xl p-4 shadow-2xl border border-white/20 flex flex-col`}>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
            <Bell className="w-4 h-4 text-yellow-300" />
            Thông Báo
          </h3>
          <button onClick={() => setShowNotifications(false)} className="bg-white/10 p-1.5 rounded-full hover:bg-white/20 transition-colors">
            <X className="w-4 h-4 text-white" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {upcomingNotifications.length > 0 ? (
            upcomingNotifications.map(task => (
              <div 
                key={`notif-${task.id}`} 
                className="bg-white/5 p-2.5 rounded-xl flex items-start gap-2.5 cursor-pointer hover:bg-white/15"
                onClick={() => {
                  setActiveTab('tasks');
                  setShowNotifications(false);
                }}
              >
                <div className="bg-green-500/20 text-green-300 p-2 rounded-lg mt-0.5">
                  <CalendarCheck className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-white leading-snug">{task.title}</p>
                  <p className="text-[9px] text-yellow-300 font-semibold">{getNotificationRelativeTime(task.date)}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-white/50 text-[10px]">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-500" />
              Tuyệt vời! <br/> Không có công việc nào sắp tới hạn.
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderHome = () => (
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

  const renderKnowledge = () => (
    <div className="p-3 h-full flex flex-col pt-4">
      {/* Header */}
      <div className="flex items-center gap-1.5 mb-4 flex-shrink-0 px-1">
        <Sparkles className="w-4 h-4 text-yellow-300" />
        <h2 className="text-sm font-bold text-white">Chuyên Gia Cà Phê AI</h2>
      </div>

      {/* Main Content Area (Scrollable) */}
      <div className="flex-1 overflow-y-auto pr-1 pb-4 space-y-4">
        {/* Initial State */}
        {!isLoadingAi && !aiResponse && !aiError && (
          <div className="flex flex-col h-full animate-fadeIn justify-center">
            <div className={`${theme.cardGlass} p-5 rounded-3xl text-center mb-4 border border-green-500/20`}>
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg border-4 border-white/10 mb-3">
                <Sparkles className="w-8 h-8 text-[#fff]" />
              </div>
              <h3 className="font-bold text-white text-sm mb-1">Xin chào, tôi là Gemini!</h3>
              <p className="text-[10px] text-white/80 leading-relaxed">
                Hãy hỏi tôi bất cứ điều gì về kỹ thuật canh tác, sâu bệnh hại, hoặc giá cả thị trường cà phê Robusta tại Tây Nguyên.
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-[9px] text-white/50 font-bold uppercase tracking-wider block px-1">💡 Hoặc thử các gợi ý sau:</span>
              {suggestedQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSearchQuery(q);
                    handleAiSearch(q);
                  }}
                  className={`w-full text-left p-2.5 rounded-xl ${theme.itemGlass} hover:bg-white/20 text-[10px] text-white/90 font-medium transition-all flex items-center justify-between border border-white/10`}
                >
                  <span className="truncate">{q}</span>
                  <PlayCircle className="w-4 h-4 text-green-300 shrink-0 ml-2" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoadingAi && (
          <div className={`p-5 rounded-3xl ${theme.cardGlass} flex flex-col items-center justify-center gap-3 border border-green-400/20 shadow-xl min-h-[160px] animate-pulse`}>
            <div className="relative">
              <Loader2 className="w-8 h-8 text-green-400 animate-spin" />
              <Sparkles className="w-4 h-4 text-yellow-300 absolute -top-1 -right-1 animate-bounce" />
            </div>
            <div className="text-center">
              <p className="text-[10px] text-green-300 font-bold">Chuyên gia Gemini đang phân tích...</p>
              <p className="text-[8px] text-white/60 mt-0.5">Sử dụng Google Search để lấy kiến thức nông học thực tế Chư Prông</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {aiError && !isLoadingAi && (
          <div className={`p-4 rounded-3xl bg-red-950/40 border border-red-500/30 text-white/90 text-[10px] ${theme.cardGlass}`}>
            <p className="font-bold text-red-300 mb-1 flex items-center gap-1">⚠️ Lỗi kết nối trợ lý</p>
            <p>{aiError}</p>
            <button 
              onClick={() => handleAiSearch()}
              className="mt-3 bg-white/10 hover:bg-white/20 text-white rounded-lg p-1.5 px-3 text-[9px] font-bold"
            >
              Thử lại
            </button>
          </div>
        )}

        {/* AI Response */}
        {aiResponse && !isLoadingAi && (
          <div className={`p-4 rounded-3xl ${theme.cardGlass} border border-green-400/20 shadow-xl space-y-3 animate-fadeIn`}>
            <div className="flex justify-between items-center border-b border-white/10 pb-2">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-yellow-300" />
                <span className="text-[10px] font-bold text-green-300">Tư vấn của Gemini AI</span>
              </div>
              <button 
                onClick={() => {
                  setAiResponse(null);
                  setSearchQuery('');
                  setAiError('');
                }}
                className="text-white/50 hover:text-white bg-white/10 p-1.5 rounded-full transition-all flex items-center gap-1 text-[8px] px-2"
              >
                <Plus className="w-3 h-3 rotate-45" /> Mới
              </button>
            </div>

            <div className="space-y-1">
              {renderFormattedAiText(aiResponse.text)}
            </div>

            {aiResponse?.sources?.length > 0 && (
              <div className="border-t border-white/10 pt-3 mt-2">
                <span className="text-[8px] text-white/50 font-bold uppercase tracking-wider block mb-1.5">🔍 Nguồn kiểm chứng uy tín:</span>
                <div className="flex flex-wrap gap-1">
                  {aiResponse.sources.map((src, i) => (
                    <a 
                      key={i} 
                      href={src.uri} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 bg-white/5 hover:bg-white/15 border border-white/10 rounded-full px-2 py-1 text-[8px] text-green-300 transition-all font-medium truncate max-w-[150px]"
                    >
                      <ExternalLink className="w-2.5 h-2.5 text-white/50 shrink-0" />
                      <span className="truncate">{src.title}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Fixed Input Area */}
      <div className="mt-auto pt-3 flex-shrink-0">
        <div className={`flex items-center p-2 rounded-2xl ${theme.inputGlass} focus-within:ring-1 focus-within:ring-green-400/50 transition-all`}>
          <input 
            type="text" 
            placeholder="Hỏi chuyên gia AI..." 
            className="bg-transparent border-none outline-none text-[11px] text-white w-full placeholder:text-white/40 focus:ring-0 px-2"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAiSearch()}
          />
          <button 
            onClick={() => handleAiSearch()}
            disabled={isLoadingAi || !searchQuery?.trim()}
            className="bg-green-500 hover:bg-green-600 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-[#fff] rounded-xl p-2.5 text-[9px] font-bold transition-all flex items-center justify-center shrink-0 shadow-lg"
          >
            {isLoadingAi ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );

  const renderTasks = () => (
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

  const renderFinance = () => {
    const doughnutData = {
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
    };

    const doughnutOptions = {
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
    };

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
  };

  const renderYield = () => (
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
            onClick={() => setShowYieldModal(true)}
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
          <div className="flex justify-between items-center">
            <div>
              <div className="text-white/80 font-medium mb-1 text-[10px] uppercase tracking-wider">Tổng sản lượng</div>
              <div className="text-3xl font-light tracking-tighter text-white">{totalYield.toLocaleString('vi-VN')} <span className="text-sm font-medium text-white/60">kg</span></div>
            </div>
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center border border-white/20 shrink-0">
              <Scale className="w-6 h-6 text-orange-300" />
            </div>
          </div>
          
          <div className="pt-3 border-t border-white/10 flex justify-between items-end">
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
                <div className="flex flex-col items-end whitespace-nowrap ml-2 flex-shrink-0">
                  <span className="font-bold text-[11px] text-orange-300">+{item.weight.toLocaleString('vi-VN')} kg</span>
                  <span className="text-[9px] text-yellow-400/80 font-medium">{formatCurrency(item.weight * (item.price || 0))}</span>
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

  return (
    <div 
      className={`${themeMode === 'light' ? 'bg-gray-100' : 'bg-[#0f172a]'} min-h-[100dvh] font-sans flex items-center justify-center p-0 md:p-6 bg-cover bg-center transition-all duration-500`}
      style={backgroundUrl ? { backgroundImage: `url(${backgroundUrl})` } : {}}
    >
      {/* Mobile Frame Wrapper */}
      <div className={`w-full h-[100dvh] md:max-w-[430px] md:h-[800px] md:rounded-[40px] md:border-[8px] md:border-black/50 ${theme.appWrapper} backdrop-blur-3xl relative shadow-2xl flex flex-col overflow-hidden`}>
        
        {/* Dynamic App Shell Content Area */}
        <div className="flex-1 absolute inset-0 overflow-y-auto scrollbar-none pb-32" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
            {activeTab === 'home' && renderHome()}
            {activeTab === 'knowledge' && renderKnowledge()}
            {activeTab === 'tasks' && renderTasks()}
            {activeTab === 'finance' && renderFinance()}
            {activeTab === 'yield' && (
              <YieldTab 
                theme={theme}
                selectedYieldYear={selectedYieldYear}
                setSelectedYieldYear={setSelectedYieldYear}
                availableYieldYears={availableYieldYears}
                setShowYieldStatsModal={setShowYieldStatsModal}
                openAddYieldModal={openAddYieldModal}
                openEditYieldModal={openEditYieldModal}
                handleDeleteYield={handleDeleteYield}
                totalYield={totalYield}
                estimatedRevenue={estimatedRevenue}
                formatCurrency={formatCurrency}
                filteredYields={filteredYields}
              />
            )}
        </div>

        {/* Floating Bottom Navigation Bar (Glassmorphism Pill) */}
        <div className="absolute left-4 right-4 z-20" style={{ bottom: 'calc(1.5rem + env(safe-area-inset-bottom))' }}>
          <div className={`${theme.bottomNavGlass} flex justify-around items-center p-2`}>
            <button 
              onClick={() => setActiveTab('home')}
              className={`flex flex-col items-center p-2.5 px-4 transition-all ${activeTab === 'home' ? theme.navActive : theme.navInactive}`}
            >
              <Home className={`w-4 h-4 ${activeTab === 'home' ? 'fill-current' : ''}`} />
            </button>
            <button 
              onClick={() => setActiveTab('knowledge')}
              className={`flex flex-col items-center p-2.5 px-4 transition-all ${activeTab === 'knowledge' ? theme.navActive : theme.navInactive}`}
            >
              <BookOpen className={`w-4 h-4 ${activeTab === 'knowledge' ? 'fill-current' : ''}`} />
            </button>
            <button 
              onClick={() => setActiveTab('tasks')}
              className={`flex flex-col items-center p-2.5 px-4 transition-all ${activeTab === 'tasks' ? theme.navActive : theme.navInactive}`}
            >
              <CalendarCheck className={`w-4 h-4 ${activeTab === 'tasks' ? 'fill-current' : ''}`} />
            </button>
            <button 
              onClick={() => setActiveTab('yield')}
              className={`flex flex-col items-center p-2.5 px-4 transition-all ${activeTab === 'yield' ? theme.navActive : theme.navInactive}`}
            >
              <Scale className={`w-4 h-4 ${activeTab === 'yield' ? 'fill-current' : ''}`} />
            </button>
            <button 
              onClick={() => setActiveTab('finance')}
              className={`flex flex-col items-center p-2.5 px-4 transition-all ${activeTab === 'finance' ? theme.navActive : theme.navInactive}`}
            >
              <Wallet className={`w-4 h-4 ${activeTab === 'finance' ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* --- DIALOG MODALS --- */}
        
        {/* Settings Modal */}
        {showSettingsModal && renderSettingsModal()}

        {/* Notification Panel */}
        {showNotifications && renderNotificationsPanel()}

        {/* Add Task Modal */}
        {showTaskModal && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center animate-in fade-in duration-200">
            <div className={`${theme.modalGlass} w-full rounded-t-[32px] p-5 shadow-2xl max-h-[95%] overflow-y-auto`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-green-300">{editingTaskId ? 'Cập nhật công việc' : 'Thêm công việc mới'}</h3>
                <button onClick={closeTaskModal} className="bg-white/10 p-1.5 rounded-full hover:bg-white/20 transition-colors">
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
              <form onSubmit={handleAddTask} className="space-y-3">
                <div>
                  <label className="block text-[9px] font-medium text-white/70 mb-1 uppercase tracking-wider">Loại công việc</label>
                  <select 
                    className={`w-full rounded-xl p-2.5 ${theme.inputGlass} outline-none text-[11px] appearance-none`}
                    value={newTask.category}
                    onChange={(e) => setNewTask({...newTask, category: e.target.value})}
                  >
                    <option value="Tưới nước" className="bg-slate-900 text-white">Tưới nước</option>
                    <option value="Bón phân" className="bg-slate-900 text-white">Bón phân</option>
                    <option value="Làm cành" className="bg-slate-900 text-white">Làm cành</option>
                    <option value="Làm cỏ" className="bg-slate-900 text-white">Làm cỏ</option>
                    <option value="Phun thuốc" className="bg-slate-900 text-white">Phun thuốc</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] font-medium text-white/70 mb-1 uppercase tracking-wider">Tên công việc cụ thể</label>
                  <input 
                    type="text" required placeholder="VD: Bón phân Kali thúc trái cà"
                    className={`w-full rounded-xl p-2.5 ${theme.inputGlass} outline-none text-[11px]`}
                    value={newTask.title} onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-medium text-white/70 mb-1 uppercase tracking-wider">Ngày thực hiện</label>
                    <input 
                      type="date" required
                      className={`w-full rounded-xl p-2.5 ${theme.inputGlass} outline-none text-[11px] [color-scheme:dark]`}
                      value={newTask.date} onChange={(e) => setNewTask({...newTask, date: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-medium text-white/70 mb-1 uppercase tracking-wider">Khu vực vườn</label>
                    <input 
                      type="text" placeholder="VD: Hàng 15-20"
                      className={`w-full rounded-xl p-2.5 ${theme.inputGlass} outline-none text-[11px]`}
                      value={newTask.rows} onChange={(e) => setNewTask({...newTask, rows: e.target.value})}
                    />
                  </div>
                </div>

                {/* NOTE FIELD (Ghi chú mới) */}
                <div>
                  <label className="block text-[9px] font-medium text-white/70 mb-1 uppercase tracking-wider">Ghi chú (Note)</label>
                  <textarea 
                    placeholder="Nhập ghi chú chi tiết cho công việc (vd: kiểm tra béc bướm, pha tỉ lệ nấm đối kháng...)"
                    className={`w-full rounded-xl p-2.5 ${theme.inputGlass} outline-none text-[11px] h-14 resize-none`}
                    value={newTask.note} onChange={(e) => setNewTask({...newTask, note: e.target.value})}
                  />
                </div>

                {/* THUÊ NHÂN CÔNG TOGGLE SECTION */}
                <div className="bg-white/5 rounded-xl p-2.5 border border-white/5 space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-white">Thuê nhân công ngoài</span>
                      <span className="text-[8px] text-white/50">Tự động trừ trực tiếp vào Sổ Thu Chi</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setNewTask({...newTask, hasLabor: !newTask.hasLabor})}
                      className={`w-8 h-4 rounded-full transition-all relative ${newTask.hasLabor ? 'bg-green-500' : 'bg-white/20'}`}
                    >
                      <span className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${newTask.hasLabor ? 'right-0.5' : 'left-0.5'}`} />
                    </button>
                  </div>

                  {newTask.hasLabor && (
                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/5 animate-in slide-in-from-top-1 duration-200">
                      <div>
                        <label className="block text-[8px] font-medium text-white/60 mb-0.5 uppercase tracking-wider">Số lượng công</label>
                        <input 
                          type="number" min="1" placeholder="Số người" required
                          className={`w-full rounded-lg p-2 ${theme.inputGlass} outline-none text-[10px]`}
                          value={newTask.laborCount} onChange={(e) => setNewTask({...newTask, laborCount: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-[8px] font-medium text-white/60 mb-0.5 uppercase tracking-wider">Đơn giá / Công (đ)</label>
                        <input 
                          type="number" min="0" step="5000" placeholder="đ/ngày" required
                          className={`w-full rounded-lg p-2 ${theme.inputGlass} outline-none text-[10px]`}
                          value={newTask.laborPrice} onChange={(e) => setNewTask({...newTask, laborPrice: e.target.value})}
                        />
                      </div>
                      {newTask.laborCount && newTask.laborPrice && (
                        <div className="col-span-2 text-right text-[9px] text-green-300 font-bold pt-1.5 pr-1">
                          Tổng chi phí dự kiến: {formatCurrency(parseFloat(newTask.laborCount) * parseFloat(newTask.laborPrice))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <button type="submit" className="w-full bg-white text-green-900 font-bold py-3 rounded-xl mt-3 shadow-lg hover:bg-green-50 transition-colors text-[11px]">
                  {editingTaskId ? 'Cập nhật' : 'Lưu công việc'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Add Finance Modal */}
        {showFinanceModal && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end justify-center animate-in fade-in duration-200">
            <div className={`${theme.modalGlass} w-full rounded-t-[32px] p-5 shadow-2xl max-h-[90%] overflow-y-auto`}>
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-sm font-bold">{editingFinanceId ? 'Cập nhật giao dịch' : 'Giao dịch mới'}</h3>
                <button onClick={closeFinanceModal} className="bg-white/10 p-1.5 rounded-full hover:bg-white/20 transition-colors">
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
              <form onSubmit={handleAddFinance} className="space-y-4">
                <div className="flex gap-3 mb-2">
                  <label className={`flex-1 flex flex-col items-center justify-center gap-2 p-4 rounded-2xl cursor-pointer transition-all border ${newFinance.type === 'thu' ? 'border-green-400 bg-green-400/20 text-green-300' : 'border-transparent bg-black/20 text-white/60'}`}>
                    <input type="radio" name="type" className="hidden" checked={newFinance.type === 'thu'} onChange={() => setNewFinance({...newFinance, type: 'thu', category: 'Bán hàng'})} />
                    <TrendingUp className="w-5 h-5" />
                    <span className="font-semibold text-[10px] uppercase tracking-wider">Khoản Thu</span>
                  </label>
                  <label className={`flex-1 flex flex-col items-center justify-center gap-2 p-4 rounded-2xl cursor-pointer transition-all border ${newFinance.type === 'chi' ? 'border-red-400 bg-red-400/20 text-red-300' : 'border-transparent bg-black/20 text-white/60'}`}>
                    <input type="radio" name="type" className="hidden" checked={newFinance.type === 'chi'} onChange={() => setNewFinance({...newFinance, type: 'chi', category: 'Vật tư'})} />
                    <Wallet className="w-5 h-5" />
                    <span className="font-semibold text-[10px] uppercase tracking-wider">Khoản Chi</span>
                  </label>
                </div>
                
                <div>
                  <label className="block text-[10px] font-medium text-white/70 mb-1.5 uppercase tracking-wider">Số tiền (VNĐ)</label>
                  <input 
                    type="number" required placeholder="0"
                    className={`w-full rounded-xl p-3 text-sm font-bold ${theme.inputGlass} outline-none`}
                    value={newFinance.amount} onChange={(e) => setNewFinance({...newFinance, amount: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-[10px] font-medium text-white/70 mb-1.5 uppercase tracking-wider">Nội dung</label>
                  <input 
                    type="text" required placeholder="VD: Mua phân bón vi sinh"
                    className={`w-full rounded-xl p-3 ${theme.inputGlass} outline-none text-[11px]`}
                    value={newFinance.note} onChange={(e) => setNewFinance({...newFinance, note: e.target.value})}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-medium text-white/70 mb-1.5 uppercase tracking-wider">Ngày</label>
                    <input 
                      type="date" required
                      className={`w-full rounded-xl p-3 ${theme.inputGlass} outline-none text-[11px] [color-scheme:dark]`}
                      value={newFinance.date} onChange={(e) => setNewFinance({...newFinance, date: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-white/70 mb-1.5 uppercase tracking-wider">Danh mục</label>
                    <select 
                      className={`w-full rounded-xl p-3 ${theme.inputGlass} outline-none text-[11px] appearance-none`}
                      value={newFinance.category}
                      onChange={(e) => setNewFinance({...newFinance, category: e.target.value})}
                    >
                      {newFinance.type === 'chi' ? (
                        <>
                          <option className="bg-green-900 text-white">Vật tư</option>
                          <option className="bg-green-900 text-white">Nhân công</option>
                          <option className="bg-green-900 text-white">Xăng/Điện</option>
                          <option className="bg-green-900 text-white">Khác</option>
                        </>
                      ) : (
                        <>
                          <option className="bg-green-900 text-white">Bán hàng</option>
                          <option className="bg-green-900 text-white">Hỗ trợ</option>
                          <option className="bg-green-900 text-white">Khác</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>

                <button type="submit" className={`w-full font-bold py-3.5 rounded-xl mt-6 shadow-lg transition-colors text-[11px] ${newFinance.type === 'thu' ? 'bg-white text-green-900 hover:bg-green-50' : 'bg-red-500 text-[#fff] hover:bg-red-600'}`}>
                  {editingFinanceId ? 'Cập nhật' : 'Lưu giao dịch'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Finance Stats Modal */}
        {showFinanceStatsModal && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className={`relative w-full max-w-[360px] ${theme.cardGlass} rounded-[28px] p-5 shadow-2xl border border-white/20 flex flex-col`}>
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4 text-blue-300" /> {/* Changed from text-blue-300 to text-blue-300 */}
                  Thống kê
                  <select 
                    className="ml-1 bg-white/10 text-white text-xs px-2 py-1 rounded-lg border border-white/20 outline-none focus:border-green-400 appearance-none cursor-pointer"
                    value={selectedStatsYear}
                    onChange={(e) => setSelectedStatsYear(Number(e.target.value))}
                  >
                    {availableYears.map(year => (
                      <option key={year} value={year} className="bg-slate-900 text-white">Năm {year}</option>
                    ))}
                  </select>
                </h3>
                <button onClick={() => setShowFinanceStatsModal(false)} className="bg-white/10 p-1.5 rounded-full hover:bg-white/20 transition-colors">
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
              <div className="flex flex-col gap-3 w-full max-h-[300px] overflow-y-auto pr-2 scrollbar-none pt-1">
                 {monthlyStats.map(stat => (
                    <div key={stat.month} className="flex items-center gap-2">
                       <span className="w-10 text-[9px] font-medium text-white/60 text-right shrink-0">{stat.label}</span>
                       <div className="flex-1 flex flex-col gap-1 border-l border-white/10 pl-2 py-0.5">
                          {/* Thanh Thu */}
                          <div className="h-2 bg-gradient-to-r from-green-600 to-green-400 rounded-r-[3px] relative group transition-all duration-500" style={{ width: Math.max((stat.thu / maxChartAmount) * 100, 2) + '%' }}>
                             <div className="opacity-0 group-hover:opacity-100 absolute bottom-full mb-1 right-0 bg-black/90 text-white text-[8px] py-1 px-1.5 rounded whitespace-nowrap pointer-events-none transition-opacity z-50 shadow-lg">
                               +{formatCurrency(stat.thu)}
                             </div>
                          </div>
                          {/* Thanh Chi */}
                          <div className="h-2 bg-gradient-to-r from-red-600 to-red-400 rounded-r-[3px] relative group transition-all duration-500" style={{ width: Math.max((stat.chi / maxChartAmount) * 100, 2) + '%' }}>
                             <div className="opacity-0 group-hover:opacity-100 absolute bottom-full mb-1 right-0 bg-black/90 text-white text-[8px] py-1 px-1.5 rounded whitespace-nowrap pointer-events-none transition-opacity z-50 shadow-lg">
                               -{formatCurrency(stat.chi)}
                             </div>
                          </div>
                       </div>
                    </div>
                 ))}
              </div>
              
              {/* Bảng tổng kết năm */}
              <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-white/10">
                <div className="flex justify-between items-center bg-black/20 p-3 rounded-xl border border-white/5">
                  <span className="text-[11px] font-medium text-white/80 uppercase tracking-wider">Lợi nhuận năm</span>
                  <span className={`text-sm font-bold tracking-tight ${yearlyProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {yearlyProfit > 0 ? '+' : ''}{formatCurrency(yearlyProfit)}
                  </span>
                </div>
                <div className="flex justify-center gap-5">
                  <div className="flex items-center gap-1.5 text-[9px] text-white/70 font-medium uppercase tracking-wider">
                    <span className="w-2.5 h-2.5 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]"></span> Thu: {formatCurrency(yearlyTotalThu)}
                  </div>
                  <div className="flex items-center gap-1.5 text-[9px] text-white/70 font-medium uppercase tracking-wider">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.5)]"></span> Chi: {formatCurrency(yearlyTotalChi)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Yield Stats Modal */}
        {showYieldStatsModal && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className={`relative w-full max-w-[360px] ${theme.cardGlass} rounded-[28px] p-5 shadow-2xl border border-white/20 flex flex-col`}>
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4 text-orange-400" />
                  So sánh sản lượng các năm
                </h3>
                <button onClick={() => setShowYieldStatsModal(false)} className="bg-white/10 p-1.5 rounded-full hover:bg-white/20 transition-colors">
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
              
              <div className="w-full h-64 mt-2">
                <Bar 
                  data={{
                    labels: yearlyYieldStats.map(s => `Năm ${s.year}`),
                    datasets: [{
                      label: 'Sản lượng (kg)',
                      data: yearlyYieldStats.map(s => s.weight),
                      backgroundColor: 'rgba(249, 115, 22, 0.8)',
                      borderColor: 'rgba(249, 115, 22, 1)',
                      borderWidth: 1,
                      borderRadius: 4,
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: false },
                      tooltip: {
                        callbacks: {
                          label: function(context) {
                            return ` ${context.parsed.y.toLocaleString('vi-VN')} kg`;
                          }
                        }
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(255,255,255,0.1)' },
                        ticks: { color: 'rgba(255,255,255,0.6)', font: { size: 10 } }
                      },
                      x: {
                        grid: { display: false },
                        ticks: { color: 'rgba(255,255,255,0.6)', font: { size: 10 } }
                      }
                    }
                  }}
                />
              </div>
              
              {/* Hiển thị tỷ lệ tăng giảm */}
              {yieldTrend && (
                <div className={`mt-5 p-3 rounded-xl border flex items-center justify-between ${yieldTrend.isPositive ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                  <div className="flex flex-col">
                     <span className="text-[9px] text-white/60 uppercase tracking-wider mb-1">Năm {yieldTrend.currentYear} so với {yieldTrend.prevYear}</span>
                     <span className={`text-sm font-bold flex items-center gap-1.5 ${yieldTrend.isPositive ? 'text-green-400' : 'text-red-400'}`}>
                       {yieldTrend.isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                       {yieldTrend.isPositive ? 'Tăng' : 'Giảm'} {yieldTrend.percent}%
                     </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Add Yield Modal */}
        {showYieldModal && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end justify-center animate-in fade-in duration-200">
            <div className={`${theme.modalGlass} w-full rounded-t-[32px] p-5 shadow-2xl max-h-[90%] overflow-y-auto`}>
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-sm font-bold text-orange-300">{editingYieldId ? 'Cập nhật mẻ thu' : 'Thêm mẻ thu hoạch'}</h3>
                <button onClick={closeYieldModal} className="bg-white/10 p-1.5 rounded-full hover:bg-white/20 transition-colors">
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
              <form onSubmit={handleAddYield} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-medium text-white/70 mb-1.5 uppercase tracking-wider">Trọng lượng (kg)</label>
                    <input 
                      type="number" required placeholder="0" min="0" step="0.1"
                      className={`w-full rounded-xl p-3 text-sm font-bold ${theme.inputGlass} outline-none text-white`}
                      value={newYield.weight} onChange={(e) => setNewYield({...newYield, weight: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-white/70 mb-1.5 uppercase tracking-wider">Đơn giá (VNĐ/kg)</label>
                    <input 
                      type="number" required placeholder="0" min="0"
                      className={`w-full rounded-xl p-3 text-sm font-bold ${theme.inputGlass} outline-none text-yellow-300`}
                      value={newYield.price} onChange={(e) => setNewYield({...newYield, price: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-medium text-white/70 mb-1.5 uppercase tracking-wider">Ngày thu</label>
                    <input 
                      type="date" required
                      className={`w-full rounded-xl p-3 ${theme.inputGlass} outline-none text-[11px] [color-scheme:dark]`}
                      value={newYield.date} onChange={(e) => setNewYield({...newYield, date: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-white/70 mb-1.5 uppercase tracking-wider">Phân loại</label>
                    <select 
                      className={`w-full rounded-xl p-3 ${theme.inputGlass} outline-none text-[11px] appearance-none`}
                      value={newYield.type} 
                      onChange={(e) => {
                        const type = e.target.value;
                        let defaultPrice = 22000;
                        if (type === 'Cà phê nhân') defaultPrice = 85000;
                        if (type === 'Cà phê rang') defaultPrice = 250000;
                        setNewYield({...newYield, type, price: defaultPrice});
                      }}
                    >
                      <option className="bg-slate-900 text-white">Cà phê tươi</option>
                      <option className="bg-slate-900 text-white">Cà phê nhân</option>
                      <option className="bg-slate-900 text-white">Cà phê rang</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-white/70 mb-1.5 uppercase tracking-wider">Ghi chú (Tùy chọn)</label>
                  <input 
                    type="text" placeholder="VD: Thu hoạch đợt 1 khu đồi dốc"
                    className={`w-full rounded-xl p-3 ${theme.inputGlass} outline-none text-[11px]`}
                    value={newYield.note} onChange={(e) => setNewYield({...newYield, note: e.target.value})}
                  />
                </div>
                <button type="submit" className="w-full bg-orange-400 text-orange-950 font-bold py-3.5 rounded-xl mt-6 shadow-lg hover:bg-orange-300 transition-colors text-[11px]">
                  {editingYieldId ? 'Cập nhật sản lượng' : 'Lưu sản lượng'}
                </button>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const handleLogin = (e) => {
    e.preventDefault();
    // Logic kiểm tra tài khoản/mật khẩu giả lập
    if (username === 'admin' && password === '123456') {
      localStorage.setItem('isAuthenticated', 'true');
      navigate('/');
    } else {
      setError('Tên đăng nhập hoặc mật khẩu không đúng! (Gợi ý: admin / 123456)');
    }
  };

  return (
    <div className="bg-emerald-50 min-h-[100dvh] font-sans flex items-center justify-center p-0 md:p-6 bg-[url('https://images.unsplash.com/photo-1524350876685-27405933260c?q=80&w=600&auto=format&fit=crop')] bg-cover bg-center">
      <div className="w-full h-[100dvh] md:h-auto md:max-w-[430px] bg-white/80 backdrop-blur-xl md:rounded-[32px] p-8 shadow-2xl flex flex-col items-center justify-center border-0 md:border border-white/40 animate-fadeIn">
        <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center mb-5 shadow-lg border-4 border-white">
          <Leaf className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800 mb-1">Nông Trại App</h1>
        <p className="text-slate-500 text-[11px] uppercase tracking-wider mb-6 text-center font-semibold">Hệ thống quản lý thâm canh</p>
        
        {error && (
          <div className="w-full bg-red-100 text-red-600 p-3 rounded-xl text-[11px] font-medium mb-4 border border-red-200 text-center animate-fadeIn">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="w-full flex flex-col gap-4">
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required placeholder="Tên đăng nhập" className="w-full bg-black/5 p-4 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-green-400 transition-all text-slate-800" />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Mật khẩu" className="w-full bg-black/5 p-4 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-green-400 transition-all text-slate-800" />
          <button type="submit" className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg active:scale-95 mt-2">Đăng Nhập</button>
        </form>
      </div>
    </div>
  );
}

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default function CoffeeFarmApp() {
  return (
    <BrowserRouter>
      <Toaster 
        position="top-center" 
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#fff',
            fontSize: '11px',
            borderRadius: '100px',
            padding: '8px 16px',
            border: '1px solid rgba(255,255,255,0.1)'
          }
        }} 
      />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}