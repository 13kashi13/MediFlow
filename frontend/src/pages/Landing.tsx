import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Shield,
  Zap,
  CheckCircle,
  ArrowRight,
  Star,
  Activity,
  Award,
  FileText,
  Heart,
  Plus,
  ShieldCheck,
  Check,
  Stethoscope
} from 'lucide-react';

// Modern Clinic / Medical Backdrop Component (Replaces Google Maps)
const MedicalBackdropComponent: React.FC = () => {
  return (
    <div className="absolute inset-0 bg-gradient-to-br from-[#071613] via-[#050e0c] to-[#020605] overflow-hidden">
      {/* Abstract Grid Mesh */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0c2d27_1px,transparent_1px),linear-gradient(to_bottom,#0c2d27_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] opacity-35"></div>

      {/* Heartbeat/ECG Pulse line animation */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.08] select-none">
        <svg className="w-full max-w-6xl h-64 text-primary-teal" viewBox="0 0 1000 100" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M 0 50 L 250 50 L 270 30 L 290 70 L 310 50 L 330 50 L 340 10 L 350 90 L 360 50 L 380 50 L 400 50 L 420 30 L 440 70 L 460 50 L 1000 50" strokeDasharray="1000" strokeDashoffset="1000">
            <animate attributeName="stroke-dashoffset" values="1000;0" dur="9s" repeatCount="Infinity" />
          </path>
        </svg>
      </div>

      {/* Glowing Clinical Orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-primary-teal/15 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-[28rem] h-[28rem] bg-primary-green/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>


    </div>
  );
};

// iPhone Mockup Component with Interactive Features
const IPhoneMockup: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<'dashboard' | 'doctors' | 'booking' | 'success' | 'prescriptions'>('dashboard');
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState('09:41');
  const [currentDate, setCurrentDate] = useState('Tue, Jun 16');

  // Dynamic Island States
  const [islandState, setIslandState] = useState<'normal' | 'expanded'>('normal');
  const [islandText, setIslandText] = useState('');

  // Simulated Appointments State
  const [appointments, setAppointments] = useState<any[]>([
    {
      id: 'apt-1',
      doctorName: 'Dr. Sarah Johnson',
      specialty: 'Cardiologist',
      date: '2026-06-16',
      time: '11:30 AM',
      status: 'scheduled', // 'scheduled' or 'confirmed' (checked in)
    }
  ]);

  // Simulated Prescriptions
  const [prescriptions] = useState<any[]>([
    {
      id: 'p1',
      doctorName: 'Dr. Sarah Johnson',
      diagnosis: 'Hypertension',
      medication: 'Lisinopril 10mg - Once daily',
      date: '2026-06-15',
    }
  ]);

  // Doctors database for mockup
  const doctorsList = [
    {
      id: 1,
      name: 'Dr. Sarah Johnson',
      specialty: 'Cardiologist',
      rating: 4.9,
      experience: '15 years',
      image: 'SJ',
      fee: 1500,
    },
    {
      id: 2,
      name: 'Dr. Michael Chen',
      specialty: 'Neurologist',
      rating: 4.8,
      experience: '12 years',
      image: 'MC',
      fee: 1800,
    },
    {
      id: 3,
      name: 'Dr. Emily Davis',
      specialty: 'Pediatrician',
      rating: 4.7,
      experience: '10 years',
      image: 'ED',
      fee: 1200,
    },
  ];

  const timeSlots = ['9:00 AM', '10:00 AM', '11:30 AM', '2:00 PM', '3:30 PM', '4:30 PM'];

  // Trigger Dynamic Island Message animation
  const triggerIslandMessage = (text: string) => {
    setIslandText(text);
    setIslandState('expanded');
    setTimeout(() => {
      setIslandState('normal');
    }, 2800);
  };

  // Clock Update
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const hrs = now.getHours().toString().padStart(2, '0');
      const mins = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hrs}:${mins}`);
    };
    updateClock();
    const interval = setInterval(updateClock, 30000);
    return () => clearInterval(interval);
  }, []);

  // Handle Patient Check-In
  const handleCheckIn = (aptId: string) => {
    setAppointments(
      appointments.map((apt) =>
        apt.id === aptId ? { ...apt, status: 'confirmed' } : apt
      )
    );
    triggerIslandMessage('Check-in Confirmed');
  };

  // Handle Booking Confirmation
  const handleConfirmBooking = () => {
    if (!selectedDoctor) return;
    const newApt = {
      id: `apt-${Math.random().toString(36).substr(2, 9)}`,
      doctorName: selectedDoctor.name,
      specialty: selectedDoctor.specialty,
      date: '2026-06-16',
      time: selectedSlot || '10:00 AM',
      status: 'scheduled',
    };
    setAppointments([newApt, ...appointments]);
    triggerIslandMessage('Appointment Booked');
    setCurrentScreen('success');
  };

  const activeBookingDoctor = selectedDoctor || doctorsList[0];

  return (
    <div className="relative hover:scale-[1.02] transition-transform duration-500 select-none drop-shadow-[0_35px_50px_rgba(0,0,0,0.85)] z-30">
      {/* iPhone 16 Pro Frame with titanium color accents */}
      <div className="relative w-[285px] h-[610px] bg-gradient-to-b from-[#2e2e30] via-[#1a1a1c] to-[#2e2e30] p-[3px] rounded-[3rem] shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.35),inset_0_-1.5px_2px_rgba(0,0,0,0.6)]">
        
        {/* Screen Bezel (Super Thin) */}
        <div className="absolute inset-[3.5px] bg-[#000] rounded-[2.9rem] shadow-[inset_0_4px_12px_rgba(0,0,0,0.95)]">
          
          {/* Dynamic Island with Framer Motion Size Changes */}
          <motion.div
            animate={{
              width: islandState === 'expanded' ? 185 : 95,
              height: islandState === 'expanded' ? 32 : 25,
              borderRadius: islandState === 'expanded' ? '1.25rem' : '1.8rem',
            }}
            transition={{ type: 'spring', stiffness: 350, damping: 22 }}
            className="absolute top-[10px] left-1/2 -translate-x-1/2 bg-black z-50 flex items-center justify-center gap-2 text-white overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.5)] border border-white/5"
          >
            {islandState === 'normal' ? (
              <>
                {/* Camera Lens Highlight */}
                <div className="w-[7px] h-[7px] bg-gradient-radial from-[#12122b] to-[#04040f] rounded-full ring-[1px] ring-white/10 shadow-inner"></div>
                {/* Sensors */}
                <div className="flex gap-[3px]">
                  <div className="w-[2.5px] h-[2.5px] bg-[#424261] rounded-full"></div>
                  <div className="w-[1.5px] h-[1.5px] bg-[#424261] rounded-full opacity-60"></div>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2 px-3 w-full justify-center text-[10px] font-bold text-primary-green tracking-wide whitespace-nowrap">
                <Check className="w-3.5 h-3.5 text-primary-green" />
                <span>{islandText}</span>
              </div>
            )}
          </motion.div>

          {/* Screen Content Container */}
          <div className="absolute inset-[6px] bg-white rounded-[2.6rem] overflow-hidden flex flex-col pt-[36px] pb-[12px]">
            
            {/* Status Bar */}
            <div className="absolute top-0 left-0 right-0 h-[36px] bg-white z-40 px-6 pt-[10px] flex items-center justify-between text-text-primary">
              <span className="text-[12px] font-bold tracking-tight">{currentTime}</span>
              <div className="flex items-center gap-1.5">
                <div className="flex gap-[1.5px] items-end">
                  <div className="w-[2px] h-[3.5px] bg-text-primary rounded-full"></div>
                  <div className="w-[2px] h-[4.5px] bg-text-primary rounded-full"></div>
                  <div className="w-[2px] h-[6px] bg-text-primary rounded-full"></div>
                  <div className="w-[2px] h-[7.5px] bg-text-primary rounded-full"></div>
                </div>
                <svg className="w-[11px] h-[11px] text-text-primary" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21l-12-12c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z"/>
                </svg>
                <div className="flex items-center gap-[1px]">
                  <div className="w-[18px] h-[9px] border-[1.2px] border-text-primary rounded-[2px] relative flex items-center">
                    <div className="absolute inset-[1px] bg-text-primary rounded-[1px]"></div>
                  </div>
                  <div className="w-[1.5px] h-[3px] bg-text-primary rounded-r-[1px]"></div>
                </div>
              </div>
            </div>

            {/* Main Screen Body with Transitions */}
            <div className="flex-1 bg-gradient-to-b from-white to-primary-secondary/30 overflow-y-auto scrollbar-hide px-3.5 relative">
              <AnimatePresence mode="wait">
                {currentScreen === 'dashboard' && (
                  <motion.div
                    key="dashboard"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="space-y-4 pt-2 pb-6"
                  >
                    {/* Welcome Banner */}
                    <div className="flex justify-between items-center bg-primary-teal/5 p-3 rounded-2xl border border-primary-teal/10">
                      <div>
                        <h4 className="text-[10px] font-bold text-primary-teal uppercase tracking-wider">Patient Portal</h4>
                        <h3 className="text-sm font-bold text-text-primary mt-0.5">Welcome, Emma Wilson</h3>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-primary-teal text-white flex items-center justify-center font-bold text-xs shadow-sm">
                        EW
                      </div>
                    </div>

                    {/* Stats Summary Panel */}
                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="p-2.5 bg-white border border-border rounded-xl shadow-[0_2px_5px_rgba(0,0,0,0.02)]">
                        <span className="text-[9px] text-text-secondary font-medium">My Active Prescr.</span>
                        <span className="text-base font-bold text-text-primary block mt-0.5">{prescriptions.length} Records</span>
                      </div>
                      <div className="p-2.5 bg-white border border-border rounded-xl shadow-[0_2px_5px_rgba(0,0,0,0.02)]">
                        <span className="text-[9px] text-text-secondary font-medium">Scheduled Visits</span>
                        <span className="text-base font-bold text-text-primary block mt-0.5">{appointments.length} Total</span>
                      </div>
                    </div>

                    {/* Next Appointment Card with Check-In capability */}
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <h4 className="text-xs font-bold text-text-primary">Today's Appointment</h4>
                      </div>
                      {appointments.length === 0 ? (
                        <div className="p-4 bg-white border border-border/80 border-dashed rounded-2xl text-center">
                          <p className="text-xs text-text-secondary">No appointments booked for today</p>
                        </div>
                      ) : (
                        <div className="bg-white border border-border/80 rounded-2xl p-3 shadow-sm space-y-2.5">
                          <div className="flex gap-2.5 items-center">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-teal to-primary-green text-white flex items-center justify-center font-bold text-xs shadow-sm">
                              {appointments[0].doctorName.split(' ').pop().substring(0, 2).toUpperCase()}
                            </div>
                            <div className="flex-1">
                              <p className="text-xs font-bold text-text-primary">{appointments[0].doctorName}</p>
                              <p className="text-[10px] text-text-secondary">{appointments[0].specialty}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between bg-primary-secondary/35 p-2 rounded-xl text-[10px] text-text-primary font-semibold">
                            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-primary-teal" />{currentDate}</span>
                            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-primary-teal" />{appointments[0].time}</span>
                          </div>

                          {/* Check-In Dynamic Control */}
                          {appointments[0].status === 'scheduled' ? (
                            <button
                              onClick={() => handleCheckIn(appointments[0].id)}
                              className="w-full py-2 bg-primary-teal text-white font-bold rounded-xl text-xs shadow-sm hover:bg-primary-dark-teal transition-all active:scale-[0.98]"
                            >
                              Confirm Attendance
                            </button>
                          ) : (
                            <div className="flex items-center justify-center gap-1.5 py-1.5 bg-green-50 border border-green-200 rounded-xl text-primary-green text-[10px] font-bold uppercase tracking-wider">
                              <CheckCircle className="w-3.5 h-3.5 text-primary-green" />
                              <span>Checked In (Waiting Room)</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Quick Launch Buttons */}
                    <div className="pt-1">
                      <button
                        onClick={() => setCurrentScreen('doctors')}
                        className="w-full p-3 bg-gradient-to-r from-primary-teal to-[#1c7e67] text-white rounded-2xl font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-between active:scale-[0.98]"
                      >
                        <span className="flex items-center gap-2">
                          <Plus className="w-4 h-4" /> Book New Appointment
                        </span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                )}

                {currentScreen === 'doctors' && (
                  <motion.div
                    key="doctors"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="space-y-3 pt-2 pb-6"
                  >
                    <div className="flex items-center justify-between pb-1 border-b border-border/65">
                      <h3 className="text-sm font-bold text-text-primary">Find a Doctor</h3>
                      <button
                        onClick={() => setCurrentScreen('dashboard')}
                        className="text-[10px] font-bold text-primary-teal hover:underline"
                      >
                        Back
                      </button>
                    </div>

                    {/* Doctors Listing */}
                    <div className="space-y-2.5">
                      {doctorsList.map((doc) => (
                        <div
                          key={doc.id}
                          onClick={() => {
                            setSelectedDoctor(doc);
                            setSelectedSlot(null);
                            setCurrentScreen('booking');
                          }}
                          className="bg-white border border-border/80 rounded-2xl p-3 shadow-[0_2px_5px_rgba(0,0,0,0.02)] hover:border-primary-teal/40 transition-colors cursor-pointer"
                        >
                          <div className="flex gap-2.5 items-center">
                            <div className="w-11 h-11 bg-primary-teal/10 rounded-xl text-primary-teal flex items-center justify-center font-bold text-xs border border-primary-teal/5">
                              {doc.image}
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="text-xs font-bold text-text-primary">{doc.name}</p>
                                  <p className="text-[10px] text-text-secondary">{doc.specialty}</p>
                                </div>
                                <div className="flex items-center gap-0.5 px-1.5 py-0.5 bg-amber-50 border border-amber-200 rounded text-[9px] font-bold text-amber-700">
                                  <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                                  <span>{doc.rating}</span>
                                </div>
                              </div>
                              <div className="flex justify-between items-center mt-2 pt-1.5 border-t border-border/40 text-[9px] text-text-secondary">
                                <span>{doc.experience} exp</span>
                                <span className="font-bold text-primary-teal text-xs">₹{doc.fee}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {currentScreen === 'booking' && (
                  <motion.div
                    key="booking"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="space-y-3 pt-2 pb-6"
                  >
                    <div className="flex items-center justify-between border-b border-border/60 pb-1">
                      <h3 className="text-xs font-bold text-text-primary">Booking Details</h3>
                      <button
                        onClick={() => setCurrentScreen('doctors')}
                        className="text-[10px] font-bold text-primary-teal hover:underline"
                      >
                        Change Doctor
                      </button>
                    </div>

                    {/* Selected Doctor Summary */}
                    <div className="p-3 bg-gradient-to-br from-primary-teal to-[#1c7e67] rounded-2xl text-white shadow-sm flex items-center gap-2.5">
                      <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center font-bold text-xs">
                        {activeBookingDoctor.image}
                      </div>
                      <div>
                        <p className="text-xs font-bold">{activeBookingDoctor.name}</p>
                        <p className="text-[9px] text-white/80">{activeBookingDoctor.specialty}</p>
                      </div>
                    </div>

                    {/* Date Picker Slider */}
                    <div>
                      <span className="text-[10px] font-bold text-text-secondary block mb-1">Select Date</span>
                      <div className="flex gap-1.5 overflow-x-auto pb-1">
                        {[0, 1, 2].map((offset) => {
                          const dateObj = new Date();
                          dateObj.setDate(dateObj.getDate() + offset);
                          const dayStr = dateObj.getDate();
                          const wday = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
                          return (
                            <div
                              key={offset}
                              className={`flex flex-col items-center py-1.5 px-3.5 rounded-xl text-[10px] font-bold min-w-[50px] border cursor-pointer ${
                                offset === 0
                                  ? 'bg-primary-teal border-primary-teal text-white shadow-sm'
                                  : 'bg-white border-border text-text-secondary'
                              }`}
                            >
                              <span>{wday}</span>
                              <span className="text-xs font-extrabold mt-0.5">{dayStr}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Slot Picker Grid */}
                    <div>
                      <span className="text-[10px] font-bold text-text-secondary block mb-1">Available Slots</span>
                      <div className="grid grid-cols-3 gap-1.5">
                        {timeSlots.map((slot) => (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setSelectedSlot(slot)}
                            className={`py-2 text-center rounded-xl text-[9px] font-bold border transition-colors ${
                              selectedSlot === slot
                                ? 'bg-primary-teal border-primary-teal text-white shadow-sm'
                                : 'bg-white border-border text-text-primary hover:border-primary-teal/40'
                            }`}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Price Breakdown */}
                    <div className="p-2.5 bg-primary-secondary/30 rounded-xl border border-border/50 text-[10px] space-y-1.5">
                      <div className="flex justify-between text-text-secondary">
                        <span>Consultation Fee</span>
                        <span className="font-semibold text-text-primary">₹{activeBookingDoctor.fee}</span>
                      </div>
                      <div className="flex justify-between text-text-secondary">
                        <span>Service Charge</span>
                        <span className="font-semibold text-text-primary">₹50</span>
                      </div>
                      <div className="border-t border-border/60 pt-1.5 flex justify-between font-bold text-text-primary">
                        <span>Total Payable</span>
                        <span className="text-primary-teal text-xs">₹{activeBookingDoctor.fee + 50}</span>
                      </div>
                    </div>

                    <button
                      onClick={handleConfirmBooking}
                      disabled={!selectedSlot}
                      className={`w-full py-2.5 font-bold rounded-xl text-xs shadow flex items-center justify-center gap-1.5 transition-all ${
                        selectedSlot
                          ? 'bg-primary-teal text-white hover:bg-primary-dark-teal active:scale-[0.98]'
                          : 'bg-gray-100 border border-border text-text-secondary cursor-not-allowed'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      Confirm Appointment
                    </button>
                  </motion.div>
                )}

                {currentScreen === 'success' && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center pt-6 pb-6 text-center space-y-4"
                  >
                    <div className="w-12 h-12 rounded-full bg-green-50 border border-green-200 flex items-center justify-center shadow-inner">
                      <Check className="w-6 h-6 text-primary-green" />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-text-primary">Booking Confirmed!</h4>
                      <p className="text-[10px] text-text-secondary mt-1">Your appointment has been registered.</p>
                    </div>

                    <div className="w-full bg-white border border-border/80 rounded-2xl p-3 shadow-sm space-y-2 text-left text-[10px]">
                      <div className="pb-1.5 border-b border-border/40 font-bold text-text-primary">
                        Visit Summary
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Doctor:</span>
                        <span className="font-bold text-text-primary">{activeBookingDoctor.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Time Slot:</span>
                        <span className="font-bold text-text-primary">{selectedSlot || '11:30 AM'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Date:</span>
                        <span className="font-bold text-text-primary">{currentDate}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setCurrentScreen('dashboard');
                        setSelectedDoctor(null);
                        setSelectedSlot(null);
                      }}
                      className="w-full py-2 bg-primary-teal text-white font-bold rounded-xl text-xs shadow hover:bg-primary-dark-teal"
                    >
                      Go to Dashboard
                    </button>
                  </motion.div>
                )}

                {currentScreen === 'prescriptions' && (
                  <motion.div
                    key="prescriptions"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="space-y-3 pt-2 pb-6"
                  >
                    <div className="flex items-center justify-between border-b border-border/60 pb-1">
                      <h3 className="text-sm font-bold text-text-primary">Prescriptions</h3>
                      <button
                        onClick={() => setCurrentScreen('dashboard')}
                        className="text-[10px] font-bold text-primary-teal hover:underline"
                      >
                        Back
                      </button>
                    </div>

                    {prescriptions.map((p) => (
                      <div key={p.id} className="bg-white border border-border/80 rounded-2xl p-3 shadow-sm space-y-2">
                        <div className="flex justify-between items-start pb-1.5 border-b border-border/30">
                          <div>
                            <span className="text-[9px] text-text-secondary block">Assigned By</span>
                            <span className="text-xs font-bold text-text-primary">{p.doctorName}</span>
                          </div>
                          <span className="text-[9px] text-text-secondary font-medium">{p.date}</span>
                        </div>
                        <div className="space-y-1">
                          <div>
                            <span className="text-[8px] text-text-secondary uppercase tracking-wider block font-semibold">Diagnosis</span>
                            <span className="text-[10px] font-bold text-text-primary">{p.diagnosis}</span>
                          </div>
                          <div className="pt-1">
                            <span className="text-[8px] text-text-secondary uppercase tracking-wider block font-semibold">Medication</span>
                            <span className="text-[10px] text-primary-teal font-semibold">{p.medication}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Bottom App Navigation Tabs */}
            <div className="border-t border-border/50 bg-white pt-2.5 px-4 flex justify-between items-center text-text-secondary">
              {[
                { tab: 'dashboard' as const, icon: <Activity className="w-5 h-5" />, label: 'Home' },
                { tab: 'doctors' as const, icon: <Calendar className="w-5 h-5" />, label: 'Book' },
                { tab: 'prescriptions' as const, icon: <FileText className="w-5 h-5" />, label: 'Rx' },
              ].map((t) => (
                <button
                  key={t.tab}
                  type="button"
                  onClick={() => setCurrentScreen(t.tab)}
                  className={`flex flex-col items-center gap-0.5 transition-colors pb-0.5 ${
                    currentScreen === t.tab || (currentScreen === 'booking' && t.tab === 'doctors') || (currentScreen === 'success' && t.tab === 'doctors')
                      ? 'text-primary-teal font-bold'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {t.icon}
                  <span className="text-[8px] tracking-tight">{t.label}</span>
                </button>
              ))}
            </div>

            {/* Home Indicator */}
            <div className="absolute bottom-[4px] left-1/2 -translate-x-1/2 w-[100px] h-[3.5px] bg-[#1a1a1a]/30 rounded-full"></div>
          </div>
        </div>

        {/* Screen reflection glass overlay */}
        <div className="absolute inset-[3px] rounded-[2.9rem] overflow-hidden pointer-events-none z-40">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-40"></div>
        </div>
      </div>
    </div>
  );
};

export const Landing: React.FC = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: <Calendar className="w-6 h-6" />,
      title: 'Smart Scheduling',
      description: 'Dynamic slot assignments linking patient attendance confirmation directly with receptionist queues.',
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: 'Integrated Prescriptions',
      description: 'Immediate prescription distribution and notifications as soon as the doctor records updates.',
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Secured Health Records',
      description: 'End-to-end data encryption satisfying high-security HIPAA directives and record controls.',
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Live Flow Analytics',
      description: 'Instant updates regarding clinic arrivals, pending patients count, and wait-time statistics.',
    },
  ];

  const stats = [
    { value: '24/7', label: 'Platform Available' },
    { value: 'Real-Time', label: 'Appointment Booking' },
    { value: 'Digital', label: 'Prescriptions' },
    { value: 'Secure', label: 'Health Records' },
  ];

  const testimonials = [
    {
      name: 'Sarah Mitchell',
      role: 'Patient',
      avatar: 'SM',
      content: 'Booking was instant, and checking in on the mobile app directly put me in the digital queue. Highly recommended!',
      rating: 5,
    },
    {
      name: 'Dr. Michael Chen',
      role: 'Neurologist',
      avatar: 'MC',
      content: 'The custom doctor workspace fits my daily queue perfectly. Click patient name, write diagnosis, and submit - extremely clean.',
      rating: 5,
    },
    {
      name: 'Emily Rodriguez',
      role: 'Receptionist',
      avatar: 'ER',
      content: 'The receptionist panel shows waiting room arrivals automatically. Changing status syncs globally with no delay.',
      rating: 5,
    },
  ];

  const partners = ['Apollo', 'Max Healthcare', 'Fortis', 'Medanta', 'AIIMS', 'Manipal'];

  return (
    <div className="min-h-screen bg-[#050e0c] text-white">
      {/* Navbar */}
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          scrolled ? 'bg-[#071613]/95 backdrop-blur-md shadow-lg border-b border-white/5' : 'bg-black/35 backdrop-blur-md'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-8 h-8 text-primary-teal" />
            <span className="text-2xl font-bold tracking-tight text-white">
              MediFlow
            </span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-semibold text-white/80 hover:text-white transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-sm font-semibold text-white/80 hover:text-white transition-colors">
              How It Works
            </a>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/login')}
              className="text-sm font-bold text-white/80 hover:text-white transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/register')}
              className="px-5 py-2.5 text-sm font-bold rounded-xl bg-primary-teal text-white hover:bg-primary-dark-teal transition-colors shadow-md"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen min-h-[680px] overflow-hidden">
        {/* Full Backdrop Component */}
        <div className="absolute inset-0 z-0">
          <MedicalBackdropComponent />
        </div>

        {/* Translucent overlay for text readability */}
        <div className="absolute inset-0 bg-black/10 z-10" />

        {/* Content */}
        <div className="relative z-20 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-6 w-full">
            <div className="grid lg:grid-cols-12 gap-8 items-center pt-8">
              
              {/* Left Side Text Content */}
              <div className="lg:col-span-7 text-left space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55 }}
                  className="space-y-6"
                >
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-primary-teal/20 backdrop-blur-md rounded-full border border-primary-teal/30">
                    <div className="w-2 h-2 bg-primary-green rounded-full animate-pulse" />
                    <span className="text-[12px] font-bold text-white tracking-wide uppercase">Connected Clinic Platform</span>
                  </div>
                  
                  <h1 className="text-4xl lg:text-5xl font-extrabold text-white leading-tight drop-shadow-md tracking-tight">
                    Healthcare Management,<br />
                    <span className="text-primary-green">Streamlined</span> & Simple.
                  </h1>
                  
                  <p className="text-base text-white/80 max-w-xl leading-relaxed drop-shadow-sm font-medium">
                    Schedule, confirm, and consult in real-time. Link patient attendance instantly with waiting rooms, track live stats, and distribute prescriptions dynamically.
                  </p>

                  {/* Platform highlights — no fake numbers */}
                  <div className="grid grid-cols-2 gap-3.5 max-w-md pt-1.5">
                    {[
                      { label: 'Appointment Booking', value: 'Real-Time', desc: 'Instant slot confirmation', color: 'text-primary-teal', icon: <Calendar className="w-3.5 h-3.5 text-primary-teal" /> },
                      { label: 'Support', value: '24/7', desc: 'Always available platform', color: 'text-primary-green', icon: <Clock className="w-3.5 h-3.5 text-primary-green" /> },
                      { label: 'Prescriptions', value: 'Digital', desc: 'Issued & tracked online', color: 'text-primary-teal', icon: <FileText className="w-3.5 h-3.5 text-primary-teal" /> },
                      { label: 'Data Security', value: 'Encrypted', desc: 'End-to-end secured records', color: 'text-primary-green', icon: <Shield className="w-3.5 h-3.5 text-primary-green" /> },
                    ].map((stat, idx) => (
                      <div key={idx} className="p-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl flex flex-col justify-between shadow-sm">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[9px] text-white/50 block font-semibold uppercase tracking-wider">{stat.label}</span>
                            <span className={`text-base font-bold ${stat.color} block mt-0.5`}>{stat.value}</span>
                          </div>
                          <div className="p-1.5 bg-white/5 rounded-lg border border-white/5">{stat.icon}</div>
                        </div>
                        <p className="text-[10px] text-white/35 mt-1.5 leading-tight">{stat.desc}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-3.5 pt-2">
                    <button
                      onClick={() => navigate('/register')}
                      className="px-6 py-3.5 bg-primary-teal text-white font-bold rounded-xl hover:bg-primary-dark-teal transition-all flex items-center gap-2 shadow-lg"
                    >
                      Book Now
                      <ArrowRight className="w-4.5 h-4.5" />
                    </button>
                    <a
                      href="#how-it-works"
                      className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl border border-white/20 backdrop-blur-sm transition-colors text-center"
                    >
                      See How It Works
                    </a>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-3">
                    {['Instant Check-in', 'Interactive Rx Portal', '24/7 Live Queues'].map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <CheckCircle className="w-4.5 h-4.5 text-primary-green" />
                        <span className="text-xs font-bold text-white/90">{item}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* Right Side iPhone Prototype Simulator */}
              <div className="lg:col-span-5 flex justify-center lg:justify-end relative z-30">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.55, delay: 0.2 }}
                >
                  <IPhoneMockup />
                </motion.div>
              </div>

            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 hidden md:block">
          <div className="flex flex-col items-center gap-1.5">
            <span className="text-[9px] font-bold text-white/60 tracking-widest uppercase">Scroll Down</span>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-5 h-8 border border-white/40 rounded-full flex items-start justify-center pt-1"
            >
              <div className="w-1 h-1.5 bg-white/70 rounded-full" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-[#071613]/80 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-3xl font-extrabold text-primary-teal">{stat.value}</div>
                <div className="text-xs text-white/50 mt-1 font-semibold uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Integrated Workspace Modules
          </h2>
          <p className="text-base text-white/50 max-w-xl mx-auto mt-2">
            Tailored interfaces for patients, doctors, and front-desk receptionists.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/8 hover:border-primary-teal/30 transition-all"
            >
              <div className="w-11 h-11 bg-primary-teal/10 rounded-xl flex items-center justify-center mb-4 text-primary-teal border border-primary-teal/10">
                {feature.icon}
              </div>
              <h3 className="text-base font-bold text-white mb-1.5">{feature.title}</h3>
              <p className="text-xs text-white/50 leading-relaxed font-medium">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-6 bg-[#071613]/60 border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-extrabold text-white tracking-tight">Workflows in Action</h2>
            <p className="text-base text-white/50 mt-1.5">How MediFlow keeps your clinic in sync</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Schedule & Book', desc: 'Patients select slots and schedule appointments via the interactive app portal.' },
              { step: '02', title: 'Confirm & Check-In', desc: 'Patients confirm attendance; receptionists automatically track arrivals in the waiting room.' },
              { step: '03', title: 'Consult & Prescribe', desc: 'Doctors start visits, view patient profiles, and submit prescriptions directly.' },
            ].map((item, idx) => (
              <div key={idx} className="relative">
                <div className="text-5xl font-extrabold text-primary-teal/20 mb-3">{item.step}</div>
                <h3 className="text-lg font-bold text-white mb-1.5">{item.title}</h3>
                <p className="text-xs text-white/50 leading-relaxed font-medium">{item.desc}</p>
                {idx < 2 && (
                  <ArrowRight className="hidden md:block absolute top-8 -right-4 w-6 h-6 text-primary-teal/20" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials section removed — no fake reviews */}

      {/* Partners section removed — no fake partner logos */}

      {/* Final CTA */}
      <section className="py-16 px-6 max-w-4xl mx-auto text-center space-y-6">
        <h2 className="text-3xl font-extrabold text-white tracking-tight">
          Ready to Experience Smart Healthcare?
        </h2>
        <p className="text-sm text-white/50 max-w-md mx-auto">
          Start streamlining consultations and front-desk schedules with MediFlow today.
        </p>
        <button
          onClick={() => navigate('/register')}
          className="px-8 py-3.5 bg-primary-teal text-white font-bold rounded-xl hover:bg-primary-dark-teal transition-all shadow-md inline-flex items-center gap-2"
        >
          Register Clinic Profile
          <ArrowRight className="w-4.5 h-4.5" />
        </button>
      </section>

      {/* Footer */}
      <footer className="bg-[#020605] text-white py-12 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Activity className="w-6 h-6 text-primary-teal" />
                <span className="text-lg font-bold tracking-tight">MediFlow</span>
              </div>
              <p className="text-xs text-white/30 leading-relaxed font-medium">
                A clinical workflow platform for modern healthcare practitioners, patients, and front-desk teams.
              </p>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider mb-3 text-primary-teal">Product</h4>
              <ul className="space-y-2 text-xs text-white/40 font-semibold">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider mb-3 text-primary-teal">Platform</h4>
              <ul className="space-y-2 text-xs text-white/40 font-semibold">
                <li><a href="/login" className="hover:text-white transition-colors">Sign In</a></li>
                <li><a href="/register" className="hover:text-white transition-colors">Get Started</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider mb-3 text-primary-teal">Support</h4>
              <ul className="space-y-2 text-xs text-white/40 font-semibold">
                <li><span className="text-white/30">Available 24/7</span></li>
                <li><span className="text-white/30">Data encrypted</span></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/5 pt-8 text-center text-xs text-white/20 font-semibold">
            <p>© 2026 MediFlow. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
