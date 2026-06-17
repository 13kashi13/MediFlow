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
import BorderGlow from '../components/ui/BorderGlow';

// Google Maps Component
const GoogleMapComponent: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [selectedClinic, setSelectedClinic] = useState<any>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

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
    
    if (!API_KEY) {
      console.error('Google Maps API key not found');
      return;
    }

    // Check if script is already loaded
    if ((window as any).google && (window as any).google.maps) {
      setIsMapLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => setIsMapLoaded(true);
    document.head.appendChild(script);

    return () => {
      // Cleanup if needed
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || !isMapLoaded) return;

    try {
      // Initialize map with dark mode style
      const map = new (window as any).google.maps.Map(mapRef.current, {
        center: { lat: 18.5204, lng: 73.8567 },
        zoom: 12,
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
        });
      });
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }, [isMapLoaded]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
};

// iPhone Mockup Component
const IPhoneMockup: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
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
      
      setCurrentTime(`${hour12}:${minutes.toString().padStart(2, '0')} ${ampm}`);
      
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

  const steps = [
    {
      title: 'Select Doctor',
      content: (
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
            <div className="w-12 h-12 rounded-full bg-primary-teal/10 flex items-center justify-center">
              <Users className="w-6 h-6 text-primary-teal" />
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary">Dr. Sarah Johnson</p>
              <p className="text-xs text-text-secondary">Cardiologist</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Choose Slot',
      content: (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            {['10:00', '11:30', '2:00', '3:30', '4:00', '5:30'].map((time, idx) => (
              <div
                key={idx}
                className={`p-2 text-center rounded-lg border shadow-sm ${
                  idx === 1
                    ? 'bg-primary-teal text-white border-primary-teal shadow-md'
                    : 'bg-white border-border'
                }`}
              >
                <p className="text-xs font-medium">{time}</p>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: 'Confirm',
      content: (
        <div className="space-y-3">
          <div className="p-3 bg-white rounded-lg space-y-2 shadow-sm">
            <div className="flex justify-between text-xs">
              <span className="text-text-secondary">Doctor</span>
              <span className="font-medium">Dr. Sarah Johnson</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-text-secondary">Date</span>
              <span className="font-medium">{currentDate}, 11:30 AM</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-text-secondary">Fee</span>
              <span className="font-medium">₹1,500</span>
            </div>
          </div>
          <button className="w-full py-3 bg-primary-teal text-white rounded-xl font-medium text-sm shadow-lg hover:shadow-xl transition-shadow">
            Confirm Appointment
          </button>
        </div>
      ),
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <BorderGlow
      edgeSensitivity={30}
      glowColor="111 207 151"
      backgroundColor="transparent"
      borderRadius={48}
      glowRadius={50}
      glowIntensity={1.2}
      coneSpread={25}
      animated={false}
      colors={['#6FCF97', '#2FA084', '#38bdf8']}
      fillOpacity={0.3}
      className="w-fit"
    >
      <div className="relative">
        {/* iPhone Frame with enhanced shadow */}
        <div className="relative w-[280px] h-[570px] bg-gradient-to-b from-gray-800 to-black rounded-[3rem] p-3 shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
          {/* Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-6 bg-black rounded-b-3xl z-10" />
          
          {/* Screen */}
          <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden shadow-inner">
            <div className="h-full flex flex-col bg-gradient-to-b from-gray-50 to-white">
              {/* Status Bar with Real Time */}
              <div className="flex justify-between items-center px-6 pt-8 pb-4 bg-white">
                <span className="text-xs font-semibold text-text-primary">{currentTime}</span>
                <div className="flex gap-1 items-center">
                  <div className="flex gap-0.5">
                    <div className="w-1 h-2 bg-text-primary rounded-full"></div>
                    <div className="w-1 h-3 bg-text-primary rounded-full"></div>
                    <div className="w-1 h-3.5 bg-text-primary rounded-full"></div>
                    <div className="w-1 h-4 bg-text-primary rounded-full"></div>
                  </div>
                  <svg className="w-5 h-5 text-text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2H6zm4 14a1 1 0 100-2 1 1 0 000 2z" />
                  </svg>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 px-4 pb-6">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="h-full"
                >
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-bold text-text-primary">
                        {steps[currentStep].title}
                      </h3>
                      <span className="text-xs text-text-secondary">{currentDate}</span>
                    </div>
                    <div className="flex gap-1">
                      {steps.map((_, idx) => (
                        <div
                          key={idx}
                          className={`h-1 rounded-full flex-1 transition-all ${
                            idx === currentStep ? 'bg-primary-teal' : 'bg-border'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  {steps[currentStep].content}
                </motion.div>
              </div>
            </div>
          </div>
          
          {/* Home Indicator */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/30 rounded-full" />
        </div>

        {/* Glow effect */}
        <div className="absolute inset-0 bg-primary-teal/20 blur-3xl rounded-full -z-10 animate-pulse" />
      </div>
    </BorderGlow>
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

        {/* Dark Overlay for better text readability */}
        <div className="absolute inset-0 bg-black/40 z-10" />

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
