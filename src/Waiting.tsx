import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Lottie, { LottieRefCurrentProps } from 'lottie-react'
import bellAnimation from './assets/public/bell/notification-V4.json'
import menuAnimation from './assets/public/menu/menuV2.json'
import NotificationModal from './components/NotificationModal'
import './Waiting.css'

// Импортируем GIF-файлы
import leftGif from './assets/public/gif/left-gif.gif';
import rightGif from './assets/public/gif/right-gif.gif';

function Waiting() {
  const navigate = useNavigate()
  const targetDate = new Date('2024-12-10T00:00:00')
  const [countdown, setCountdown] = useState<string>('')
  const [isTimeUp, setIsTimeUp] = useState(false)
  const [, setIsPlaying] = useState(false)
  const lottieRef = useRef<LottieRefCurrentProps>(null)
  const menuRef = useRef<LottieRefCurrentProps>(null)
  const [menuVisible, setMenuVisible] = useState(false)
  const [notificationVisible, setNotificationVisible] = useState(false)

  const toggleMenu = () => {
    if (menuRef.current) {
      menuRef.current.setDirection(menuVisible ? -1 : 1)
      menuRef.current.goToAndPlay(0)
    }

    setTimeout(() => {
      setMenuVisible(prev => !prev)
    }, 300)
  }

  const handleVoteClick = () => {
    navigate('/vote')
  }

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date()
      const timeRemaining = targetDate.getTime() - now.getTime()

      if (timeRemaining <= 0) {
        clearInterval(interval)
        setIsTimeUp(true)
        return
      }

      const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24))
      const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000)

      setCountdown(`${days} дня ${hours} : ${minutes} : ${seconds}`)
    }, 1000)

    return () => clearInterval(interval)
  }, [targetDate])

  const handleNotification = () => {
    if (lottieRef.current) {
      lottieRef.current.setDirection(1)
      lottieRef.current.goToAndPlay(0)
      setIsPlaying(true)
    }
    setNotificationVisible(true)
  }


  return (
    <>
      <h1 className="volunteer-title">Народный волонтер</h1>
      <div className="container">
        <div className="control-panel">
          <button 
            className="control-button" 
            onClick={toggleMenu}
            style={{ outline: 'none', border: 'none' }}
          >
            <Lottie 
              lottieRef={menuRef}
              animationData={menuAnimation} 
              style={{ width: 32, height: 32 }}
              autoplay={false}
              loop={false}
            />
          </button>
          <div className={`menu ${menuVisible ? 'menu-visible' : 'menu-hidden'}`}>
            <div className={`icon-container ${menuVisible ? 'menu-visible' : ''}`}>
              {menuVisible && (
                <>
                  <button 
                    className="control-button" 
                    onClick={handleNotification}
                    style={{ outline: 'none', border: 'none' }}
                  >
                    <Lottie 
                      lottieRef={lottieRef}
                      animationData={bellAnimation} 
                      style={{ width: 32, height: 32 }}
                      autoplay={false}
                      loop={false}
                      onComplete={() => {
                        setIsPlaying(false)
                        if (lottieRef.current) {
                          lottieRef.current.setDirection(-1)
                          lottieRef.current.play()
                        }
                      }}
                    />
                  </button>
                 
                </>
              )}
            </div>
          </div>
        </div>
        <div className="countdown-display">
          <img src={leftGif} alt="Left Gif" className="gif" />
          {isTimeUp ? (
            <button 
              className="vote-button" 
              onClick={handleVoteClick}
              style={{
                padding: '20px 40px',
                fontSize: '24px',
                fontWeight: 'bold',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',

                borderRadius: '10px',
                cursor: 'pointer',
                transition: 'background-color 0.3s',
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#45a049'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#4CAF50'}
            >
              ПОЕХАЛИ!
            </button>
          ) : (
            <p>{countdown}</p>
          )}
          <img src={rightGif} alt="Right Gif" className="gif" />
        </div>
      </div>
      <NotificationModal 
        visible={notificationVisible} 
        onClose={() => setNotificationVisible(false)} 
      />
    </>
  )
}

export default Waiting 