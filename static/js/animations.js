// Animation Manager for EcoFusion
const AnimationManager = (() => {
    // Run transition animations when changing tabs
    const runTabTransition = (tabName) => {
        const animations = {
            finance: () => {
                animateElements('#financeTab .glass-card', 'fadeInUp');
                animateNumbers('#financeEcoPoints');
            },
            game: () => {
                document.querySelector('#plantObject')?.classList.add('animate__bounce');
                setTimeout(() => {
                    document.querySelector('#plantObject')?.classList.remove('animate__bounce');
                }, 1000);
                animateElements('#gameTab .game-stats', 'fadeInRight');
            },
            tasks: () => {
                animateElements('#tasksTab .task-item', 'fadeInRight', 100);
                animateElements('#tasksTab .daily-challenge', 'pulse');
            },
            withdraw: () => {
                animateElements('#withdrawTab .glass-card', 'fadeInUp', 150);
                animateNumbers('#withdrawablePoints');
            }
        };

        // Run the animation for the specific tab if it exists
        if (animations[tabName]) {
            animations[tabName]();
        }
    };

    // Animate elements with a staggered delay
    const animateElements = (selector, animationClass, delay = 50) => {
        const elements = document.querySelectorAll(selector);
        elements.forEach((el, index) => {
            setTimeout(() => {
                el.style.animation = 'none';
                el.offsetHeight; // Trigger reflow
                el.style.animation = `${animationClass} 0.5s forwards`;
            }, index * delay);
        });
    };

    // Number counter animation
    const animateNumbers = (selector) => {
        const element = document.querySelector(selector);
        if (!element) return;

        const target = parseInt(element.textContent);
        const duration = 1000; // ms
        const steps = 20;
        const stepDuration = duration / steps;
        let current = 0;
        
        const interval = setInterval(() => {
            current += target / steps;
            if (current >= target) {
                element.textContent = target;
                clearInterval(interval);
            } else {
                element.textContent = Math.round(current);
            }
        }, stepDuration);
    };

    // Tap effect animations for game
    const tapEffects = (button, plantObject) => {
        // Button animation
        button.style.animation = 'none';
        button.offsetHeight; // Trigger reflow
        button.style.animation = 'coinBounce 0.3s';
        
        // Plant animation
        if (plantObject) {
            plantObject.style.transform = 'scale(1.1)';
            setTimeout(() => {
                plantObject.style.transform = 'scale(1)';
            }, 300);
        }
        
        // Create floating coin animation
        createFloatingCoin(button);
        
        // Show tap indicator at random position
        showTapIndicator();

        // Reset button animation
        setTimeout(() => {
            button.style.animation = '';
        }, 300);
    };

    // Create floating coin animation
    const createFloatingCoin = (targetElement) => {
        const coin = document.createElement('div');
        coin.className = 'coin-animation';
        coin.innerHTML = `<i class="fas fa-leaf"></i> +1`;
        
        // Position relative to target element
        const rect = targetElement.getBoundingClientRect();
        const x = Math.random() * rect.width;
        const y = rect.height / 2;
        
        coin.style.position = 'absolute';
        coin.style.left = `${x}px`;
        coin.style.top = `${y}px`;
        
        targetElement.parentElement.appendChild(coin);
        
        // Remove after animation completes
        setTimeout(() => {
            coin.remove();
        }, 1000);
    };

    // Show tap indicator at random position
    const showTapIndicator = () => {
        const tapIndicator = document.getElementById('tapIndicator');
        if (!tapIndicator) return;
        
        const parentElement = tapIndicator.parentElement;
        const parentRect = parentElement.getBoundingClientRect();
        
        // Random position within parent element
        const x = Math.random() * (parentRect.width - 50);
        const y = Math.random() * (parentRect.height - 30);
        
        tapIndicator.style.left = `${x}px`;
        tapIndicator.style.top = `${y}px`;
        tapIndicator.style.opacity = '1';
        tapIndicator.style.transform = 'translateY(0)';
        
        // Hide after a delay
        setTimeout(() => {
            tapIndicator.style.opacity = '0';
            tapIndicator.style.transform = 'translateY(-10px)';
        }, 700);
    };

    // Show achievement unlock animation
    const showAchievementUnlock = (achievementName) => {
        // Create achievement notification
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <i class="fas fa-trophy"></i>
            <div>
                <h4>Succès débloqué!</h4>
                <p>${achievementName}</p>
            </div>
        `;
        
        // Style the notification
        Object.assign(notification.style, {
            position: 'fixed',
            bottom: '-100px',
            right: '20px',
            backgroundColor: 'rgba(46, 204, 113, 0.9)',
            color: 'white',
            padding: '15px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
            zIndex: '1000',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
            transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        });
        
        // Add to DOM
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.bottom = '20px';
        }, 100);
        
        // Animate out after delay
        setTimeout(() => {
            notification.style.bottom = '-100px';
            // Remove from DOM after animation
            setTimeout(() => {
                notification.remove();
            }, 500);
        }, 4000);
    };

    // Show reward animation
    const showReward = (element, amount) => {
        const reward = document.createElement('div');
        reward.className = 'reward-animation';
        reward.innerHTML = `+${amount} <i class="fas fa-leaf"></i>`;
        
        // Style the reward
        Object.assign(reward.style, {
            position: 'absolute',
            top: '0',
            left: '50%',
            transform: 'translateX(-50%)',
            color: '#f1c40f',
            fontWeight: 'bold',
            fontSize: '18px',
            pointerEvents: 'none',
            opacity: '0',
            animation: 'rewardFloat 1.5s forwards'
        });
        
        // Add reward float animation if not already in stylesheet
        if (!document.getElementById('rewardAnimation')) {
            const style = document.createElement('style');
            style.id = 'rewardAnimation';
            style.textContent = `
                @keyframes rewardFloat {
                    0% { opacity: 0; transform: translate(-50%, 0); }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { opacity: 0; transform: translate(-50%, -50px); }
                }
            `;
            document.head.appendChild(style);
        }
        
        // Add to DOM
        const parentEl = element.parentElement;
        parentEl.style.position = 'relative';
        parentEl.appendChild(reward);
        
        // Remove after animation completes
        setTimeout(() => {
            reward.remove();
        }, 1500);
    };

    // Show upgrade effect
    const showUpgradeEffect = (element) => {
        // Create radial burst effect
        const burst = document.createElement('div');
        burst.className = 'upgrade-burst';
        
        // Style the burst
        Object.assign(burst.style, {
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '10px',
            height: '10px',
            backgroundColor: 'var(--primary-color)',
            borderRadius: '50%',
            opacity: '0.7',
            pointerEvents: 'none',
            animation: 'burstAnimation 0.6s forwards'
        });
        
        // Add burst animation if not already in stylesheet
        if (!document.getElementById('burstAnimation')) {
            const style = document.createElement('style');
            style.id = 'burstAnimation';
            style.textContent = `
                @keyframes burstAnimation {
                    0% { transform: translate(-50%, -50%) scale(1); opacity: 0.7; }
                    100% { transform: translate(-50%, -50%) scale(20); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
        
        // Add to DOM
        const parentEl = element.parentElement;
        parentEl.style.position = 'relative';
        parentEl.appendChild(burst);
        
        // Apply pulse animation to the button
        element.style.animation = 'none';
        element.offsetHeight; // Trigger reflow
        element.style.animation = 'pulse 0.6s';
        
        // Remove burst after animation completes
        setTimeout(() => {
            burst.remove();
        }, 600);
    };

    // Show insufficient funds animation
    const showInsufficientFunds = (element) => {
        // Shake animation
        element.style.animation = 'none';
        element.offsetHeight; // Trigger reflow
        element.style.animation = 'shakeAnimation 0.5s';
        
        // Add shake animation if not already in stylesheet
        if (!document.getElementById('shakeAnimation')) {
            const style = document.createElement('style');
            style.id = 'shakeAnimation';
            style.textContent = `
                @keyframes shakeAnimation {
                    0%, 100% { transform: translateX(0); }
                    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
                    20%, 40%, 60%, 80% { transform: translateX(5px); }
                }
            `;
            document.head.appendChild(style);
        }
        
        // Show error message
        const errorMsg = document.createElement('div');
        errorMsg.className = 'error-message';
        errorMsg.textContent = 'Points insuffisants';
        
        // Style the error message
        Object.assign(errorMsg.style, {
            position: 'absolute',
            bottom: '-30px',
            left: '50%',
            transform: 'translateX(-50%)',
            color: 'var(--error-color)',
            fontSize: '14px',
            fontWeight: 'bold',
            opacity: '0',
            animation: 'fadeInOut 2s forwards'
        });
        
        // Add fade animation if not already in stylesheet
        if (!document.getElementById('fadeInOut')) {
            const style = document.createElement('style');
            style.id = 'fadeInOut';
            style.textContent = `
                @keyframes fadeInOut {
                    0% { opacity: 0; }
                    20% { opacity: 1; }
                    80% { opacity: 1; }
                    100% { opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
        
        // Add to DOM
        const parentEl = element.parentElement;
        parentEl.style.position = 'relative';
        parentEl.appendChild(errorMsg);
        
        // Remove after animation completes
        setTimeout(() => {
            errorMsg.remove();
        }, 2000);
    };

    // Show low energy animation
    const showLowEnergy = (element) => {
        // Pulse red animation
        element.style.animation = 'none';
        element.offsetHeight; // Trigger reflow
        element.style.animation = 'lowEnergyPulse 0.5s';
        
        // Show energy warning
        const warningMsg = document.createElement('div');
        warningMsg.className = 'energy-warning';
        warningMsg.innerHTML = '<i class="fas fa-bolt"></i> Énergie insuffisante';
        
        // Style the warning message
        Object.assign(warningMsg.style, {
            position: 'absolute',
            top: '-40px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'var(--energy-low)',
            color: 'white',
            padding: '5px 10px',
            borderRadius: '5px',
            fontSize: '14px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            opacity: '0',
            animation: 'fadeInOut 2s forwards'
        });
        
        // Add to DOM
        const parentEl = element.parentElement;
        parentEl.style.position = 'relative';
        parentEl.appendChild(warningMsg);
        
        // Remove after animation completes
        setTimeout(() => {
            warningMsg.remove();
        }, 2000);
    };

    // Pulse animation for element
    const pulseElement = (element) => {
        element.style.animation = 'none';
        element.offsetHeight; // Trigger reflow
        element.style.animation = 'selectPulse 0.5s';
    };

    return {
        runTabTransition,
        animateElements,
        animateNumbers,
        tapEffects,
        showAchievementUnlock,
        showReward,
        showUpgradeEffect,
        showInsufficientFunds,
        showLowEnergy,
        pulseElement
    };
})();
