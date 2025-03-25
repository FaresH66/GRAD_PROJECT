import { useState } from 'react';
import axios from 'axios';

interface ValidateResponse {
  status: string;
  resident?: string;
  message?: string;
}

const Gatekeeper: React.FC = () => {
  const [faceFile, setFaceFile] = useState<File | null>(null);
  const [plateFile, setPlateFile] = useState<File | null>(null);
  const [result, setResult] = useState<string>('');

  const handleValidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!faceFile || !plateFile) {
      setResult('Please upload both images');
      return;
    }

    const formData = new FormData();
    formData.append('face', faceFile);
    formData.append('plate', plateFile);

    try {
      const res = await axios.post<ValidateResponse>('http://localhost:5000/gatekeeper/validate', formData);
      setResult(res.data.status === 'success' ? `Entry granted for ${res.data.resident}` : 'Entry denied');
    } catch (err) {
      setResult('Entry denied');
    }
    setFaceFile(null);
    setPlateFile(null);
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-3xl font-bold mb-6">Gatekeeper Dashboard</h2>
      <form onSubmit={handleValidate} className="bg-white p-6 rounded shadow-md space-y-4">
        <h3 className="text-xl font-semibold">Validate Entry</h3>
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
          <label className="block text-gray-700 mb-2">License Plate Image</label>
          <input
            type="file"
            onChange={(e) => setPlateFile(e.target.files ? e.target.files[0] : null)}
            accept="image/*"
            className="w-full p-2 border rounded"
          />
        </div>
        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">
          Validate
        </button>
      </form>
      {result && <p className="mt-4 text-center text-lg">{result}</p>}
    </div>
  );
};

export default Gatekeeper;