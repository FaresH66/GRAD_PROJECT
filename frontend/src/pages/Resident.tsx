import { useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';
import axios from 'axios';

interface Guest {
  id: number;
  face_data_ref: string | null;
  license_plate: string | null;
  invitation_start: string | null;
  status: string;
}

interface Notification {
  guest_id: number;
  plate: string;
  time: string;
}

const Resident: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [faceFile, setFaceFile] = useState<File | null>(null);
  const [plate, setPlate] = useState<string>('');
  const [invitationStart, setInvitationStart] = useState<string>('');

  useEffect(() => {
    const userId = sessionStorage.getItem('user_id');
    const socket: Socket = io('http://localhost:5000', { query: { user_id: userId || '' } });
    socket.on('guest_arrival', (data: Notification) => {
      setNotifications((prev) => [...prev, data]);
    });

    const fetchGuests = async () => {
      try {
        const res = await axios.get<{ status: string; guests: Guest[] }>('http://localhost:5000/resident/guests');
        if (res.data.status === 'success') {
          setGuests(res.data.guests);
        }
      } catch (err) {
        console.error('Error fetching guests:', err);
      }
    };
    fetchGuests();

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleAddGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    if (faceFile) formData.append('face', faceFile);
    if (plate) formData.append('plate', plate);
    if (invitationStart) formData.append('invitation_start', invitationStart);

    try {
      await axios.post<{ status: string }>('http://localhost:5000/resident/add_guest', formData);
      setFaceFile(null);
      setPlate('');
      setInvitationStart('');
      const res = await axios.get<{ status: string; guests: Guest[] }>('http://localhost:5000/resident/guests');
      if (res.data.status === 'success') {
        setGuests(res.data.guests);
      }
    } catch (err) {
      console.error('Error adding guest:', err);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">Resident Dashboard</h2>

      <form onSubmit={handleAddGuest} className="bg-white p-6 rounded shadow-md mb-8 space-y-4">
        <h3 className="text-xl font-semibold">Add Guest</h3>
        <div>
          <label className="block text-gray-700 mb-2">Face Image</label>
          <input
            type="file"
            onChange={(e) => setFaceFile(e.target.files ? e.target.files[0] : null)}
            accept="image/*"
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-2">License Plate</label>
          <input
            value={plate}
            onChange={(e) => setPlate(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Enter license plate"
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-2">Invitation Start</label>
          <input
            type="datetime-local"
            value={invitationStart}
            onChange={(e) => setInvitationStart(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">
          Add Guest
        </button>
      </form>

      <h3 className="text-xl font-semibold mb-4">My Guests</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead>
            <tr>
              <th className="p-2 border">ID</th>
              <th className="p-2 border">License Plate</th>
              <th className="p-2 border">Invitation Start</th>
              <th className="p-2 border">Status</th>
            </tr>
          </thead>
          <tbody>
            {guests.map((guest) => (
              <tr key={guest.id}>
                <td className="p-2 border">{guest.id}</td>
                <td className="p-2 border">{guest.license_plate || 'N/A'}</td>
                <td className="p-2 border">{guest.invitation_start || 'N/A'}</td>
                <td className="p-2 border">{guest.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="text-xl font-semibold mt-8 mb-4">Notifications</h3>
      <div className="space-y-2">
        {notifications.map((n, i) => (
          <p key={i} className="p-2 bg-gray-100 rounded">
            Guest with plate {n.plate} arrived at {n.time}
          </p>
        ))}
      </div>
    </div>
  );
};

export default Resident;