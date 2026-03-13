import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload, faTrash, faPencil, faPlus, faCheck, faXmark } from '@fortawesome/free-solid-svg-icons';
import Navbar, { TripTabs } from '../../components/ui/Navbar.jsx';
import Modal, { modalStyles } from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import extendAgentBg from '../../assets/images/extendagentbg.jpg';
import { colors, spacing, radius, fontSize, fontFamily } from '../../styles/variables';
import { TripCard, ImageUploadCard, InputField, IconButton, AddButton, UploadButton, CardHeader, SectionTitle, ImagePreview, TextLink } from '../../components/ui/Card';
import { fetchPlannerTripDetail, updatePlannerTrip } from '../../services/tripService';

const DESTINATION_TYPES = [
  'Island Exploration',
  'Mount Hiking',
  'Camping Ground',
  'City Tour',
  'Wildlife Exploration',
  'Other'
];

const DEST_OPTIONS = DESTINATION_TYPES;

export default function TripEditPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const isEdit = location.pathname === '/trip/edit';
  const isParticipant = location.pathname === '/trip/participant';
  const search = (location && location.search) ? location.search : '';
  const params = new URLSearchParams(search);
  const qTripId = params.get('tripId');
  
  // State for loading trip data from database
  const [loading, setLoading] = useState(!!qTripId);
  const [error, setError] = useState(null);
  const [tripData, setTripData] = useState(null);
  
  // Determine defaultTrip from fetched data only
  let defaultTrip = tripData || {};
  
  const [tripName, setTripName] = useState(() => defaultTrip.name || '');
  const [tripPrice, setTripPrice] = useState(() => {
    const p = defaultTrip.price;
    if (p == null) return '';
    if (typeof p === 'number') return String(p).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return String(p);
  });
  const [tripProvince, setTripProvince] = useState(() => defaultTrip.location?.state || defaultTrip.provinsi || '');
  const [tripCountry, setTripCountry] = useState(() => defaultTrip.location?.country || defaultTrip.negara || '');
  const [tripSlot, setTripSlot] = useState(() => String(defaultTrip.slot || defaultTrip.slot_tersedia || ''));
  const [tripDay, setTripDay] = useState(() => defaultTrip.duration?.days ? String(defaultTrip.duration.days) : '');
  const [tripNight, setTripNight] = useState(() => defaultTrip.duration?.nights ? String(defaultTrip.duration.nights) : '');
  const [tripDestType, setTripDestType] = useState(() => defaultTrip.destinationType || defaultTrip.destination_type || 'Island Exploration');
  const [tripDescription, setTripDescription] = useState(() => defaultTrip.description || defaultTrip.deskripsi || '');
  const MAX_IMAGES = 4;
  const [imagePreviews, setImagePreviews] = useState(() => {
    const imgs = defaultTrip.images || [];
    const base = imgs.slice(0, MAX_IMAGES).map(img => typeof img === 'string' ? img : img?.url).filter(Boolean);
    while (base.length < MAX_IMAGES) base.push(null);
    return base;
  });
  const fileInputRef = useRef(null);
  const [schedules, setSchedules] = useState(() => []);
  const [pickupPoints, setPickupPoints] = useState(() => {
    const pts = defaultTrip.pickup_points || [];
    if (!pts.length) return [];
    return pts.map((p, i) => {
      if (typeof p === 'string') {
        return { id: i + 1, price: '', location: p, checked: i === 0 };
      }
      return { id: i + 1, price: p.price != null ? String(p.price) : '', location: p.location || '', checked: i === 0 };
    });
  });
  const [includes, setIncludes] = useState(() => {
    const inc = defaultTrip.includes || [];
    if (!inc.length) return [];
    return inc.map((name, i) => ({ id: i + 1, name, checked: true }));
  });
  const [tripDays, setTripDays] = useState(() => defaultTrip.duration?.days || (defaultTrip.rundowns ? Object.keys(defaultTrip.rundowns).length : 3));
  const [tripPlanner, setTripPlanner] = useState(() => {
    const r = defaultTrip.rundowns || {};
    const out = {};
    Object.entries(r).forEach(([day, arr]) => {
      out[day] = (arr || []).map((a, idx) => ({ id: idx + 1, ...a }));
    });
    return Object.keys(out).length ? out : { 1: [{ id: 1, time: '', duration: '', activity: '', location: '' }] };
  });
  const [openDay, setOpenDay] = useState(() => {
    const first = Object.keys(defaultTrip.rundowns || {})[0];
    return first ? Number(first) : 1;
  });
  const [showIncludeModal, setShowIncludeModal] = useState(false);
  const [newIncludeName, setNewIncludeName] = useState('');
  const [showPickupModal, setShowPickupModal] = useState(false);
  const [newPickupPrice, setNewPickupPrice] = useState('');
  const [newPickupLocation, setNewPickupLocation] = useState('');
  const [showEditScheduleModal, setShowEditScheduleModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [editScheduleStartDate, setEditScheduleStartDate] = useState('');
  const [editScheduleEndDate, setEditScheduleEndDate] = useState('');
  const [newScheduleStartDate, setNewScheduleStartDate] = useState('');
  const [newScheduleEndDate, setNewScheduleEndDate] = useState('');
  const [scheduleError, setScheduleError] = useState('');
  const [editScheduleError, setEditScheduleError] = useState('');
  const [showEditPickupModal, setShowEditPickupModal] = useState(false);
  const [editingPickup, setEditingPickup] = useState(null);
  const [pickupError, setPickupError] = useState('');
  const [editPickupError, setEditPickupError] = useState('');
  const [showEditIncludeModal, setShowEditIncludeModal] = useState(false);
  const [editingInclude, setEditingInclude] = useState(null);
  const [includeError, setIncludeError] = useState('');
  const [editIncludeError, setEditIncludeError] = useState('');
  const [showFieldModal, setShowFieldModal] = useState(false);
  const [fieldToEdit, setFieldToEdit] = useState('');
  const [fieldValue, setFieldValue] = useState('');
  const [fieldCustomValue, setFieldCustomValue] = useState('');
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [editLocationProvince, setEditLocationProvince] = useState('');
  const [editLocationCountry, setEditLocationCountry] = useState('');

  // Fetch trip data from database when tripId is provided
  useEffect(() => {
    const loadTripData = async () => {
      if (!qTripId) {
        setLoading(false);
        return;
      }
      
      try {
        console.log('[TripEditPage] Fetching trip with ID:', qTripId);
        const data = await fetchPlannerTripDetail(qTripId);
        console.log('[TripEditPage] Loaded trip data:', data);
        setTripData(data);
        
        // Update state with fetched data
        setTripName(data.name || 'Labuan Bajo');
        
        const p = data.price;
        if (p != null) {
          setTripPrice(typeof p === 'number' ? String(p).replace(/\B(?=(\d{3})+(?!\d))/g, '.') : String(p));
        }
        
        setTripProvince(data.location?.state || data.provinsi || 'East Nusa Tenggara, Indonesia');
        setTripCountry(data.location?.country || data.negara || 'Indonesia');
        {
          const slotVal = data.slot ?? data.slot_tersedia;
          setTripSlot(slotVal != null ? String(slotVal) : '');
        }
        {
          const daysVal = data.duration?.days ?? data.jumlah_hari;
          setTripDay(daysVal != null ? String(daysVal) : '');
        }
        {
          const nightsVal = data.duration?.nights ?? data.jumlah_malam;
          setTripNight(nightsVal != null ? String(nightsVal) : '');
        }
        setTripDestType(data.destinationType || data.destination_type || 'Island Exploration');
        setTripDescription(data.description || data.deskripsi || 'Labuan Bajo, located at the eastern end of Rinca Flores, Manggarai, is famous for its stunning beauty and unique wildlife.');
        
        // Update images
        if (data.images && data.images.length > 0) {
          const imgs = data.images.map(img => img.url);
          while (imgs.length < MAX_IMAGES) imgs.push(null);
          setImagePreviews(imgs.slice(0, MAX_IMAGES));
        }
        
        // Update pickup points
        if (data.pickup_points && data.pickup_points.length > 0) {
          const pts = data.pickup_points.map((p, i) => ({
            id: i + 1,
            price: p.price != null ? String(p.price) : '',
            location: p.location || '',
            checked: i === 0
          }));
          setPickupPoints(pts);
        }
        
        // Update includes
        if (data.includes && data.includes.length > 0) {
          const inc = data.includes.map((item, i) => ({
            id: i + 1,
            name: item, // item is already a string from backend
            checked: true
          }));
          setIncludes(inc);
        }
        
        // Update trip planner/rundowns
        if (data.rundowns && Object.keys(data.rundowns).length > 0) {
          const rundownsData = {};
          Object.entries(data.rundowns).forEach(([day, activities]) => {
            rundownsData[day] = activities.map((a, idx) => ({
              id: idx + 1,
              time: a.time || '',
              duration: a.duration || '',
              activity: a.activity || '',
              location: a.location || ''
            }));
          });
          setTripPlanner(rundownsData);
          setTripDays(Object.keys(data.rundowns).length || data.duration?.days || 3);
          setOpenDay(1);
        }
        
        // Update schedules
        if (data.startDate && data.endDate) {
          setSchedules([{ id: 1, text: `${data.startDate} - ${data.endDate}` }]);
        }
        
        setError(null);
      } catch (err) {
        console.error('[TripEditPage] Failed to load trip:', err);
        setError('Gagal memuat data trip. Silakan coba lagi.');
      } finally {
        setLoading(false);
      }
    };
    
    loadTripData();
  }, [qTripId]);

  const openFieldModal = (field, value) => {
    if (field === 'destType') {
      if (DEST_OPTIONS.includes(value)) {
        setFieldToEdit(field);
        setFieldValue(value ?? '');
        setFieldCustomValue('');
      } else {
        setFieldToEdit(field);
        setFieldValue('Other');
        setFieldCustomValue(value ?? '');
      }
    } else {
      setFieldToEdit(field);
      setFieldValue(value ?? '');
      setFieldCustomValue('');
    }
    setShowFieldModal(true);
  };

  const openLocationModal = () => {
    setEditLocationProvince(tripProvince || '');
    setEditLocationCountry(tripCountry || '');
    setShowLocationModal(true);
  };

  const saveFieldModal = () => {
    switch (fieldToEdit) {
      case 'name': setTripName(fieldValue); break;
      case 'price': {
        const v = (fieldValue ?? '').toString().trim();
        if (/^\d+$/.test(v)) {
          const formatted = v.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
          setTripPrice(formatted);
        } else {
          setTripPrice(fieldValue);
        }
        break;
      }
      case 'slot': setTripSlot(fieldValue); break;
      case 'province': setTripProvince(fieldValue); break;
      case 'country': setTripCountry(fieldValue); break;
      case 'destType':
        if (fieldValue === 'Other') {
          setTripDestType(fieldCustomValue || '');
        } else {
          setTripDestType(fieldValue);
        }
        break;
      case 'description': setTripDescription(fieldValue); break;
      default: break;
    }
    setShowFieldModal(false);
    setFieldToEdit('');
    setFieldValue('');
    setFieldCustomValue('');
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const imageFiles = files.filter(f => /image\/(png|jpeg|jpg)/i.test(f.type));
    if (!imageFiles.length) return;

    setImagePreviews(prev => {
      const newPrev = [...prev];
      let slotIndex = newPrev.findIndex(p => p === null);
      if (slotIndex === -1) return newPrev;
      for (let f of imageFiles) {
        if (slotIndex === -1) break;
        newPrev[slotIndex] = URL.createObjectURL(f);
        slotIndex = newPrev.findIndex((p, i) => p === null && i > slotIndex);
      }
      return newPrev;
    });

    e.target.value = '';
  };

  const handleDeleteImage = (index) => {
    setImagePreviews(prev => {
      const newPrev = [...prev];
      if (newPrev[index]) {
        if (newPrev[index].startsWith('blob:')) {
          URL.revokeObjectURL(newPrev[index]);
        }
        newPrev[index] = null;
      }
      return newPrev;
    });
  };

  const handleDeleteSchedule = (id) => {
    setSchedules(schedules.filter(s => s.id !== id));
  };

  const handleEditSchedule = (schedule) => {
    setEditingSchedule(schedule);
    setEditScheduleStartDate('');
    setEditScheduleEndDate('');
    setEditScheduleError('');
    setShowEditScheduleModal(true);
  };

  const handleSaveEditSchedule = () => {
    if (editingSchedule && (editScheduleStartDate || editScheduleEndDate)) {
      setEditScheduleError('');
      if (editScheduleStartDate && editScheduleEndDate) {
        const s = new Date(editScheduleStartDate);
        const e = new Date(editScheduleEndDate);
        if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime()) || e < s) {
          setEditScheduleError('End date tidak boleh lebih kecil dari start date.');
          return;
        }
      }

      const newText = `${editScheduleStartDate || 'TBD'} - ${editScheduleEndDate || 'TBD'}`;

      if (schedules.some(s => s.id !== editingSchedule.id && s.text === newText)) {
        setEditScheduleError('Input sudah ada');
        return;
      }

      setSchedules(schedules.map(s => 
        s.id === editingSchedule.id ? { ...s, text: newText } : s
      ));
      setShowEditScheduleModal(false);
      setEditingSchedule(null);
      setEditScheduleStartDate('');
      setEditScheduleEndDate('');
    } else if (editingSchedule) {
      setEditScheduleError('Start date atau End date harus diisi.');
    }
  };

  const handleAddSchedule = () => {
    setScheduleError('');
    if (!newScheduleStartDate && !newScheduleEndDate) {
      setScheduleError('Start date atau End date harus diisi.');
      return;
    }

    if (newScheduleStartDate && newScheduleEndDate) {
      const s = new Date(newScheduleStartDate);
      const e = new Date(newScheduleEndDate);
      if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime()) || e < s) {
        setScheduleError('End date tidak boleh lebih kecil dari start date.');
        return;
      }
    }

    const newId = schedules.length > 0 ? Math.max(...schedules.map(s => s.id)) + 1 : 1;
    const newText = `${newScheduleStartDate || 'TBD'} - ${newScheduleEndDate || 'TBD'}`;

    if (schedules.some(s => s.text === newText)) {
      setScheduleError('Input sudah ada');
      return;
    }

    const newSchedule = { id: newId, text: newText };
    setSchedules([newSchedule, ...schedules]);
    setNewScheduleStartDate('');
    setNewScheduleEndDate('');
    setScheduleError('');
  };

  const handleAddInclude = () => {
    setIncludeError('');
    if (!newIncludeName.trim()) {
      setIncludeError('Nama harus diisi.');
      return;
    }
    if (includes.some(i => i.name.toLowerCase() === newIncludeName.trim().toLowerCase())) {
      setIncludeError('Input sudah ada');
      return;
    }
    const newId = includes.length > 0 ? Math.max(...includes.map(i => i.id)) + 1 : 1;
    setIncludes([
      ...includes,
      { id: newId, name: newIncludeName.trim(), checked: false }
    ]);
    setNewIncludeName('');
    setShowIncludeModal(false);
    setIncludeError('');
  };

  const handleDeleteInclude = (id) => {
    setIncludes(includes.filter(i => i.id !== id));
  };

  const handleEditInclude = (item) => {
    setEditingInclude(item);
    setEditIncludeError('');
    setShowEditIncludeModal(true);
  };

  const handleSaveEditInclude = () => {
    setEditIncludeError('');
    if (editingInclude) {
      if (!editingInclude.name.trim()) {
        setEditIncludeError('Nama harus diisi.');
        return;
      }
      if (includes.some(i => i.id !== editingInclude.id && i.name.toLowerCase() === editingInclude.name.trim().toLowerCase())) {
        setEditIncludeError('Input sudah ada');
        return;
      }
      setIncludes(includes.map(i => 
        i.id === editingInclude.id ? { ...editingInclude, name: editingInclude.name.trim() } : i
      ));
      setShowEditIncludeModal(false);
      setEditingInclude(null);
      setEditIncludeError('');
    }
  };

  const handleAddPickupPoint = () => {
    setPickupError('');
    if (!(newPickupPrice.trim() && newPickupLocation.trim())) {
      setPickupError('Harga dan Lokasi harus diisi.');
      return;
    }
    if (!/^\d+$/.test(newPickupPrice.trim())) {
      setPickupError('Harga harus berupa integer (hanya angka).');
      return;
    }
    const newId = Math.max(...pickupPoints.map(p => p.id)) + 1;
    const formatted = formatRupiah(newPickupPrice.trim());
    setPickupPoints([
      ...pickupPoints,
      { id: newId, price: formatted, location: newPickupLocation.trim(), checked: false }
    ]);
    setNewPickupPrice('');
    setNewPickupLocation('');
    setShowPickupModal(false);
    setPickupError('');
  };

  const handleDeletePickupPoint = (id) => {
    setPickupPoints(pickupPoints.filter(p => p.id !== id));
  };

  const handleEditPickupPoint = (point) => {
    setEditingPickup(point);
    setEditPickupError('');
    setShowEditPickupModal(true);
  };

  const handleSaveEditPickupPoint = () => {
    if (editingPickup && editingPickup.price.trim() && editingPickup.location.trim()) {
      setEditPickupError('');
      if (!/^\d+$/.test(editingPickup.price.trim())) {
        setEditPickupError('Harga harus berupa integer (hanya angka).');
        return;
      }
      const formatted = formatRupiah(editingPickup.price.trim());
      setPickupPoints(pickupPoints.map(p => 
        p.id === editingPickup.id ? { ...editingPickup, price: formatted, location: editingPickup.location.trim() } : p
      ));
      setShowEditPickupModal(false);
      setEditingPickup(null);
      setEditPickupError('');
    } else if (editingPickup) {
      setEditPickupError('Harga dan Lokasi harus diisi.');
    }
  };

  const handleDayInputChange = (value) => {
    const days = parseInt(value) || 1;
    setTripDays(days);
    
    const newPlanner = { ...tripPlanner };
    for (let i = 1; i <= days; i++) {
      if (!newPlanner[i]) {
        newPlanner[i] = [{ id: 1, time: '', duration: '', activity: '', location: '' }];
      }
    }
    setTripPlanner(newPlanner);
  };

  const handleAddActivity = (day) => {
    const dayActivities = tripPlanner[day] || [];
    const newId = dayActivities.length > 0 ? Math.max(...dayActivities.map(a => a.id)) + 1 : 1;
    setTripPlanner({
      ...tripPlanner,
      [day]: [...dayActivities, { id: newId, time: '', duration: '', activity: '', location: '' }]
    });
  };

  const handleDeleteActivity = (day, activityId) => {
    setTripPlanner({
      ...tripPlanner,
      [day]: tripPlanner[day].filter(a => a.id !== activityId)
    });
  };

  const handleActivityChange = (day, activityId, field, value) => {
    setTripPlanner({
      ...tripPlanner,
      [day]: tripPlanner[day].map(a =>
        a.id === activityId ? { ...a, [field]: value } : a
      )
    });
  };

  const monthNames = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

  const formatISODate = (iso) => {
    if (!iso) return iso;
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    const day = d.getDate();
    const month = monthNames[d.getMonth()];
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const formatDateRange = (text) => {
    if (!text || typeof text !== 'string') return text;
    const m = text.match(/(\d{4}-\d{2}-\d{2})\s*-\s*(\d{4}-\d{2}-\d{2})/);
    if (m) return `${formatISODate(m[1])} - ${formatISODate(m[2])}`;
    return text;
  };

  const formatRupiah = (val) => {
    if (val == null) return '';
    const s = String(val).replace(/\D/g, '');
    if (!s) return '';
    return s.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const handleSaveTrip = async () => {
    if (!qTripId) {
      console.error('[TripEditPage] No tripId available for saving');
      alert('Cannot save: Trip ID is missing');
      return;
    }

    try {
      console.log('[TripEditPage] Saving trip:', qTripId);

      // Parse price: remove dots and convert to number
      const priceNumber = parseFloat(String(tripPrice).replace(/\./g, ''));

      // Parse slot
      const slotNumber = parseInt(tripSlot, 10);

      // Parse days and nights
      const daysNumber = parseInt(tripDay, 10);
      const nightsNumber = parseInt(tripNight, 10);

      // Parse first schedule into start/end date when present
      const firstSchedule = schedules[0]?.text || '';
      const dateMatch = firstSchedule.match(/(\d{4}-\d{2}-\d{2})\s*-\s*(\d{4}-\d{2}-\d{2})/);
      const durasi_mulai = dateMatch?.[1] || tripData?.startDate || null;
      const durasi_selesai = dateMatch?.[2] || tripData?.endDate || null;

      // Keep only selected list items to mirror create flow
      const selectedIncludes = includes
        .filter((inc) => inc.checked)
        .map((inc) => inc.name);

      const selectedPickupPoints = pickupPoints
        .filter((pnt) => pnt.checked)
        .map((pnt) => pnt.location);

      const imageUrls = imagePreviews
        .filter((url) => Boolean(url) && typeof url === 'string' && !url.startsWith('blob:'));

      const plannerPayload = Object.entries(tripPlanner || {}).reduce((acc, [dayKey, rows]) => {
        const normalizedRows = (rows || [])
          .map((row) => {
            const rawTime = (row?.time || '').trim();
            const startOnly = rawTime ? rawTime.split('-')[0].trim() : '';
            return {
              time: startOnly,
              duration: (row?.duration || '').toString().trim(),
              activity: (row?.activity || '').trim(),
              location: (row?.location || '').trim()
            };
          })
          .filter((row) => row.time || row.duration || row.activity || row.location);

        if (normalizedRows.length > 0) {
          acc[String(dayKey)] = normalizedRows;
        }

        return acc;
      }, {});
      
      // Prepare update data
      const updateData = {
        name: tripName,
        description: tripDescription,
        price: priceNumber,
        provinsi: tripProvince,
        country: tripCountry,
        slot: slotNumber,
        days: daysNumber,
        nights: nightsNumber,
        destinationType: tripDestType,
        durasi_mulai,
        durasi_selesai,
        images: imageUrls,
        includes: selectedIncludes,
        pickup_points: selectedPickupPoints,
        trip_planner: plannerPayload,
      };
      
      console.log('[TripEditPage] Update data:', updateData);
      
      // Call API to update trip
      const result = await updatePlannerTrip(qTripId, updateData);
      
      console.log('[TripEditPage] Trip updated successfully:', result);
      alert('Trip saved successfully!');
      
      // Optionally navigate back to agent page after successful save
      // navigate('/trip/agent');
      
    } catch (error) {
      console.error('[TripEditPage] Error saving trip:', error);
      const errorMessage = error.response?.data?.detail || error.message || 'Unknown error occurred';
      alert(`Failed to save trip: ${errorMessage}`);
    }
  };

  const filledCount = imagePreviews.filter(Boolean).length;

  const pageStyle = {
    minHeight: '100vh',
    backgroundImage: 'url("https://images.unsplash.com/photo-1584715625116-c1dbbfcf19be?q=80&w=2000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D")',
    backgroundColor: colors.bg,
    backgroundSize: 'cover',
    backgroundPosition: 'center top',
    backgroundRepeat: 'no-repeat',
    fontFamily: 'Inter, system-ui, -apple-system',
  };

  const scheduleCardTotalMin = '180px';
  const scheduleFixedBottomApprox = '0px';
  const scheduleListMaxHeight = `calc(${scheduleCardTotalMin} - ${scheduleFixedBottomApprox})`;

  const containerStyle = {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: spacing.lg,
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: '500px 1fr',
    gap: spacing.lg,
    marginTop: spacing.lg,
  };

  // Show loading state
  if (loading) {
    return (
      <div style={pageStyle}>
        <Navbar style={{ position: 'sticky', top: 0, left: 0, right: 0, zIndex: 60, backgroundColor: `${colors.bg}33`, backdropFilter: 'saturate(120%) blur(6px)', borderBottom: `1px solid ${colors.bg}20` }} />
        <div style={containerStyle}>
          <TripTabs />
          <div style={{
            padding: 32,
            background: colors.bg,
            borderRadius: radius.lg,
            boxShadow: '0 6px 18px rgba(8,15,20,0.06)',
            marginTop: spacing.lg,
            textAlign: 'center'
          }}>
            <p>Memuat data trip...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div style={pageStyle}>
        <Navbar style={{ position: 'sticky', top: 0, left: 0, right: 0, zIndex: 60, backgroundColor: `${colors.bg}33`, backdropFilter: 'saturate(120%) blur(6px)', borderBottom: `1px solid ${colors.bg}20` }} />
        <div style={containerStyle}>
          <TripTabs />
          <div style={{
            padding: 32,
            background: colors.bg,
            borderRadius: radius.lg,
            boxShadow: '0 6px 18px rgba(8,15,20,0.06)',
            marginTop: spacing.lg,
            textAlign: 'center',
            color: colors.error
          }}>
            <p>{error}</p>
            <Button variant="primary" onClick={() => window.location.reload()} style={{ marginTop: spacing.md }}>
              Reload Page
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (isParticipant) {
    return (
      <div style={pageStyle}>
        <Navbar style={{ position: 'sticky', top: 0, left: 0, right: 0, zIndex: 60, backgroundColor: `${colors.bg}33`, backdropFilter: 'saturate(120%) blur(6px)', borderBottom: `1px solid ${colors.bg}20` }} />
        <div style={containerStyle}>
          <TripTabs />
          <div style={{
            padding: 32,
            background: colors.bg,
            borderRadius: radius.lg,
            boxShadow: '0 6px 18px rgba(8,15,20,0.06)',
            marginTop: spacing.lg
          }}>
            <h2>Participants</h2>
            <p>This is the Participant list placeholder. Replace with participant management UI.</p>
          </div>
        </div>
      </div>
    );
  }

  return (<>
    <div style={pageStyle}>
      <Navbar style={{ position: 'sticky', top: 0, left: 0, right: 0, zIndex: 60, backgroundColor: `${colors.bg}33`, backdropFilter: 'saturate(120%) blur(6px)', borderBottom: `1px solid ${colors.bg}20` }} />
      <div style={containerStyle}>
        <TripTabs />
        
        <div style={gridStyle}>
          {/* LEFT COLUMN */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.lg }}>
            {/* Image Upload Card */}
            <ImageUploadCard>
              <FontAwesomeIcon icon={faUpload} size="3x" color={colors.accent4} />
              <UploadButton onClick={handleUploadClick} disabled={filledCount >= MAX_IMAGES}>Upload Image</UploadButton>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/png, image/jpeg"
                multiple
                style={{ display: 'none' }}
              />
            </ImageUploadCard>
            {/* Image Preview Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: spacing.sm }}>
              {imagePreviews.map((img, idx) => (
                <ImagePreview key={idx}>
                  {img ? (
                    <div style={{ position: 'relative' }}>
                      <img 
                        src={img} 
                        alt={`preview-${idx}`} 
                        style={{ 
                          width: 100, 
                          height: 100, 
                          objectFit: 'cover', 
                          borderRadius: radius.sm
                        }} 
                      />
                      {filledCount >= 0 && (
                        <button
                          onClick={() => handleDeleteImage(idx)}
                          style={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            background: 'transparent',
                            border: 'none',
                            borderRadius: '100%',
                            padding: 6,
                            cursor: 'pointer'
                          }}
                        >
                          <FontAwesomeIcon icon={faTrash} color={colors.error} />
                        </button>
                      )}
                    </div>
                  ) : (
                    <div style={{ width: '100%', height: 100, borderRadius: radius.sm }} />
                  )}
                </ImagePreview>
              ))}
            </div>
            {/* Schedule Section */}
            <TripCard>
              <CardHeader>Schedule</CardHeader>
              <div style={{ display: 'flex', flexDirection: 'column', minHeight: scheduleCardTotalMin, maxHeight: scheduleCardTotalMin }}>
                <div style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: spacing.sm,
                  overflowY: schedules.length >= 2 ? 'auto' : 'hidden',
                  maxHeight: schedules.length >= 2 ? scheduleListMaxHeight : 'none',
                  paddingRight: spacing.sm
                }}>
                  {schedules.map((schedule) => (
                    <div
                      key={schedule.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px 0',
                      }}
                    >
                      <span style={{ fontSize: fontSize.base }}>{formatDateRange(schedule.text)}</span>
                      <div style={{ display: 'flex', gap: spacing.xs }}>
                        <IconButton icon={<FontAwesomeIcon icon={faPencil} />} onClick={() => handleEditSchedule(schedule)} />
                        <IconButton icon={<FontAwesomeIcon icon={faTrash} />} onClick={() => handleDeleteSchedule(schedule.id)} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Schedule (fixed area) */}
                <div style={{ padding: spacing.md, borderTop: `1px solid ${colors.accent5}20`, backgroundColor: colors.bg }}>
                  <div style={{ display: 'flex', gap: spacing.sm, alignItems: 'end' }}>
                    <div style={{ flex: 1 }}>
                      <InputField label="Start Date" type="date" value={newScheduleStartDate} onChange={(e) => { setNewScheduleStartDate(e.target.value); setScheduleError(''); }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <InputField label="End Date" type="date" value={newScheduleEndDate} onChange={(e) => { setNewScheduleEndDate(e.target.value); setScheduleError(''); }} />
                    </div>
                    <AddButton onClick={handleAddSchedule} />
                  </div>
                  <div style={{ height: spacing.sm }} />
                  <div style={{ minHeight: fontSize.sm, lineHeight: 1, color: colors.error }}>
                    {scheduleError && (
                      <div style={{ color: colors.error, fontSize: fontSize.sm }}>{scheduleError}</div>
                    )}
                  </div>
                </div>
              </div>
            </TripCard>
            
          </div>
          {/* RIGHT COLUMN */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.lg }}>
            {/* Trip Information */}
            <TripCard>
              <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.lg }}>
                <IconButton
                  icon={<FontAwesomeIcon icon={faPencil} style={{ fontSize: 14 }} />}
                  onClick={() => openFieldModal('name', tripName)}
                  style={{ width: 32, height: 32, padding: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                />
                <SectionTitle style={{ marginBottom: '0px', lineHeight: '32px', height: '32px', display: 'flex', alignItems: 'center', color: colors.accent4, fontWeight: '800px' }}>{tripName}</SectionTitle>
              </div>
              <div style={{ marginBottom: spacing.md }}>
                <CardHeader>Trip Information</CardHeader>
                <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.xs, fontSize: fontSize.sm }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
                    <span style={{ color: colors.text }}>Rp {tripPrice}</span>
                    <IconButton 
                      icon={<FontAwesomeIcon icon={faPencil} size="xs" />} 
                      onClick={() => openFieldModal('price', tripPrice)}
                      style={{ marginLeft: 'auto', width: 24, height: 24 }}
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
                    <span style={{ color: colors.text }}>{tripSlot} Slot Available</span>
                    <IconButton 
                      icon={<FontAwesomeIcon icon={faPencil} size="xs" />} 
                      onClick={() => openFieldModal('slot', tripSlot)}
                      style={{ marginLeft: 'auto', width: 24, height: 24 }}
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
                    <span style={{ color: colors.text }}>
                      {tripProvince}, {tripCountry}
                    </span>
                    <IconButton icon={<FontAwesomeIcon icon={faPencil} size="xs" />} onClick={openLocationModal} style={{ marginLeft: 'auto', width: 24, height: 24 }} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
                    <span style={{ color: colors.text }}>{tripDestType}</span>
                    <IconButton 
                      icon={<FontAwesomeIcon icon={faPencil} size="xs" />} 
                      onClick={() => openFieldModal('destType', tripDestType)}
                      style={{ marginLeft: 'auto', width: 24, height: 24 }}
                    />
                  </div>
                </div>
              </div>
            </TripCard>
            {/* Pick Up Point Section */}
            <TripCard style={{ width: '828px', height: '200px', display: 'flex', flexDirection: 'column' }}>
              <CardHeader>Pick Up Point</CardHeader>
              <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm, flex: 1, overflowY: 'auto', paddingRight: spacing.sm }}>
                {pickupPoints.map((point) => (
                  <div
                    key={point.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '6px 0',
                    }}
                  >
                    <label style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, cursor: 'pointer', flex: 1 }}>
                      <input
                        type="checkbox"
                        checked={point.checked}
                        onChange={() => {
                          setPickupPoints(
                            pickupPoints.map((p) =>
                              p.id === point.id ? { ...p, checked: !p.checked } : p
                            )
                          );
                        }}
                        style={{ width: 16, height: 16, cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: fontSize.sm }}>
                        <span style={{ color: colors.accent3, fontWeight: 600 }}>[Rp {formatRupiah(point.price)}]</span>{' '}
                        {point.location}
                      </span>
                    </label>
                    <div style={{ display: 'flex', gap: spacing.xs }}>
                      <IconButton icon={<FontAwesomeIcon icon={faPencil} />} onClick={() => handleEditPickupPoint(point)} />
                      <IconButton icon={<FontAwesomeIcon icon={faTrash} />} onClick={() => handleDeletePickupPoint(point.id)} />
                    </div>
                  </div>
                ))}
              </div>
              <TextLink onClick={() => { setPickupError(''); setShowPickupModal(true); }}>+ Others</TextLink>
            </TripCard>
            {/* Include Section */}
            <TripCard style={{ width: '828px', height: '418px', display: 'flex', flexDirection: 'column' }}>
              <CardHeader>Include</CardHeader>
              <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm, flex: 1, overflowY: 'auto', paddingRight: spacing.sm }}>
                {includes.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '6px 0',
                    }}
                  >
                    <label style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, cursor: 'pointer', flex: 1 }}>
                      <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={() => {
                          setIncludes(
                            includes.map((i) =>
                              i.id === item.id ? { ...i, checked: !i.checked } : i
                            )
                          );
                        }}
                        style={{ width: 16, height: 16, cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: fontSize.sm }}>{item.name}</span>
                    </label>
                    <div style={{ display: 'flex', gap: spacing.xs }}>
                      <IconButton icon={<FontAwesomeIcon icon={faPencil} />} onClick={() => handleEditInclude(item)} />
                      <IconButton icon={<FontAwesomeIcon icon={faTrash} />} onClick={() => handleDeleteInclude(item.id)} />
                    </div>
                  </div>
                ))}
              </div>
              <TextLink onClick={() => { setIncludeError(''); setShowIncludeModal(true); }}>+ Others</TextLink>
            </TripCard>
          </div>
        </div>

        {/* Description Section (full-width below columns) */}
        <div style={{ marginTop: spacing.lg }}>
          <TripCard>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md }}>
              <CardHeader style={{ margin: 0 }}>Description</CardHeader>
              <IconButton icon={<FontAwesomeIcon icon={faPencil} />} onClick={() => openFieldModal('description', tripDescription)} />
            </div>
            <p style={{ 
              fontSize: fontSize.sm, 
              color: colors.text, 
              lineHeight: 1.6,
              margin: 0
            }}>
              {tripDescription}
            </p>
          </TripCard>
        </div>

        {/* Trip Planner Section */}
        <div style={{ marginTop: spacing.xl }}>
          <h2 style={{ fontSize: fontSize.xl, fontWeight: 1000, color: colors.accent5, marginBottom: spacing.lg }}>
            Trip Planner
          </h2>
          
          <div style={{ display: 'flex', gap: spacing.md, alignItems: 'center', marginBottom: spacing.md }}>
            <label style={{ fontWeight: 600, color: colors.bg, fontFamily: fontFamily.base }}>Day</label>
            <select
              value={openDay}
              onChange={(e) => setOpenDay(parseInt(e.target.value))}
              style={{ 
                padding: `${spacing.sm} ${spacing.md}`, 
                borderRadius: radius.md, 
                border: `1px solid ${colors.accent5}20`, 
                backgroundColor: colors.bg,
                cursor: 'pointer'
              }}
            >
              {Array.from({ length: tripDays }, (_, i) => i + 1).map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          {tripPlanner[openDay] && (
            <div style={{
              backgroundColor: colors.bg,
              borderRadius: radius.md,
              border: `1px solid ${colors.accent5}20`,
              overflow: 'hidden'
            }}>
              <div style={{ height: '335px', overflowY: (tripPlanner[openDay] || []).length >= 4 ? 'scroll' : 'auto', position: 'relative' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ position: 'sticky', top: 0, zIndex: 1, backgroundColor: colors.accent5 }}>
                    <tr>
                      <th style={{ padding: spacing.md, textAlign: 'center', fontWeight: 600, fontSize: fontSize.sm, color: colors.bg, borderBottom: `3px solid ${colors.accent4}`, width: '12%' }}>Time</th>
                      <th style={{ padding: spacing.md, textAlign: 'center', fontWeight: 600, fontSize: fontSize.sm, color: colors.bg, borderBottom: `3px solid ${colors.accent4}`, width: '8%' }}>Duration (hrs)</th>
                      <th style={{ padding: spacing.md, textAlign: 'center', fontWeight: 600, fontSize: fontSize.sm, color: colors.bg, borderBottom: `3px solid ${colors.accent4}`, width: '40%' }}>Activity</th>
                      <th style={{ padding: spacing.md, textAlign: 'center', fontWeight: 600, fontSize: fontSize.sm, color: colors.bg, borderBottom: `3px solid ${colors.accent4}`, width: '30%' }}>Location</th>
                      <th style={{ padding: spacing.md, textAlign: 'center', fontWeight: 600, fontSize: fontSize.sm, color: colors.bg, borderBottom: `3px solid ${colors.accent4}`, width: '10%' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(tripPlanner[openDay] || []).map((activity) => (
                      <tr key={activity.id} style={{borderBottom: `1px solid ${colors.accent4}`}}>
                        <td style={{ padding: spacing.sm, width: '12%' }}>
                          <input
                            type="text"
                            value={activity.time}
                            onChange={(e) => handleActivityChange(openDay, activity.id, 'time', e.target.value)}
                            placeholder="06.00"
                            style={{
                              width: '100%',
                              padding: spacing.sm,
                              border: '1px solid #D4C4A8',
                              borderRadius: radius.sm,
                              backgroundColor: '#F9F5EE',
                              fontSize: fontSize.sm,
                              outline: 'none'
                            }}
                          />
                        </td>
                        <td style={{ padding: spacing.sm, width: '8%' }}>
                          <input
                            type="number"
                            value={activity.duration}
                            onChange={(e) => handleActivityChange(openDay, activity.id, 'duration', e.target.value)}
                            placeholder="1"
                            style={{
                              width: '100%',
                              padding: spacing.sm,
                              border: '1px solid #D4C4A8',
                              borderRadius: radius.sm,
                              backgroundColor: '#F9F5EE',
                              fontSize: fontSize.sm,
                              outline: 'none'
                            }}
                          />
                        </td>
                        <td style={{ padding: spacing.sm, width: '40%' }}>
                          <input
                            type="text"
                            value={activity.activity}
                            onChange={(e) => handleActivityChange(openDay, activity.id, 'activity', e.target.value)}
                            placeholder="Meeting point & briefing"
                            style={{
                              width: '100%',
                              padding: spacing.sm,
                              border: '1px solid #D4C4A8',
                              borderRadius: radius.sm,
                              backgroundColor: '#F9F5EE',
                              fontSize: fontSize.sm,
                              outline: 'none'
                            }}
                          />
                        </td>
                        <td style={{ padding: spacing.sm, width: '30%' }}>
                          <input
                            type="text"
                            value={activity.location}
                            onChange={(e) => handleActivityChange(openDay, activity.id, 'location', e.target.value)}
                            placeholder="Bandar Udara Komodo"
                            style={{
                              width: '100%',
                              padding: spacing.sm,
                              border: '1px solid #D4C4A8',
                              borderRadius: radius.sm,
                              backgroundColor: '#F9F5EE',
                              fontSize: fontSize.sm,
                              outline: 'none'
                            }}
                          />
                        </td>
                        <td style={{ padding: spacing.sm, width: '10%' }}>
                          <div style={{ display: 'flex', gap: spacing.xs, justifyContent: 'center', alignItems: 'center' }}>
                            <IconButton 
                              icon={<FontAwesomeIcon icon={faTrash} />}
                              onClick={() => handleDeleteActivity(openDay, activity.id)}
                              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, padding: 0 }}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ padding: spacing.md, textAlign: 'center', borderTop: '1px solid #E8D4B8', backgroundColor: colors.bg }}>
                <button
                  onClick={() => handleAddActivity(openDay)}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    border: `2px solid ${colors.accent5}`,
                    backgroundColor: 'transparent',
                    color: colors.accent5,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: fontSize.lg,
                    margin: '0 auto'
                  }}
                >
                  <FontAwesomeIcon icon={faPlus} />
                </button>
              </div>
            </div>
          )}
          {/* Keep Trip Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: spacing.lg }}>
            <Button variant="primary" style={{ minWidth: '200px', padding: `${spacing.md} ${spacing.xl}` }} onClick={handleSaveTrip}>
              <FontAwesomeIcon icon={faCheck} style={{ marginRight: spacing.xs }} />
              <span style={{ fontWeight: 700, fontFamily: fontFamily.base}}>Save Trip</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
    {/* Modals */}
    {showIncludeModal && (
      <Modal open={showIncludeModal} onClose={() => { setShowIncludeModal(false); setNewIncludeName(''); }} title="Add Custom Include">
        <div style={modalStyles.formGroup}>
          <label style={modalStyles.label}>Include Name</label>
          <input
            type="text"
            value={newIncludeName}
            onChange={(e) => { setNewIncludeName(e.target.value); setIncludeError(''); }}
            style={modalStyles.input}
          />
        </div>
        {includeError && (
          <div style={modalStyles.errorText}>{includeError}</div>
        )}
        <div style={modalStyles.buttonContainer}>
          <Button variant="btn2" onClick={handleAddInclude} style={{ display: 'inline-flex', gap: spacing.xs }}>
            <FontAwesomeIcon icon={faCheck} /> Confirm
          </Button>
          <Button variant="btn3" onClick={() => { setShowIncludeModal(false); setNewIncludeName(''); }} style={{ display: 'inline-flex', gap: spacing.xs }}>
            <FontAwesomeIcon icon={faXmark} /> Cancel
          </Button>
        </div>
      </Modal>
    )}
          {showFieldModal && (
      <Modal open={showFieldModal} onClose={() => setShowFieldModal(false)} title={fieldToEdit === 'description' ? 'Edit Description' : `Edit ${fieldToEdit.charAt(0).toUpperCase() + fieldToEdit.slice(1)}`}>
        <div style={{ marginBottom: spacing.md }}>
          {fieldToEdit === 'description' ? (
            <div>
              <textarea value={fieldValue} onChange={(e) => setFieldValue(e.target.value)} rows={6} maxLength={400} style={{ ...modalStyles.input, resize: 'vertical' }} />
              <div style={{ marginTop: spacing.sm, fontSize: fontSize.sm, color: colors.text }}>{fieldValue.length}/400</div>
            </div>
          ) : fieldToEdit === 'destType' ? (
            <div>
              <select value={fieldValue} onChange={(e) => setFieldValue(e.target.value)} style={modalStyles.input}>
                {DEST_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
                <option value="Other">Other</option>
              </select>
              {fieldValue === 'Other' && (
                <div style={{ marginTop: spacing.sm }}>
                  <InputField label="Custom Destination Type" type="text" value={fieldCustomValue} onChange={(e) => setFieldCustomValue(e.target.value)} />
                </div>
              )}
            </div>
          ) : (
            <input type="text" value={fieldValue} onChange={(e) => setFieldValue(e.target.value)} style={modalStyles.input} />
          )}
        </div>
        <div style={modalStyles.buttonContainer}>
          <Button variant="btn2" onClick={saveFieldModal} style={{ display: 'inline-flex', gap: spacing.xs }}>
            <FontAwesomeIcon icon={faCheck} /> Save
          </Button>
          <Button variant="btn3" onClick={() => setShowFieldModal(false)} style={{ display: 'inline-flex', gap: spacing.xs }}>
            <FontAwesomeIcon icon={faXmark} /> Cancel
          </Button>
        </div>
      </Modal>
    )}
    {showLocationModal && (
      <Modal open={showLocationModal} onClose={() => setShowLocationModal(false)} title="Edit Province & Country">
        <div style={modalStyles.gridTwoColumns}>
          <div>
            <label style={modalStyles.label}>Province / State</label>
            <input type="text" value={editLocationProvince} onChange={(e) => setEditLocationProvince(e.target.value)} style={modalStyles.input} />
          </div>
          <div>
            <label style={modalStyles.label}>Country</label>
            <input type="text" value={editLocationCountry} onChange={(e) => setEditLocationCountry(e.target.value)} style={modalStyles.input} />
          </div>
        </div>
        <div style={modalStyles.buttonContainer}>
          <Button variant="btn2" onClick={() => { setTripProvince(editLocationProvince); setTripCountry(editLocationCountry); setShowLocationModal(false); }} style={{ display: 'inline-flex', gap: spacing.xs }}>
            <FontAwesomeIcon icon={faCheck} /> Save
          </Button>
          <Button variant="btn3" onClick={() => setShowLocationModal(false)} style={{ display: 'inline-flex', gap: spacing.xs }}>
            <FontAwesomeIcon icon={faXmark} /> Cancel
          </Button>
        </div>
      </Modal>
    )}
    {showEditScheduleModal && (
      <Modal open={showEditScheduleModal} onClose={() => { setShowEditScheduleModal(false); setEditingSchedule(null); }} title="Edit Schedule">
        <div style={modalStyles.formGroupMd}>
          <label style={modalStyles.label}>Start Date</label>
          <input
            type="date"
            value={editScheduleStartDate}
            onChange={(e) => { setEditScheduleStartDate(e.target.value); setEditScheduleError(''); }}
            style={modalStyles.input}
          />
        </div>
        <div style={modalStyles.formGroup}>
          <label style={modalStyles.label}>End Date</label>
          <input
            type="date"
            value={editScheduleEndDate}
            onChange={(e) => { setEditScheduleEndDate(e.target.value); setEditScheduleError(''); }}
            style={modalStyles.input}
          />
        </div>
        {editScheduleError && (
          <div style={modalStyles.errorText}>{editScheduleError}</div>
        )}
        <div style={modalStyles.buttonContainer}>
          <Button variant="btn2" onClick={handleSaveEditSchedule} style={{ display: 'inline-flex', gap: spacing.xs }}>
            <FontAwesomeIcon icon={faCheck} /> Confirm
          </Button>
          <Button variant="btn3" onClick={() => { setShowEditScheduleModal(false); setEditingSchedule(null); }} style={{ display: 'inline-flex', gap: spacing.xs }}>
            <FontAwesomeIcon icon={faXmark} /> Cancel
          </Button>
        </div>
      </Modal>
    )}
    {showEditPickupModal && editingPickup && (
      <Modal open={showEditPickupModal} onClose={() => { setShowEditPickupModal(false); setEditingPickup(null); }} title="Edit Pick Up Point">
        <div style={modalStyles.formGroupMd}>
          <label style={modalStyles.label}>Pick Up Point Name</label>
          <input
            type="text"
            value={editingPickup.location}
            onChange={(e) => setEditingPickup({ ...editingPickup, location: e.target.value })}
            style={modalStyles.input}
          />
        </div>
        <div style={modalStyles.formGroup}>
          <label style={modalStyles.label}>Price</label>
          <input
            type="text"
            value={editingPickup.price}
            onChange={(e) => { setEditingPickup({ ...editingPickup, price: e.target.value }); setEditPickupError(''); }}
            style={modalStyles.input}
          />
        </div>
        {editPickupError && (
          <div style={modalStyles.errorText}>{editPickupError}</div>
        )}
        <div style={modalStyles.buttonContainer}>
          <Button variant="btn2" onClick={handleSaveEditPickupPoint} style={{ display: 'inline-flex', gap: spacing.xs }}>
            <FontAwesomeIcon icon={faCheck} /> Confirm
          </Button>
          <Button variant="btn3" onClick={() => { setShowEditPickupModal(false); setEditingPickup(null); }} style={{ display: 'inline-flex', gap: spacing.xs }}>
            <FontAwesomeIcon icon={faXmark} /> Cancel
          </Button>
        </div>
      </Modal>
    )}
    {showEditIncludeModal && editingInclude && (
      <Modal open={showEditIncludeModal} onClose={() => { setShowEditIncludeModal(false); setEditingInclude(null); }} title="Edit Include">
        <div style={modalStyles.formGroup}>
          <label style={modalStyles.label}>Include Name</label>
          <input
            type="text"
            value={editingInclude.name}
            onChange={(e) => { setEditingInclude({ ...editingInclude, name: e.target.value }); setEditIncludeError(''); }}
            style={modalStyles.input}
          />
        </div>
        {editIncludeError && (
          <div style={modalStyles.errorText}>{editIncludeError}</div>
        )}
        <div style={modalStyles.buttonContainer}>
          <Button variant="btn2" onClick={handleSaveEditInclude} style={{ display: 'inline-flex', gap: spacing.xs }}>
            <FontAwesomeIcon icon={faCheck} /> Confirm
          </Button>
          <Button variant="btn3" onClick={() => { setShowEditIncludeModal(false); setEditingInclude(null); }} style={{ display: 'inline-flex', gap: spacing.xs }}>
            <FontAwesomeIcon icon={faXmark} /> Cancel
          </Button>
        </div>
      </Modal>
    )}
    {showPickupModal && (
      <Modal open={showPickupModal} onClose={() => { setShowPickupModal(false); setNewPickupPrice(''); setNewPickupLocation(''); }} title="Add Custom Pick Up Point">
        <div style={modalStyles.formGroupMd}>
          <label style={modalStyles.label}>Pick Up Point Name</label>
          <input
            type="text"
            value={newPickupLocation}
            onChange={(e) => { setNewPickupLocation(e.target.value); setPickupError(''); }}
            style={modalStyles.input}
          />
        </div>
        <div style={modalStyles.formGroup}>
          <label style={modalStyles.label}>Price</label>
          <input
            type="text"
            value={newPickupPrice}
            onChange={(e) => { setNewPickupPrice(e.target.value); setPickupError(''); }}
            style={modalStyles.input}
          />
        </div>
        {pickupError && (
          <div style={modalStyles.errorText}>{pickupError}</div>
        )}
        <div style={modalStyles.buttonContainer}>
          <Button variant="btn2" onClick={handleAddPickupPoint} style={{ display: 'inline-flex', gap: spacing.xs }}>
            <FontAwesomeIcon icon={faCheck} /> Confirm
          </Button>
          <Button variant="btn3" onClick={() => { setShowPickupModal(false); setNewPickupPrice(''); setNewPickupLocation(''); }} style={{ display: 'inline-flex', gap: spacing.xs }}>
            <FontAwesomeIcon icon={faXmark} /> Cancel
          </Button>
        </div>
      </Modal>
    )}
  </> );
}
