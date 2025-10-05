// Mock data - in a real app, this would be API calls to your backend
const trialRequests = [
  {
    id: '1',
    name: 'Ahmed Khan',
    email: 'ahmed@example.com',
    phone: '+1234567890',
    course: 'Quran for Beginners',
    message: 'I would like to learn proper Tajweed',
    status: 'pending',
    requestedAt: new Date('2023-05-15T10:30:00'),
  },
  {
    id: '2',
    name: 'Fatima Ali',
    email: 'fatima@example.com',
    phone: '+1987654321',
    course: 'Advanced Tajweed',
    message: 'Looking for advanced level classes',
    status: 'completed',
    requestedAt: new Date('2023-05-10T14:45:00'),
  },
  {
    id: '3',
    name: 'Ibrahim Mohamed',
    email: 'ibrahim@example.com',
    phone: '+1122334455',
    course: 'Quran Memorization',
    message: 'Interested in Hifz program for my son',
    status: 'pending',
    requestedAt: new Date('2023-05-05T09:15:00'),
  },
];

export const trialRequestService = {
  async getAll() {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...trialRequests]);
      }, 500);
    });
  },

  async getById(id: string) {
    // Simulate API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const request = trialRequests.find(req => req.id === id);
        if (request) {
          resolve({ ...request });
        } else {
          reject(new Error('Trial request not found'));
        }
      }, 500);
    });
  },

  async updateStatus(id: string, status: string) {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        const requestIndex = trialRequests.findIndex(req => req.id === id);
        if (requestIndex !== -1) {
          trialRequests[requestIndex].status = status;
          resolve({ ...trialRequests[requestIndex] });
        }
      }, 500);
    });
  },

  async delete(id: string) {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        const requestIndex = trialRequests.findIndex(req => req.id === id);
        if (requestIndex !== -1) {
          trialRequests.splice(requestIndex, 1);
        }
        resolve(true);
      }, 500);
    });
  },

  async create(data: Omit<typeof trialRequests[0], 'id' | 'requestedAt' | 'status'>) {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        const newRequest = {
          ...data,
          id: Math.random().toString(36).substr(2, 9),
          requestedAt: new Date(),
          status: 'pending',
        };
        trialRequests.unshift(newRequest);
        resolve(newRequest);
      }, 500);
    });
  },
};
