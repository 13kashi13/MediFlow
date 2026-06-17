import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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
  TrendingUp,
  Activity,
  Award,
} from 'lucide-react';

// Google Maps Component
const GoogleMapComponent: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [selectedClinic, setSelectedClinic] = useState<any>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  const clinics = [
    {
      id: 1,
      name: 'Ruby Hall Clinic',
      lat: 18.5204,
      lng: 73.8567,
      address: 'Grant Road, Pune',
      slots: ['10:00 AM', '2:00 PM', '4:30 PM'],
      rating: 4.8,
    },
    {
      id: 2,
      name: 'Sahyadri Hospital',
      lat: 18.5314,
      lng: 73.8446,
      address: 'Deccan Gymkhana, Pune',
      slots: ['9:00 AM', '11:30 AM', '3:00 PM'],
      rating: 4.9,
    },
    {
      id: 3,
      name: 'Deenanath Mangeshkar Hospital',
      lat: 18.5018,
      lng: 73.8636,
      address: 'Erandwane, Pune',
      slots: ['10:30 AM', '1:00 PM', '5:00 PM'],
      rating: 4.7,
    },
  ];

  useEffect(() => {
    // Load Google Maps script dynamically
    const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    
    console.log('Google Maps API Key:', API_KEY ? 'Present' : 'Missing');
    
    if (!API_KEY) {
      console.error('Google Maps API key not found in environment variables');
      setMapError('Google Maps API key not configured');
      return;
    }

    // Check if script is already loaded
    if ((window as any).google && (window as any).google.maps) {
      console.log('Google Maps already loaded');
      setIsMapLoaded(true);
      return;
    }

    console.log('Loading Google Maps script...');
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      console.log('Google Maps script loaded successfully');
      setIsMapLoaded(true);
    };
    script.onerror = (error) => {
      console.error('Failed to load Google Maps script:', error);
      setMapError('Failed to load Google Maps');
    };
    document.head.appendChild(script);

    return () => {
      // Cleanup if needed
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || !isMapLoaded) {
      console.log('Map not ready:', { mapRef: !!mapRef.current, isMapLoaded });
      return;
    }

    try {
      console.log('Initializing Google Map...');
      // Initialize map with dark mode style
      const map = new (window as any).google.maps.Map(mapRef.current, {
        center: { lat: 18.5204, lng: 73.8567 },
        zoom: 13,
        styles: [
          { elementType: 'geometry', stylers: [{ color: '#212121' }] },
          { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
          { elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
          { elementType: 'labels.text.stroke', stylers: [{ color: '#212121' }] },
          {
            featureType: 'administrative',
            elementType: 'geometry',
            stylers: [{ color: '#757575' }],
          },
          {
            featureType: 'administrative.country',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#9e9e9e' }],
          },
          {
            featureType: 'administrative.locality',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#bdbdbd' }],
          },
          {
            featureType: 'poi',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#757575' }],
          },
          {
            featureType: 'poi.park',
            elementType: 'geometry',
            stylers: [{ color: '#181818' }],
          },
          {
            featureType: 'poi.park',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#616161' }],
          },
          {
            featureType: 'poi.park',
            elementType: 'labels.text.stroke',
            stylers: [{ color: '#1b1b1b' }],
          },
          {
            featureType: 'road',
            elementType: 'geometry.fill',
            stylers: [{ color: '#2c2c2c' }],
          },
          {
            featureType: 'road',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#8a8a8a' }],
          },
          {
            featureType: 'road.arterial',
            elementType: 'geometry',
            stylers: [{ color: '#373737' }],
          },
          {
            featureType: 'road.highway',
            elementType: 'geometry',
            stylers: [{ color: '#3c3c3c' }],
          },
          {
            featureType: 'road.highway.controlled_access',
            elementType: 'geometry',
            stylers: [{ color: '#4e4e4e' }],
          },
          {
            featureType: 'road.local',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#616161' }],
          },
          {
            featureType: 'transit',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#757575' }],
          },
          {
            featureType: 'water',
            elementType: 'geometry',
            stylers: [{ color: '#000000' }],
          },
          {
            featureType: 'water',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#3d3d3d' }],
          },
        ],
        disableDefaultUI: true,
        zoomControl: true,
      });

      console.log('Map initialized, adding markers...');
      // Add markers
      clinics.forEach((clinic) => {
        const marker = new (window as any).google.maps.Marker({
          position: { lat: clinic.lat, lng: clinic.lng },
          map: map,
          icon: {
            path: (window as any).google.maps.SymbolPath.CIRCLE,
            scale: 12,
            fillColor: '#2FA084',
            fillOpacity: 1,
            strokeColor: '#6FCF97',
            strokeWeight: 3,
          },
        });

        marker.addListener('click', () => {
          setSelectedClinic(clinic);
          console.log('Clinic selected:', clinic.name);
        });
      });
      console.log('Markers added successfully');
    } catch (error) {
      console.error('Error initializing map:', error);
      setMapError('Failed to initialize map');
    }
  }, [isMapLoaded]);

  if (mapError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <p className="text-red-400 mb-2">Map Error</p>
          <p className="text-sm text-gray-400">{mapError}</p>
        </div>
      </div>
    );
  }

  if (!isMapLoaded) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-teal border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-sm text-gray-400">Loading Map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
};

// iPhone Mockup Component with Interactive Features
const IPhoneMockup: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<'home' | 'doctors' | 'booking' | 'success'>('home');
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');

  // Update time every second (IST - Indian Standard Time)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const istTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
      
      const hours = istTime.getHours();
      const minutes = istTime.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const hour12 = hours % 12 || 12;
      
      setCurrentTime(`${hour12}:${minutes.toString().padStart(2, '0')}`);
      
      const options: Intl.DateTimeFormatOptions = { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      };
      setCurrentDate(istTime.toLocaleDateString('en-US', options));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Auto-cycle through screens for demo
  useEffect(() => {
    const screens: Array<'home' | 'doctors' | 'booking' | 'success'> = ['home', 'doctors', 'booking', 'success'];
    let currentIndex = 0;
    
    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % screens.length;
      setCurrentScreen(screens[currentIndex]);
      
      // Reset selections when going back to home
      if (screens[currentIndex] === 'home') {
        setSelectedDoctor(null);
        setSelectedSlot(null);
      }
    }, 4000);
    
    return () => clearInterval(interval);
  }, []);

  const doctors = [
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
      name: 'Dr. Priya Sharma',
      specialty: 'Pediatrician',
      rating: 4.9,
      experience: '10 years',
      image: 'PS',
      fee: 1200,
    },
  ];

  const timeSlots = [
    '9:00 AM', '10:00 AM', '11:30 AM', 
    '2:00 PM', '3:30 PM', '4:30 PM'
  ];

  // Render different screens
  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return (
          <div className="h-full flex flex-col">
            {/* App Header */}
            <div className="px-4 pb-4">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-text-primary">MediFlow</h1>
                  <p className="text-xs text-text-secondary">Find & Book Appointments</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-primary-teal text-white flex items-center justify-center text-sm font-semibold">
                  AM
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search doctors, specialties..."
                  className="w-full px-4 py-3 pl-10 bg-white border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-teal/20"
                  readOnly
                />
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="px-4 pb-4">
              <div className="grid grid-cols-4 gap-3">
                {[
                  { icon: <Calendar className="w-5 h-5" />, label: 'Book' },
                  { icon: <Clock className="w-5 h-5" />, label: 'Schedule' },
                  { icon: <Users className="w-5 h-5" />, label: 'Doctors' },
                  { icon: <Activity className="w-5 h-5" />, label: 'Records' },
                ].map((action, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-2">
                    <div className="w-14 h-14 bg-primary-teal/10 rounded-2xl flex items-center justify-center text-primary-teal">
                      {action.icon}
                    </div>
                    <span className="text-xs text-text-secondary">{action.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Appointments */}
            <div className="flex-1 px-4 overflow-auto scrollbar-hide">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-text-primary">Upcoming</h3>
                <span className="text-xs text-primary-teal">View All</span>
              </div>
              
              <div className="space-y-3">
                <div className="p-4 bg-white border border-border rounded-xl shadow-sm">
                  <div className="flex gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary-green/10 text-primary-green flex items-center justify-center font-semibold text-sm">
                      SJ
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-text-primary">Dr. Sarah Johnson</p>
                      <p className="text-xs text-text-secondary">Cardiologist</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-text-secondary">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {currentDate}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          11:30 AM
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Navigation */}
            <div className="px-4 py-3 border-t border-border bg-white">
              <div className="flex justify-around items-center">
                {[
                  { icon: <Activity className="w-5 h-5" />, active: true },
                  { icon: <Calendar className="w-5 h-5" />, active: false },
                  { icon: <Users className="w-5 h-5" />, active: false },
                  { icon: <Award className="w-5 h-5" />, active: false },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-2 rounded-xl ${item.active ? 'text-primary-teal bg-primary-teal/10' : 'text-text-secondary'}`}
                  >
                    {item.icon}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'doctors':
        return (
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="px-4 pb-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <ArrowRight className="w-4 h-4 rotate-180 text-text-primary" />
                </div>
                <h2 className="text-lg font-bold text-text-primary">Find Doctors</h2>
              </div>

              {/* Filters */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                {['All', 'Cardiology', 'Neurology', 'Pediatrics'].map((filter, idx) => (
                  <div
                    key={idx}
                    className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap ${
                      idx === 0
                        ? 'bg-primary-teal text-white'
                        : 'bg-gray-100 text-text-secondary'
                    }`}
                  >
                    {filter}
                  </div>
                ))}
              </div>
            </div>

            {/* Doctors List */}
            <div className="flex-1 px-4 overflow-auto space-y-3 scrollbar-hide">
              {doctors.map((doctor) => (
                <div
                  key={doctor.id}
                  className="p-4 bg-white border border-border rounded-xl hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => {
                    setSelectedDoctor(doctor);
                    setCurrentScreen('booking');
                  }}
                >
                  <div className="flex gap-3">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-teal to-primary-green text-white flex items-center justify-center font-bold text-lg shadow-lg">
                      {doctor.image}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-1">
                        <div>
                          <p className="text-sm font-bold text-text-primary">{doctor.name}</p>
                          <p className="text-xs text-text-secondary">{doctor.specialty}</p>
                        </div>
                        <div className="flex items-center gap-1 px-2 py-1 bg-warning/10 rounded-lg">
                          <Star className="w-3 h-3 fill-warning text-warning" />
                          <span className="text-xs font-semibold text-warning">{doctor.rating}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-text-secondary">{doctor.experience} exp</span>
                        <span className="text-sm font-bold text-primary-teal">₹{doctor.fee}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Navigation */}
            <div className="px-4 py-3 border-t border-border bg-white">
              <div className="flex justify-around items-center">
                {[
                  { icon: <Activity className="w-5 h-5" />, active: false },
                  { icon: <Calendar className="w-5 h-5" />, active: false },
                  { icon: <Users className="w-5 h-5" />, active: true },
                  { icon: <Award className="w-5 h-5" />, active: false },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-2 rounded-xl ${item.active ? 'text-primary-teal bg-primary-teal/10' : 'text-text-secondary'}`}
                  >
                    {item.icon}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'booking':
        const doctor = selectedDoctor || doctors[0];
        return (
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="px-4 pb-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <ArrowRight className="w-4 h-4 rotate-180 text-text-primary" />
                </div>
                <h2 className="text-lg font-bold text-text-primary">Book Appointment</h2>
              </div>

              {/* Doctor Info */}
              <div className="p-4 bg-gradient-to-br from-primary-teal to-primary-green rounded-2xl text-white shadow-lg">
                <div className="flex gap-3 items-center">
                  <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center font-bold text-lg">
                    {doctor.image}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-base">{doctor.name}</p>
                    <p className="text-sm text-white/90">{doctor.specialty}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-white text-white" />
                        <span className="text-xs font-medium">{doctor.rating}</span>
                      </div>
                      <span className="text-xs text-white/80">•</span>
                      <span className="text-xs text-white/90">{doctor.experience}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Time Slots */}
            <div className="flex-1 px-4 overflow-auto scrollbar-hide">
              <div className="mb-3">
                <h3 className="text-sm font-semibold text-text-primary mb-1">Select Date</h3>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {[0, 1, 2, 3, 4].map((offset) => {
                    const date = new Date();
                    date.setDate(date.getDate() + offset);
                    const day = date.getDate();
                    const weekday = date.toLocaleDateString('en-US', { weekday: 'short' });
                    return (
                      <div
                        key={offset}
                        className={`flex flex-col items-center px-4 py-3 rounded-xl min-w-[60px] ${
                          offset === 0
                            ? 'bg-primary-teal text-white shadow-md'
                            : 'bg-gray-50 text-text-secondary'
                        }`}
                      >
                        <span className="text-xs font-medium">{weekday}</span>
                        <span className="text-lg font-bold mt-1">{day}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mb-4">
                <h3 className="text-sm font-semibold text-text-primary mb-3">Available Slots</h3>
                <div className="grid grid-cols-3 gap-2">
                  {timeSlots.map((slot, idx) => (
                    <div
                      key={idx}
                      className={`p-3 text-center rounded-xl border-2 cursor-pointer transition-all ${
                        idx === 2 || selectedSlot === slot
                          ? 'bg-primary-teal text-white border-primary-teal shadow-md'
                          : 'bg-white border-border hover:border-primary-teal/30'
                      }`}
                      onClick={() => setSelectedSlot(slot)}
                    >
                      <p className="text-xs font-semibold">{slot}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Booking Summary */}
              <div className="p-4 bg-gray-50 rounded-xl mb-4">
                <h3 className="text-xs font-semibold text-text-secondary mb-2">Booking Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Consultation Fee</span>
                    <span className="font-semibold text-text-primary">₹{doctor.fee}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Service Charge</span>
                    <span className="font-semibold text-text-primary">₹50</span>
                  </div>
                  <div className="border-t border-border pt-2 flex justify-between">
                    <span className="text-sm font-semibold text-text-primary">Total</span>
                    <span className="text-lg font-bold text-primary-teal">₹{doctor.fee + 50}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Book Button */}
            <div className="px-4 pb-4">
              <button
                onClick={() => setCurrentScreen('success')}
                className="w-full py-4 bg-primary-teal text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                Confirm Booking
              </button>
            </div>
          </div>
        );

      case 'success':
        return (
          <div className="h-full flex flex-col items-center justify-center px-4">
            {/* Success Animation */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', duration: 0.6 }}
              className="w-24 h-24 rounded-full bg-primary-green/10 flex items-center justify-center mb-6"
            >
              <div className="w-20 h-20 rounded-full bg-primary-green/20 flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-primary-green" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center mb-8"
            >
              <h2 className="text-2xl font-bold text-text-primary mb-2">Booking Confirmed!</h2>
              <p className="text-sm text-text-secondary">
                Your appointment has been successfully booked
              </p>
            </motion.div>

            {/* Appointment Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="w-full p-5 bg-white border border-border rounded-2xl shadow-lg mb-6"
            >
              <div className="flex items-center gap-3 pb-4 border-b border-border">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-teal to-primary-green text-white flex items-center justify-center font-bold text-lg">
                  SJ
                </div>
                <div>
                  <p className="font-bold text-text-primary">Dr. Sarah Johnson</p>
                  <p className="text-xs text-text-secondary">Cardiologist</p>
                </div>
              </div>
              
              <div className="space-y-3 pt-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-teal/10 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-primary-teal" />
                  </div>
                  <div>
                    <p className="text-xs text-text-secondary">Date</p>
                    <p className="text-sm font-semibold text-text-primary">{currentDate}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-teal/10 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-primary-teal" />
                  </div>
                  <div>
                    <p className="text-xs text-text-secondary">Time</p>
                    <p className="text-sm font-semibold text-text-primary">11:30 AM</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-teal/10 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-primary-teal" />
                  </div>
                  <div>
                    <p className="text-xs text-text-secondary">Location</p>
                    <p className="text-sm font-semibold text-text-primary">Ruby Hall Clinic, Pune</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="w-full space-y-3"
            >
              <button className="w-full py-3 bg-primary-teal text-white font-semibold rounded-xl shadow-lg">
                Add to Calendar
              </button>
              <button className="w-full py-3 bg-white border-2 border-border text-text-primary font-semibold rounded-xl">
                View Details
              </button>
            </motion.div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="relative hover:scale-[1.02] transition-transform duration-500">
      {/* iPhone 14 Pro Frame - Compact & Realistic */}
      <div className="relative w-[280px] h-[600px]">
          {/* Metal Frame with realistic bezels */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#3a3a3a] via-[#1f1f1f] to-[#3a3a3a] rounded-[3rem] shadow-[0_25px_70px_rgba(0,0,0,0.9),0_12px_35px_rgba(0,0,0,0.75),inset_0_1px_2px_rgba(255,255,255,0.12),inset_0_-1px_2px_rgba(0,0,0,0.5)]">
            {/* Side buttons - Left side */}
            <div className="absolute -left-[2px] top-[110px] w-[2.5px] h-[45px] bg-gradient-to-b from-[#4a4a4a] via-[#2a2a2a] to-[#1f1f1f] rounded-l-md shadow-inner"></div>
            <div className="absolute -left-[2px] top-[170px] w-[2.5px] h-[60px] bg-gradient-to-b from-[#4a4a4a] via-[#2a2a2a] to-[#1f1f1f] rounded-l-md shadow-inner"></div>
            <div className="absolute -left-[2px] top-[245px] w-[2.5px] h-[60px] bg-gradient-to-b from-[#4a4a4a] via-[#2a2a2a] to-[#1f1f1f] rounded-l-md shadow-inner"></div>
            
            {/* Power button - Right side */}
            <div className="absolute -right-[2px] top-[185px] w-[2.5px] h-[75px] bg-gradient-to-b from-[#4a4a4a] via-[#2a2a2a] to-[#1f1f1f] rounded-r-md shadow-inner"></div>
            
            {/* Inner bezel */}
            <div className="absolute inset-[3px] bg-black rounded-[2.8rem] shadow-[inset_0_3px_12px_rgba(0,0,0,0.95)]">
              {/* Dynamic Island */}
              <div className="absolute top-[11px] left-1/2 -translate-x-1/2 w-[95px] h-[28px] bg-black rounded-[1.8rem] z-20 shadow-[0_3px_10px_rgba(0,0,0,0.8)] flex items-center justify-center gap-3">
                {/* Front Camera */}
                <div className="w-[8px] h-[8px] bg-gradient-radial from-[#1a1a3e] to-[#0a0a1e] rounded-full ring-[1px] ring-white/15 shadow-inner"></div>
                {/* Face ID Sensors */}
                <div className="flex gap-1">
                  <div className="w-[2px] h-[2px] bg-[#5a5a7a] rounded-full shadow-sm"></div>
                  <div className="w-[2px] h-[2px] bg-[#5a5a7a] rounded-full shadow-sm"></div>
                </div>
              </div>
              
              {/* Screen Content */}
              <div className="absolute inset-[7px] bg-white rounded-[2.5rem] overflow-hidden shadow-[inset_0_0_15px_rgba(0,0,0,0.1)]">
                {/* Status Bar */}
                <div className="absolute top-0 left-0 right-0 h-[44px] bg-white z-30 px-7 pt-[12px] flex items-start justify-between">
                  <span className="text-[13px] font-semibold text-text-primary tracking-tight leading-none">{currentTime}</span>
                  <div className="flex items-center gap-[5px]">
                    {/* Cellular Signal */}
                    <div className="flex gap-[2px] items-end">
                      <div className="w-[2.5px] h-[4px] bg-text-primary rounded-full"></div>
                      <div className="w-[2.5px] h-[5px] bg-text-primary rounded-full"></div>
                      <div className="w-[2.5px] h-[7px] bg-text-primary rounded-full"></div>
                      <div className="w-[2.5px] h-[8px] bg-text-primary rounded-full"></div>
                    </div>
                    {/* WiFi */}
                    <svg className="w-[14px] h-[14px] text-text-primary" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z"/>
                    </svg>
                    {/* Battery */}
                    <div className="flex items-center gap-[2px]">
                      <div className="w-[20px] h-[10px] border-[1.5px] border-text-primary rounded-[2.5px] relative flex items-center">
                        <div className="absolute inset-[1.5px] bg-text-primary rounded-[1.5px]"></div>
                      </div>
                      <div className="w-[2px] h-[4px] bg-text-primary rounded-r-[1px]"></div>
                    </div>
                  </div>
                </div>

                {/* App Content with smooth transitions */}
                <div className="absolute top-[44px] left-0 right-0 bottom-[10px] bg-gradient-to-b from-white to-gray-50/50 overflow-hidden">
                  <motion.div
                    key={currentScreen}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.4, ease: 'easeInOut' }}
                    className="h-full"
                  >
                    {renderScreen()}
                  </motion.div>
                </div>

                {/* Home Indicator */}
                <div className="absolute bottom-[8px] left-1/2 -translate-x-1/2 w-[110px] h-[4px] bg-text-primary/25 rounded-full shadow-sm"></div>
              </div>
            </div>
          </div>

          {/* Screen reflection effect - Glass-like */}
          <div className="absolute inset-[3px] rounded-[2.8rem] overflow-hidden pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-br from-white/8 via-transparent to-transparent opacity-50"></div>
          </div>
        </div>

        {/* Realistic shadow beneath device */}
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-[60%] h-4 bg-black/20 blur-xl rounded-full -z-20"></div>
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
      description: 'AI-powered appointment booking that finds the perfect time for you and your doctor',
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: 'Location-Based Search',
      description: 'Find nearby clinics and hospitals with real-time availability',
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Secure & Private',
      description: 'Bank-level encryption keeps your medical data safe and confidential',
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Instant Confirmations',
      description: 'Get immediate booking confirmations via SMS and email',
    },
  ];

  const stats = [
    { value: '50K+', label: 'Active Patients' },
    { value: '2,500+', label: 'Healthcare Providers' },
    { value: '98%', label: 'Satisfaction Rate' },
    { value: '24/7', label: 'Support Available' },
  ];

  const testimonials = [
    {
      name: 'Sarah Mitchell',
      role: 'Patient',
      avatar: 'SM',
      content: 'MediFlow made booking appointments so much easier. I found a great doctor near me in minutes!',
      rating: 5,
    },
    {
      name: 'Dr. James Chen',
      role: 'Cardiologist',
      avatar: 'JC',
      content: 'As a healthcare provider, MediFlow has streamlined my practice. Fewer no-shows and better patient management.',
      rating: 5,
    },
    {
      name: 'Emily Rodriguez',
      role: 'Working Professional',
      avatar: 'ER',
      content: 'The mobile app is incredible. I can book appointments during my commute without any hassle.',
      rating: 5,
    },
  ];

  const partners = ['Apollo', 'Max Healthcare', 'Fortis', 'Medanta', 'AIIMS', 'Manipal'];

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          scrolled ? 'bg-white shadow-sm' : 'bg-black/30 backdrop-blur-md'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className={`w-8 h-8 ${scrolled ? 'text-primary-teal' : 'text-white'}`} />
            <span className={`text-2xl font-bold ${scrolled ? 'text-primary-teal' : 'text-white'}`}>
              MediFlow
            </span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <a 
              href="#features" 
              className={`text-sm font-medium transition-colors ${
                scrolled 
                  ? 'text-text-secondary hover:text-text-primary' 
                  : 'text-white/90 hover:text-white'
              }`}
            >
              Features
            </a>
            <a 
              href="#how-it-works" 
              className={`text-sm font-medium transition-colors ${
                scrolled 
                  ? 'text-text-secondary hover:text-text-primary' 
                  : 'text-white/90 hover:text-white'
              }`}
            >
              How It Works
            </a>
            <a 
              href="#testimonials" 
              className={`text-sm font-medium transition-colors ${
                scrolled 
                  ? 'text-text-secondary hover:text-text-primary' 
                  : 'text-white/90 hover:text-white'
              }`}
            >
              Testimonials
            </a>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/login')}
              className={`text-sm font-medium transition-colors ${
                scrolled 
                  ? 'text-text-primary hover:text-primary-teal' 
                  : 'text-white hover:text-primary-green'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/register')}
              className={`px-6 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                scrolled
                  ? 'bg-primary-teal text-white hover:bg-primary-dark-teal'
                  : 'bg-white text-primary-teal hover:bg-white/90'
              }`}
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen overflow-hidden">
        {/* Full Background Google Map */}
        <div className="absolute inset-0 z-0">
          <GoogleMapComponent />
        </div>

        {/* Lighter Dark Overlay for better map visibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/30 z-10" />

        {/* Content */}
        <div className="relative z-20 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-6 w-full">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Side - Text */}
              <div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-green/20 backdrop-blur-sm rounded-full mb-6 border border-primary-green/30">
                    <div className="w-2 h-2 bg-primary-green rounded-full animate-pulse" />
                    <span className="text-sm font-medium text-white">2,500+ doctors available</span>
                  </div>
                  
                  <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight drop-shadow-lg">
                    Healthcare Made{' '}
                    <span className="text-primary-green">Simple</span>
                  </h1>
                  
                  <p className="text-lg text-white/90 mb-8 leading-relaxed drop-shadow-md">
                    Book appointments with top doctors near you in seconds. No more waiting on hold or missed calls. 
                    Healthcare that fits your schedule.
                  </p>

                  <div className="flex flex-wrap gap-4 mb-12">
                    <button
                      onClick={() => navigate('/register')}
                      className="px-8 py-4 bg-primary-teal text-white font-semibold rounded-xl hover:bg-primary-dark-teal transition-all hover:shadow-2xl flex items-center gap-2 shadow-xl"
                    >
                      Book Appointment
                      <ArrowRight className="w-5 h-5" />
                    </button>
                    <button className="px-8 py-4 bg-white/20 backdrop-blur-md text-white font-semibold rounded-xl hover:bg-white/30 transition-colors border border-white/30">
                      Watch Demo
                    </button>
                  </div>

                  <div className="flex items-center gap-8">
                    {['Instant Booking', 'Verified Doctors', '24/7 Support'].map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-primary-green drop-shadow-lg" />
                        <span className="text-sm font-medium text-white drop-shadow-md">{item}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* Right Side - iPhone Mockup overlapping the map */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex justify-center relative z-30"
              >
                <div className="drop-shadow-2xl">
                  <IPhoneMockup />
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
        >
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs text-white/80 uppercase tracking-wider">Scroll Down</span>
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center pt-2"
            >
              <div className="w-1 h-2 bg-white/70 rounded-full" />
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-primary-secondary">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-4xl font-bold text-primary-teal mb-2">{stat.value}</div>
                <div className="text-sm text-text-secondary">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-text-primary mb-4">
              Everything You Need for Better Healthcare
            </h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              Modern tools designed to make healthcare accessible, efficient, and stress-free
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="p-6 bg-white border border-border rounded-2xl hover:shadow-lg transition-all"
              >
                <div className="w-12 h-12 bg-primary-teal/10 rounded-xl flex items-center justify-center mb-4 text-primary-teal">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">{feature.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-6 bg-primary-secondary">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-text-primary mb-4">How MediFlow Works</h2>
            <p className="text-lg text-text-secondary">Three simple steps to better healthcare</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Search', desc: 'Find doctors by specialty, location, or insurance' },
              { step: '02', title: 'Book', desc: 'Choose your preferred date and time slot' },
              { step: '03', title: 'Visit', desc: 'Attend your appointment and get the care you need' },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="text-6xl font-bold text-primary-teal/20 mb-4">{item.step}</div>
                <h3 className="text-2xl font-bold text-text-primary mb-2">{item.title}</h3>
                <p className="text-text-secondary">{item.desc}</p>
                {idx < 2 && (
                  <ArrowRight className="hidden md:block absolute top-8 -right-4 w-8 h-8 text-primary-teal/30" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-text-primary mb-4">Loved by Thousands</h2>
            <p className="text-lg text-text-secondary">See what our users have to say</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="p-6 bg-white border border-border rounded-2xl"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-warning text-warning" />
                  ))}
                </div>
                <p className="text-text-secondary mb-6 leading-relaxed">"{testimonial.content}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-teal text-white flex items-center justify-center font-semibold text-sm">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-text-primary text-sm">{testimonial.name}</div>
                    <div className="text-text-secondary text-xs">{testimonial.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Partners */}
      <section className="py-16 bg-primary-secondary">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-text-secondary mb-8">Trusted by leading healthcare providers</p>
          <div className="flex flex-wrap justify-center items-center gap-12">
            {partners.map((partner, idx) => (
              <div key={idx} className="text-2xl font-bold text-text-primary/30">
                {partner}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-text-primary mb-6">
              Ready to Experience Better Healthcare?
            </h2>
            <p className="text-lg text-text-secondary mb-8">
              Join thousands of patients who've made healthcare simple with MediFlow
            </p>
            <button
              onClick={() => navigate('/register')}
              className="px-10 py-4 bg-primary-teal text-white font-semibold rounded-xl hover:bg-primary-dark-teal transition-all hover:shadow-lg inline-flex items-center gap-2"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-text-primary text-white py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-6 h-6" />
                <span className="text-xl font-bold">MediFlow</span>
              </div>
              <p className="text-sm text-gray-400">
                Making healthcare accessible for everyone, everywhere.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-white transition-colors">HIPAA</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            <p>© 2026 MediFlow. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
