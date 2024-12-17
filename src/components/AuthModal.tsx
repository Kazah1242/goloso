import React, { useState, useRef, useEffect } from 'react';
import './AuthModal.css';
import { useAuth } from '../contexts/AuthContext';
import { authApi } from '../api/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  returnUrl?: string;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, returnUrl }) => {
  const [email, setEmail] = useState(() => localStorage.getItem('auth_email') || '');
  const [showCodeInput, setShowCodeInput] = useState(() => localStorage.getItem('auth_showCodeInput') === 'true');
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const codeInputs = useRef<(HTMLInputElement | null)[]>([]);
  const { login } = useAuth();

  useEffect(() => {
    localStorage.setItem('auth_email', email);
    localStorage.setItem('auth_showCodeInput', String(showCodeInput));
  }, [email, showCodeInput]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const response = await authApi.requestCode(email);
    
    if (response.success) {
      setShowCodeInput(true);
      localStorage.setItem('auth_codeExpiry', String(Date.now() + 5 * 60 * 1000));
    } else {
      setError(response.message || 'Произошла ошибка');
    }
    
    setIsLoading(false);
  };

  useEffect(() => {
    const checkCodeExpiry = () => {
      const expiryTime = localStorage.getItem('auth_codeExpiry');
      if (expiryTime && Date.now() > Number(expiryTime)) {
        setShowCodeInput(false);
        localStorage.removeItem('auth_codeExpiry');
        setError('Время действия кода истекло. Запросите новый код.');
      }
    };

    const timer = setInterval(checkCodeExpiry, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(0, 1);
    if (!/^\d*$/.test(value)) return;

    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);

    if (value !== '' && index < 5) {
      codeInputs.current[index + 1]?.focus();
    }
  };

  const handleVerifyCode = async () => {
    const code = verificationCode.join('');
    if (code.length !== 6) {
      setError('Введите полный код');
      return;
    }

    setIsLoading(true);
    setError('');

    const response = await authApi.verifyCode(email, code);

    if (response.success) {
      await login(email, code);
      onClose();
      if (returnUrl) {
        window.location.href = returnUrl;
      }
    } else {
      setError(response.message || 'Произошла ошибка');
    }

    setIsLoading(false);
  };

  const handleResendCode = async () => {
    setIsLoading(true);
    setError('');
    const response = await authApi.requestCode(email);
    
    if (response.success) {
      localStorage.setItem('auth_codeExpiry', String(Date.now() + 5 * 60 * 1000));
      setError('Новый код отправлен');
    } else {
      setError(response.message || 'Ошибка при отправке кода');
    }
    setIsLoading(false);
  };

  const CodeTimer = () => {
    const [timeLeft, setTimeLeft] = useState<number>(0);

    useEffect(() => {
      const expiryTime = localStorage.getItem('auth_codeExpiry');
      if (expiryTime) {
        const updateTimer = () => {
          const remaining = Math.max(0, Number(expiryTime) - Date.now());
          setTimeLeft(Math.floor(remaining / 1000));
        };

        updateTimer();
        const timer = setInterval(updateTimer, 1000);
        return () => clearInterval(timer);
      }
    }, []);

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    return (
      <div className="auth-modal__timer">
        Код действителен: {minutes}:{seconds.toString().padStart(2, '0')}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="auth-modal-overlay">
      <div className="auth-modal">
        <button className="auth-modal__close" onClick={onClose}>×</button>
        <h2>Авторизация для голосования</h2>
        
        {!showCodeInput ? (
          <div>
            <p className="auth-modal__instruction">
              Введите ваш email для получения кода подтверждения
            </p>
            <form onSubmit={handleEmailSubmit}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Введите ваш email"
                required
                className="email-input"
                disabled={isLoading}
              />
              <button 
                type="submit" 
                className="modal-button"
                disabled={isLoading}
              >
                {isLoading ? 'Отправка...' : 'Получить код'}
              </button>
            </form>
          </div>
        ) : (
          <div>
            <p className="auth-modal__instruction">
              Введите код, отправленный на {email}
            </p>
            <CodeTimer />
            <div className="verification-code-inputs">
              {verificationCode.map((digit, index) => (
                <input
                  key={index}
                  ref={el => codeInputs.current[index] = el}
                  type="text"
                  value={digit}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  className="code-input"
                  maxLength={1}
                  disabled={isLoading}
                />
              ))}
            </div>
            {error && <p className="auth-modal__error">{error}</p>}
            <button 
              onClick={handleVerifyCode}
              className="modal-button"
              disabled={isLoading || verificationCode.join('').length !== 6}
            >
              {isLoading ? 'Проверка...' : 'Подтвердить'}
            </button>
            <button 
              onClick={handleResendCode}
              className="modal-button modal-button--secondary"
              disabled={isLoading}
            >
              Отправить код повторно
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthModal;