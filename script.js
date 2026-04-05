// script.js
document.addEventListener('DOMContentLoaded', function() {
    const tickerElement = document.getElementById('tickerText');
    const container = document.querySelector('.ticker-container');
    initSimpleGallery();
    
    // Текст бегущей строки с разделителем
    const baseText = 'приглашение на свадьбу • ';
    
    // Функция для обновления бегущей строки
    function updateTicker() {
        if (!container || !tickerElement) return;
        
        const containerWidth = container.offsetWidth;
        
        const temp = document.createElement('span');
        temp.style.visibility = 'hidden';
        temp.style.position = 'absolute';
        temp.style.whiteSpace = 'nowrap';
        temp.style.fontSize = window.getComputedStyle(tickerElement).fontSize;
        temp.style.fontFamily = window.getComputedStyle(tickerElement).fontFamily;
        temp.style.letterSpacing = window.getComputedStyle(tickerElement).letterSpacing;
        temp.style.fontWeight = window.getComputedStyle(tickerElement).fontWeight;
        temp.textContent = baseText;
        document.body.appendChild(temp);
        
        const textWidth = temp.offsetWidth;
        document.body.removeChild(temp);
        
        const repeatsNeeded = Math.max(3, Math.ceil((containerWidth * 2) / textWidth) + 1);
        
        let fullText = '';
        for (let i = 0; i < repeatsNeeded; i++) {
            fullText += baseText;
        }
        
        tickerElement.textContent = fullText;
    }
    
    if (!document.querySelector('#ticker-styles')) {
        const style = document.createElement('style');
        style.id = 'ticker-styles';
        style.textContent = `
            @keyframes ticker {
                0% { transform: translateX(0); }
                100% { transform: translateX(-100%); }
            }
        `;
        document.head.appendChild(style);
    }
    
    updateTicker();
    
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(updateTicker, 100);
    });
    
    window.addEventListener('orientationchange', function() {
        setTimeout(updateTicker, 150);
    });
    
    console.log('Hero секция загружена. Проверьте отображение имен на вашем устройстве.');
    
    // Инициализация обработчика формы
    initFormHandler();
});

// Таймер обратного отсчета до свадьбы
function weddingTimer() {
    const weddingDate = new Date(2026, 7, 8, 15, 0); // 8 августа 2026, 15:00
    
    function updateTimer() {
        const now = new Date().getTime();
        const distance = weddingDate - now;
        
        if (distance < 0) {
            document.getElementById('days').textContent = '00';
            document.getElementById('hours').textContent = '00';
            document.getElementById('minutes').textContent = '00';
            document.getElementById('seconds').textContent = '00';
            return;
        }
        
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        document.getElementById('days').textContent = days < 10 ? '0' + days : days;
        document.getElementById('hours').textContent = hours < 10 ? '0' + hours : hours;
        document.getElementById('minutes').textContent = minutes < 10 ? '0' + minutes : minutes;
        document.getElementById('seconds').textContent = seconds < 10 ? '0' + seconds : seconds;
    }
    
    updateTimer();
    setInterval(updateTimer, 1000);
}

// Функция для отправки данных в Google Sheets
async function submitFormToGoogleSheets(formData) {
    // ВАШ URL ОТ APPS SCRIPT - ЗАМЕНИТЕ НА РЕАЛЬНЫЙ
    const scriptURL = 'https://script.google.com/macros/s/AKfycbwdJIslA8ZQWg6ddn-JJSLP_uVS5y1TxFiZFsR_CcQGigfoMxfyN29VMmDLSBrVQyaF/exec';
    
    try {
        const formDataToSend = new URLSearchParams();
        formDataToSend.append('name', formData.name || '');
        formDataToSend.append('attendance', formData.attendance || '');
        
        if (formData.alcohol && formData.alcohol.length > 0) {
            for (const pref of formData.alcohol) {
                formDataToSend.append('alcohol', pref);
            }
        }
        
        const response = await fetch(scriptURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formDataToSend.toString()
        });
        
        const result = await response.json();
        return { success: result.result === 'success', message: result.message };
        
    } catch (error) {
        console.error('Ошибка при отправке:', error);
        throw error;
    }
}

// Функция для сбора данных из формы
function collectFormData(form) {
    const nameInput = form.querySelector('#name');
    const name = nameInput ? nameInput.value.trim() : '';
    
    const attendanceRadio = form.querySelector('input[name="attendance"]:checked');
    const attendance = attendanceRadio ? attendanceRadio.value : '';
    
    const alcoholCheckboxes = form.querySelectorAll('input[name="alcohol"]:checked');
    const alcoholValues = Array.from(alcoholCheckboxes).map(cb => cb.value);
    
    return {
        name: name,
        attendance: attendance,
        alcohol: alcoholValues
    };
}

// Функция валидации формы
function validateForm(formData) {
    if (!formData.name) {
        showNotification('Пожалуйста, введите ваше имя', true);
        return false;
    }
    
    if (!formData.attendance) {
        showNotification('Пожалуйста, укажите, сможете ли вы присутствовать', true);
        return false;
    }
    
    return true;
}

// Функция для отображения уведомлений
function showNotification(message, isError = false) {
    let notification = document.getElementById('form-notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'form-notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            padding: 15px 30px;
            border-radius: 50px;
            font-family: 'Caveat', cursive;
            font-size: 18px;
            font-weight: 500;
            z-index: 9999;
            text-align: center;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
            transition: opacity 0.3s ease;
        `;
        document.body.appendChild(notification);
    }
    
    notification.style.backgroundColor = isError ? '#f44336' : '#4CAF50';
    notification.style.color = 'white';
    notification.textContent = message;
    notification.style.display = 'block';
    notification.style.opacity = '1';
    
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            notification.style.display = 'none';
        }, 300);
    }, 4000);
}

// Функция для очистки формы
function resetForm(form) {
    form.reset();
}

// Функция для отображения сообщения об успехе
function showSuccessMessage(guestName) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'success-message';
    messageDiv.innerHTML = `
        <div class="success-content">
            <svg class="success-icon" viewBox="0 0 24 24" width="48" height="48">
                <path fill="#4CAF50" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            <h3>Спасибо, ${guestName}!</h3>
            <p>Ваш ответ получен. Ждем вас на свадьбе!</p>
            <button class="success-close-btn" onclick="this.parentElement.parentElement.remove()">Закрыть</button>
        </div>
    `;
    
    const style = document.createElement('style');
    style.textContent = `
        .success-message {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            animation: fadeIn 0.3s ease;
        }
        
        .success-content {
            background: white;
            padding: 40px;
            border-radius: 20px;
            text-align: center;
            max-width: 400px;
            margin: 20px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        }
        
        .success-icon {
            margin-bottom: 20px;
        }
        
        .success-content h3 {
            font-family: 'Tangerine', 'Great Vibes', cursive;
            font-size: 2.5rem;
            color: #333;
            margin-bottom: 10px;
            font-weight: 400;
        }
        
        .success-content p {
            font-family: 'Caveat', cursive;
            font-size: 1.3rem;
            color: #666;
            margin-bottom: 25px;
        }
        
        .success-close-btn {
            background-color: #595b4e;
            color: white;
            border: none;
            padding: 12px 35px;
            border-radius: 50px;
            font-family: 'Caveat', cursive;
            font-size: 1.2rem;
            cursor: pointer;
            transition: background-color 0.3s;
        }
        
        .success-close-btn:hover {
            background-color: #333;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 5000);
}

// Основной обработчик формы
function initFormHandler() {
    const form = document.querySelector('.guest-form');
    if (!form) return;
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const submitBtn = form.querySelector('.submit-btn');
        const originalText = submitBtn.textContent;
        
        const formData = collectFormData(form);
        
        if (!validateForm(formData)) {
            return;
        }
        
        submitBtn.disabled = true;
        submitBtn.textContent = 'Отправка...';
        showNotification('Отправляем ваш ответ...', false);
        
        try {
            const result = await submitFormToGoogleSheets(formData);
            
            if (result.success) {
                showNotification('✅ Спасибо! Ваш ответ сохранен.', false);
                showSuccessMessage(formData.name);
                resetForm(form);
            } else {
                showNotification('❌ Ошибка: ' + result.message, true);
            }
        } catch (error) {
            console.error('Ошибка:', error);
            showNotification('❌ Ошибка отправки. Попробуйте еще раз.', true);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });
}

// Запускаем таймер после загрузки страницы
document.addEventListener('DOMContentLoaded', weddingTimer);

function initSimpleGallery() {
    const track = document.getElementById('galleryTrack');
    const nextBtn = document.getElementById('galleryNext');
    
    if (!track || !nextBtn) return;
    
    let currentIndex = 0;
    const totalSlides = 2;
    
    nextBtn.addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % totalSlides;
        track.style.transform = `translateX(-${currentIndex * 100}%)`;
    });
}

function initGallery() {
    const track = document.getElementById('galleryTrack');
    const prevBtn = document.getElementById('galleryPrev');
    const nextBtn = document.getElementById('galleryNext');
    
    if (!track || !prevBtn || !nextBtn) return;
    
    let currentIndex = 0;
    const totalSlides = 2;
    
    function updateGallery(index) {
        currentIndex = index;
        track.style.transform = `translateX(-${currentIndex * 100}%)`;
    }
    
    nextBtn.addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % totalSlides;
        updateGallery(currentIndex);
    });
    
    prevBtn.addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
        updateGallery(currentIndex);
    });
    
    let touchStartX = 0;
    let touchEndX = 0;
    
    track.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    
    track.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                currentIndex = (currentIndex + 1) % totalSlides;
            } else {
                currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
            }
            updateGallery(currentIndex);
        }
    }, { passive: true });
}

document.addEventListener('DOMContentLoaded', function() {
    initGallery();
});

// Аудиоплеер
const audio = document.getElementById('weddingAudio');
const playBtn = document.getElementById('playPauseBtn');
const playIcon = document.querySelector('.play-icon');
const pauseIcon = document.querySelector('.pause-icon');

if (audio && playBtn) {
    const tryAutoplay = () => {
        audio.play().then(() => {
            playIcon.style.display = 'none';
            pauseIcon.style.display = 'block';
        }).catch(() => {
            console.log('Автовоспроизведение заблокировано. Нажмите кнопку.');
        });
    };
    
    tryAutoplay();
    
    playBtn.addEventListener('click', () => {
        if (audio.paused) {
            audio.play();
            playIcon.style.display = 'none';
            pauseIcon.style.display = 'block';
        } else {
            audio.pause();
            playIcon.style.display = 'block';
            pauseIcon.style.display = 'none';
        }
    });
}
