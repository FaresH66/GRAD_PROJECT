import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios, { AxiosError } from 'axios';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// Define types for guest, log, and API responses
interface Guest {
  id: number;
  resident_id: number;
  face_data_ref: string | null;
  license_plate: string | null;
  arrival_time: string | null;
  status: string;
  resident_name: string;
  log_time: string | null;
  event_type: string | null;
  details: string | null;
}

interface Log {
  id: number;
  user_id: number | null;
  user_name: string | null;
  event_type: string;
  log_time: string;
  details: string;
}

interface GuestsResponse {
  status: 'success' | 'error';
  guests: Guest[];
  message?: string;
}

interface LogsResponse {
  status: 'success' | 'error';
  logs: Log[];
  message?: string;
}

interface CreateUserResponse {
  status: 'success' | 'error';
  user_id?: number;
  message?: string;
}

interface LogoutResponse {
  status: 'success' | 'error';
  message?: string;
}

interface TrainFaceResponse {
  status: 'success' | 'error';
  message?: string;
}

const getBackendUrl = (endpoint: string) => {
  return process.env.NODE_ENV === 'development' ? endpoint : `https://your-backend-domain.com${endpoint}`; // Replace with deployed backend URL
};

const Admin: React.FC = () => {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [role, setRole] = useState<'admin' | 'resident' | 'gatekeeper'>('resident');
  const [licensePlate, setLicensePlate] = useState<string>('');
  const [faceUserId, setFaceUserId] = useState<string>('');
  const [faceFile, setFaceFile] = useState<File | null>(null);
  const [faceRole, setFaceRole] = useState<'resident' | 'guest'>('resident');
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  // Fetch guests and logs on mount
  useEffect(() => {
    const fetchGuests = async () => {
      try {
        const res = await axios.get<GuestsResponse>(getBackendUrl('/admin/guests'), {
          withCredentials: true,
        });
        if (res.data.status === 'success') {
          setGuests(res.data.guests);
        } else {
          setError(res.data.message || 'Failed to fetch guests');
        }
      } catch (err) {
        const axiosError = err as AxiosError<GuestsResponse>;
        setError(axiosError.response?.data?.message || 'Error fetching guests');
        console.error('Error fetching guests:', axiosError.response?.data || axiosError.message);
      }
    };

    const fetchLogs = async () => {
      try {
        const res = await axios.get<LogsResponse>(getBackendUrl('/admin/logs'), {
          withCredentials: true,
        });
        if (res.data.status === 'success') {
          setLogs(res.data.logs);
        } else {
          setError(res.data.message || 'Failed to fetch logs');
        }
      } catch (err) {
        const axiosError = err as AxiosError<LogsResponse>;
        setError(axiosError.response?.data?.message || 'Error fetching logs');
        console.error('Error fetching logs:', axiosError.response?.data || axiosError.message);
      }
    };

    fetchGuests();
    fetchLogs();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const userData = {
        name,
        email,
        password,
        role,
        license_plate: licensePlate || null,
      };

      const userRes = await axios.post<CreateUserResponse>(getBackendUrl('/admin/create_user'), userData, {
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' },
      });

      if (userRes.data.status !== 'success') {
        setError(userRes.data.message || 'Failed to create user');
        return;
      }

      // Reset form on success
      setName('');
      setEmail('');
      setPassword('');
      setRole('resident');
      setLicensePlate('');
    } catch (err) {
      const axiosError = err as AxiosError<CreateUserResponse>;
      setError(axiosError.response?.data?.message || 'Error creating user');
      console.error('Error creating user:', axiosError.response?.data || axiosError.message);
    }
  };

  const handleTrainFace = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!faceUserId || !faceFile) {
      setError('User ID and face image are required');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('face_image', faceFile);
      formData.append('user_id', faceUserId);
      formData.append('role', faceRole);

      const res = await axios.post<TrainFaceResponse>(getBackendUrl('/admin/train_face'), formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.status === 'success') {
        setFaceUserId('');
        setFaceFile(null);
        setFaceRole('resident');
      } else {
        setError(res.data.message || 'Failed to train face');
      }
    } catch (err) {
      const axiosError = err as AxiosError<TrainFaceResponse>;
      setError(axiosError.response?.data?.message || 'Error training face');
      console.error('Error training face:', axiosError.response?.data || axiosError.message);
    }
  };

  const handleLogout = async () => {
    try {
      const res = await axios.post<LogoutResponse>(getBackendUrl('/logout'), {}, {
        withCredentials: true,
      });
      if (res.data.status === 'success') {
        sessionStorage.clear();
        navigate('/');
      }
    } catch (err) {
      const axiosError = err as AxiosError<LogoutResponse>;
      setError(axiosError.response?.data?.message || 'Error logging out');
      console.error('Error logging out:', axiosError.response?.data || axiosError.message);
    }
  };

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
    exit: { opacity: 0, y: -50, transition: { duration: 0.4 } },
  };

  const inputVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5, delay: 0.2 } },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-6">
      <motion.div
        className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1350&q=80')] bg-cover bg-center opacity-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.1 }}
        transition={{ duration: 1 }}
      />
      <div className="relative z-10 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="flex justify-between items-center mb-8"
        >
          <h2 className="text-3xl font-bold text-white tracking-tight">Admin Dashboard</h2>
          <Button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105"
          >
            Logout
          </Button>
        </motion.div>

        {/* Create User Form */}
        <motion.div variants={cardVariants} initial="hidden" animate="visible">
          <Card className="shadow-2xl border border-gray-700 bg-gray-950/90 backdrop-blur-md mb-8">
            <CardHeader className="text-center">
              <h3 className="text-xl font-semibold text-white">Create New User</h3>
              <p className="text-gray-400 mt-2">Add a new user to the system</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateUser} className="space-y-6">
                {error && (
                  <div className="text-red-500 text-center animate-pulse">{error}</div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <motion.div variants={inputVariants} initial="hidden" animate="visible">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter name"
                      className="w-full bg-gray-800 text-white border-gray-700 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </motion.div>
                  <motion.div variants={inputVariants} initial="hidden" animate="visible">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                    <Input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter email"
                      className="w-full bg-gray-800 text-white border-gray-700 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </motion.div>
                  <motion.div variants={inputVariants} initial="hidden" animate="visible">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                    <Input
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      type="password"
                      placeholder="Enter password"
                      className="w-full bg-gray-800 text-white border-gray-700 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </motion.div>
                  <motion.div variants={inputVariants} initial="hidden" animate="visible">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Role</label>
                    <Select
                      value={role}
                      onValueChange={(value: string) => setRole(value as 'admin' | 'resident' | 'gatekeeper')}
                    >
                      <SelectTrigger className="w-full bg-gray-800 text-white border-gray-700 focus:ring-blue-500">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 text-white border-gray-700">
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="resident">Resident</SelectItem>
                        <SelectItem value="gatekeeper">Gatekeeper</SelectItem>
                      </SelectContent>
                    </Select>
                  </motion.div>
                  <motion.div variants={inputVariants} initial="hidden" animate="visible">
                    <label className="block text-sm font-medium text-gray-300 mb-2">License Plate (for Residents)</label>
                    <Input
                      value={licensePlate}
                      onChange={(e) => setLicensePlate(e.target.value)}
                      placeholder="Enter license plate"
                      className="w-full bg-gray-800 text-white border-gray-700 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </motion.div>
                </div>
                <motion.div variants={inputVariants} initial="hidden" animate="visible">
                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-all duration-300 transform hover:scale-105"
                  >
                    Create User
                  </Button>
                </motion.div>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Train Face Form */}
        <motion.div variants={cardVariants} initial="hidden" animate="visible">
          <Card className="shadow-2xl border border-gray-700 bg-gray-950/90 backdrop-blur-md mb-8">
            <CardHeader className="text-center">
              <h3 className="text-xl font-semibold text-white">Train Face</h3>
              <p className="text-gray-400 mt-2">Upload a face image for recognition</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleTrainFace} className="space-y-6">
                {error && (
                  <div className="text-red-500 text-center animate-pulse">{error}</div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <motion.div variants={inputVariants} initial="hidden" animate="visible">
                    <label className="block text-sm font-medium text-gray-300 mb-2">User ID</label>
                    <Input
                      value={faceUserId}
                      onChange={(e) => setFaceUserId(e.target.value)}
                      placeholder="Enter user ID"
                      className="w-full bg-gray-800 text-white border-gray-700 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </motion.div>
                  <motion.div variants={inputVariants} initial="hidden" animate="visible">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Role</label>
                    <Select
                      value={faceRole}
                      onValueChange={(value: string) => setFaceRole(value as 'resident' | 'guest')}
                    >
                      <SelectTrigger className="w-full bg-gray-800 text-white border-gray-700 focus:ring-blue-500">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 text-white border-gray-700">
                        <SelectItem value="resident">Resident</SelectItem>
                        <SelectItem value="guest">Guest</SelectItem>
                      </SelectContent>
                    </Select>
                  </motion.div>
                  <motion.div variants={inputVariants} initial="hidden" animate="visible" className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Face Image</label>
                    <Input
                      type="file"
                      onChange={(e) => setFaceFile(e.target.files ? e.target.files[0] : null)}
                      accept="image/*"
                      className="w-full bg-gray-800 text-white border-gray-700 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </motion.div>
                </div>
                <motion.div variants={inputVariants} initial="hidden" animate="visible">
                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-all duration-300 transform hover:scale-105"
                  >
                    Train Face
                  </Button>
                </motion.div>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Guests Table */}
        <motion.div variants={cardVariants} initial="hidden" animate="visible">
          <Card className="shadow-2xl border border-gray-700 bg-gray-950/90 backdrop-blur-md mb-8">
            <CardHeader className="text-center">
              <h3 className="text-xl font-semibold text-white">All Guests</h3>
              <p className="text-gray-400 mt-2">List of all guests in the system</p>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table className="min-w-full">
                  <TableHeader>
                    <TableRow className="border-gray-700">
                      <TableHead className="text-gray-300">ID</TableHead>
                      <TableHead className="text-gray-300">Resident</TableHead>
                      <TableHead className="text-gray-300">License Plate</TableHead>
                      <TableHead className="text-gray-300">Arrival Time</TableHead>
                      <TableHead className="text-gray-300">Status</TableHead>
                      <TableHead className="text-gray-300">Log Time</TableHead>
                      <TableHead className="text-gray-300">Event</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {guests.map((guest) => (
                      <TableRow key={guest.id} className="border-gray-700 hover:bg-gray-800">
                        <TableCell className="text-white">{guest.id}</TableCell>
                        <TableCell className="text-white">{guest.resident_name}</TableCell>
                        <TableCell className="text-white">{guest.license_plate || 'N/A'}</TableCell>
                        <TableCell className="text-white">{guest.arrival_time || 'N/A'}</TableCell>
                        <TableCell className="text-white">{guest.status}</TableCell>
                        <TableCell className="text-white">{guest.log_time || 'N/A'}</TableCell>
                        <TableCell className="text-white">{guest.event_type || 'N/A'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Logs Table */}
        <motion.div variants={cardVariants} initial="hidden" animate="visible">
          <Card className="shadow-2xl border border-gray-700 bg-gray-950/90 backdrop-blur-md">
            <CardHeader className="text-center">
              <h3 className="text-xl font-semibold text-white">System Logs</h3>
              <p className="text-gray-400 mt-2">All system events and activities</p>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table className="min-w-full">
                  <TableHeader>
                    <TableRow className="border-gray-700">
                      <TableHead className="text-gray-300">ID</TableHead>
                      <TableHead className="text-gray-300">User</TableHead>
                      <TableHead className="text-gray-300">Event Type</TableHead>
                      <TableHead className="text-gray-300">Log Time</TableHead>
                      <TableHead className="text-gray-300">Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => (
                      <TableRow key={log.id} className="border-gray-700 hover:bg-gray-800">
                        <TableCell className="text-white">{log.id}</TableCell>
                        <TableCell className="text-white">{log.user_name || 'N/A'}</TableCell>
                        <TableCell className="text-white">{log.event_type}</TableCell>
                        <TableCell className="text-white">{log.log_time}</TableCell>
                        <TableCell className="text-white">{log.details}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
            <CardFooter className="text-center text-gray-400 text-sm">
              <p>© 2025 Gatekeeper. All rights reserved.</p>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Admin;