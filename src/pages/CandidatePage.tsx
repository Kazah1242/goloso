import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { candidatesData } from '../data/candidateData';
import './CandidatePage.css';
import chevronLeft from '../assets/public/Chevron-left/chevron-left.svg';
import chevronRight from '../assets/public/Chevron-right/chevron-right.svg';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from '../components/AuthModal';
import { sendVote, checkVote } from '../api/voteService';

const CandidatePage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [votedCandidateId, setVotedCandidateId] = useState<number | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const currentId = Number(id);
  const candidateDetails = candidatesData[currentId];

  // Проверка статуса голосования при монтировании компонента
  useEffect(() => {
    const fetchVoteStatus = async () => {
      if (isAuthenticated && user) {
        try {
          const voteStatus = await checkVote(user.email);
          if (voteStatus.hasVoted) {
            setHasVoted(true);
            setVotedCandidateId(voteStatus.votedCandidateId || null);
          }
        } catch (error) {
          console.error('Ошибка при получении статуса голосования:', error);
          setErrorMessage('Не удалось получить статус голосования');
        }
      }
    };

    fetchVoteStatus();
  }, [isAuthenticated, user]);

  const handleNavigate = (direction: 'prev' | 'next') => {
    const newId = direction === 'prev' ? currentId - 1 : currentId + 1;
    if (newId >= 1 && newId < Object.keys(candidatesData).length + 1) {
      navigate(`/candidate/${newId}`);
    }
  };

  const handleVoteInitiate = () => {
    if (!isAuthenticated || !user) {
      setShowAuthModal(true);
      return;
    }

    if (hasVoted) {
      setErrorMessage('Вы уже проголосовали за другого кандидата');
      return;
    }

    // Переключаем состояние на подтверждение
    setShowConfirmation(true);
  };

  const handleVoteConfirm = async () => {
    if (!isAuthenticated || !user) {
      setShowAuthModal(true);
      return;
    }

    if (!candidateDetails) {
      setErrorMessage('Кандидат не найден');
      return;
    }

    try {
      await sendVote({
        candidateId: currentId,
        email: user.email,
        fingerprint: user.id,
      });

      console.log('Голос успешно отправлен');
      setHasVoted(true);
      setVotedCandidateId(currentId); // Устанавливаем ID кандидата, за которого проголосовали
      setShowConfirmation(false);
      setErrorMessage(null);
    } catch (error) {
      console.error('Ошибка голосования:', error);
      setErrorMessage('Ошибка при голосовании. Попробуйте снова.');
      setShowConfirmation(false);
    }
  };

  const handleVoteCancel = () => {
    // Возврат к initial состоянию кнопки
    setShowConfirmation(false);
  };

  return (
    <>
      <div className="page-candidate">
        <button className="page-candidate__back-button" onClick={() => navigate('/vote')}>
          ← Назад
        </button>

        <div className="page-candidate__details">
          <div className="page-candidate__navigation">
            {currentId && (
              <button
                className="page-candidate__nav-button page-candidate__nav-button--prev"
                onClick={() => handleNavigate('prev')}
              >
                <img src={chevronLeft} alt="Предыдущий кандидат" />
              </button>
            )}

            {currentId < Object.keys(candidatesData).length && (
              <button
                className="page-candidate__nav-button page-candidate__nav-button--next"
                onClick={() => handleNavigate('next')}
              >
                <img src={chevronRight} alt="Следующий кандидат" />
              </button>
            )}
          </div>
          <div className="page-candidate__content-wrapper">
          <div className="page-candidate__text-content">
              <h1>{candidateDetails.fullName}</h1>

              <div className="page-candidate__info">
                <p><strong>Возраст:</strong> {candidateDetails.age} лет</p>
                <p><strong>Место жительства:</strong> {candidateDetails.location}</p>
              </div>

              <div className="page-candidate__description">
                <h2>О кандидате</h2>
                <p>{candidateDetails.description}</p>
              </div>

              <div className="page-candidate__achievements">
                <h2>Достижения</h2>
                <ul>
                  {candidateDetails.achievements?.map((achievement, index) => (
                    <li key={index}>{achievement}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="page-candidate__image">
              <img src={candidateDetails.imageUrl} alt={candidateDetails.fullName} />
              
              {hasVoted ? (
                // Условие: если проголосовали за текущего кандидата
                votedCandidateId === currentId ? (
                  <div className="page-candidate__voted-message">
                    Вы уже проголосовали за этого кандидата
                  </div>
                ) : (
                  <div className="page-candidate__voted-message page-candidate__voted-message--other">
                    Вы проголосовали за другого кандидата
                  </div>
                )
              ) : (
                <button
                  className="page-candidate__vote-button"
                  onClick={showConfirmation ? handleVoteConfirm : handleVoteInitiate}
                >
                  {showConfirmation ? 'Подтвердить' : 'Голосовать'}
                </button>
              )}

              {showConfirmation && !hasVoted && (
                <button 
                  className="page-candidate__cancel-button"
                  onClick={handleVoteCancel}
                >
                  Отмена
                </button>
              )}

              {errorMessage && (
                <div className="page-candidate__error-message">
                  {errorMessage}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        returnUrl={`/candidate/${id}`}
      />
    </>
  );
};

export default CandidatePage;