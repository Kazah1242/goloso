import React, { useState } from 'react';
import './NotificationModal.css';
import { sendNotification, saveEmail } from '../api/emailApi';
import loadingJson from '../assets/public/loading/loading.json';
import Lottie from 'lottie-react';

interface NotificationModalProps {
  visible: boolean;
  onClose: () => void;
}

const NotificationModal: React.FC<NotificationModalProps> = ({ visible, onClose }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!visible) return null;

  const handleAgree = () => {
    if (!email) {
      setError(true);
      setTimeout(() => {
        setError(false);
      }, 300);
      return;
    }

    setSuccess(false);
    setIsLoading(true);
    setTimeout(() => {
      handleSendNotification(email);
    }, 5000);
  };

  const handleSendNotification = async (email: string) => {
    try {
      await sendNotification(email);
      const result = await saveEmail(email);
      console.log(result);
      setSuccess(true);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="notification-modal">
      <p className="notification-text">Хотите ли вы подписаться на уведомления о начале голосования?</p>
      <input 
        type="email" 
        placeholder="Введите ваш email" 
        value={email} 
        onChange={(e) => setEmail(e.target.value)}
        className={`email-input ${error ? 'error' : success ? 'success' : ''}`}
        required
      />
      <button className="modal-button" onClick={onClose} disabled={isLoading} style={{ backgroundColor: isLoading ? 'gray' : '' }}>
        Закрыть
      </button>
      <button 
        className="modal-button agree-button" 
        onClick={handleAgree} 
        disabled={isLoading} 
        style={{ backgroundColor: isLoading ? 'gray' : '' }}
      >
        Согласен
      </button>
      {isLoading && (
        <div className="loading-overlay">
          <Lottie animationData={loadingJson} loop={true} />
        </div>
      )}
      {success && <p className="success-message" style={{ color: 'green' }}>Успешно отправлено!</p>}
    </div>
  );
};

export default NotificationModal; 