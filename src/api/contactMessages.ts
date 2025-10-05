// Mock data - in a real app, this would be API calls to your backend
const contactMessages = [
  {
    id: '1',
    name: 'Mohamed Ali',
    email: 'mohamed@example.com',
    subject: 'Question about Quran courses',
    message: 'I would like to know more about your advanced Tajweed program. What are the prerequisites for joining?',
    status: 'unread',
    receivedAt: new Date('2023-05-18T09:30:00'),
  },
  {
    id: '2',
    name: 'Aisha Khan',
    email: 'aisha@example.com',
    subject: 'Registration inquiry',
    message: 'How can I register my child for the weekend classes? What is the fee structure?',
    status: 'read',
    receivedAt: new Date('2023-05-17T14:15:00'),
  },
  {
    id: '3',
    name: 'Omar Farooq',
    email: 'omar@example.com',
    subject: 'Private lessons',
    message: 'I am interested in one-on-one Tajweed lessons. Do you have any qualified teachers available in the evenings?',
    status: 'replied',
    receivedAt: new Date('2023-05-16T11:20:00'),
  },
];

export const contactMessageService = {
  async getAll() {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...contactMessages]);
      }, 500);
    });
  },

  async getById(id: string) {
    // Simulate API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const message = contactMessages.find(msg => msg.id === id);
        if (message) {
          // Mark as read when fetched individually
          if (message.status === 'unread') {
            message.status = 'read';
          }
          resolve({ ...message });
        } else {
          reject(new Error('Message not found'));
        }
      }, 500);
    });
  },

  async markAsRead(id: string) {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        const message = contactMessages.find(msg => msg.id === id);
        if (message) {
          message.status = 'read';
          resolve({ ...message });
        }
      }, 500);
    });
  },

  async markAsReplied(id: string) {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        const message = contactMessages.find(msg => msg.id === id);
        if (message) {
          message.status = 'replied';
          resolve({ ...message });
        }
      }, 500);
    });
  },

  async delete(id: string) {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        const messageIndex = contactMessages.findIndex(msg => msg.id === id);
        if (messageIndex !== -1) {
          contactMessages.splice(messageIndex, 1);
        }
        resolve(true);
      }, 500);
    });
  },

  async create(data: Omit<typeof contactMessages[0], 'id' | 'receivedAt' | 'status'>) {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        const newMessage = {
          ...data,
          id: Math.random().toString(36).substr(2, 9),
          receivedAt: new Date(),
          status: 'unread',
        };
        contactMessages.unshift(newMessage);
        resolve(newMessage);
      }, 500);
    });
  },
};
